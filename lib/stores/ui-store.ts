import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  activeExamStep: number;
  theme: "light";
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveExamStep: (step: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeExamStep: 0,
  theme: "light",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveExamStep: (step) => set({ activeExamStep: step }),
}));
