import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useMonacoEditor } from "@/hooks/useMonacoEditor";
import { MdOutlineWebAsset, MdOutlineWebAssetOff } from "react-icons/md";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { IoPeopleCircleOutline } from "react-icons/io5";
import { CgRemove } from "react-icons/cg";

interface WorkspaceToolsComponentProps {
  setShowOutput: React.Dispatch<React.SetStateAction<boolean>>;
  showOutput: boolean;
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  backSocket: any;
  socket: any;
}

export const WorkspaceToolsComponent = ({
  setShowOutput,
  timeRemaining,
  setTimeRemaining,
  backSocket,
  showOutput,
  socket,
}: WorkspaceToolsComponentProps) => {
  const { projectId } = useParams();
  const { activeUsers } = useMonacoEditor((state) => state);
  const [user] = useState(JSON.parse(sessionStorage.getItem("user")!));

  const handleRunCode = () => {
    setShowOutput((prev) => !prev);
  };

  useEffect(() => {
    if (backSocket) {
      let secondCounter = 0;
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev > 0) {
            secondCounter++;
            if (secondCounter === 60) {
              backSocket?.emit("updateTimer", projectId);
              secondCounter = 0;
            }

            return prev - 1;
          }
          return 0;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
        backSocket?.disconnect();
      };
    }
  }, [projectId, backSocket]);

  const handleKickUser = (
    targetUserId: string,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation();
    if (socket) {
      console.log(`Kicking user ${targetUserId}`);
      socket.emit(
        "kick-user",
        targetUserId,
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            alert(`User ${targetUserId} has been kicked`);
          } else {
            alert(
              `Failed to kick user ${targetUserId}. Reason: ${response.error}`
            );
          }
        }
      );
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="min-h-[40px] bg-gray-900 pl-4 py-1 w-full overflow-hidden border-b border-b-gray-800 pr-[2px]">
      <div className="w-full h-full flex items-center overflow-hidden">
        <div className="ml-auto flex items-center gap-[2px]">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <IoPeopleCircleOutline className="h-7 w-7 text-neutral-300" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black">
              <DropdownMenuLabel className="text-sm text-neutral-200">
                Active Users
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-600" />
              <DropdownMenuGroup className="w-full">
                {activeUsers?.map((aU) => (
                  <DropdownMenuItem asChild key={aU?.userId}>
                    <div
                      className="flex items-center justify-between gap-2"
                      style={{ backgroundColor: aU?.color }}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center truncate max-w-[120px]">
                              <p className="truncate text-xs">{aU.userName}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{aU?.currentFile?.split("/").pop()}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {user?._id !== aU?.userId && (
                        <div
                          className="flex items-center justify-center h-4 w-4"
                          role="button"
                          onClick={(e) => handleKickUser(aU?.userId, e)}
                        >
                          <CgRemove className="h-full w-full text-white" />
                        </div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  {showOutput ? (
                    <MdOutlineWebAssetOff
                      onClick={handleRunCode}
                      role="button"
                      className="cursor-pointer h-7 w-7 text-neutral-300"
                    />
                  ) : (
                    <MdOutlineWebAsset
                      onClick={handleRunCode}
                      role="button"
                      className="cursor-pointer h-7 w-7 text-neutral-300"
                    />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showOutput ? "Hide Output" : "Show Output"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="px-1 py-0 flex items-center justify-center hover:cursor-pointer transition-all">
                  <p className="font-semibold text-lg text-neutral-300">
                    {formatTime(timeRemaining)}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upgrade to pro</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
