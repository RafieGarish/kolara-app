import { create } from "zustand";

interface UiState {
  /** desktop: sidebar collapsed; mobile (<=860px): sidebar open */
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  inviteOpen: boolean;
  chatOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
  setInviteOpen: (v: boolean) => void;
  setChatOpen: (v: boolean) => void;
}

export const useUi = create<UiState>((set) => ({
  sidebarCollapsed: false,
  sidebarOpen: false,
  inviteOpen: false,
  chatOpen: false,
  toggleSidebar: () =>
    set((s) =>
      typeof window !== "undefined" && window.innerWidth <= 860
        ? { sidebarOpen: !s.sidebarOpen }
        : { sidebarCollapsed: !s.sidebarCollapsed },
    ),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setInviteOpen: (v) => set({ inviteOpen: v }),
  setChatOpen: (v) => set({ chatOpen: v }),
}));
