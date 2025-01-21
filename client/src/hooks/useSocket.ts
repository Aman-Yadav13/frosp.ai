import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

export const useSocket = (replId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    const newSocket = io(`ws://frosp-rippler.duckdns.org/`, {
      path: `/repl-${replId}/socket.io/`,
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [replId]);

  return socket;
};
