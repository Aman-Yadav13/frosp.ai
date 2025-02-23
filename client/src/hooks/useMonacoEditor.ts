import { ActiveUser } from "@/types";
import { create } from "zustand";

interface MonacoStore {
  monacoEditor: import("monaco-editor").editor.IStandaloneCodeEditor | null;
  setMonacoEditor: (
    editor: import("monaco-editor").editor.IStandaloneCodeEditor | null
  ) => void;
  activeUsers: ActiveUser[];
  setActiveUsers: (users: ActiveUser[]) => void;
}

export const useMonacoEditor = create<MonacoStore>((set) => ({
  monacoEditor: null,
  activeUsers: [],
  setActiveUsers: (users) => set({ activeUsers: users }),
  setMonacoEditor: (editor) => set({ monacoEditor: editor }),
}));
