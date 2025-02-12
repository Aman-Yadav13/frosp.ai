import React, { useState, useEffect, useRef } from "react";
import {
  Directory,
  File,
  RemoteFile,
  sortDir,
  sortFile,
} from "./utils/file-manager";
import { getIcon } from "./icon";
import { cn } from "@/lib/utils";
import FileEditor from "../ui/file-editor";
import { MdKeyboardArrowRight } from "react-icons/md";
import { AnimatePresence } from "framer-motion";
import { useFileEditor } from "@/hooks/useFileEditor";
import { useSocket } from "@/hooks/useSocket";
import { useParams } from "react-router-dom";
import { FaRegFile } from "react-icons/fa";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { LuTrash } from "react-icons/lu";

interface FileTreeProps {
  rootDir: Directory;
  selectedFile: File | Directory | undefined;
  onSelect: (file: File | Directory) => void;
  onDelete?: (file: File | Directory) => void;
  selectedNode: File | undefined;
  setSelectedNode: React.Dispatch<React.SetStateAction<File | undefined>>;
  isRenamingFile: boolean;
  setIsRenamingFile: React.Dispatch<React.SetStateAction<boolean>>;
  fileStructure: RemoteFile[];
  setFileStructure: React.Dispatch<React.SetStateAction<RemoteFile[]>>;
  updateFileStructureOnRename: (newName: string) => void;
  updateFileStructureOnAdd: (newFileName: string, type: string) => void;
  updateFileStructureOnDelete: (path: string, type: string) => void;
  selectedDirectory: string;
  setSelectedDirectory: React.Dispatch<React.SetStateAction<string>>;
}

