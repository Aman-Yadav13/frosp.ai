import { create } from "zustand";

type FileEditorStore = {
  renameProvided: string | undefined;
  isRenamingCompleted: boolean;
  isAddingFolder: boolean;
  folderNameProvided: string | undefined;
  isAddingFile: boolean;
  fileNameProvided: string | undefined;
  isUpdatingFileStructure: boolean;
  contextEvent: boolean;
  setContextEvent: (contextEvent: boolean) => void;
  setIsUpdatingFileStructure: (isUpdatingFileStructure: boolean) => void;
  setIsAddingFile: (isAddingFile: boolean) => void;
  setFileNameProvided: (fileNameProvided: string | undefined) => void;
  setFolderNameProvided: (folderNameProvided: string | undefined) => void;
  setIsAddingFolder: (isAddingFolder: boolean) => void;
  setIsRenamingCompleted: (isRenamingCompleted: boolean) => void;
  setRenameProvided: (renameProvided: string | undefined) => void;
};

export const useFileEditor = create<FileEditorStore>((set) => ({
  renameProvided: undefined,
  isRenamingCompleted: false,
  isAddingFolder: false,
  folderNameProvided: undefined,
  isAddingFile: false,
  fileNameProvided: undefined,
  isUpdatingFileStructure: false,
  contextEvent: false,
  setContextEvent: (contextEvent) => set({ contextEvent }),
  setIsUpdatingFileStructure: (isUpdatingFileStructure) =>
    set({ isUpdatingFileStructure }),
  setIsAddingFile: (isAddingFile) => set({ isAddingFile }),
  setFileNameProvided: (fileNameProvided) => set({ fileNameProvided }),
  setFolderNameProvided: (folderNameProvided) => set({ folderNameProvided }),
  setIsAddingFolder: (isAddingFolder) => set({ isAddingFolder }),
  setIsRenamingCompleted: (isRenamingCompleted) => set({ isRenamingCompleted }),
  setRenameProvided: (renameProvided) => set({ renameProvided }),
}));
