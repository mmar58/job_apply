import { AuthUser } from "@/lib/types";
import { create } from "zustand";
import { request } from "@/lib/api-core";
import { toast } from "sonner";

type AuthStore = {
    user: AuthUser | null;
    setUser: (user: AuthUser) => void;
    fetchMe: () => Promise<void>;
    logout: () => Promise<void>;
    can: (permission: string) => boolean;
    loading: boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    loading: true,
    setUser: (user) => set({ user }),
    fetchMe: async () => {
        try {
            set({ loading: true });
            const res = await request<{ user: AuthUser }>("/auth/me");
            set({ user: res.user });
            toast.success(`Welcome back ${res.user.name}`)
        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            set({ loading: false });
        }
    },
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