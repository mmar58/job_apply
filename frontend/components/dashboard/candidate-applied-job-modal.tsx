"use client";

import { useEffect, useState } from "react";
import {
    X,
    Briefcase,
    Building2,
    MapPin,
    DollarSign,
    Calendar,
    Users,
    FileText,
    MessageSquare,
    CheckCircle2,
    AlertCircle,
    Clock,
    Loader2Icon,
} from "lucide-react";
import { request, ApiError } from "@/lib/api-core";
import { StatusBadge } from "./status-badge";
import type { JobItem, ApplicationStatus } from "@/lib/types";

interface CandidateAppliedJobModalProps {
    applicationId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

interface AppliedJobDetailResponse {
    application: {
        id: number;
        status: ApplicationStatus;
        coverLetter: string;
        reviewNote: string | null;
        reviewedAt: string | null;
        createdAt: string;
        jobId: number;
    };
    job: JobItem & {
        description: string;
        requirements: string;
    };
    totalApplications: number;
}

export function CandidateAppliedJobModal({
    applicationId,
    isOpen,
    onClose,
}: CandidateAppliedJobModalProps) {
    const [data, setData] = useState<AppliedJobDetailResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !applicationId) return;
        setLoading(true);
        setError(null);

        request<AppliedJobDetailResponse>(`/candidate/applications/${applicationId}`)
            .then((res) => setData(res))
            .catch((err) => {
                setError(err instanceof ApiError ? err.message : "Failed to load application details");
            })
            .finally(() => setLoading(false));
    }, [isOpen, applicationId]);

    if (!isOpen || !applicationId) return null;

    const formatSalary = (min: number | null, max: number | null) => {
        if (!min && !max) return null;
        if (min && max) return `$${Math.round(min / 1000)}k – $${Math.round(max / 1000)}k`;
        if (min) return `From $${Math.round(min / 1000)}k`;
        return `Up to $${Math.round(max! / 1000)}k`;
    };

    const salaryString = data?.job ? formatSalary(data.job.salaryMin, data.job.salaryMax) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-3xl bg-card text-card-foreground rounded-2xl sm:rounded-3xl shadow-2xl border border-border max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
                    <div className="flex items-center gap-3">
                        <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
                            {data?.job.company ? data.job.company.slice(0, 2).toUpperCase() : "JB"}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-lg text-foreground truncate">
                                    {data?.job.title ?? "Applied Position"}
                                </h3>
                                {data?.application && <StatusBadge status={data.application.status} />}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span>{data?.job.company}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-semibold text-foreground/80">
                                    <Users className="size-3 text-primary" />
                                    {data?.totalApplications ?? 1}{" "}
                                    {data?.totalApplications === 1 ? "applicant" : "applicants"} total
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="overflow-y-auto p-6 space-y-6 flex-1">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                            <Loader2Icon className="size-8 animate-spin text-primary" />
                            <p className="text-sm">Loading your application details...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-destructive">
                            {error}
                        </div>
                    ) : data ? (
                        <>
                            {/* Status Banner */}
                            <div
                                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                    data.application.status === "hired"
                                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:text-emerald-300"
                                        : data.application.status === "shortlisted"
                                        ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-800 dark:text-indigo-300"
                                        : data.application.status === "rejected"
                                        ? "bg-rose-500/10 border-rose-500/25 text-rose-800 dark:text-rose-300"
                                        : "bg-amber-500/10 border-amber-500/25 text-amber-800 dark:text-amber-300"
                                }`}
                            >
                                <div className="space-y-0.5">
                                    <span className="text-xs font-bold uppercase tracking-wider block">
                                        Current Application Status: {data.application.status}
                                    </span>
                                    <p className="text-xs opacity-90">
                                        {data.application.status === "hired"
                                            ? "Congratulations! You have been selected for this position."
                                            : data.application.status === "shortlisted"
                                            ? "Great news! Your profile has been shortlisted for this role."
                                            : data.application.status === "rejected"
                                            ? "Thank you for applying. The hiring team decided to move forward with other candidates."
                                            : "Your application is currently under review by the hiring team."}
                                    </p>
                                </div>
                                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-background/80 border border-current shrink-0">
                                    Applied on{" "}
                                    {new Date(data.application.createdAt).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>

                            {/* Review Note from Employer (if any) */}
                            {data.application.reviewNote && (
                                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                                        <MessageSquare className="size-3.5" />
                                        <span>Employer Feedback / Review Note</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                        {data.application.reviewNote}
                                    </p>
                                    {data.application.reviewedAt && (
                                        <span className="text-[10px] text-muted-foreground block pt-1">
                                            Reviewed on{" "}
                                            {new Date(data.application.reviewedAt).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Job Quick Info */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-background/60 border border-border">
                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                                        Location
                                    </span>
                                    <span className="text-xs font-semibold text-foreground flex items-center gap-1 mt-0.5">
                                        <MapPin className="size-3 text-muted-foreground" />
                                        {data.job.location}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                                        Job Type
                                    </span>
                                    <span className="text-xs font-semibold text-foreground capitalize mt-0.5 block">
                                        {data.job.jobType.replace(/_/g, " ")}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                                        Experience
                                    </span>
                                    <span className="text-xs font-semibold text-foreground capitalize mt-0.5 block">
                                        {data.job.experienceLevel} level
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                                        Compensation
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-600 mt-0.5 block">
                                        {salaryString || "Competitive"}
                                    </span>
                                </div>
                            </div>

                            {/* Your Submitted Cover Letter */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <FileText className="size-3.5" />
                                    Your Submitted Pitch / Cover Letter
                                </h4>
                                <div className="p-4 rounded-2xl bg-background/60 border border-border text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                                    {data.application.coverLetter}
                                </div>
                            </div>

                            {/* Skills Required */}
                            {data.job.skills && data.job.skills.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Target Skills
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {data.job.skills.map((s) => (
                                            <span
                                                key={s}
                                                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-foreground/80 border border-border/60"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Job Description */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Full Job Description
                                </h4>
                                <div className="p-4 rounded-2xl bg-background/60 border border-border text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                                    {data.job.description}
                                </div>
                            </div>

                            {/* Job Requirements */}
                            {data.job.requirements && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Requirements
                                    </h4>
                                    <div className="p-4 rounded-2xl bg-background/60 border border-border text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                                        {data.job.requirements}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 border-t border-border bg-background/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Users className="size-3.5 text-primary" />
                        {data?.totalApplications ?? 0} candidates applied to this posting
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
