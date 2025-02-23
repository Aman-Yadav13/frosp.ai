import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "./useUser";

export const useBackSocket = (replId: string) => {
  const [backSocket, setBackSocket] = useState<Socket | null>(null);
  const { userInfo } = useUser((state) => state);

  useEffect(() => {
    const newBackSocket = io(`ws://localhost:3001/`, {
      query: { userId: userInfo?._id, replId },
    });
    setBackSocket(newBackSocket);

    newBackSocket.on("connect", () => {
      if (userInfo?._id && replId) {
        newBackSocket.emit("userJoin", {
          projectId: replId,
          userId: userInfo._id,
        });
      }
    });

    return () => {
      newBackSocket.disconnect();
      if (userInfo?._id && replId) {
        newBackSocket.emit("userLeave", {
          projectId: replId,
          userId: userInfo._id,
        });
      }
    };
  }, [replId, userInfo?._id]);

  return backSocket;
};
