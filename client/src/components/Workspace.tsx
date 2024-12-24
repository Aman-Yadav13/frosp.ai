import Editor from "@monaco-editor/react";
import { Socket } from "socket.io-client";
import { File } from "./external/utils/file-manager";

export const Workspace = ({
  selectedFile,
  socket,
}: {
  selectedFile: File | undefined;
  socket: Socket;
}) => {
  return (
    <div className="flex-1 w-[60%]">
      <Editor
        height="100vh"
        language="javascript"
        value=""
        theme="vs-dark"
        onChange={() => {}}
      />
    </div>
  );
};
