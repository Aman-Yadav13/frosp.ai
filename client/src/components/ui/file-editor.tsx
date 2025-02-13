import { useSocket } from "@/hooks/useSocket";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Directory, File } from "../external/utils/file-manager";
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { MdKeyboardArrowRight } from "react-icons/md";
import { cn } from "@/lib/utils";
import { useFileEditor } from "@/hooks/useFileEditor";
import { CgFileAdd, CgFolderAdd } from "react-icons/cg";

interface FileEditorProps {
  selectedFile: Directory | File | undefined;
  path: string | undefined;
  filePath?: string | undefined;
  fileTreeCollapsed: boolean;
  setFileTreeCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isRenamingFile: boolean;
  setIsRenamingFile: React.Dispatch<React.SetStateAction<boolean>>;
  selectedNode: File | undefined;
  updateFileStructureOnDelete: (path: string, type: string) => void;
}

export const FileEditor = ({
  selectedFile,
  path,
  fileTreeCollapsed,
  setFileTreeCollapsed,
  setIsRenamingFile,
  selectedNode,
  updateFileStructureOnDelete,
}: FileEditorProps) => {
  const { projectId } = useParams();
  const socket = useSocket(projectId!);

  const { project } = useCurrentProject();
  const {
    setRenameProvided,
    setIsRenamingCompleted,
    setIsAddingFolder,
    setFolderNameProvided,
    setIsAddingFile,
    setFileNameProvided,
  } = useFileEditor((state) => state);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Delete" &&
        (selectedNode || !path || (!selectedNode && path))
      ) {
        deleteEntry();
      }
      if (
        event.key === "F2" &&
        (selectedNode || !path || (!selectedNode && path))
      ) {
        renameEntry();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedFile, path]);

  const addNewFile = (e: any) => {
    e.stopPropagation();
    setIsAddingFolder(false);
    setFolderNameProvided(undefined);
    setIsAddingFile(true);
    setFileNameProvided("");
  };

  const addNewDirectory = (e: any) => {
    e.stopPropagation();
    setIsAddingFile(false);
    setFileNameProvided(undefined);
    setIsAddingFolder(true);
    setFolderNameProvided("");
  };

  const deleteEntry = () => {
    if (!selectedNode || !path) {
      return;
    }

    let entryPath = "";
    if (selectedNode.type === 1) {
      entryPath = `${path!.replace(/^\/+/, "")}`;
      updateFileStructureOnDelete(selectedNode.path, "directory");
    } else {
      entryPath = `${selectedNode.path.replace(/^\/+/, "")}`;
      updateFileStructureOnDelete(selectedNode.path, "file");
    }
    if (!entryPath || entryPath === "/") {
      return;
    }
    socket?.emit("deleteEntry", { path: entryPath }, (response: any) => {
      if (response.success) {
      } else {
      }
    });
  };

  const renameEntry = () => {
    if (!selectedNode && !path) {
      return;
    }

    const oldPath = selectedNode ? selectedNode.path : path;
    if (!oldPath) {
      return;
    }
    setIsRenamingFile(true);
    setIsRenamingCompleted(false);
    setRenameProvided(selectedNode?.name);
  };

  return (
    <div
      className="w-full bg-transparent cursor-pointer pb-[1px] pt-[2px] border-b border-b-neutral-700"
      role="button"
      onClick={() => setFileTreeCollapsed(!fileTreeCollapsed)}
    >
      <div className="flex items-center group/sidebar-header gap-1">
        <MdKeyboardArrowRight
          size={18}
          className={cn(
            "transition-all duration-200 text-gray-300 group-hover/sidebar-header:text-gray-200",
            !fileTreeCollapsed ? "rotate-90" : "rotate-0"
          )}
        />
        <div className="w-full flex items-center justify-between pr-2">
          <p className="truncate uppercase text-xs -ml-[2px] font-normal text-gray-300 group-hover/sidebar-header:text-gray-2-0 transition-all duration-200">
            {project?.name}
          </p>
          <div className="flex items-center gap-[2px]">
            <div role="button" onClick={(e) => addNewFile(e)}>
              <CgFileAdd className="w-5 h-5 opacity-0 group-hover/sidebar:opacity-100 transition-all duration-200 text-neutral-400 hover:text-neutral-200" />
            </div>
            <div role="button" onClick={(e) => addNewDirectory(e)}>
              <CgFolderAdd className="h-5 w-5 opacity-0 group-hover/sidebar:opacity-100 transition-all duration-200 text-neutral-400 hover:text-neutral-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileEditor;
