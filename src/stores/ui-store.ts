import { create } from "zustand";

interface UIState {
    isSidebarOpen: boolean;
    isCallOverlayVisible: boolean;
    activeModal: string | null;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    showCallOverlay: () => void;
    hideCallOverlay: () => void;
    openModal: (modalId: string) => void;
    closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isSidebarOpen: true,
    isCallOverlayVisible: false,
    activeModal: null,
    toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),
    showCallOverlay: () => set({ isCallOverlayVisible: true }),
    hideCallOverlay: () => set({ isCallOverlayVisible: false }),
    openModal: (modalId) => set({ activeModal: modalId }),
    closeModal: () => set({ activeModal: null }),
}));
