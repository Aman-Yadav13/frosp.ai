import { Workspace } from "@/components/Workspace";
import { Sidebar } from "@/components/sidebar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  buildFileTree,
  File,
  RemoteFile,
  Type,
} from "@/components/external/utils/file-manager";
import { Output } from "@/components/Output";
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
import { useCurrentProject } from "@/hooks/useCurrentProject";
import { TerminalsContainer } from "@/components/TerminalsContainer";

const ReplPage = () => {
  const { userId, projectId } = useParams();
  const [podCreated, setPodCreated] = useState(false);
  const navigate = useNavigate();

  const startContainer = useCallback(async () => {
    try {
      const response = await startK8sContainer({
        userId,
        replId: projectId,
      });

      if (response.status === 200) {
        setPodCreated(true);
        toast.success("Container started successfully!");
        return;
      } else if (response.status === 400) {
        const data = response.data;
        if (data.message.includes("Project is full")) {
          toast.error(data.message, {
            duration: 5000,
            action: {
              label: "Go Home",
              onClick: () => navigate("/"),
            },
          });
          setTimeout(() => navigate("/"), 5000);
        }
      } else if (response.status === 403) {
        toast.error("Unauthorized access. Please login again.", {
          duration: 3000,
        });
        setTimeout(() => navigate("/"), 3000);
      } else {
        toast.error("Failed to start container. Please try again.");
      }
    } catch (e) {
      console.log(e);
    }
  }, [projectId, navigate]);

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

export const directoryCache = new Map<string, RemoteFile[]>();
export const fileContentCache = new Map<string, string>();

const CodingPagePodCreated = () => {
  const { projectId } = useParams();
  const contentRef = React.createRef<HTMLDivElement>();
  const [loaded, setLoaded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [selectedNode, setSelectedNode] = useState<File | undefined>(undefined);
  const [isRenamingFile, setIsRenamingFile] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState<string>("/");
  const [filesInToolbar, setFilesInToolbar] = useState<(RemoteFile | File)[]>(
    []
  );
  const { setProject } = useCurrentProject((state) => state);

  const socket = useSocket(projectId!, selectedFile);
  const backSocket = useBackSocket(projectId!);

  const getFreeTimeLeft = useCallback(async () => {
    try {
      const res = await getFTL(projectId!);
      setTimeRemaining(res.timeLeft);
    } catch (e) {
      console.log(e);
    }
  }, [projectId]);

  const onSelect = (file: File) => {
    setSelectedNode(file);
    if (file?.type === Type.FILE) {
      const isAlreadyPresent = filesInToolbar.find((f) => f.path === file.path);
      if (!isAlreadyPresent) {
        setFilesInToolbar((prev) => [...prev, file]);
      }
    }

    if (file?.type === Type.DIRECTORY) {
      if (directoryCache.has(file?.path)) {
        const cachedData = directoryCache.get(file?.path)!;
        setFileStructure((prev) => {
          const allFiles = [...prev, ...cachedData];
          return allFiles.filter(
            (file, index, self) =>
              index === self.findIndex((f) => f?.path === file?.path)
          );
        });
      } else {
        socket?.emit("fetchDir", file?.path, (data: RemoteFile[]) => {
          directoryCache.set(file?.path, data);
          setFileStructure((prev) => {
            const allFiles = [...prev, ...data];
            return allFiles.filter(
              (file, index, self) =>
                index === self.findIndex((f) => f?.path === file?.path)
            );
          });
        });
      }
    } else {
      socket?.emit("join-file", file?.path);
      if (fileContentCache.has(file?.path)) {
        file.content = fileContentCache.get(file?.path)!;
        setSelectedFile(file);
      } else {
        socket?.emit("fetchContent", { path: file?.path }, (data: string) => {
          file.content = data;
          fileContentCache.set(file?.path, data);
          setSelectedFile(file);
        });
      }
    }
  };

  const updateFileStructureOnRename = (newName: string) => {
    if (!selectedNode) return;

    const oldPath = selectedNode.path;
    const isDirectory = selectedNode.type === Type.DIRECTORY;

    const updateCacheKeys = (
      cache: Map<string, any>,
      oldPath: string,
      newPath: string
    ) => {
      const entriesToUpdate = Array.from(cache.entries()).filter(
        ([path]) => path === oldPath || path.startsWith(`${oldPath}/`)
      );

      for (const [key, value] of entriesToUpdate) {
        const updatedKey = key.replace(oldPath, newPath);
        cache.delete(key);
        cache.set(updatedKey, value);
      }
    };

    if (isDirectory) {
      const newPath = oldPath.replace(/[^/]+$/, newName);
      updateCacheKeys(directoryCache, oldPath, newPath);
      updateCacheKeys(fileContentCache, oldPath, newPath);
    } else {
      const newPath = oldPath.replace(/[^/]+$/, newName);
      if (fileContentCache.has(oldPath)) {
        const content = fileContentCache.get(oldPath)!;
        fileContentCache.delete(oldPath);
        fileContentCache.set(newPath, content);
      }
    }
    setFileStructure((prev) => {
      return prev.map((file) => {
        if (file.path === oldPath || file.path.startsWith(`${oldPath}/`)) {
          file.path = file.path.replace(
            oldPath,
            oldPath.replace(/[^/]+$/, newName)
          );
          file.name = file.path.split("/").pop()!;
        }
        return file;
      });
    });

    setFilesInToolbar((prev) =>
      prev.map((file) => {
        if (file.path === oldPath || file.path.startsWith(`${oldPath}/`)) {
          file.path = file.path.replace(
            oldPath,
            oldPath.replace(/[^/]+$/, newName)
          );
          file.name = file.path.split("/").pop()!;
        }
        return file;
      })
    );
  };

  const updateFileStructureOnAdd = (newFileName: string, type: string) => {
    if (type == "dir") {
      let newDir: any;
      if (selectedDirectory === "/") {
        newDir = {
          name: newFileName,
          path: `/${newFileName}`,
          type,
        };
      } else {
        newDir = {
          name: newFileName,
          path: `${selectedNode?.path}/${newFileName}`,
          type,
        } as RemoteFile;
      }
      setFileStructure((prev) => [...prev, newDir]);
    } else if (type == "file") {
      let newFile: any;
      if (selectedDirectory === "/") {
        newFile = {
          name: newFileName,
          path: `/${newFileName}`,
          type,
        };
      } else {
        newFile = {
          name: newFileName,
          path: `${selectedNode?.path}/${newFileName}`,
          type,
        };
      }
      setFileStructure((prev) => [...prev, newFile]);
    }
  };

  const updateFileStructureOnDelete = (path: string, type: string) => {
    if (!path) return;

    const deleteCacheEntries = (
      cache: Map<string, any>,
      predicate: (key: string) => boolean
    ) => {
      for (const key of Array.from(cache.keys())) {
        if (predicate(key)) {
          cache.delete(key);
        }
      }
    };

    if (type === "directory") {
      deleteCacheEntries(directoryCache, (key) => key.startsWith(path));
      deleteCacheEntries(fileContentCache, (key) => key.startsWith(path));

      setFileStructure((prev) =>
        prev.filter((file) => !file.path.startsWith(path))
      );
      setFilesInToolbar((prev) =>
        prev.filter((file) => !file.path.startsWith(path))
      );
    } else {
      deleteCacheEntries(fileContentCache, (key) => key === path);

      for (const [dirPath, files] of directoryCache.entries()) {
        const updatedFiles = files.filter((file) => file.path !== path);
        if (updatedFiles.length < files.length) {
          directoryCache.set(dirPath, updatedFiles);
        }
      }

      setFileStructure((prev) => prev.filter((file) => file.path !== path));
      setFilesInToolbar((prev) => prev.filter((file) => file.path !== path));
    }
  };

  const rootDir = useMemo(() => {
    const fileTree = buildFileTree(fileStructure);
    return fileTree;
  }, [fileStructure]);

  useEffect(() => {
    backSocket?.emit("getProjectDetails", projectId, (project: any) => {
      setProject(project);
    });
  }, [backSocket]);

  useEffect(() => {
    getFreeTimeLeft();
  }, [getFreeTimeLeft]);

  useEffect(() => {
    if (socket) {
      socket.on("loaded", ({ rootContent }: { rootContent: RemoteFile[] }) => {
        setLoaded(true);
        setFileStructure(rootContent);
      });
    }
  }, [socket]);

  if (!loaded) {
    // return <CodingPageSkeleton />;
  }

  useEffect(() => {
    if (!selectedFile) {
      // onSelect(rootDir?.files[0]);
    }
  }, [selectedFile]);

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      <WorkspaceToolsComponent
        setShowOutput={setShowOutput}
        timeRemaining={timeRemaining}
        setTimeRemaining={setTimeRemaining}
        backSocket={backSocket}
        socket={socket}
        showOutput={showOutput}
      />
      <div
        className="w-full flex overflow-hidden border-b border-zinc-800"
        style={{ height: `calc(100% - 20px)` }}
      >
        <Sidebar contentRef={contentRef} projectName={""}>
          <FileTree
            rootDir={rootDir}
            fileStructure={fileStructure}
            setFileStructure={setFileStructure}
            selectedFile={selectedFile}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            onSelect={onSelect}
            isRenamingFile={isRenamingFile}
            setIsRenamingFile={setIsRenamingFile}
            updateFileStructureOnRename={updateFileStructureOnRename}
            updateFileStructureOnAdd={updateFileStructureOnAdd}
            updateFileStructureOnDelete={updateFileStructureOnDelete}
            selectedDirectory={selectedDirectory}
            setSelectedDirectory={setSelectedDirectory}
            filesInToolbar={filesInToolbar}
            setFilesInToolbar={setFilesInToolbar}
          />
        </Sidebar>
        <div ref={contentRef} className="flex-1 flex w-full h-full">
          <div className="flex flex-col w-full h-full">
            <ResizablePanelGroup
              direction="horizontal"
              className="flex-1 w-full h-full flex"
            >
              <ResizablePanel defaultSize={50} minSize={20} maxSize={80}>
                <Workspace
                  socket={socket!}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  onSelect={onSelect}
                  files={fileStructure}
                  filesInToolbar={filesInToolbar}
                  setFilesInToolbar={setFilesInToolbar}
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
                        <TerminalsContainer
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
