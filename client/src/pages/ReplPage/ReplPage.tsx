import { Workspace } from "@/components/Workspace";
import { Sidebar } from "@/components/sidebar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
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
import { getK8sNodePorts, startK8sContainer } from "@/api/k8s";
import { useContainer } from "@/hooks/useContainer";
import { WorkspaceToolsComponent } from "@/components/WorkspaceToolsComponent";

const ReplPage = () => {
  const { userId, projectId } = useParams();
  const [podCreated, setPodCreated] = useState(false);
  // const startContainer = useCallback(async () => {
  //   try {
  //     const initialTest = await getK8sNodePorts(`repl-${projectId}`);
  //     if (initialTest.status === 500) {
  //       const startResponse = await startK8sContainer({
  //         userId,
  //         replId: projectId,
  //       });
  //       console.log("Start Response: ", startResponse);

  //       if (startResponse.status === 200) {
  //         const nodePortsResponse = await getK8sNodePorts(`repl-${projectId}`);
  //         console.log("NodePorts Response", nodePortsResponse);
  //         if (nodePortsResponse.status === 200) {
  //           setPodCreated(true);
  //           state.setUserNodePort(nodePortsResponse.data.ports[1].nodePort);
  //           state.setWsNodePort(nodePortsResponse.data.ports[0].nodePort);
  //         }
  //         return;
  //       }
  //     } else if (initialTest.status === 200) {
  //       // console.log("Initial test true: ", initialTest);
  //       state.setUserNodePort(initialTest.data.ports[1].nodePort);
  //       state.setWsNodePort(initialTest.data.ports[0].nodePort);
  //       setPodCreated(true);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [projectId]);

  const startContainer = useCallback(async () => {
    try {
      const startResponse = await startK8sContainer({
        userId,
        replId: projectId,
      });
      setPodCreated(true);
      return;
    } catch (e) {
      console.log(e);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      startContainer();
    }
  }, [startContainer]);

  if (!podCreated) {
    return <>Booting...</>;
  }
  return <CodingPagePodCreated />;
};

const CodingPagePodCreated = () => {
  const contentRef = React.createRef<HTMLDivElement>();
  const { projectId } = useParams();
  const [loaded, setLoaded] = useState(false);
  const socket = useSocket(projectId!);
  const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [showOutput, setShowOutput] = useState(false);

  // if (!socket || !socket.connected) {
  //   return null;
  // }

  useEffect(() => {
    if (socket) {
      socket.on("loaded", ({ rootContent }: { rootContent: RemoteFile[] }) => {
        console.log("Root content: ", rootContent);
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
    <div className="h-full flex w-full overflow-hidden">
      <Sidebar contentRef={contentRef}>
        <FileTree
          rootDir={rootDir}
          selectedFile={selectedFile}
          onSelect={onSelect}
        />
      </Sidebar>
      <div ref={contentRef} className="flex-1 flex w-full h-full">
        <div className="flex flex-col w-full h-full">
          <WorkspaceToolsComponent setShowOutput={setShowOutput} />
          <div className="flex-1 w-full h-full flex">
            <Workspace
              socket={socket!}
              selectedFile={selectedFile}
              onSelect={onSelect}
              files={fileStructure}
            />
            <div className="w-[40%] flex-1 flex flex-col gap-0 h-full">
              {showOutput && <Output />}
              {socket && socket.connected && (
                <TerminalComponent showOutput={showOutput} socket={socket!} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplPage;
