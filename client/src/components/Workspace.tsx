import Editor from "@monaco-editor/react";
import { Socket } from "socket.io-client";
import { File, RemoteFile } from "./external/utils/file-manager";
import { WorkspaceFilesToolbar } from "./WorkspaceFilesToolbar";
import { useMonacoEditor } from "@/hooks/useMonacoEditor";
import { WorkspaceCommands } from "./WorkspaceCommands";

interface WorkspaceProps {
  selectedFile: File | undefined;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | undefined>>;
  socket: Socket;
  onSelect: (file: File) => void;
  files: RemoteFile[];
  filesInToolbar: (RemoteFile | File)[];
  setFilesInToolbar: React.Dispatch<
    React.SetStateAction<(RemoteFile | File)[]>
  >;
}

export const Workspace = ({
  selectedFile,
  setSelectedFile,
  onSelect,
  filesInToolbar,
  setFilesInToolbar,
}: WorkspaceProps) => {
  const { setMonacoEditor } = useMonacoEditor();

  const code = selectedFile?.content;
  const language = getLanguage(selectedFile?.name);
  // console.log("Code: ", code);

  const handleMount = (
    editor: import("monaco-editor").editor.IStandaloneCodeEditor
  ) => {
    setMonacoEditor(editor);
  };

  if (!selectedFile) {
    return <WorkspaceCommands />;
    // return (
    //   <div className="flex-1 flex h-full items-center justify-center border-r border-r-slate-800">
    //     <h1 className="text-2xl text-gray-400">
    //       Select a file to start coding
    //     </h1>
    //   </div>
    // );
  }

  return (
    <div className="flex-1">
      <div className="w-full h-6 bg-neutral-900 border-b border-b-neutral-800">
        <WorkspaceFilesToolbar
          filesInToolbar={filesInToolbar}
          onSelect={onSelect}
          setFilesInToolbar={setFilesInToolbar}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
        />
      </div>
      <Editor
        height="100vh"
        language={language}
        defaultValue={code || ""}
        theme="vs-dark"
        onMount={(editor) => handleMount(editor)}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
        }}
      />
    </div>
  );
};

function getLanguage(fileName: string | undefined): string {
  const extension = fileName?.split(".").pop();
  switch (extension) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "py":
      return "python";
    case "json":
      return "json";
    default:
      return "plaintext";
  }
}
