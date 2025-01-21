import { getInviteInformation, matchInviteCode } from "@/api/repl";
import { Button } from "@/components/ui/button";
import { getStatus } from "@/hooks/getStatus";
import { useModal } from "@/hooks/useModal";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const InvitePage = () => {
  const { projectId, inviteCode } = useParams();
  const navigate = useNavigate();
  const [isLoggedIn, _] = getStatus();
  const { onOpen, onClose } = useModal((state) => state);
  const [authenticated, setIsAuthenticated] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectOwner, setProjectOwner] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [matchFound, setMatchFound] = useState(false);

  const getInviteInfo = useCallback(async () => {
    try {
      const resp = await getInviteInformation(projectId!);
      setProjectName(resp.pname);
      setProjectOwner(resp.powner);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const addCollaborator = async () => {
    try {
      const resp = await matchInviteCode(projectId!, inviteCode!);
      if (resp.matchFound && !resp.alreadyExists) {
        setMatchFound(true);
      } else if (resp.matchFound && resp.alreadyExists) {
        setMatchFound(true);
        setAlreadyExists(true);
      } else {
        setMatchFound(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsAdding(false);
      setAdded(true);
    }
  };

  const handleDecline = () => {
    navigate("/");
  };

  const handleAccept = async () => {
    setIsAdding(true);
    setTimeout(async () => {
      await addCollaborator();
    }, 500);
  };

  const handleReturnToHome = () => {
    navigate("/");
  };

  useEffect(() => {
    if (isLoggedIn) {
      onClose();
      setIsAuthenticated(true);
      getInviteInfo();
    } else {
      onOpen("Login");
    }
  }, [isLoggedIn, getInviteInfo]);

  return (
    <div className="h-full w-full bg-gray-900 flex items-center justify-center">
      <div
        className={cn(
          "h-[15%] w-[40%] bg-slate-300 rounded-md border border-gray-500 py-2 px-2",
          !authenticated && "flex justify-center items-center"
        )}
      >
        {!authenticated && (
          <div className="flex items-center gap-2 justify-center">
            <p className="text-center text-2xl text-gray-700 font-medium">
              Authenticating
            </p>
            <div className="bg-transparent h-5 w-5 animate-spin border-2 border-t-gray-500 border-l-gray-500 border-b-gray-700 border-r-gray-700 rounded-full" />
          </div>
        )}
        {authenticated && !added && (
          <div className="flex flex-col justify-between h-full">
            <div className="px-2 text-gray-700 text-xl text-center font-semibold">
              <p>
                <span className="text-purple-700 font-semibold">
                  {projectOwner}{" "}
                </span>
                has invited you to collaborate on{" "}
                <span className="text-purple-700 font-semibold">
                  {projectName}
                </span>
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant={"secondary"}
                onClick={handleDecline}
                disabled={isAdding}
              >
                Decline
              </Button>
              <Button
                className="bg-purple-700 text-white hover:bg-purple-800"
                onClick={handleAccept}
                disabled={isAdding}
              >
                Accept
              </Button>
            </div>
          </div>
        )}
        {authenticated && added && matchFound && !alreadyExists && (
          <div className="flex flex-col h-full justify-between">
            <div className="px-2 text-gray-700 text-xl text-center font-semibold">
              <p>
                You are now a collaborator in{" "}
                <span className="text-purple-700 font-semibold">
                  {projectName}
                </span>
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button variant={"secondary"} onClick={handleReturnToHome}>
                Home
              </Button>
            </div>
          </div>
        )}
        {authenticated && added && matchFound && alreadyExists && (
          <div className="flex flex-col justify-between h-full">
            <div className="px-2 text-gray-700 text-xl text-center font-semibold">
              <p>
                You are already a collaborator of the project{" "}
                <span className="text-purple-700 font-semibold">
                  {projectName}
                </span>
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button variant={"secondary"} onClick={handleReturnToHome}>
                Home
              </Button>
            </div>
          </div>
        )}
        {authenticated && added && !matchFound && (
          <div className="flex flex-col h-full">
            <div className="px-2 text-gray-700 text-lg text-center">
              <p className="text-red-500 font-semibold">
                Invalid invite code or the code has expired.
              </p>
              <p className="text-sm">
                Please request a fresh url from the owner of the project
              </p>
            </div>
            <div className="mt-auto ml-auto flex items-center gap-1">
              <Button variant={"secondary"} onClick={handleReturnToHome}>
                Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitePage;