export const FileTree = (props: FileTreeProps) => {
  const [fileTreeCollapsed, setFileTreeCollapsed] = useState(false);
  const { selectedDirectory, setSelectedDirectory } = props;
  const { projectId } = useParams();
  const socket = useSocket(projectId!);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const {
    isAddingFolder,
    setIsAddingFolder,
    folderNameProvided,
    setFolderNameProvided,
    setIsUpdatingFileStructure,
  } = useFileEditor((state) => state);

  const handleFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setFolderNameProvided(e.target.value);
  };
  const handleAddFolderBlur = () => {
    setIsAddingFolder(false);
    setFolderNameProvided(undefined);
  };

  const handleAddFolderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && folderNameProvided) {
      const type = "dir";
      const dir = selectedDirectory || "/";
      props.updateFileStructureOnAdd(folderNameProvided, type);
      setIsAddingFolder(false);
      var folderName = folderNameProvided;
      setFolderNameProvided(undefined);
      setIsUpdatingFileStructure(true);
      socket?.emit(
        "addEntry",
        { dir, name: folderName, type },
        (response: any) => {
          if (response.success) {
          } else {
          }
          setIsUpdatingFileStructure(false);
        }
      );
    }
  };

  useEffect(() => {
    if (isAddingFolder && selectedDirectory === "/" && folderInputRef.current) {
      folderInputRef.current.focus();
    }
  }, [isAddingFolder, selectedDirectory]);

  return (
    <div>
      <FileEditor
        selectedFile={props.selectedFile}
        path={selectedDirectory}
        fileTreeCollapsed={fileTreeCollapsed}
        setFileTreeCollapsed={setFileTreeCollapsed}
        isRenamingFile={props.isRenamingFile}
        setIsRenamingFile={props.setIsRenamingFile}
        selectedNode={props.selectedNode}
        updateFileStructureOnDelete={props.updateFileStructureOnDelete}
      />
      <AnimatePresence>
        {!fileTreeCollapsed && (
          <div className="w-full h-auto pl-2">
            {selectedDirectory === "/" && isAddingFolder && (
              <>
                <div className={cn(`flex items-center`)}>
                  <span>
                    <MdKeyboardArrowRight
                      size={18}
                      className={cn(
                        "transition-all duration-200 text-gray-400"
                      )}
                    />
                  </span>
                  <div className="flex items-center -ml-[4px] w-full overflow-hidden">
                    <FileIcon name={"closedDirectory"} extension="" />
                    <input
                      className="bg-transparent text-gray-200 border border-gray-300 focus:border-gray-100 rounded-none outline-none transition-all duration-200 text-base w-full"
                      type="text"
                      ref={folderInputRef}
                      value={folderNameProvided || ""}
                      onChange={(e) => handleFolderNameChange(e)}
                      onBlur={handleAddFolderBlur}
                      onKeyDown={handleAddFolderKeyDown}
                    />
                  </div>
                </div>
              </>
            )}
            <SubTree
              directory={props.rootDir}
              {...props}
              selectedNode={props.selectedNode}
              setSelectedNode={props.setSelectedNode}
              setSelectedDirectory={setSelectedDirectory}
              isRenamingFile={props.isRenamingFile}
              setIsRenamingFile={props.setIsRenamingFile}
              path={selectedDirectory}
              fileStructure={props.fileStructure}
              setFileStructure={props.setFileStructure}
              updateFileStructureOnRename={props.updateFileStructureOnRename}
              updateFileStructureOnAdd={props.updateFileStructureOnAdd}
              updateFileStructureOnDelete={props.updateFileStructureOnDelete}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SubTreeProps {
  directory: Directory;
  selectedFile: File | Directory | undefined;
  onSelect: (file: File | Directory) => void;
  setSelectedDirectory: React.Dispatch<React.SetStateAction<string>>;
  selectedNode: File | undefined;
  setSelectedNode: React.Dispatch<React.SetStateAction<File | undefined>>;
  isRenamingFile: boolean;
  setIsRenamingFile: React.Dispatch<React.SetStateAction<boolean>>;
  path: string | undefined;
  fileStructure: RemoteFile[];
  setFileStructure: React.Dispatch<React.SetStateAction<RemoteFile[]>>;
  updateFileStructureOnRename: (newName: string) => void;
  updateFileStructureOnAdd: (newFileName: string, type: string) => void;
  updateFileStructureOnDelete: (path: string, type: string) => void;
}

const SubTree = (props: SubTreeProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    isAddingFile,
    fileNameProvided,
    setFileNameProvided,
    setIsAddingFile,
    setIsUpdatingFileStructure,
  } = useFileEditor((state) => state);
  const { projectId } = useParams();
  const socket = useSocket(projectId!);
  const fileDir = props.path || "/";

  const handleAddFileBlur = () => {
    setIsAddingFile(false);
    setFileNameProvided(undefined);
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setFileNameProvided(e.target.value);
  };

  const handleAddFileKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && fileNameProvided) {
      const type = "file";
      props.updateFileStructureOnAdd(fileNameProvided, type);
      setIsAddingFile(false);
      setIsUpdatingFileStructure(true);
      var fileName = fileNameProvided;
      setFileNameProvided(undefined);
      socket?.emit(
        "addEntry",
        { dir: fileDir, name: fileName, type },
        (response: any) => {
          if (response.success) {
          } else {
          }
          setIsUpdatingFileStructure(false);
        }
      );
    }
  };

  useEffect(() => {
    if (isAddingFile && fileDir === "/" && fileInputRef.current) {
      fileInputRef.current.focus();
    }
  }, [isAddingFile, fileDir]);

  return (
    <div>
      {props.directory.dirs.sort(sortDir).map((dir) => (
        <React.Fragment key={dir.id}>
          <DirDiv
            directory={dir}
            selectedFile={props.selectedFile}
            onSelect={props.onSelect}
            setSelectedDirectory={props.setSelectedDirectory}
            setSelectedNode={props.setSelectedNode}
            selectedNode={props.selectedNode}
            isRenamingFile={props.isRenamingFile}
            setIsRenamingFile={props.setIsRenamingFile}
            path={props.path}
            fileStructure={props.fileStructure}
            setFileStructure={props.setFileStructure}
            updateFileStructureOnRename={props.updateFileStructureOnRename}
            updateFileStructureOnAdd={props.updateFileStructureOnAdd}
            updateFileStructureOnDelete={props.updateFileStructureOnDelete}
          />
        </React.Fragment>
      ))}
      {isAddingFile && fileDir === "/" && (
        <div
          className={cn(
            "flex items-center hover:cursor-pointer gap-1 ml-[3px]"
          )}
        >
          <FileIcon name={"createFileIcon"} />
          <input
            className="bg-transparent text-gray-200 border border-gray-300 focus:border-gray-100 rounded-none outline-none transition-all duration-200 w-full text-base"
            type="text"
            ref={fileInputRef}
            value={fileNameProvided || ""}
            onChange={(e) => handleFileNameChange(e)}
            onBlur={handleAddFileBlur}
            onKeyDown={handleAddFileKeyDown}
          />
        </div>
      )}

      {props.directory.files.sort(sortFile).map((file) => (
        <React.Fragment key={file.id}>
          <FileDiv
            file={file}
            selectedFile={props.selectedFile}
            onClick={() => props.onSelect(file)}
            setSelectedNode={props.setSelectedNode}
            selectedNode={props.selectedNode}
            isRenamingFile={props.isRenamingFile}
            setIsRenamingFile={props.setIsRenamingFile}
            path={props.path}
            fileStructure={props.fileStructure}
            setFileStructure={props.setFileStructure}
            updateFileStructureOnRename={props.updateFileStructureOnRename}
            updateFileStructureOnAdd={props.updateFileStructureOnAdd}
            updateFileStructureOnDelete={props.updateFileStructureOnDelete}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

const FileDiv = (props: {
  file: File | Directory;
  icon?: string;
  selectedFile: File | Directory | undefined;
  onClick: () => void;
  selectedNode: File | undefined;
  setSelectedNode: React.Dispatch<React.SetStateAction<File | undefined>>;
  children?: React.ReactNode;
  isRenamingFile: boolean;
  setIsRenamingFile: React.Dispatch<React.SetStateAction<boolean>>;
  path: string | undefined;
  fileStructure: RemoteFile[];
  setFileStructure: React.Dispatch<React.SetStateAction<RemoteFile[]>>;
  updateFileStructureOnRename: (newName: string) => void;
  updateFileStructureOnAdd: (newFileName: string, type: string) => void;
  updateFileStructureOnDelete: (path: string, type: string) => void;
}) => {
  const {
    file,
    icon,
    onClick,
    children,
    selectedNode,
    isRenamingFile,
    setIsRenamingFile,
    path,
    updateFileStructureOnRename,
    updateFileStructureOnDelete,
  } = props;
  const isSelected = selectedNode?.id === file.id;
  const depth = file.depth;
  const {
    renameProvided,
    setRenameProvided,
    setIsRenamingCompleted,
    setIsUpdatingFileStructure,
    setContextEvent,
    contextEvent,
  } = useFileEditor((state) => state);
  const { projectId } = useParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const socket = useSocket(projectId!);

  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setRenameProvided(e.target.value);
  };

  const handleBlur = () => {
    setIsRenamingFile(false);
    setIsRenamingCompleted(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const oldPath = selectedNode ? selectedNode.path : path;
      if (!oldPath) return;

      const newName = renameProvided || selectedNode?.name || "";
      const newPath = oldPath.replace(/[^/]+$/, newName);

      if (newName) {
        updateFileStructureOnRename(newName);

        setIsRenamingCompleted(true);
        setIsRenamingFile(false);
        setIsUpdatingFileStructure(true);
        setRenameProvided(undefined);
        socket?.emit("renameEntry", { oldPath, newPath }, (response: any) => {
          if (response.success) {
          } else {
            alert(`Error renaming entry: ${response.error}`);
            props.setFileStructure((prev: any) =>
              prev.map((file: any) =>
                file.path === newPath
                  ? { ...file, name: oldPath.split("/").pop()!, path: oldPath }
                  : file
              )
            );
          }
          setIsUpdatingFileStructure(false);
        });
      }
    }
  };

  const handleContextRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedNode && !path) {
      return;
    }

    const oldPath = selectedNode ? selectedNode.path : path;
    if (!oldPath) {
      return;
    }
    setContextEvent(true);
    setIsRenamingFile(true);
    setIsRenamingCompleted(false);
    setRenameProvided(selectedNode?.name);
  };

  const handleContextDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedNode || !path) {
      return;
    }

    setContextEvent(true);
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
    setContextEvent(false);
  };

  useEffect(() => {
    if (isRenamingFile && selectedNode?.id === file?.id && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenamingFile, selectedNode?.id, file?.id]);

  return (
    <>
      {selectedNode?.id === file?.id ? (
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={cn(
                `flex items-center justify-between hover:cursor-pointer hover:bg-[#242424] pl-[${
                  depth * 8
                }px]`,
                isSelected ? "bg-[#242424]" : "bg-transparent"
              )}
              onClick={onClick}
            >
              <div className="flex items-center overflow-hidden">
                <FileIcon
                  name={icon}
                  extension={file.name.split(".").pop() || ""}
                />
                {isRenamingFile && selectedNode?.id === file?.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={renameProvided}
                    className="bg-transparent border-none outline-none"
                    onChange={(e) => handleRenameChange(e)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                  />
                ) : (
                  <span
                    className="truncate select-none"
                    style={{ marginLeft: 8 }}
                  >
                    {file.name}
                  </span>
                )}
              </div>
              {children}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent
            className={cn(
              "z-[100000] bg-neutral-900",
              contextEvent && "hidden"
            )}
          >
            <ContextMenuItem className="text-xs !py-[4px]">
              <div
                className="flex items-center justify-between w-full text-xs"
                role="button"
                onClick={(e) => handleContextRename(e)}
              >
                Rename
              </div>
              <p className="text-gray-400 rounded-sm bg-neutral-800 px-[4px] py-[2px]">
                F2
              </p>
            </ContextMenuItem>
            <ContextMenuItem className="text-xs !py-[4px]">
              <div
                className="flex items-center justify-between w-full"
                role="button"
                onClick={(e) => handleContextDelete(e)}
              >
                Delete
                <LuTrash className="text-gray-400 rounded-sm bg-neutral-800 px-[4px] py-[2px] h-[18px] w-[18px]" />
              </div>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ) : (
        <div
          className={cn(
            `flex items-center justify-between hover:cursor-pointer hover:bg-[#242424] pl-[${
              depth * 8
            }px]`,
            isSelected ? "bg-[#242424]" : "bg-transparent"
          )}
          onClick={onClick}
        >
          <div className="flex items-center overflow-hidden">
            <FileIcon
              name={icon}
              extension={file.name.split(".").pop() || ""}
            />
            {isRenamingFile && selectedNode?.id === file?.id ? (
              <input
                ref={inputRef}
                type="text"
                value={renameProvided}
                className="bg-transparent border-none outline-none"
                onChange={(e) => handleRenameChange(e)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <span className="truncate select-none" style={{ marginLeft: 8 }}>
                {file.name}
              </span>
            )}
          </div>
          {children}
        </div>
      )}
    </>
  );
};

const DirDiv = (props: {
  directory: Directory;
  selectedFile: File | Directory | undefined;
  onSelect: (file: File | Directory) => void;
  setSelectedDirectory: React.Dispatch<React.SetStateAction<string>>;
  selectedNode: File | undefined;
  setSelectedNode: React.Dispatch<React.SetStateAction<File | undefined>>;
  isRenamingFile: boolean;
  setIsRenamingFile: React.Dispatch<React.SetStateAction<boolean>>;
  path: string | undefined;
  fileStructure: RemoteFile[];
  setFileStructure: React.Dispatch<React.SetStateAction<RemoteFile[]>>;
  updateFileStructureOnRename: (newName: string) => void;
  updateFileStructureOnAdd: (newFileName: string, type: string) => void;
  updateFileStructureOnDelete: (path: string, type: string) => void;
}) => {
  const {
    directory,
    selectedFile,
    onSelect,
    setSelectedDirectory,
    selectedNode,
    isRenamingFile,
    setIsRenamingFile,
    path,
    updateFileStructureOnRename,
    updateFileStructureOnAdd,
    updateFileStructureOnDelete,
  } = props;
  const isInitiallyOpen = selectedFile
    ? isChildSelected(directory, selectedFile)
    : false;
  const [open, setOpen] = useState(isInitiallyOpen);
  const {
    renameProvided,
    setRenameProvided,
    setIsRenamingCompleted,
    isAddingFolder,
    setIsAddingFolder,
    folderNameProvided,
    setFolderNameProvided,
    isAddingFile,
    setIsAddingFile,
    setFileNameProvided,
    fileNameProvided,
    setIsUpdatingFileStructure,
    contextEvent,
    setContextEvent,
  } = useFileEditor((state) => state);
  const { projectId } = useParams();
  const isSelectedOrOpen = selectedNode?.id === directory?.id;
  const inputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socket = useSocket(projectId!);
  const fileDir = path || "/";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
    if (open) {
      setSelectedDirectory("/");
    } else {
      onSelect(directory);
      setSelectedDirectory(directory.path);
    }
  };

  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setRenameProvided(e.target.value);
  };

  const handleBlur = () => {
    setIsRenamingFile(false);
    setIsRenamingCompleted(true);
    setRenameProvided(undefined);
    setContextEvent(false);
  };

  const handleFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setFolderNameProvided(e.target.value);
  };

  const handleAddFolderBlur = () => {
    setIsAddingFolder(false);
    setFolderNameProvided(undefined);
  };

  const handleAddFileBlur = () => {
    setIsAddingFile(false);
    setFileNameProvided(undefined);
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setFileNameProvided(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const oldPath = selectedNode ? selectedNode.path : path;
      if (!oldPath) return;

      const newName = renameProvided || selectedNode?.name || "";
      const newPath = oldPath.replace(/[^/]+$/, newName);

      if (newName) {
        updateFileStructureOnRename(newName);

        setIsRenamingCompleted(true);
        setIsRenamingFile(false);
        setIsUpdatingFileStructure(true);
        setRenameProvided(undefined);
        setContextEvent(false);
        socket?.emit("renameEntry", { oldPath, newPath }, (response: any) => {
          if (response.success) {
          } else {
            alert(`Error renaming entry: ${response.error}`);
            props.setFileStructure((prev: any) =>
              prev.map((file: any) =>
                file.path === newPath
                  ? { ...file, name: oldPath.split("/").pop()!, path: oldPath }
                  : file
              )
            );
          }
          setIsUpdatingFileStructure(false);
        });
      }
    }
  };

  const handleAddFolderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && folderNameProvided) {
      const type = "dir";
      const dir = path || "/";
      updateFileStructureOnAdd(folderNameProvided, type);
      setIsAddingFolder(false);
      setIsUpdatingFileStructure(true);
      var folderName = folderNameProvided;
      setFolderNameProvided(undefined);
      socket?.emit(
        "addEntry",
        { dir, name: folderName, type },
        (response: any) => {
          if (response.success) {
          } else {
          }
          setIsUpdatingFileStructure(false);
        }
      );
    }
  };

  const handleAddFileKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && fileNameProvided) {
      const type = "file";
      props.updateFileStructureOnAdd(fileNameProvided, type);
      setIsAddingFile(false);
      setIsUpdatingFileStructure(true);
      var fileName = fileNameProvided;
      setFileNameProvided(undefined);
      socket?.emit(
        "addEntry",
        { dir: fileDir, name: fileName, type },
        (response: any) => {
          if (response.success) {
          } else {
          }
          setIsUpdatingFileStructure(false);
        }
      );
    }
  };

  const handleContextRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedNode && !path) {
      return;
    }

    const oldPath = selectedNode ? selectedNode.path : path;
    if (!oldPath) {
      return;
    }
    setContextEvent(true);
    setIsRenamingFile(true);
    setIsRenamingCompleted(false);
    setRenameProvided(selectedNode?.name);
  };

  const handleContextDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedNode || !path) {
      return;
    }

    setContextEvent(true);
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
    setContextEvent(false);
  };

  useEffect(() => {
    if (
      isRenamingFile &&
      selectedNode?.id === directory?.id &&
      inputRef.current
    ) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenamingFile, selectedNode?.id, directory?.id]);

  useEffect(() => {
    if (isAddingFolder && path === directory?.id && folderInputRef.current) {
      folderInputRef.current.focus();
    }
  }, [isAddingFolder, path, directory?.id]);

  useEffect(() => {
    if (isAddingFile && path === directory?.id && fileInputRef.current) {
      fileInputRef.current.focus();
    }
  }, [isAddingFile, fileDir]);

  return (
    <>
      {isAddingFolder && !isAddingFile && path === directory?.path ? (
        <div>
          <div className="flex flex-col gap-0">
            <div
              className={cn(
                `flex items-center hover:cursor-pointer pl-[${
                  directory.depth * 8
                }px]`,
                isSelectedOrOpen ? "bg-[#242424]" : "bg-transparent"
              )}
              role="button"
              onClick={handleClick}
            >
              <span>
                <MdKeyboardArrowRight
                  size={18}
                  className={cn(
                    "transition-all duration-200 text-gray-400",
                    open ? "rotate-90 " : "rotate-0"
                  )}
                />
              </span>
              <div className="flex items-center -ml-[6px] overflow-hidden">
                <FileIcon
                  name={open ? "openDirectory" : "closedDirectory"}
                  extension=""
                />
                <span className="truncate select-none">{directory.name}</span>
              </div>
            </div>
            <div style={{ marginLeft: 10 }}>
              <div
                className={cn(
                  `flex items-center pl-[${directory.depth * 8}px]`
                )}
              >
                <span>
                  <MdKeyboardArrowRight
                    size={18}
                    className={cn("transition-all duration-200 text-gray-400")}
                  />
                </span>
                <div className="flex items-center -ml-[6px] overflow-hidden">
                  <FileIcon name={"closedDirectory"} extension="" />
                  <input
                    className="bg-transparent text-gray-200 border border-gray-300 focus:border-gray-100 rounded-none outline-none transition-all duration-200 text-base w-[90%]"
                    type="text"
                    ref={folderInputRef}
                    value={folderNameProvided || ""}
                    onChange={(e) => handleFolderNameChange(e)}
                    onBlur={handleAddFolderBlur}
                    onKeyDown={handleAddFolderKeyDown}
                  />
                </div>
              </div>
            </div>
            {open && (
              <div style={{ marginLeft: 10 }}>
                <SubTree
                  directory={directory}
                  selectedFile={selectedFile}
                  onSelect={onSelect}
                  setSelectedDirectory={setSelectedDirectory}
                  selectedNode={props.selectedNode}
                  setSelectedNode={props.setSelectedNode}
                  isRenamingFile={isRenamingFile}
                  setIsRenamingFile={setIsRenamingFile}
                  path={path}
                  fileStructure={props.fileStructure}
                  setFileStructure={props.setFileStructure}
                  updateFileStructureOnRename={
                    props.updateFileStructureOnRename
                  }
                  updateFileStructureOnAdd={props.updateFileStructureOnAdd}
                  updateFileStructureOnDelete={
                    props.updateFileStructureOnDelete
                  }
                />
              </div>
            )}
          </div>
        </div>
      ) : isAddingFile && path === directory?.path ? (
        <div>
          <div className="flex flex-col gap-0">
            <div
              className={cn(
                `flex items-center hover:cursor-pointer pl-[${
                  directory.depth * 8
                }px]`,
                isSelectedOrOpen ? "bg-[#242424]" : "bg-transparent"
              )}
              role="button"
              onClick={handleClick}
            >
              <span>
                <MdKeyboardArrowRight
                  size={18}
                  className={cn(
                    "transition-all duration-200 text-gray-400",
                    open ? "rotate-90 " : "rotate-0"
                  )}
                />
              </span>
              <div className="flex items-center -ml-[6px] overflow-hidden">
                <FileIcon
                  name={open ? "openDirectory" : "closedDirectory"}
                  extension=""
                />
                <span className="truncate select-none">{directory.name}</span>
              </div>
            </div>
            <div style={{ marginLeft: 10 }}>
              <div
                className={cn(
                  `flex items-center pl-[${directory.depth * 8}px]`
                )}
              >
                <div className="flex items-center overflow-hidden w-full">
                  <FileIcon name={"createFileIcon"} extension="" />
                  <input
                    className="bg-transparent text-gray-200 border border-gray-300 focus:border-gray-100 outline-none transition-all duration-200 text-base w-full rounded-none"
                    type="text"
                    ref={fileInputRef}
                    value={fileNameProvided || ""}
                    onChange={(e) => handleFileNameChange(e)}
                    onBlur={handleAddFileBlur}
                    onKeyDown={handleAddFileKeyDown}
                  />
                </div>
              </div>
            </div>
            {open && (
              <div style={{ marginLeft: 10 }}>
                <SubTree
                  directory={directory}
                  selectedFile={selectedFile}
                  onSelect={onSelect}
                  setSelectedDirectory={setSelectedDirectory}
                  selectedNode={props.selectedNode}
                  setSelectedNode={props.setSelectedNode}
                  isRenamingFile={isRenamingFile}
                  setIsRenamingFile={setIsRenamingFile}
                  path={path}
                  fileStructure={props.fileStructure}
                  setFileStructure={props.setFileStructure}
                  updateFileStructureOnRename={
                    props.updateFileStructureOnRename
                  }
                  updateFileStructureOnAdd={props.updateFileStructureOnAdd}
                  updateFileStructureOnDelete={
                    props.updateFileStructureOnDelete
                  }
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {selectedNode?.id === directory?.id ? (
            <ContextMenu>
              <ContextMenuTrigger>
                <div
                  className={cn(
                    `flex items-center hover:cursor-pointer pl-[${
                      directory.depth * 8
                    }px]`,
                    isSelectedOrOpen ? "bg-[#242424]" : "bg-transparent"
                  )}
                  role="button"
                  onClick={handleClick}
                >
                  <span>
                    <MdKeyboardArrowRight
                      size={18}
                      className={cn(
                        "transition-all duration-200 text-gray-400",
                        open ? "rotate-90 " : "rotate-0"
                      )}
                    />
                  </span>

                  <div className="flex items-center -ml-[6px] overflow-hidden">
                    <FileIcon
                      name={open ? "openDirectory" : "closedDirectory"}
                      extension=""
                    />
                    {isRenamingFile && selectedNode?.id === directory?.id ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={renameProvided}
                        className="bg-transparent border-none outline-none w-[90%]"
                        onChange={(e) => handleRenameChange(e)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                      />
                    ) : (
                      <span className="truncate select-none">
                        {directory.name}
                      </span>
                    )}
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent
                className={cn(
                  "z-[100000] bg-neutral-900",
                  contextEvent && "hidden"
                )}
              >
                <ContextMenuItem className="text-xs !py-[4px]">
                  <div
                    className="flex items-center justify-between w-full text-xs"
                    role="button"
                    onClick={(e) => handleContextRename(e)}
                  >
                    Rename
                  </div>
                  <p className="text-gray-400 rounded-sm bg-neutral-800 px-[4px] py-[2px]">
                    F2
                  </p>
                </ContextMenuItem>
                <ContextMenuItem className="text-xs !py-[4px]">
                  <div
                    className="flex items-center justify-between w-full"
                    role="button"
                    onClick={(e) => handleContextDelete(e)}
                  >
                    Delete
                    <LuTrash className="text-gray-400 rounded-sm bg-neutral-800 px-[4px] py-[2px] h-[18px] w-[18px]" />
                  </div>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ) : (
            <div
              className={cn(
                `flex items-center hover:cursor-pointer pl-[${
                  directory.depth * 8
                }px]`,
                isSelectedOrOpen ? "bg-[#242424]" : "bg-transparent"
              )}
              role="button"
              onClick={handleClick}
            >
              <span>
                <MdKeyboardArrowRight
                  size={18}
                  className={cn(
                    "transition-all duration-200 text-gray-400",
                    open ? "rotate-90 " : "rotate-0"
                  )}
                />
              </span>

              <div className="flex items-center -ml-[6px] overflow-hidden">
                <FileIcon
                  name={open ? "openDirectory" : "closedDirectory"}
                  extension=""
                />
                {isRenamingFile && selectedNode?.id === directory?.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={renameProvided}
                    className="bg-transparent border-none outline-none w-[90%]"
                    onChange={(e) => handleRenameChange(e)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                  />
                ) : (
                  <span className="truncate select-none">{directory.name}</span>
                )}
              </div>
            </div>
          )}

          {open && (
            <div style={{ marginLeft: 10 }}>
              <SubTree
                directory={directory}
                selectedFile={selectedFile}
                onSelect={onSelect}
                setSelectedDirectory={setSelectedDirectory}
                selectedNode={props.selectedNode}
                setSelectedNode={props.setSelectedNode}
                isRenamingFile={isRenamingFile}
                setIsRenamingFile={setIsRenamingFile}
                path={path}
                fileStructure={props.fileStructure}
                setFileStructure={props.setFileStructure}
                updateFileStructureOnRename={props.updateFileStructureOnRename}
                updateFileStructureOnAdd={props.updateFileStructureOnAdd}
                updateFileStructureOnDelete={props.updateFileStructureOnDelete}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

const isChildSelected = (
  directory: Directory,
  selectedFile: File | Directory
): boolean => {
  let result = false;

  const checkChild = (dir: Directory, file: File | Directory) => {
    if (file.parentId === dir.id) {
      result = true;
      return;
    }
    dir.dirs.forEach((childDir) => checkChild(childDir, file));
  };

  checkChild(directory, selectedFile);
  return result;
};

const FileIcon = ({
  extension,
  name,
}: {
  name?: string;
  extension?: string;
}) => {
  const icon = getIcon(extension || "", name || "");
  return name === "createFileIcon" ? (
    <span className="flex w-7 h-7 justify-center items-center">
      <FaRegFile className="text-slate-400 h-4 w-4" />
    </span>
  ) : (
    <span className="flex w-7 h-7 justify-center items-center">{icon}</span>
  );
};
