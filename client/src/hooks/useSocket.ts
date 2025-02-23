import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import * as awarenessProtocol from "y-protocols/awareness";
import * as monaco from "monaco-editor";
import { debounce } from "lodash";
import { getRandomColor } from "@/lib/helpers";
import { useMonacoEditor } from "./useMonacoEditor";
import { File } from "@/components/external/utils/file-manager";
import { ActiveUser } from "@/types";
import { fileContentCache } from "@/pages/ReplPage/ReplPage";

export const useSocket = (replId: string, selectedFile?: File | undefined) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user] = useState(JSON.parse(sessionStorage.getItem("user")!));
  const { monacoEditor: editor, setActiveUsers } = useMonacoEditor();
  const [userColor] = useState(getRandomColor());
  const yDocs = useRef<
    Map<string, { doc: Y.Doc; awareness: awarenessProtocol.Awareness }>
  >(new Map());
  const bindingsRef = useRef<Map<string, MonacoBinding>>(new Map());
  const previousFilePath = usePrevious(selectedFile?.path);

  useEffect(() => {
    if (sessionStorage.getItem("user")) {
      const newSocket = io(`ws://frosp-rippler.duckdns.org/`, {
        path: `/repl-${replId}/socket.io/`,
        query: { userId: user?._id, replId },
      });
      setSocket(newSocket);

      newSocket.on("connect", () => {
        newSocket.emit("set-user-info", {
          userId: user._id,
          userName: user.fullName,
          color: userColor,
        });
      });

      newSocket.on("active-users-update", (users: ActiveUser[]) => {
        setActiveUsers(users);
      });

      newSocket.on("kicked", (data: { message: string }) => {
        alert(data.message);
        window.location.href = "http://localhost:5173/";
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [replId, user, userColor]);

  useEffect(() => {
    if (!socket || !editor) return;

    const handleCleanup = () => {
      const model = editor.getModel();
      if (!model) return;

      const decorations = model.getAllDecorations();
      const decorationIds = decorations.map((d) => d.id);

      if (decorationIds.length > 0) {
        editor.removeDecorations(decorationIds);
      }
    };

    socket.on("force-cleanup-decorations", handleCleanup);

    return () => {
      socket.off("force-cleanup-decorations", handleCleanup);
    };
  }, [socket, editor]);

  useEffect(() => {
    if (!socket || !selectedFile?.path || !editor) return;

    const filePath = selectedFile?.path;

    socket.emit("update-user-info", {
      userId: user._id,
      userName: user.fullName,
      color: userColor,
      currentFile: filePath,
    });

    if (previousFilePath && previousFilePath !== filePath) {
      const prevYDocData = yDocs.current.get(previousFilePath);
      if (prevYDocData) {
        prevYDocData.awareness.setLocalState(null);
        socket.emit("cleanup-decorations", previousFilePath);
      }
    }

    let yDocData = yDocs.current.get(filePath);
    let yDoc: Y.Doc;
    let awareness: awarenessProtocol.Awareness;

    const existingBinding = bindingsRef.current.get(filePath);
    if (existingBinding) {
      existingBinding.destroy();
      bindingsRef.current.delete(filePath);
    }

    if (!yDocData) {
      yDoc = new Y.Doc();
      awareness = new awarenessProtocol.Awareness(yDoc);
      yDocs.current.set(filePath, { doc: yDoc, awareness });
    } else {
      yDoc = yDocData.doc;
      awareness = yDocData.awareness;
    }

    awareness.setLocalState({
      user: {
        userId: user?._id,
        userName: user?.fullName,
        color: userColor,
        currentFile: filePath,
      },
      cursor: null,
      selection: null,
    });

    const model = editor.getModel();
    if (model) {
      const yText = yDoc.getText("monaco");
      const binding = new MonacoBinding(
        yText,
        model,
        new Set([editor]),
        awareness
      );
      bindingsRef.current.set(filePath, binding);

      editor.onDidChangeCursorPosition(() => {
        const position = editor.getPosition();
        if (position) {
          const localState = awareness.getLocalState() || {};
          awareness.setLocalStateField("cursor", {
            position,
            user: localState.user || {
              userId: user?._id,
              userName: user?.fullName,
              color: userColor,
              currentFile: selectedFile?.path,
            },
          });
        }
      });

      editor.onDidChangeModelDecorations(() => {
        let reqUserName = "";
        const decorationNodes = document.querySelectorAll(".cursor-label");
        awareness.getStates().forEach((state, _) => {
          if (state.user.userId !== user?.userId) {
            reqUserName = state.user.userName;
          }
        });
        decorationNodes.forEach((node) => {
          node.setAttribute("data-label", reqUserName);
          // @ts-ignore
          node.style.setProperty("--user-color", userColor);
        });
      });

      editor.onDidChangeCursorSelection(() => {
        const selection = editor.getSelection();
        if (selection) {
          const localState = awareness.getLocalState() || {};
          awareness.setLocalStateField("selection", {
            anchor: Y.createRelativePositionFromTypeIndex(
              yText,
              editor.getModel()!.getOffsetAt(selection.getStartPosition())
            ),
            head: Y.createRelativePositionFromTypeIndex(
              yText,
              editor.getModel()!.getOffsetAt(selection.getEndPosition())
            ),
            user: localState.user || {
              userId: user?._id,
              userName: user?.fullName,
              color: userColor,
              currentFile: selectedFile?.path,
            },
          });
        }
      });

      const updateDecorations = debounce(() => {
        const states = awareness.getStates();
        const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];

        states.forEach((state, clientId) => {
          if (clientId !== awareness.clientID && state.cursor?.position) {
            const { position, user } = state.cursor;
            newDecorations.push({
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
              ),
              options: {
                afterContentClassName: `cursor-label bg-${user.color}-500 after:bg-${user.color}-500`,
                hoverMessage: { value: `${user.userName} is here` },
              },
            });
          }
        });

        const model = editor.getModel();
        if (model) {
          const currentDecorations = model.getAllDecorations();
          editor.removeDecorations(currentDecorations.map((d) => d.id));
          if (newDecorations.length > 0) {
            editor.createDecorationsCollection(newDecorations);
          }
        }
      }, 100);

      awareness.on("update", updateDecorations);
    }

    const handleInitialSync = (update: ArrayBuffer) => {
      Y.applyUpdate(yDoc!, new Uint8Array(update));
    };

    socket.emit("join-file", filePath);
    socket.on("yjs-sync-init", handleInitialSync);

    const handleYjsUpdate = (update: ArrayBuffer) => {
      Y.applyUpdate(yDoc!, new Uint8Array(update));
    };

    const handleAwarenessUpdate = (awarenessUpdate: ArrayBuffer) => {
      awarenessProtocol.applyAwarenessUpdate(
        awareness,
        new Uint8Array(awarenessUpdate),
        null
      );
    };

    yDoc.on("update", (update: Uint8Array) => {
      const yText = yDoc.getText("monaco");

      const currentContent = yText.toString();
      fileContentCache.set(filePath, currentContent);

      socket.emit("yjs-update", update.buffer);
    });

    awareness.on("update", () => {
      const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(
        awareness,
        [awareness.clientID]
      );
      socket.emit("awareness-update", awarenessUpdate.buffer);
    });

    socket.on("yjs-update", handleYjsUpdate);
    socket.on("awareness-update", handleAwarenessUpdate);

    return () => {
      socket.off("yjs-sync-init", handleInitialSync);
      socket.off("yjs-update", handleYjsUpdate);
      socket.off("awareness-update", handleAwarenessUpdate);

      const binding = bindingsRef.current.get(filePath);
      if (binding) {
        binding.destroy();
        bindingsRef.current.delete(filePath);
      }
      if (previousFilePath && previousFilePath !== filePath) {
        const prevData = yDocs.current.get(previousFilePath);
        if (prevData) {
          prevData.awareness.setLocalState(null);
          const update = awarenessProtocol.encodeAwarenessUpdate(
            prevData.awareness,
            [prevData.awareness.clientID]
          );
          socket.emit("awareness-update", update.buffer);
        }
      }
    };
  }, [socket, selectedFile?.path, editor, user, userColor]);
  return socket;
};

function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
