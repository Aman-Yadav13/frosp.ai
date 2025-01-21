import { SiPolymerproject } from "react-icons/si";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { IoSettingsOutline } from "react-icons/io5";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MdPeopleAlt } from "react-icons/md";
import { ElementRef, RefObject, useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useProjectSettingsSidebar } from "@/hooks/useProjectSettingsSidebar";

import { BiChevronsLeft } from "react-icons/bi";
import { LuMenu } from "react-icons/lu";

interface ProjectSettingsSidebarProps {
  contentRef: RefObject<HTMLDivElement>;
}

export const ProjectSettingsSidebar = ({
  contentRef,
}: ProjectSettingsSidebarProps) => {
  const { project } = useCurrentProject();
  const { pathname } = useLocation();
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const isMobile = useMediaQuery("max-width: 768px");

  const { isResetting, setIsResetting, isCollapsed, setIsCollapsed } =
    useProjectSettingsSidebar((store) => store);

  const resetWidth = () => {
    if (sidebarRef.current && contentRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "10%" : "240px";
      contentRef.current.style.setProperty(
        "width",
        isMobile ? "90%" : "calc(100%)"
      );
      contentRef.current.style.setProperty(
        "padding-left",
        isMobile ? "12%" : "240px"
      );
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const collapse = () => {
    if (sidebarRef.current && contentRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "45px";
      contentRef.current.style.setProperty("width", "100%");
      contentRef.current.style.setProperty("padding-left", "45px");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [isMobile, pathname]);

  useEffect(() => {
    if (isCollapsed) {
      collapse();
    }
  }, [isCollapsed]);

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "fixed h-full w-60 group/sidebar bg-neutral-800 border-r border-r-slate-500 border-t",
        isResetting && "transition-all ease-in-out duration-300"
      )}
    >
      {!isCollapsed ? (
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-60 group-hover/sidebar:opacity-100 transition flex items-center justify-center"
          )}
        >
          <BiChevronsLeft className="h-6 w-6" />
        </div>
      ) : (
        <div
          onClick={resetWidth}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-100 group-hover/sidebar:opacity-100 transition"
          )}
        >
          <LuMenu className="h-6 w-6" />
        </div>
      )}
      {!isCollapsed && (
        <div className="h-full w-full">
          <div className="flex items-center gap-2 w-full py-2 px-2 transition-all duration-200">
            <SiPolymerproject size={18} />
            <p className="capitalize line-clamp-1 truncate text-xl font-semibold">
              {project?.name}
            </p>
          </div>
          <div className="h-[1px] w-full bg-zinc-700" />
          <div className="flex flex-col">
            <div
              className={cn(
                "flex items-center gap-2 w-full py-2 pr-2 pl-4 hover:bg-neutral-700 transition-all duration-200 cursor-pointer",
                location.pathname.includes("general") &&
                  "bg-zinc-800 border-r-[6px] border-r-cyan-700"
              )}
              role="button"
              onClick={() => navigate(`/projects/${projectId}/general`)}
            >
              <IoSettingsOutline size={18} />
              <p className="capitalize line-clamp-1 truncate text-lg font-semibold">
                General
              </p>
            </div>
            <div
              className={cn(
                "flex items-center gap-2 w-full py-2 pr-2 pl-4 hover:bg-neutral-700 transition-all duration-200 cursor-pointer",
                location.pathname.includes("collaborators") &&
                  "bg-zinc-800 border-r-[6px] border-r-cyan-700"
              )}
              role="button"
              onClick={() => navigate(`/projects/${projectId}/collaborators`)}
            >
              <MdPeopleAlt size={18} />
              <p className="capitalize line-clamp-1 truncate text-lg font-semibold">
                Collaborators
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
