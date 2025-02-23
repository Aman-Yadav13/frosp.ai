import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { TerminalComponent } from "./Terminal";
import { cn } from "@/lib/utils";
import { GoTerminal } from "react-icons/go";
import { Plus, X } from "lucide-react";

export const TerminalsContainer = ({
  socket,
  showOutput,
}: {
  socket: Socket;
  showOutput: boolean;
}) => {
  const [terminals, setTerminals] = useState<string[]>([]);
  const [selectedTerminal, setSelectedTerminal] = useState<string | null>(null);

  const spawnNewTerminal = () => {
    socket.emit("spawnTerminal");
  };

  const handleSuspendTerminal = (terminalId: string) => {
    if (terminals.length === 1) {
      return;
    }
    socket.emit("suspendTerminal", { terminalId });
    setTerminals((prev) => {
      const newTerminals = prev.filter((id) => id !== terminalId);
      if (selectedTerminal === terminalId) {
        setSelectedTerminal(newTerminals[0] || null);
      }
      return newTerminals;
    });
  };

  useEffect(() => {
    socket.on("terminalSpawned", ({ terminalId }) => {
      setTerminals((prev) => {
        const newTerminals = [...prev, terminalId];
        if (!selectedTerminal) {
          setSelectedTerminal(terminalId);
        }
        return newTerminals;
      });
    });

    return () => {
      socket.off("terminalSpawned");
    };
  }, [socket, selectedTerminal]);

  useEffect(() => {
    socket.emit("spawnTerminal");
  }, []);

  return (
    <div className="h-full w-full">
      <div className="h-6 flex flex-row-reverse justify-between pr-2 gap-2 w-full border-b">
        <div
          className="h-full flex items-center justify-center cursor-pointer"
          role="button"
          onClick={spawnNewTerminal}
        >
          <Plus className="text-gray-400 ml-4 h-4 w-4 hover:bg-neutral-700  rounded-sm" />
        </div>
        <div className="flex h-full mb-0 overflow-x-scroll">
          {terminals.map((terminalId, idx) => (
            <div
              role="button"
              key={terminalId}
              onClick={() => setSelectedTerminal(terminalId)}
              className={cn(
                "flex items-center gap-3 justify-between pl-2 pr-2 bg-transparent w-fit transition-all duration-100 group/tb",
                selectedTerminal === terminalId &&
                  "bg-neutral-800 border-l border-l-cyan-700",
                idx === 0 && "pl-1"
              )}
            >
              <div className="flex items-center gap-1">
                <GoTerminal className="text-gray-400" />
                <span className="text-sm">Terminal</span>
              </div>
              <div className="flex items-center justify-center px-[1px] py-[1px] overflow-hidden h-full w-full">
                {terminals.length > 1 && (
                  <X
                    className={cn(
                      "group-hover/tb:opacity-100 opacity-0 transtion-all duration-100 h-3 w-3 text-gray-400 hover:bg-neutral-800 rounded-sm",
                      selectedTerminal === terminalId && "hover:bg-neutral-950"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSuspendTerminal(terminalId);
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="terminal-wrapper"
        style={{
          position: "relative",
          height: "calc(100% - 24px)",
          width: "100%",
          overflowY: "scroll",
        }}
      >
        {terminals.map((terminalId) => (
          <div
            key={terminalId}
            style={{
              visibility:
                terminalId === selectedTerminal ? "visible" : "hidden",
              height: "100%",
              width: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <TerminalComponent
              socket={socket}
              terminalId={terminalId}
              showOutput={showOutput}
              isActive={terminalId === selectedTerminal}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
