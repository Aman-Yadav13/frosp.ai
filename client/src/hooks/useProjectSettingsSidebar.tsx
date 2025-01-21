import { create } from "zustand";

type ProjectSettingsSidebarStore = {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isResetting: boolean;
  setIsResetting: (resetting: boolean) => void;
};

export const useProjectSettingsSidebar = create<ProjectSettingsSidebarStore>(
  (set) => ({
    isCollapsed: false,
    setIsCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    isResetting: false,
    setIsResetting: (resetting) => set({ isResetting: resetting }),
  })
);
