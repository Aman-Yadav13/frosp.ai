import { create } from "zustand";

interface ProjectStore {
  project: any;
  setProject: (project: any) => void;
}

export const useCurrentProject = create<ProjectStore>((set) => ({
  project: null,
  setProject: (project) => set({ project }),
}));
