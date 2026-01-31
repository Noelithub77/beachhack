import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserRole =
    | "customer"
    | "rep_l1"
    | "rep_l2"
    | "rep_l3"
    | "admin_manager"
    | "admin_senior"
    | "admin_super";

interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    vendorId?: string;
    language: string;
    avatarUrl?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        { name: "coco-auth" }
    )
);

// helper to check role hierarchy
export const isRep = (role: UserRole) =>
    role === "rep_l1" || role === "rep_l2" || role === "rep_l3";

export const isAdmin = (role: UserRole) =>
    role === "admin_manager" || role === "admin_senior" || role === "admin_super";

export const isCustomer = (role: UserRole) => role === "customer";

export const getRepLevel = (role: UserRole): number => {
    if (role === "rep_l1") return 1;
    if (role === "rep_l2") return 2;
    if (role === "rep_l3") return 3;
    return 0;
};

export const getAdminLevel = (role: UserRole): number => {
    if (role === "admin_manager") return 1;
    if (role === "admin_senior") return 2;
    if (role === "admin_super") return 3;
    return 0;
};
