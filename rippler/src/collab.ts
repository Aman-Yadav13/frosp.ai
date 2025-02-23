import { DefaultEventsMap, Server, Socket } from "socket.io";
import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import { debounce } from "lodash-es";
import { fetchFileContent, saveFile } from "./fs.js";
import { saveToS3 } from "./aws.js";

type ActiveUserInfo = {
  userId: string;
  userName: string;
  color: string;
  currentFile: string | null;
};

const yDocs = new Map<string, Y.Doc>();
const roomConnections = new Map<string, Set<string>>();
const socketRooms = new Map<string, Set<string>>();
const replUsers = new Map<string, Map<string, ActiveUserInfo>>();
const userIdToSocketId = new Map<string, string>();

const saveChanges = debounce(async (filePath: string, content: string) => {
  try {
    await saveFile(getPodPath(filePath), content);
    await saveToS3(getS3Path(filePath), content);
    console.log("✅ [SAVE] Successfully saved:", filePath);
  } catch (error) {
    console.error("❌ [SAVE] Failed to save:", filePath, "Error:", error);
  }
}, 1000);

const getS3Path = (filePath: string) =>
  `code/${process.env.REPL_ID?.substring(5)}/${filePath.replace(/^\/+/, "")}`;

const getRoomPath = (filePath: string) =>
  `${process.env.REPL_ID?.substring(5)}/${filePath.replace(/^\/+/, "")}`;

const getPodPath = (filePath: string) =>
  `/workspace/${filePath.replace(/^\/+/, "")}`;

export function initCollab(
  socket: Socket,
  replId: string,
  userId: string,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  socketRooms.set(socket.id, new Set());
  const replRoom = `repl:${replId}`;
  socket.join(replRoom);

  userIdToSocketId.set(userId, socket.id);

  if (!replUsers.has(replId)) {
    replUsers.set(replId, new Map());
  }

  socket.on(
    "set-user-info",
    (info: { userId: string; userName: string; color: string }) => {
      const userMap = replUsers.get(replId)!;
      userMap.set(info.userId, { ...info, currentFile: null });
      console.log(
        `Setting user info - socket userId: ${userId}, info userId: ${info.userId}`
      );
      emitActiveUsers(replId, io);
    }
  );

  socket.on(
    "update-user-info",
    (data: {
      userId: string;
      userName: string;
      color: string;
      currentFile: string | null;
    }) => {
      const { userId, userName, color, currentFile } = data;
      console.log(`Updating user ${userId} with file ${currentFile}`);

      const userMap = replUsers.get(replId);

      if (userMap) {
        userMap.set(userId, { userId, userName, color, currentFile });
      } else {
        const newUserMap = new Map<string, ActiveUserInfo>();
        newUserMap.set(userId, { userId, userName, color, currentFile });
        replUsers.set(replId, newUserMap);
      }

      const activeUsers = Array.from(replUsers.get(replId)?.values() || []);
      io.to(`repl:${replId}`).emit("active-users-update", activeUsers);
    }
  );

  socket.on(
    "kick-user",
    (
      targetUserId: string,
      callback: (response: { success: boolean; error?: string }) => void
    ) => {
      console.log(
        `Received kick request for user ${targetUserId} from ${userId}`
      );
      const targetSocketId = userIdToSocketId.get(targetUserId);
      if (!targetSocketId) {
        console.log(`Target user ${targetUserId} not found`);
        callback({ success: false, error: "User not found" });
        return;
      }
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.emit("kicked", {
          message: "You have been kicked from the project.",
        });
        cleanupUser(targetSocket, targetUserId, replId, io);
        callback({ success: true });
        targetSocket.disconnect(true);
        console.log(`User ${targetUserId} kicked from repl ${replId}`);
      } else {
        console.log(`Socket for user ${targetUserId} not found`);
        callback({ success: false, error: "Socket not found" });
      }
    }
  );

  socket.on("join-file", async (filePath: string) => {
    const roomFilePath = getRoomPath(filePath);
    console.log("🔗 [JOIN] User", userId, "joining room:", roomFilePath);

    const previousRooms = [...(socketRooms.get(socket.id) || [])];

    socket.on("cleanup-decorations", (previousFilePath: string) => {
      const roomPath = getRoomPath(previousFilePath);

      const yDoc = yDocs.get(roomPath);
      if (yDoc) {
        const awareness = new awarenessProtocol.Awareness(yDoc);
        awareness.setLocalState(null);
      }
      socket.to(roomPath).emit("force-cleanup-decorations");
    });

    previousRooms.forEach((room) => {
      const yDoc = yDocs.get(room);
      if (yDoc) {
        const awareness = new awarenessProtocol.Awareness(yDoc);
        const clientID = Number(socket.id);
        if (awareness.meta.has(clientID)) {
          awareness.setLocalState(null);
          const update = awarenessProtocol.encodeAwarenessUpdate(awareness, [
            clientID,
          ]);
          socket.to(room).emit("awareness-update", update.buffer);
        } else {
          console.log(
            `No awareness state for client ${clientID} in room ${room}, skipping update.`
          );
        }
      }
      socket.leave(room);
    });

    socket.removeAllListeners("yjs-update");
    socket.removeAllListeners("awareness-update");

    console.log(
      "[JOIN] User with userId",
      userId,
      "is joining the roomFilePath:",
      roomFilePath
    );
    socket.join(roomFilePath);
    socketRooms.set(socket.id, new Set([roomFilePath]));

    if (!roomConnections.has(roomFilePath)) {
      roomConnections.set(roomFilePath, new Set());
    }
    roomConnections.get(roomFilePath)?.add(socket.id);

    console.log(
      "\n\n[ACTIVE_ROOM_CONNECTIONS]: ",
      roomConnections.get(roomFilePath)?.size || 0
    );

    const userMap = replUsers.get(replId)!;
    const userInfo = userMap.get(userId);
    if (userInfo) {
      userInfo.currentFile = filePath;
      console.log(`Updated ${userId} currentFile to ${filePath}`);
      emitActiveUsers(replId, io);
    } else {
      console.log(`User ${userId} not found in replUsers for repl ${replId}`);
    }

    let yDoc = yDocs.get(roomFilePath);
    if (!yDoc) {
      console.log("📂 [INIT] Creating new Y.Doc for:", roomFilePath);
      yDoc = new Y.Doc();
      yDocs.set(roomFilePath, yDoc);

      try {
        const content = await fetchFileContent(getPodPath(filePath));
        console.log(
          "📄 [INIT] Loaded content for:",
          filePath,
          "Length:",
          content.length
        );
        const yText = yDoc.getText("monaco");
        yText.insert(0, content);
        console.log("✅ [INIT] Initialized Y.Doc with content for:", filePath);
      } catch (error) {
        console.log(
          "⚠️ [INIT] No existing file found for:",
          filePath,
          "Starting fresh."
        );
      }
    }

    const yText = yDoc.getText("monaco");
    yText.observe(() => {
      const content = yText.toString();
      console.log(
        "📝 [OBSERVE] Detected changes for user",
        userId,
        "in roomFilePath:",
        roomFilePath,
        "Content length:",
        content.length
      );
      saveChanges(filePath, content);
    });

    const awareness = new awarenessProtocol.Awareness(yDoc);
    awareness.setLocalStateField("user", {
      userId,
      color: getRandomColor(),
    });

    console.log("🔄 [SYNC] Sending initial sync data for:", roomFilePath);
    socket.emit("yjs-sync-init", Y.encodeStateAsUpdate(yDoc));
    socket.emit(
      "awareness-update",
      awarenessProtocol.encodeAwarenessUpdate(
        awareness,
        Array.from(awareness.getStates().keys())
      )
    );

    socket.on("yjs-update", (update: ArrayBuffer) => {
      //   console.log("Received yjs-update for", roomFilePath);
      const uint8Update = new Uint8Array(update);
      Y.applyUpdate(yDoc!, uint8Update);
      socket.to(roomFilePath).emit("yjs-update", uint8Update.buffer);
    });

    socket.on("awareness-update", (awarenessUpdate: ArrayBuffer) => {
      //   console.log("Received awareness-update for", roomFilePath);
      const uint8Update = new Uint8Array(awarenessUpdate);
      awarenessProtocol.applyAwarenessUpdate(awareness, uint8Update, socket);
      socket.to(roomFilePath).emit("awareness-update", uint8Update.buffer);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      cleanupUser(socket, userId, replId, io);
    });
  });
}

