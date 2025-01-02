import { create } from "zustand";

export type ModalType =
  | "Login"
  | "Register"
  | "ResetPassword"
  | "ChangeAccountDetails"
  | "CreateProject"
  | "InspectProject";

interface ModalStore {
  type: ModalType | null;
  data: null | any;
  setData: (data: any) => void;
  isOpen: boolean;
  onOpen: (type: ModalType) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  data: null,
  setData: (data) => set({ data }),
  onOpen: (type) => set({ type, isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
