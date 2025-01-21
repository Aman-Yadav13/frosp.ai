import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import Repl from "./models/repl.ts";

export function Ws(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", async (socket) => {
    console.log("Socket connection established");

    socket.on("updateTimer", async (projectId) => {
      const project = await Repl.findById(projectId);
      if (project && Number(project.freeTrialRemaining) > 0) {
        project.freeTrialRemaining = Number(project.freeTrialRemaining) - 60;
        console.log("Updating project: ", project.freeTrialRemaining);
        await project.save();
      }
    });
  });
}
