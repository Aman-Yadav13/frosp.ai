import { DefaultEventsMap, Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { saveToS3 } from "./aws.js";
import { fetchDir, fetchFileContent, saveFile } from "./fs.js";
import { TerminalManager } from "./pty.js";
import fs from "fs";
import pkg from "aws-sdk";
import { initCollab } from "./collab.js";

const { S3 } = pkg;

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  endpoint: process.env.S3_ENDPOINT!,
});

const terminalManager = new TerminalManager();

export function initWs(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: `/${process.env.REPL_ID}/socket.io/`,
    pingTimeout: 15000,
    pingInterval: 5000,
  });

  io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`[WS] Socket ${id} joined ${room}`);
  });

  io.of("/").adapter.on("leave-room", (room, id) => {
    console.log(`[WS] Socket ${id} left ${room}`);
  });

  io.on("connection", async (socket) => {
    const urlPath = socket.handshake.url;
    const replId = urlPath?.split("/")[1];
    const { userId } = socket.handshake.query;

    if (!replId) {
      socket.disconnect();
      terminalManager.clear(socket.id);
      return;
    }

    socket.emit("loaded", {
      rootContent: await fetchDir("/workspace", ""),
    });

    initHandlers(socket, replId, userId as string, io);
  });
}

function initHandlers(
  socket: Socket,
  replId: string,
  userId: string,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  const getUserPath = (dir: string) =>
    `code/${process.env.REPL_ID?.substring(5)}/${dir.replace(/^\/+/, "")}`;

  const validateBucket = () => {
    if (!process.env.S3_BUCKET) {
      throw new Error("S3_BUCKET environment variable is not set");
    }
    return process.env.S3_BUCKET;
  };

  initCollab(socket, replId, userId, io);

  socket.on("fetchDir", async (dir: string, callback) => {
    const dirPath = `/workspace/${dir}`;
    console.log(
      "Fetching dir content user ",
      userId,
      " for directory",
      dirPath
    );

    const contents = await fetchDir(dirPath, dir);
    callback(contents);
  });

  socket.on(
    "fetchContent",
    async ({ path: filePath }: { path: string }, callback) => {
      const fullPath = `/workspace/${filePath}`;
      console.log("Fetching content user ", userId, " for file", fullPath);
      const data = await fetchFileContent(fullPath);
      callback(data);
    }
  );

  socket.on(
    "addEntry",
    async (
      { dir, name, type }: { dir: string; name: string; type: "file" | "dir" },
      callback
    ) => {
      const entryPath = `/workspace/${dir.replace(/^\/+/, "")}/${name}`;
      const s3Key = getUserPath(`${dir}/${name}`);

      try {
        validateBucket();
        if (type === "dir") {
          await saveToS3(s3Key + "/", "");
          fs.mkdirSync(entryPath, { recursive: true });
        } else {
          await saveToS3(s3Key, "");
          fs.writeFileSync(entryPath, "");
        }
        callback({ success: true });
      } catch (error: any) {
        console.error("Error adding entry:", error);
        callback({ success: false, error: error.message });
      }
    }
  );

  socket.on(
    "deleteEntry",
    async ({ path: filePath }: { path: string }, callback) => {
      const fullPath = `/workspace/${filePath.replace(/^\/+/, "")}`;
      const s3Key = getUserPath(filePath);

      try {
        const bucket = validateBucket();
        const params = { Bucket: bucket, Prefix: s3Key };
        const listedObjects = await s3.listObjectsV2(params).promise();

        if (listedObjects.Contents?.length) {
          for (const obj of listedObjects.Contents) {
            await s3.deleteObject({ Bucket: bucket, Key: obj.Key! }).promise();
          }
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          await s3.deleteObject({ Bucket: bucket, Key: s3Key }).promise();
          fs.unlinkSync(fullPath);
        }

        callback({ success: true });
      } catch (error: any) {
        console.error("Error deleting entry:", error);
        callback({ success: false, error: error.message });
      }
    }
  );

  socket.on(
    "renameEntry",
    async (
      { oldPath, newPath }: { oldPath: string; newPath: string },
      callback
    ) => {
      const oldFullPath = `/workspace/${oldPath.replace(/^\/+/g, "")}`;
      const newFullPath = `/workspace/${newPath.replace(/^\/+/g, "")}`;
      const oldS3Key = getUserPath(oldPath);
      const newS3Key = getUserPath(newPath);

      try {
        const bucket = validateBucket();
        const params = { Bucket: bucket, Prefix: oldS3Key };
        const listedObjects = await s3.listObjectsV2(params).promise();

        for (const obj of listedObjects.Contents || []) {
          const newKey = obj.Key!.replace(oldS3Key, newS3Key);
          await s3
            .copyObject({
              Bucket: bucket,
              CopySource: `${bucket}/${obj.Key}`,
              Key: newKey,
            })
            .promise();
          await s3.deleteObject({ Bucket: bucket, Key: obj.Key! }).promise();
        }

        fs.renameSync(oldFullPath, newFullPath);
        callback({ success: true });
      } catch (error: any) {
        console.error("Error renaming entry:", error);
        callback({ success: false, error: error.message });
      }
    }
  );

  socket.on("spawnTerminal", async () => {
    const sessionId = terminalManager.createPty(
      socket.id,
      replId,
      async (data, sessionId) => {
        socket.emit("terminalData", {
          terminalId: sessionId,
          data: Buffer.from(data, "utf-8"),
        });
      }
    );
    socket.emit("terminalSpawned", { terminalId: sessionId });
  });

  socket.on("suspendTerminal", ({ terminalId }) => {
    terminalManager.suspend(terminalId);
  });

  socket.on("terminalData", async ({ terminalId, data }) => {
    terminalManager.write(terminalId, data);
  });

  socket.on("resizeTerminal", async ({ sessionId, cols, rows }) => {
    terminalManager.resize(sessionId, cols, rows);
  });
}
