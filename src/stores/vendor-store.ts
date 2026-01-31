import { create } from "zustand";

interface VendorState {
    selectedVendorId: string | null;
    selectedVendorName: string | null;
    setVendor: (id: string | null, name: string | null) => void;
    clearVendor: () => void;
}

export const useVendorStore = create<VendorState>((set) => ({
    selectedVendorId: null,
    selectedVendorName: null,
    setVendor: (id, name) => set({ selectedVendorId: id, selectedVendorName: name }),
    clearVendor: () => set({ selectedVendorId: null, selectedVendorName: null }),
}));
