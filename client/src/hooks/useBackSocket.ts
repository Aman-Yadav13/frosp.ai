import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useBackSocket = (replId: string) => {
  const [backSocket, setBackSocket] = useState<Socket | null>(null);
  useEffect(() => {
    const newBackSocket = io(`ws://localhost:3001/`);
    setBackSocket(newBackSocket);
    return () => {
      newBackSocket.disconnect();
    };
  }, [replId]);

  return backSocket;
};
