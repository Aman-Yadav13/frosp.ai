import { create } from "zustand";

interface ProjectStore {
  name: string;
  language: string;
  stack?: string;
  setProject: (name: string, language: string, stack?: string) => void;
}

export const useProject = create<ProjectStore>((set) => ({
  name: "",
  language: "",
  stack: "",
  setProject: (name, language, stack) => set({ name, language, stack }),
}));
