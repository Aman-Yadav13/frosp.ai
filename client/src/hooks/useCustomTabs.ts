import { create } from "zustand";

interface CustomTabsStore {
  active: any;
  tabs: any;
  setTabs: (tabs: any) => void;
  setActive: (active: any) => void;
}

export const useCustomTabs = create<CustomTabsStore>((set) => ({
  active: null,
  tabs: [],
  setTabs: (tabs) => set({ tabs }),
  setActive: (active) => set({ active }),
}));
