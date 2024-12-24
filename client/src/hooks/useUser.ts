import { UserInfo } from "@/types";
import { create } from "zustand";

interface UserStore {
  isLoggedIn: boolean;
  userInfo: UserInfo;
  setUserInfo: (userInfo: UserInfo) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

export const useUser = create<UserStore>((set) => ({
  isLoggedIn: false,
  userInfo: {} as UserInfo,
  setUserInfo: (userInfo) => set({ userInfo }),
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
}));
