"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Briefcase,
    FileText,
    Users,
    TrendingUp,
    Plus,
    RefreshCw,
    ExternalLink,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    ChevronRight,
    Loader2Icon,
} from "lucide-react";
import { request, ApiError } from "@/lib/api-core";
import { toast } from "sonner";
import { StatCard } from "./stat-card";
import { StatusBadge } from "./status-badge";
import { CreateJobModal } from "./create-job-modal";
import { ReviewApplicationModal } from "./review-application-modal";
import type { AdminDashboardData } from "@/lib/types";
import DashboardTopBar from "./common/dashboard-top-bar";
import DashboardSkelton from "./common/dashboard-skelton";
import DashboardError from "./common/dashboard-error";

export function AdminDashboard() {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modals state
    const [createJobOpen, setCreateJobOpen] = useState(false);
    const [reviewAppId, setReviewAppId] = useState<number | null>(null);

    const loadDashboard = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        setError(null);

        try {
            const res = await request<AdminDashboardData>("/dashboard/admin");
            setData(res);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Failed to load admin dashboard data.");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const handleRefresh = () => {
        loadDashboard(true);
        toast.info("Refreshed metrics");
    };

    if (loading) {
        return (
            <DashboardSkelton />
        );
    }

    if (error) {
        return (
            <DashboardError
                error={error}
                loadDashboard={loadDashboard}
            />
        );
    }

    const jobs = data?.jobs ?? { draft: 0, active: 0, closed: 0, total: 0 };
    const apps = data?.applications ?? { pending: 0, approved: 0, rejected: 0, total: 0 };
    const candidates = data?.candidates ?? 0;
    const recentApps = data?.recentApplications ?? [];
    const topJobs = data?.topJobs ?? [];

    const approvalRate = apps.total > 0 ? Math.round((apps.approved / apps.total) * 100) : 0;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
            <DashboardTopBar header="Admin Dashboard"
                title="Hiring & Application Command Center"
                description="Monitor active job requisitions, review candidates, and manage pipeline velocity."
                options={[
                    {
                        label: "Refresh",
                        type: "button",
                        icon: <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />,
                        onClick: handleRefresh,
                    },
                    {
                        label: "Public Board",
                        type: "link",
                        href: "/jobs",
                        icon: <ExternalLink className="size-4" />,
                    },
                    {
                        label: "Post Job",
                        type: "button",
                        icon: <Plus className="size-4" />,
                        onClick: () => setCreateJobOpen(true),
                        theme: "dark"
                    },
                ]}
            />
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <StatCard
                    title="Total Job Posts"
                    value={jobs.total}
                    icon={<Briefcase className="size-5" />}
                    iconBg="bg-blue-500/10 text-blue-700"
                    subtitle={
                        <>
                            <span className="font-semibold text-emerald-600">
                                {jobs.active} active
                            </span>
                            <span>•</span>
                            <span>{jobs.draft} draft</span>
                            <span>•</span>
                            <span>{jobs.closed} closed</span>
                        </>
                    }
                />

                <StatCard
                    title="Applications Received"
                    value={apps.total}
                    icon={<FileText className="size-5" />}
                    iconBg="bg-amber-500/10 text-amber-700"
                    subtitle={
                        <>
                            <span className="font-semibold text-amber-600">
                                {apps.pending} pending
                            </span>
                            <span>•</span>
                            <span className="text-emerald-600">
                                {apps.approved} approved
                            </span>
                        </>
                    }
                />

                <StatCard
                    title="Registered Candidates"
                    value={candidates}
                    icon={<Users className="size-5" />}
                    iconBg="bg-purple-500/10 text-purple-700"
                    subtitle={<span>Active talent pool on portal</span>}
                />

                <StatCard
                    title="Approval Rate"
                    value={`${approvalRate}%`}
                    icon={<TrendingUp className="size-5" />}
                    iconBg="bg-emerald-500/10 text-emerald-700"
                    subtitle={
                        <span>
                            {apps.approved} approved of {apps.total} total
                        </span>
                    }
                />
            </div>

            {/* Two Column Layout: Recent Applications & Top Jobs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Left (2 cols): Recent Applications */}
                <div className="lg:col-span-2 bg-card rounded-2xl sm:rounded-3xl border border-border/80 shadow-md p-5 sm:p-7 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-border/60">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                                    Recent Applications
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                    Latest submissions awaiting or undergoing review
                                </p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
                                {recentApps.length} latest
                            </span>
                        </div>

                        {recentApps.length === 0 ? (
                            <div className="py-16 text-center text-muted-foreground">
                                <FileText className="size-10 mx-auto text-muted-foreground/40 mb-3" />
                                <p className="font-medium">No applications submitted yet</p>
                                <p className="text-xs mt-1">
                                    Applications will appear here once candidates apply to your posted jobs.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/60 mt-2">
                                {recentApps.map((app) => (
                                    <div
                                        key={app.id}
                                        className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-xl px-2 transition-colors"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-foreground text-sm truncate">
                                                    {app.candidateName}
                                                </span>
                                                <StatusBadge status={app.status} />
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
                                                <span className="text-foreground/90 font-medium truncate">
                                                    {app.jobTitle}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    {new Date(app.createdAt).toLocaleDateString(undefined, {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setReviewAppId(app.id)}
                                            className="self-start sm:self-center px-3.5 py-1.5 rounded-lg border border-border/80 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold text-foreground transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                                        >
                                            <Eye className="size-3.5 text-primary" />
                                            <span>Review</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-border/60 mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Click &ldquo;Review&rdquo; to examine cover letters and approve/reject</span>
                    </div>
                </div>

                {/* Right (1 col): Top Jobs by Application Volume */}
                <div className="bg-card rounded-2xl sm:rounded-3xl border border-border/80 shadow-md p-5 sm:p-7 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-border/60">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                                    High-Demand Roles
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                    Positions with most candidate interest
                                </p>
                            </div>
                        </div>

                        {topJobs.length === 0 ? (
                            <div className="py-16 text-center text-muted-foreground">
                                <Briefcase className="size-10 mx-auto text-muted-foreground/40 mb-3" />
                                <p className="font-medium">No job postings recorded</p>
                                <button
                                    onClick={() => setCreateJobOpen(true)}
                                    className="mt-3 text-xs font-semibold text-primary hover:underline"
                                >
                                    + Post your first job
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 mt-4">
                                {topJobs.map((job) => {
                                    const maxApps = Math.max(...topJobs.map((j) => j.applications), 1);
                                    const percentage = Math.round((job.applications / maxApps) * 100);

                                    return (
                                        <div
                                            key={job.id}
                                            className="p-3.5 rounded-xl border border-border/60 bg-background/50 hover:bg-background/90 transition-all space-y-2"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-semibold text-foreground truncate">
                                                        {job.title}
                                                    </h4>
                                                    <div className="mt-1">
                                                        <StatusBadge status={job.status} />
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-sm font-bold text-foreground">
                                                        {job.applications}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground block">
                                                        applicants
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bar indicator */}
                                            <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.max(percentage, 8)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-border/60 mt-4">
                        <Link
                            href="/jobs"
                            className="w-full py-2.5 px-4 rounded-xl border border-border/80 bg-background/80 hover:bg-background text-foreground text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                        >
                            <span>Browse Public Job Directory</span>
                            <ChevronRight className="size-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateJobModal
                isOpen={createJobOpen}
                onClose={() => setCreateJobOpen(false)}
                onSuccess={() => loadDashboard(true)}
            />

            <ReviewApplicationModal
                applicationId={reviewAppId}
                onClose={() => setReviewAppId(null)}
                onReviewed={() => loadDashboard(true)}
            />
        </div>
    );
}
