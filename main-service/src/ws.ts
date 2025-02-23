import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import Repl from "./models/repl.ts";
import FileActivity from "./models/fileActivity.ts";
import mongoose from "mongoose";

export function Ws(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  const userTimers = new Map<string, NodeJS.Timeout>();

  io.on("connection", async (socket) => {
    console.log("Socket connection established");
    const { userId, replId } = socket.handshake.query;

    const getUserPath = (dir: string) =>
      `code/${replId}/${dir.replace(/^\/+/, "")}`;

    const findFileCreator = async (replId: string, filePath: string) => {
      const project = await Repl.findOne(
        {
          _id: replId,
          "collaboratorMetrics.filesCreated": filePath,
        },
        {
          "collaboratorMetrics.$": 1,
        }
      );

      return project?.collaboratorMetrics?.[0]?.collaborator;
    };

    const updateFileActivity = {
      create: async (replId: string, filePath: string, userId: string) => {
        await FileActivity.create({
          project: replId,
          filePath,
          createdBy: userId,
          deleted: false,
        });
      },

      delete: async (replId: string, filePath: string, userId: string) => {
        await FileActivity.findOneAndUpdate(
          { project: replId, filePath },
          {
            $set: {
              deleted: true,
              deletedBy: userId,
              deletedAt: new Date(),
            },
          }
        );
      },

      rename: async (
        replId: string,
        oldPath: string,
        newPath: string,
        userId: string
      ) => {
        const session = await mongoose.startSession();
        try {
          await session.withTransaction(async () => {
            const existing = await FileActivity.findOne({
              project: replId,
              filePath: oldPath,
            });
            if (!existing) return;

            await FileActivity.findByIdAndUpdate(
              existing._id,
              {
                $set: {
                  deleted: true,
                  deletedBy: userId,
                  deletedAt: new Date(),
                },
              },
              { session }
            );

            await FileActivity.create(
              [
                {
                  project: replId,
                  filePath: newPath,
                  createdBy: existing.createdBy,
                  sizeBytes: existing.sizeBytes,
                  deleted: false,
                },
              ],
              { session }
            );
          });
        } finally {
          session.endSession();
        }
      },
    };

    socket.on("userJoin", async ({ projectId, userId }) => {
      console.log(`User ${userId} joined project ${projectId}`);

      try {
        const project = await Repl.findByIdAndUpdate(
          projectId,
          {
            $addToSet: { activeUsers: userId },
            $inc: { activeUsersCount: 1 },
          },
          { new: true }
        );

        if (!project) {
          console.error(`Project ${projectId} not found`);
          return;
        }

        console.log(`Active users count: ${project.activeUsersCount}`);

        if (userTimers.has(userId)) {
          clearInterval(userTimers.get(userId));
        }

        const timer = setInterval(async () => {
          try {
            const updatedProject = await Repl.findById(projectId);
            if (updatedProject) {
              const collaboratorIndex =
                updatedProject.collaboratorMetrics.findIndex(
                  (metric) => metric.collaborator.toString() === userId
                );

              if (collaboratorIndex === -1) {
                updatedProject.collaboratorMetrics.push({
                  collaborator: userId,
                  timeUsedSeconds: 30,
                  spaceUsedBytes: 0,
                  filesCreated: [],
                  filesDeleted: [],
                });
              } else {
                updatedProject.collaboratorMetrics[
                  collaboratorIndex
                ].timeUsedSeconds += 30;
              }

              await updatedProject.save();
              console.log(
                `Updated metrics for user ${userId} in project ${projectId}`
              );
            }
          } catch (error) {
            console.error("Error updating metrics:", error);
          }
        }, 30000);

        userTimers.set(userId, timer);
      } catch (error) {
        console.error("Error handling user join:", error);
      }
    });

    socket.on("userLeave", async ({ projectId, userId }) => {
      console.log(`User ${userId} left project ${projectId}`);

      try {
        const project = await Repl.findByIdAndUpdate(
          projectId,
          {
            $pull: { activeUsers: userId },
            $inc: { activeUsersCount: -1 },
          },
          { new: true }
        );

        if (!project) {
          console.error(`Project ${projectId} not found`);
          return;
        }

        console.log(`Active users count: ${project.activeUsersCount}`);

        if (userTimers.has(userId)) {
          clearInterval(userTimers.get(userId));
          userTimers.delete(userId);
        }
      } catch (error) {
        console.error("Error handling user leave:", error);
      }
    });

    socket.on("addEntry", async ({ dir, name, type }, callback) => {
      if (!replId || type !== "file") return;

      const s3Path = getUserPath(`${dir}/${name}`);

      try {
        await Repl.updateOne(
          { _id: replId, "collaboratorMetrics.collaborator": userId },
          { $addToSet: { "collaboratorMetrics.$.filesCreated": s3Path } }
        );

        await updateFileActivity.create(
          replId as string,
          s3Path,
          userId as string
        );

        callback({ success: true });
      } catch (error) {
        callback({ success: false, error: "Failed to track file creation" });
      }
    });

    socket.on("deleteEntry", async ({ path }, callback) => {
      if (!replId) return;

      const s3Path = getUserPath(path);

      try {
        const creatorId = await findFileCreator(replId as string, s3Path);
        if (creatorId) {
          await Repl.updateOne(
            { _id: replId, "collaboratorMetrics.collaborator": creatorId },
            { $pull: { "collaboratorMetrics.$.filesCreated": s3Path } }
          );
        }

        await Repl.updateOne(
          { _id: replId, "collaboratorMetrics.collaborator": userId },
          { $addToSet: { "collaboratorMetrics.$.filesDeleted": s3Path } }
        );

        await updateFileActivity.delete(
          replId as string,
          s3Path,
          userId as string
        );

        callback({ success: true });
      } catch (error) {
        callback({ success: false, error: "Failed to track file deletion" });
      }
    });

    socket.on("renameEntry", async ({ oldPath, newPath }, callback) => {
      if (!replId) return;

      const oldS3Path = getUserPath(oldPath);
      const newS3Path = getUserPath(newPath);

      try {
        const creatorId = await findFileCreator(replId as string, oldS3Path);

        if (creatorId) {
          await Repl.updateOne(
            {
              _id: replId,
              "collaboratorMetrics.collaborator": creatorId,
              "collaboratorMetrics.filesCreated": oldS3Path,
            },
            {
              $set: {
                "collaboratorMetrics.$.filesCreated.$[oldPath]": newS3Path,
              },
            },
            {
              arrayFilters: [{ oldPath: oldS3Path }],
            }
          );
        }

        await updateFileActivity.rename(
          replId as string,
          oldS3Path,
          newS3Path,
          userId as string
        );

        callback({ success: true });
      } catch (error) {
        console.error("Rename error:", error);
        callback({ success: false, error: "Failed to track file rename" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });

    socket.on("updateTimer", async (projectId) => {
      const project = await Repl.findById(projectId);
      console.log("updateTimerworking");
      if (project && Number(project.freeTrialRemaining) > 0) {
        project.freeTrialRemaining = Number(project.freeTrialRemaining) - 60;
        console.log("Updating project: ", project.freeTrialRemaining);
        await project.save();
      }
    });

    socket.on("getProjectDetails", async (projectId, callback) => {
      const project = await Repl.findById(projectId);
      callback(project);
    });
  });
}
