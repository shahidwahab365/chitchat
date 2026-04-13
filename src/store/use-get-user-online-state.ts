import { create } from "zustand";

type OnlineUserType = {
  onlineUsers: Record<string, boolean>;
  setUserOnline: (id: string) => void;
  setUserOffline: (id: string) => void;
  setOnlineUsersBulk: (users: Record<string, any>) => void;
};

export const useUserOnlineState = create<OnlineUserType>((set) => ({
  onlineUsers: {},
  setUserOnline: (id) =>
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [id]: true },
    })),
  setUserOffline: (id) =>
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [id]: false },
    })),
  setOnlineUsersBulk: (presenceState) => {
    const formatted: Record<string, boolean> = {};

    Object.keys(presenceState).forEach((id) => {
      formatted[id] = true;
    });

    set({ onlineUsers: formatted });
  },
}));
