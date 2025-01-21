import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { dir } from "console";
import { ElementRef, useRef, useState } from "react";
import { AiOutlineFileAdd, AiOutlineFolderAdd } from "react-icons/ai";
import { RiArrowLeftDoubleFill } from "react-icons/ri";
import { useParams } from "react-router-dom";

export const Sidebar = ({
  contentRef,
  children,
  projectName,
}: {
  contentRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
  projectName:string;
}) => {
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
    
  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;
    if (newWidth < 220) newWidth = 220;
    if (newWidth > 310) newWidth = 310;

    if (sidebarRef.current && navbarRef.current && contentRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`
      );
      contentRef.current.style.setProperty("left", `${newWidth}px`);
      contentRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`
      );
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current && contentRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = "220px";
      navbarRef.current.style.setProperty("width", "calc(100% - 220px)");
      navbarRef.current.style.setProperty("left", "220px");
      setTimeout(() => setIsResetting(false), 300);
      contentRef.current.style.setProperty("width", "calc(100% - 220px)");
      contentRef.current.style.setProperty("left", "220px");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current && contentRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
      contentRef.current.style.setProperty("width", "100%");
      contentRef.current.style.setProperty("left", "0");

      setTimeout(() => setIsResetting(false), 300);
    }
  };

  return (
    <>
      <div>{projectName}</div>
      <aside
        className={cn(
          "group/sidebar h-full bg-gray-950 overflow-y-auto relative flex w-60 flex-col z-[99999]  min-w-[220px]",
          isResetting && "transition-all ease-in-out duration-300",
          isCollapsed && "min-w-0 w-0"
        )}
        ref={sidebarRef}
      >
        <div className="py-2 px-1">{children}</div>

        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition"
          )}
        >
          <RiArrowLeftDoubleFill className="h-6 w-6" />
        </div>
        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-[220px] w-[calc(100%-220px)]",
          isResetting && "transition-all ease-in-out duration-300"
        )}
      >
        <nav className="bg-transparent px-3 py-2 w-full">
          {isCollapsed && (
            <HamburgerMenuIcon
              onClick={resetWidth}
              role="button"
              className="h-6 w-6 text-muted-foreground"
            />
          )}
        </nav>
      </div>
    </>
  );
};
