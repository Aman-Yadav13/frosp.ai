import { useEffect } from "react";
import { Button } from "./ui/button";
import { useParams } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface WorkspaceToolsComponentProps {
  setShowOutput: React.Dispatch<React.SetStateAction<boolean>>;
  showOutput: boolean;
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  backSocket: any;
}

export const WorkspaceToolsComponent = ({
  setShowOutput,
  timeRemaining,
  setTimeRemaining,
  backSocket,
  showOutput,
}: WorkspaceToolsComponentProps) => {
  const { projectId } = useParams();

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="min-h-[45px] bg-gray-900 pl-4 pr-2 py-1 w-full overflow-hidden border-b border-b-gray-800">
      <div className="w-full h-full flex items-center overflow-hidden">
        <div className="ml-auto flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="px-2 py-1 flex items-center justify-center bg-emerald-900 rounded-md hover:cursor-pointer hover:bg-emerald-950 transition-all">
                  <p className="font-semibold">{formatTime(timeRemaining)}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upgrade to pro</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            className="ml-auto text-sm cursor-pointer"
            size={"sm"}
            onClick={handleRunCode}
          >
            {showOutput ? "Hide Output" : "Show Output"}
          </Button>
        </div>
      </div>
    </div>
  );
};
