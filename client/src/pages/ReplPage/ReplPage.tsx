import { Workspace } from "@/components/Workspace";
import { Sidebar } from "@/components/sidebar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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
import { startK8sContainer } from "@/api/k8s";
import { WorkspaceToolsComponent } from "@/components/WorkspaceToolsComponent";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CodingPageSkeleton } from "@/components/skeletons/CodingPageSkeleton";
import { FooterTools } from "@/components/FooterTools";
import { getFTL } from "@/api/repl";
import { useBackSocket } from "@/hooks/useBackSocket";

const ReplPage = () => {
  const { userId, projectId } = useParams();
  const [podCreated, setPodCreated] = useState(false);

  const startContainer = useCallback(async () => {
    try {
      await startK8sContainer({
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
    return <CodingPageSkeleton />;
  }

  return <CodingPagePodCreated />;
};

const CodingPagePodCreated = () => {
  const { projectId } = useParams();
  const contentRef = React.createRef<HTMLDivElement>();
  const [loaded, setLoaded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const backSocket = useBackSocket(projectId!);
  const socket = useSocket(projectId!);
  const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [showOutput, setShowOutput] = useState(false);
  // if (!socket || !socket.connected) {
  //   return null;
  // }

  const getFreeTimeLeft = useCallback(async () => {
    try {
      const res = await getFTL(projectId!);
      setTimeRemaining(res.timeLeft);
    } catch (e) {
      //Handle errors;
      console.log(e);
    }
  }, [projectId]);

  useEffect(() => {
    getFreeTimeLeft();
  }, [getFreeTimeLeft]);
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

  if (!loaded) {
    // return <CodingPageSkeleton />;
  }
  const rootDir = useMemo(() => {
    return buildFileTree(fileStructure);
  }, [fileStructure]);

  useEffect(() => {
    if (!selectedFile) {
      onSelect(rootDir?.files[0]);
    }
  }, [selectedFile]);

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      <div
        className="w-full flex overflow-hidden border-b border-zinc-800"
        style={{ height: `calc(100% - 20px)` }}
      >
        <Sidebar contentRef={contentRef}>
          <FileTree
            rootDir={rootDir}
            selectedFile={selectedFile}
            onSelect={onSelect}
          />
        </Sidebar>
        <div ref={contentRef} className="flex-1 flex w-full h-full">
          <div className="flex flex-col w-full h-full">
            <WorkspaceToolsComponent
              setShowOutput={setShowOutput}
              timeRemaining={timeRemaining}
              setTimeRemaining={setTimeRemaining}
              backSocket={backSocket}
              showOutput={showOutput}
            />
            <ResizablePanelGroup
              direction="horizontal"
              className="flex-1 w-full h-full flex"
            >
              <ResizablePanel defaultSize={50} minSize={20} maxSize={80}>
                <Workspace
                  socket={socket!}
                  selectedFile={selectedFile}
                  onSelect={onSelect}
                  files={fileStructure}
                />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={50} minSize={20} maxSize={80}>
                <ResizablePanelGroup direction="vertical">
                  <div className="flex-1 flex flex-col gap-0 h-full">
                    {showOutput && (
                      <>
                        <ResizablePanel>
                          <Output />
                        </ResizablePanel>
                        <ResizableHandle />
                      </>
                    )}
                    {socket && socket.connected && (
                      <ResizablePanel>
                        <TerminalComponent
                          showOutput={showOutput}
                          socket={socket!}
                        />
                      </ResizablePanel>
                    )}
                  </div>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </div>
      <FooterTools socket={socket!} />
    </div>
  );
};

export default ReplPage;
