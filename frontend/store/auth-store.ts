import { AuthUser } from "@/lib/types";
import { create } from "zustand";
import { request } from "@/lib/api-core";

type AuthStore = {
    user: AuthUser | null;
    setUser: (user: AuthUser) => void;
    logout: () => Promise<void>;
    can: (permission: string) => boolean;
    loading: boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    loading: true,
    setUser: (user) => set({ user }),
    logout: async () => {
        await request("/auth/logout", { method: "POST" }).catch(() => { })
        set({ user: null })
        if (typeof window !== "undefined") {
            window.location.href = "/";
        }
    },
    can: (permission) => {
        const u = get().user;
        return !!u && u.permissions.includes(permission);
    },

}))