function cleanupUser(socket: Socket, userId: string, replId: string, io: any) {
  console.log(`Cleaning up user ${userId} from repl ${replId}`);

  const userMap = replUsers.get(replId);
  if (userMap) {
    userMap.delete(userId);
    emitActiveUsers(replId, io);
  }

  const rooms = [...(socketRooms.get(socket.id) || [])];
  socketRooms.delete(socket.id);
  for (const room of rooms) {
    const connections = roomConnections.get(room);
    if (connections) {
      connections.delete(socket.id);
      if (connections.size === 0) {
        roomConnections.delete(room);
        const yDoc = yDocs.get(room);
        if (yDoc) {
          const awareness = new awarenessProtocol.Awareness(yDoc);
          const clientID = Number(socket.id);
          if (awareness.meta.has(clientID)) {
            awareness.setLocalState(null);
            const update = awarenessProtocol.encodeAwarenessUpdate(awareness, [
              clientID,
            ]);
            socket.to(room).emit("awareness-update", update.buffer);
          }
          yDoc.destroy();
          yDocs.delete(room);
          console.log(`♻️ [CLEAN] Destroyed Y.Doc for ${room}`);
        }
      }
    }
    socket.leave(room);
  }

  userIdToSocketId.delete(userId);
}

function emitActiveUsers(replId: string, io: any) {
  const userMap = replUsers.get(replId);
  if (userMap) {
    const activeUsers = Array.from(userMap.values());
    console.log("Emitting: active-users-update", activeUsers);
    io.to(`repl:${replId}`).emit("active-users-update", activeUsers);
  }
}

function getRandomColor() {
  const colors = [
    "#065f46",
    "#1e40af",
    "#3f6212",
    "#5b21b6",
    "#9f1239",
    "#713f12",
    "#86198f",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
