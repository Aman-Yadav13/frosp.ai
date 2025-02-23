import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

const fitAddon = new FitAddon();

const OPTIONS_TERM = {
  useStyle: true,
  screenKeys: true,
  cursorBlink: true,
  theme: {
    background: "#000000",
    foreground: "#ffffff",
  },
};

function ab2str(buf: ArrayBuffer) {
  return new TextDecoder().decode(new Uint8Array(buf));
}

export const TerminalComponent = ({
  socket,
  showOutput,
  terminalId,
  isActive,
}: {
  socket: Socket;
  showOutput: boolean;
  terminalId: string;
  isActive: boolean;
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef(new FitAddon());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!terminalRef.current || !socket) return;

    const term = new Terminal(OPTIONS_TERM);
    term.loadAddon(fitAddonRef.current);
    term.open(terminalRef.current);
    termRef.current = term;
    fitAddonRef.current.fit();
    termRef.current.refresh(0, termRef.current.rows - 1);

    const terminalDataHandler = ({
      terminalId: incomingId,
      data,
    }: {
      terminalId: string;
      data: ArrayBuffer | string;
    }) => {
      if (incomingId === terminalId) {
        const strData = data instanceof ArrayBuffer ? ab2str(data) : data;
        term.write(strData);
      }
    };

    socket.on("terminalData", terminalDataHandler);

    term.onData((data) => {
      socket.emit("terminalData", { terminalId, data });
    });

    return () => {
      socket.off("terminalData", terminalDataHandler);
      term.dispose();
      termRef.current = null;
    };
  }, [socket, terminalId]);

  useEffect(() => {
    if (!termRef.current || !terminalRef.current) return;
    const handleResize = () => {
      try {
        fitAddonRef.current.fit();
        const dimensions = fitAddonRef.current.proposeDimensions();
        if (dimensions) {
          if (isActive) {
            socket.emit("resizeTerminal", {
              sessionId: terminalId,
              cols: dimensions.cols,
              rows: dimensions.rows,
            });
          }
        }
      } catch (error) {
        console.error("Resize error:", error);
      }
    };

    resizeObserverRef.current = new ResizeObserver(handleResize);
    if (terminalRef.current) {
      resizeObserverRef.current.observe(terminalRef.current);
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserverRef.current?.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [isActive, terminalId, socket]);

  useEffect(() => {
    if (termRef.current && isActive) {
      try {
        fitAddonRef.current.fit();
        termRef.current.refresh(0, termRef.current.rows - 1);
      } catch (error) {
        console.error("Refresh error:", error);
      }
    }
  }, [isActive]);

  return (
    <div
      ref={terminalRef}
      className="h-full w-full text-left"
      style={{
        height: "100%",
        width: "100%",
      }}
    ></div>
  );
};
