"use client";

import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingScreen from "@/components/common/loading-screen";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace("/dashboard");
        }
    }, [user, loading, router]);

    if (loading) {
        return <LoadingScreen />;
    }
    if (user) return null;
    return <>{children}</>;
}
