import { useCurrentProject } from "@/hooks/useCurrentProject";
import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";
import { updateCollaborationStatus, updateInviteCode } from "@/api/repl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { LuCheck, LuCopy, LuRefreshCcw } from "react-icons/lu";

export const CollaboratorsSetting = () => {
  const { project, setProject } = useCurrentProject((state) => state);
  const [collaborative, setCollaborative] = useState(
    project?.collaborative || false
  );
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const { projectId } = useParams();
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState(
    `http://localhost:5173/invite/${projectId}/${project?.inviteCode}`
  );

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const handleCollaborativeChange = async () => {
    try {
      const resp = await updateCollaborationStatus(projectId!);
      if (resp?.success) {
        if (resp?.repl?.collaborative) {
          toast.success(`Project ${project?.name} is now collaborative.`);
        } else {
          toast.success(`Project ${project?.name} is no longer collaborative.`);
        }
        setCollaborative((prev: any) => !prev);
        setProject({ ...project, collaborative: !project?.collaborative });
      } else {
        toast.error(`Failed to update collaboration status.`);
      }
    } catch (e) {
      console.log(e);
      toast.error(`Failed to update collaboration status.`);
    }
  };

  const generateInviteCode = async () => {
    setIsGeneratingLink(true);
    try {
      const res = await updateInviteCode(projectId!);
      setProject({ ...project, inviteCode: res?.repl?.inviteCode });
    } catch (e) {
      console.log(e);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  useEffect(() => {
    setCollaborative(project?.collaborative);
    setInviteUrl(
      `http://localhost:5173/invite/${projectId}/${project?.inviteCode}`
    );
  }, [project]);

  return (
    <>
      {project?.collaborative ? (
        <div
          className="h-full relative w-full"
          style={{
            minHeight: `calc(100vh - 58px)`,
          }}
        >
          <p className="text-gray-800 text-xl font-semibold px-4 py-2">
            {project?.name} / collaborators
          </p>
          <div className="h-[1px] w-full px-2 bg-gray-400" />
          <div className="mt-2 pl-6 pr-4">
            <div className="flex flex-col">
              <p className="text-lg text-gray-700 font-medium">Invite Url</p>
              <p className="text-base text-gray-600 -mt-1">
                Share this url with people you want to work with!
              </p>
              {project?.inviteCode ? (
                <>
                  <div className="flex flex-col gap-2 w-full mt-2">
                    <div className="flex items-center gap-1">
                      <Input
                        disabled
                        value={inviteUrl}
                        className="w-fit min-w-[45%] text-black truncate"
                      />
                      <Button
                        size="icon"
                        onClick={onCopy}
                        className="group bg-transparent transition-all hover:bg-gray-50 border border-gray-400 hover:ring-1 hover:ring-gray-500"
                      >
                        {copied ? (
                          <LuCheck className="text-gray-600 group-hover:text-gray-700 transition-all h-4 w-4" />
                        ) : (
                          <LuCopy className="text-gray-600 group-hover:text-gray-700 transition-all h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      className="w-fit text-white bg-cyan-700 hover:bg-cyan-800 flex items-center"
                      onClick={generateInviteCode}
                      disabled={isGeneratingLink}
                    >
                      Generate New Link
                      <LuRefreshCcw className="w-[14px] h-[14px] ml-2" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-2">
                    <Button
                      className="w-fit text-white bg-cyan-700 hover:bg-cyan-800 flex items-center"
                      onClick={generateInviteCode}
                      disabled={isGeneratingLink}
                    >
                      Generate Link
                      <LuRefreshCcw className="w-[14px] h-[14px] ml-2" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full w-full pl-6 pr-4 py-4">
          <div className="flex flex-col">
            <p className="text-gray-700 text-lg font-medium">
              This project is not collaborative right now.
            </p>
            <p className="text-gray-600 ">
              Turn on collaboration to enhance development experience.
            </p>
          </div>
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Switch
                    checked={collaborative}
                    onCheckedChange={handleCollaborativeChange}
                    className={cn(
                      "data-[state=unchecked]:bg-transparent border-slate-600",
                      collaborative
                        ? "data-[state=checked]:bg-green-400 border-green-600"
                        : ""
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {collaborative
                    ? "Turn off collaboration"
                    : "Turn on collaboration"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </>
  );
};
