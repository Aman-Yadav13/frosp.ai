import Editor from "@monaco-editor/react";
import { Socket } from "socket.io-client";
import { File, RemoteFile } from "./external/utils/file-manager";

export const Workspace = ({
  selectedFile,
  socket,
  onSelect,
  files,
}: {
  selectedFile: File | undefined;
  socket: Socket;
  onSelect: (file: File) => void;
  files: RemoteFile[];
}) => {
  if (!selectedFile) {
    return (
      <div className="flex-1 flex h-full items-center justify-center border-r border-r-slate-800">
        <h1 className="text-2xl text-gray-400">
          Select a file to start coding
        </h1>
      </div>
    );
  }

  const code = selectedFile.content;
  let language = selectedFile.name.split(".").pop();

  if (language === "js" || language === "jsx") language = "javascript";
  else if (language === "ts" || language === "tsx") language = "typescript";
  else if (language === "py") language = "python";

  const debounce = (
    func: (value: string | undefined) => void,
    wait: number
  ) => {
    let timeout: NodeJS.Timeout;
    return (value: string | undefined) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(value);
      }, wait);
    };
  };

  return (
    <div className="flex-1">
      <Editor
        height="100vh"
        language={language}
        value={code || " "}
        theme="vs-dark"
        onChange={debounce((value: string | undefined) => {
          socket.emit("updateContent", {
            path: selectedFile.path,
            content: value,
          });
        }, 500)}
      />
    </div>
  );
};
