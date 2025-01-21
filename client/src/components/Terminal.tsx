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
  cols: 100,
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

    socket.emit("requestTerminal");
    socket.on("terminal", terminalHandler);
    const term = new Terminal(OPTIONS_TERM);
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    function terminalHandler({ data }) {
      if (data instanceof ArrayBuffer) {
        // console.error(data);
        // console.log(ab2str(data));
        term.write(ab2str(data));
      }
    }
    term.onData((data) => {
      socket.emit("terminalData", {
        data,
      });
    });

    socket.emit("terminalData", {
      data: "\n",
    });

    return () => {
      socket.off("terminal");
    };
  }, [terminalRef]);

  return (
    <div
      className="h-full overflow-scroll text-left w-full ml-1 overflow-x-visible"
      ref={terminalRef}
    ></div>
  );
};
