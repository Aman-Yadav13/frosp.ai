import { cn } from "@/lib/utils";
import { getIcon } from "./external/icon";
import { File, RemoteFile } from "./external/utils/file-manager";
import { XIcon } from "lucide-react";

interface WorkspaceFilesToolbarProps {
  onSelect: (file: File) => void;
  filesInToolbar: (RemoteFile | File)[];
  setFilesInToolbar: React.Dispatch<
    React.SetStateAction<(RemoteFile | File)[]>
  >;
  selectedFile: File | undefined;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | undefined>>;
}

export const WorkspaceFilesToolbar = ({
  onSelect,
  filesInToolbar,
  setFilesInToolbar,
  selectedFile,
  setSelectedFile,
}: WorkspaceFilesToolbarProps) => {
  const removeFileFromToolbar = (
    file: RemoteFile | File,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation();
    if (filesInToolbar.length === 1) {
      setSelectedFile(undefined);
    } else {
      if (selectedFile?.path === file.path) {
        if (filesInToolbar[0]?.path === file.path) {
          setSelectedFile(filesInToolbar[1] as File);
        } else {
          setSelectedFile(filesInToolbar[0] as File);
        }
      }
    }
    setFilesInToolbar((prev) => prev.filter((f) => f !== file));
  };

  const handleFileClick = (e: React.MouseEvent, file: RemoteFile | File) => {
    e.stopPropagation();
    onSelect(file as File);
  };

  return (
    <div className="flex overflow-x-scroll items-center w-full">
      {filesInToolbar?.map((file) => (
        <div
          className={cn(
            "w-fit flex items-center border group pl-2 pr-2 pt-[1px] pb-[2px] border-neutral-800 justify-between gap-2 hover:cursor-pointer",
            selectedFile?.path === file.path &&
              "bg-neutral-800 border-b-neutral-700 border-r-neutral-700 border-l-neutral-700 border-t-cyan-800"
          )}
          role="button"
          onClick={(e) => handleFileClick(e, file)}
        >
          <div className="flex items-center gap-1">
            <FileIcon extension={file.name.split(".").pop() || ""} />
            <p className="text-gray-200 text-[13px]">
              {file.name.length > 10
                ? `${file.name.slice(0, 10)}...`
                : file.name}
            </p>
          </div>
          <div
            className={cn(
              "group-hover:visible invisible px-[2px] py-[2px] hover:bg-neutral-700 rounded-sm flex items-center justify-center"
            )}
            role="button"
            onClick={(e) => removeFileFromToolbar(file, e)}
          >
            <XIcon className="h-3 w-3" />
          </div>
        </div>
      ))}
    </div>
  );
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
    <span className="flex w-3 h-3 justify-center items-center">{icon}</span>
  );
};
