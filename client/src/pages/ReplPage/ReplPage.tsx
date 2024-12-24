import { Workspace } from "@/components/Workspace";
import { Sidebar } from "@/components/sidebar";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useSocket } from "@/hooks/useSocket";
import {
  buildFileTree,
  File,
  RemoteFile,
  Type,
} from "@/components/external/utils/file-manager";
import { Output } from "@/components/Output";
import { TerminalComponent } from "@/components/Terminal";
import { FileTree } from "@/components/external/file-tree";

const ReplPage = () => {
  const [searchParams] = useSearchParams();
  const [podCreated, setPodCreated] = useState(false);
  const { language } = useParams();
  const replId = searchParams.get("replId") ?? "";

  useEffect(() => {
    if (replId) {
      axios
        .post(`http://localhost:3002/start`, { replId })
        .then(() => setPodCreated(true))
        .catch((err) => console.log(err));
    }
  }, []);

  // if (!podCreated) {
  //   return <>Booting...</>;
  // }
  return <CodingPagePodCreated />;
};

const CodingPagePodCreated = () => {
  const contentRef = React.createRef<HTMLDivElement>();
  const [searchParams] = useSearchParams();
  const replId = searchParams.get("replId") ?? "";
  const [loaded, setLoaded] = useState(false);
  const socket = useSocket(replId);
  const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on("loaded", ({ rootContent }: { rootContent: RemoteFile[] }) => {
        setLoaded(true);
        setFileStructure(rootContent);
      });
    }
  }, [socket]);

  const onSelect = (file: File) => {
    if (file?.type === Type.DIRECTORY) {
      socket?.emit("fetchDir", file.path, (data: RemoteFile[]) => {
        setFileStructure((prev) => {
          const allFiles = [...prev, ...data];
          return allFiles.filter(
            (file, index, self) =>
              index === self.findIndex((f) => f.path === file.path)
          );
        });
      });
    } else {
      socket?.emit("fetchContent", { path: file.path }, (data: string) => {
        file.content = data;
        setSelectedFile(file);
      });
    }
  };

  // if (!loaded) {
  //   return "Loading...";
  // }
  const rootDir = useMemo(() => {
    return buildFileTree(fileStructure);
  }, [fileStructure]);

  useEffect(() => {
    if (!selectedFile) {
      onSelect(rootDir?.files[0]);
    }
  }, [selectedFile]);

  return (
    <div className="h-full bg-gray-900 flex w-full overflow-hidden">
      <Sidebar contentRef={contentRef}>
        <FileTree
          rootDir={rootDir}
          selectedFile={selectedFile}
          onSelect={onSelect}
        />
      </Sidebar>
      <div ref={contentRef} className="bg-gray-800 flex-1 flex w-full h-full">
        <Workspace socket={socket!} selectedFile={selectedFile} />
        <div className="w-[40%] flex flex-col flex-1">
          {showOutput && <Output />}
          <TerminalComponent socket={socket!} />
        </div>
      </div>
    </div>
  );
};

export default ReplPage;
