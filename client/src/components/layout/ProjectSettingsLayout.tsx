import React, { ElementRef, useRef } from "react";
import { Navbar } from "../Navbar";
import { getReplByReplid } from "@/api/repl";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProjectSettingsSidebar } from "../ProjectSettings/ProjectSettingsSidebar";
import { useUser } from "@/hooks/useUser";
import { getStatus } from "@/hooks/getStatus";
import { getCurrentUser } from "@/api/user";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { useProjectSettingsSidebar } from "@/hooks/useProjectSettingsSidebar";

const ProjectSettingsLayout = (props: { children?: React.ReactNode }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { isResetting } = useProjectSettingsSidebar((state) => state);
  const isMobile = useMediaQuery("max-width: 768px");
  const { setProject } = useCurrentProject((state) => state);
  const state = useUser((state) => state);
  const [isLoggedIn, _] = getStatus();
  const contentRef = useRef<ElementRef<"div">>(null);
  const [projectDetails, setProjectDetails] = useState();
  const [isLoginProcessed, setIsLoginProcessed] = useState(false);

  if (!projectId) return null;
  const getUser = useCallback(async () => {
    const user = await getCurrentUser();
    if (user) {
      state.setUserInfo({
        _id: user.data._id,
        email: user.data.email,
        fullName: user.data.fullName,
        username: user.data.username,
        updatedAt: user.data.updatedAt,
        createdAt: user.data.createdAt,
      });
    }
  }, []);

  const getProjectDetails = useCallback(async () => {
    try {
      const resp = await getReplByReplid(projectId!);
      setProjectDetails(resp.repl);
      setProject(resp.repl);
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      state.setIsLoggedIn(true);
      getUser();
    }
    setIsLoginProcessed(true);
  }, [getUser, isLoggedIn]);

  useEffect(() => {
    getProjectDetails();
  }, [getProjectDetails]);

  return (
    <main className="bg-gray-900 w-full h-full overflow-hidden">
      <Navbar isLoginProcessed={isLoginProcessed} />
      <div
        className="h-auto w-full bg-white relative"
        style={{ minHeight: `calc(100% - 58px)` }}
      >
        <ProjectSettingsSidebar contentRef={contentRef} />
        <div
          ref={contentRef}
          className={cn(
            "h-full w-full",
            isResetting && "transition-all ease-in-out duration-300",
            isMobile && "w-full"
          )}
        >
          {props.children}
        </div>
      </div>
    </main>
  );
};

export default ProjectSettingsLayout;
