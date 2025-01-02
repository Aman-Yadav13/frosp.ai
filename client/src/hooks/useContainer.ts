import { create } from "zustand";

interface ContainerStore {
  wsNodePort: number | null;
  userNodePort: number | null;
  setWsNodePort: (wsPort: number) => void;
  setUserNodePort: (userPort: number) => void;
}

export const useContainer = create<ContainerStore>((set) => ({
  wsNodePort: null,
  userNodePort: null,
  setWsNodePort: (wsNodePort) => set({ wsNodePort }),
  setUserNodePort: (userNodePort) => set({ userNodePort }),
}));
