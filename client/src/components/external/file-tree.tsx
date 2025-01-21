import React, { useState, useEffect } from "react";
import { Directory, File, sortDir, sortFile } from "./utils/file-manager";
import { getIcon } from "./icon";
import { cn } from "@/lib/utils";
import { RiArrowDropLeftLine, RiArrowDropDownLine } from "react-icons/ri";
import FileEditor from "../ui/file-editor";

interface FileTreeProps {
  rootDir: Directory;
  selectedFile: File | Directory | undefined;
  onSelect: (file: File | Directory) => void;
  onDelete?: (file: File | Directory) => void;
}

export const FileTree = (props: FileTreeProps) => {
  const [selectedDirectory, setSelectedDirectory] = useState<string>("/");

  return (
    <div>
      <FileEditor selectedFile={props.selectedFile} path={selectedDirectory} />
      <SubTree
        directory={props.rootDir}
        {...props}
        setSelectedDirectory={setSelectedDirectory}
      />
    </div>
  );
};

interface SubTreeProps {
  directory: Directory;
  selectedFile: File | Directory | undefined;
  onSelect: (file: File | Directory) => void;
  setSelectedDirectory: React.Dispatch<React.SetStateAction<string>>;
}

const SubTree = (props: SubTreeProps) => {
  return (
    <div>
      {props.directory.dirs.sort(sortDir).map((dir) => (
        <React.Fragment key={dir.id}>
          <DirDiv
            directory={dir}
            selectedFile={props.selectedFile}
            onSelect={props.onSelect}
            setSelectedDirectory={props.setSelectedDirectory}
          />
        </React.Fragment>
      ))}
      {props.directory.files.sort(sortFile).map((file) => (
        <React.Fragment key={file.id}>
          <FileDiv
            file={file}
            selectedFile={props.selectedFile}
            onClick={() => props.onSelect(file)}
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
  children?: React.ReactNode;
}) => {
  const { file, icon, selectedFile, onClick, children } = props;
  const isSelected = selectedFile?.id === file.id;
  const depth = file.depth;

  return (
    <div
      className={cn(
        `flex items-center justify-between hover:cursor-pointer hover:bg-[#242424] pl-${
          depth * 16
        }`,
        isSelected ? "bg-[#242424]" : "bg-transparent"
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        <FileIcon name={icon} extension={file.name.split(".").pop() || ""} />
        <span style={{ marginLeft: 8 }}>{file.name}</span>
      </div>
      {children}
    </div>
  );
};

const DirDiv = (props: {
  directory: Directory;
  selectedFile: File | Directory | undefined;
  onSelect: (file: File | Directory) => void;
  setSelectedDirectory: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { directory, selectedFile, onSelect, setSelectedDirectory } = props;

  const isInitiallyOpen = selectedFile
    ? isChildSelected(directory, selectedFile)
    : false;
  const [open, setOpen] = useState(isInitiallyOpen);

  const isSelectedOrOpen = selectedFile?.id === directory.id || open;

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (open) {
      setSelectedDirectory("/");
    }
    setOpen(!open);
  };

  const handleClick = () => {
    onSelect(directory);
    setSelectedDirectory(directory.path);
  };

  return (
    <div>
      {/* Directory Item */}
      <div
        className={cn(
          `flex items-center justify-between hover:cursor-pointer pl-${
            directory.depth * 16
          }`,
          isSelectedOrOpen ? "bg-[#242424]" : "bg-transparent"
        )}
        onClick={handleClick}
      >
        <div className="flex items-center">
          <FileIcon
            name={open ? "openDirectory" : "closedDirectory"}
            extension=""
          />
          <span style={{ marginLeft: 8 }}>{directory.name}</span>
        </div>
        <span className="ml-auto" onClick={handleArrowClick}>
          {open ? (
            <RiArrowDropDownLine size={24} />
          ) : (
            <RiArrowDropLeftLine size={24} />
          )}
        </span>
      </div>

      {/* Render SubTree if open */}
      {open && (
        <div style={{ marginLeft: 16 }}>
          <SubTree
            directory={directory}
            selectedFile={selectedFile}
            onSelect={onSelect}
            setSelectedDirectory={setSelectedDirectory}
          />
        </div>
      )}
    </div>
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
  return (
    <span className="flex w-8 h-8 justify-center items-center">{icon}</span>
  );
};
