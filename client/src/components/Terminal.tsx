//@ts-nocheck
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

const fitAddon = new FitAddon();

function ab2str(buf: string) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

const OPTIONS_TERM = {
  useStyle: true,
  screenKeys: true,
  cursorBlink: true,
  cols: 200, // Initial columns
  theme: {
    background: "black",
  },
};

export const TerminalComponent = ({
  socket,
  showOutput,
}: {
  socket: Socket;
  showOutput: boolean;
}) => {
  const terminalRef = useRef();

  useEffect(() => {
    if (!terminalRef || !terminalRef.current || !socket) {
      return;
    }

    const term = new Terminal(OPTIONS_TERM);
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit(); // Initial fit

    // Emit request to initialize terminal data
    socket.emit("requestTerminal");
    socket.on("terminal", terminalHandler);

    // Handle terminal data
    function terminalHandler({ data }) {
      if (data instanceof ArrayBuffer) {
        term.write(ab2str(data));
      }
    }

    // Send user input to server
    term.onData((data) => {
      socket.emit("terminalData", { data });
    });

    // Initial terminal data
    socket.emit("terminalData", { data: "\n" });

    // Resize terminal on window resize
    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      socket.off("terminal");
      term.dispose();
    };
  }, [terminalRef, socket]);

  return (
    <div
      className="h-full overflow-scroll text-left w-full ml-1"
      ref={terminalRef}
    ></div>
  );
};
