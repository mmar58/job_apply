"use client";

import { useAuthStore } from "@/store/auth-store";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { CandidateDashboard } from "@/components/dashboard/candidate-dashboard";

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user);
    const can = useAuthStore((state) => state.can);

    if (!user) return null;

    // Check if the authenticated user has the Admin role or admin dashboard permission
    const isAdmin = user.roles?.includes("admin") || can("dashboard:admin");

    return (
        <div className="w-full flex-1">
            {isAdmin ? <AdminDashboard /> : <CandidateDashboard />}
        </div>
    );
}