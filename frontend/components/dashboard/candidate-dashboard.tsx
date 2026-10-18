"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Send,
    UserCheck,
    Compass,
    Sparkles,
    RefreshCw,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Edit3,
    FileText,
    Building2,
    ChevronRight,
    Eye,
} from "lucide-react";
import { request, ApiError } from "@/lib/api-core";
import { toast } from "sonner";
import { StatCard } from "./stat-card";
import { StatusBadge } from "./status-badge";
import { CandidateProfileModal } from "./candidate-profile-modal";
import { CandidateAppliedJobModal } from "./candidate-applied-job-modal";
import type { CandidateDashboardData } from "@/lib/types";
import DashboardTopBar from "./common/dashboard-top-bar"
import DashboardSkelton from "./common/dashboard-skelton";
import DashboardError from "./common/dashboard-error";

export function CandidateDashboard() {
    const [data, setData] = useState<CandidateDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Profile modal state
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState<number | null>(null);

    const loadDashboard = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        setError(null);

        try {
            const res = await request<CandidateDashboardData>("/dashboard/candidate");
            setData(res);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Failed to load candidate dashboard data.");
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
        toast.info("Refreshed your dashboard");
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

    const apps = data?.applications ?? { pending: 0, shortlisted: 0, hired: 0, rejected: 0, total: 0 };
    const recentApps = data?.recentApplications ?? [];
    const completeness = data?.profileCompleteness ?? 0;
    const openJobs = data?.openJobs ?? 0;

    const hiredCount = apps.hired ?? (apps as any).approved ?? 0;
    const shortlistedCount = apps.shortlisted ?? 0;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
            <DashboardTopBar header="Candidate Dashboard"
                title="Career & Application Overviewr"
                description="Track the status of your applications and manage your professional profile."
                options={[
                    {
                        label: "Refresh",
                        type: "button",
                        icon: <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />,
                        onClick: handleRefresh,
                    },
                    {
                        label: "Edit Profile",
                        type: "button",
                        onClick: () => setProfileModalOpen(true),
                        icon: <Edit3 className="size-4" />,
                    },
                    {
                        label: "Find Jobs",
                        type: "link",
                        icon: <Compass className="size-4" />,
                        href: "/jobs",
                        theme: "dark"
                    },
                ]}
            />
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <StatCard
                    title="Applications Submitted"
                    value={apps.total}
                    icon={<Send className="size-5" />}
                    iconBg="bg-blue-500/10 text-blue-700 dark:text-blue-400"
                    subtitle={
                        <>
                            <span className="font-semibold text-amber-600">
                                {apps.pending} in review
                            </span>
                            <span>•</span>
                            <span className="text-indigo-600 font-medium">
                                {shortlistedCount} shortlisted
                            </span>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">
                                {hiredCount} hired
                            </span>
                        </>
                    }
                />

                <StatCard
                    title="Profile Strength"
                    value={`${completeness}%`}
                    icon={<UserCheck className="size-5" />}
                    iconBg={
                        completeness >= 80
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-amber-500/10 text-amber-700"
                    }
                    subtitle={
                        <div className="w-full space-y-1.5 mt-1">
                            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${completeness >= 80 ? "bg-emerald-500" : "bg-amber-500"
                                        }`}
                                    style={{ width: `${Math.max(completeness, 5)}%` }}
                                />
                            </div>
                            <span className="text-xs">
                                {completeness >= 100
                                    ? "Profile is complete & optimized"
                                    : "Add skills & bio to boost visibility"}
                            </span>
                        </div>
                    }
                />

                <StatCard
                    title="Active Positions"
                    value={openJobs}
                    icon={<Compass className="size-5" />}
                    iconBg="bg-purple-500/10 text-purple-700 dark:text-purple-400"
                    subtitle={
                        <Link
                            href="/jobs"
                            className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                        >
                            <span>Browse open roles</span>
                            <ArrowRight className="size-3" />
                        </Link>
                    }
                />
            </div>

            {/* Profile Completeness Alert / Tip if incomplete */}
            {completeness < 100 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-amber-500/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="size-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Sparkles className="size-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm sm:text-base text-foreground">
                                Boost your chances by completing your profile
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                Employers give 4x higher priority to candidates with verified skills, headline, and bio.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setProfileModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:bg-primary/90 transition-all shrink-0 cursor-pointer"
                    >
                        Complete Profile ({completeness}%)
                    </button>
                </div>
            )}

            {/* Main Section: Recent Applications */}
            <div className="bg-card rounded-2xl sm:rounded-3xl border border-border/80 shadow-md p-5 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                            My Recent Applications
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Real-time status updates on roles you have applied for
                        </p>
                    </div>

                    <Link
                        href="/jobs"
                        className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline"
                    >
                        <span>Find more roles</span>
                        <ArrowRight className="size-3.5" />
                    </Link>
                </div>

                {recentApps.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground space-y-3">
                        <FileText className="size-12 mx-auto text-muted-foreground/30" />
                        <h3 className="font-bold text-foreground text-base">You haven&apos;t applied to any jobs yet</h3>
                        <p className="text-xs sm:text-sm max-w-md mx-auto text-muted-foreground">
                            Explore hundreds of verified tech, design, and remote positions tailored to your skill set.
                        </p>
                        <div className="pt-2">
                            <Link
                                href="/jobs"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
                            >
                                <Compass className="size-4" />
                                <span>Browse Jobs Now</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recentApps.map((app) => (
                            <div
                                key={app.id}
                                onClick={() => setSelectedAppId(app.id)}
                                className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-background/50 hover:bg-background/90 hover:border-primary/50 transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="font-bold text-foreground text-base tracking-tight group-hover:text-primary transition-colors">
                                                {app.jobTitle}
                                            </h4>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                                <Building2 className="size-3.5 text-muted-foreground" />
                                                <span>{app.company}</span>
                                            </div>
                                        </div>
                                        <StatusBadge status={app.status} />
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="size-3.5" />
                                        <span>
                                            Applied on{" "}
                                            {new Date(app.createdAt).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAppId(app.id);
                                        }}
                                        className="font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>View Details</span>
                                        <ChevronRight className="size-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Explore Banner */}
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-card via-card to-secondary/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-xl">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Ready for your next opportunity?
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                        Discover new openings added today
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Filter by remote, full-time, contract, and experience level. Apply with a single click.
                    </p>
                </div>

                <Link
                    href="/jobs"
                    className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-md shrink-0 inline-flex items-center gap-2"
                >
                    <span>Search Jobs Board</span>
                    <ArrowRight className="size-4" />
                </Link>
            </div>

            {/* Candidate Profile Edit Modal */}
            <CandidateProfileModal
                isOpen={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
                onSuccess={() => loadDashboard(true)}
            />

            {/* Candidate Applied Job Detail Modal */}
            <CandidateAppliedJobModal
                applicationId={selectedAppId}
                isOpen={selectedAppId !== null}
                onClose={() => setSelectedAppId(null)}
            />
        </div>
    );
}
