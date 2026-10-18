"use client";

import { useEffect, useState } from "react";
import {
    X,
    Briefcase,
    Users,
    Sparkles,
    Calendar,
    MapPin,
    DollarSign,
    Loader2Icon,
    Eye,
    TrendingUp,
    FileText,
} from "lucide-react";
import { request, ApiError } from "@/lib/api-core";
import { StatusBadge } from "./status-badge";
import type { AdminJobDetail, AdminJobApplicant } from "@/lib/types";

interface AdminJobModalProps {
    jobId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onReviewApplicant: (applicationId: number) => void;
    onViewCandidate?: (candidateId: number) => void;
}

export function AdminJobModal({
    jobId,
    isOpen,
    onClose,
    onReviewApplicant,
    onViewCandidate,
}: AdminJobModalProps) {
    const [data, setData] = useState<AdminJobDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "applicants" | "suggestions">("overview");

    useEffect(() => {
        if (!isOpen || !jobId) return;
        setLoading(true);
        setError(null);
        setActiveTab("overview");

        request<AdminJobDetail>(`/admin/jobs/${jobId}/details`)
            .then((res) => setData(res))
            .catch((err) => {
                setError(err instanceof ApiError ? err.message : "Failed to load job details");
            })
            .finally(() => setLoading(false));
    }, [isOpen, jobId]);

    if (!isOpen || !jobId) return null;

    const renderScoreBadge = (score: number) => {
        let color = "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/25";
        if (score >= 80) {
            color = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
        } else if (score >= 60) {
            color = "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
        }

        return (
            <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}
            >
                <Sparkles className="size-3" />
                <span>{score}% Match</span>
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-4xl bg-card text-card-foreground rounded-2xl sm:rounded-3xl shadow-2xl border border-border max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <Briefcase className="size-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-lg text-foreground truncate">
                                    {data?.job.title ?? "Job Requisition"}
                                </h3>
                                {data?.job.status && <StatusBadge status={data.job.status} />}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {data?.job.company} • {data?.totalApplications ?? 0} total applicants
                            </p>
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

                {/* Tabs */}
                <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-border bg-background/30 text-xs font-semibold overflow-x-auto no-scrollbar">
                    <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                            activeTab === "overview"
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                        }`}
                    >
                        Job Overview
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("applicants")}
                        className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === "applicants"
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                        }`}
                    >
                        <Users className="size-3.5" />
                        <span>Applicants ({data?.applications.length ?? 0})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("suggestions")}
                        className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === "suggestions"
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                        }`}
                    >
                        <Sparkles className="size-3.5" />
                        <span>AI Suggested Matches ({data?.suggestions.length ?? 0})</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="overflow-y-auto p-6 space-y-6 flex-1">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                            <Loader2Icon className="size-8 animate-spin text-primary" />
                            <p className="text-sm">Loading job data & candidate scores...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-destructive">
                            {error}
                        </div>
                    ) : data ? (
                        <>
                            {/* TAB 1: OVERVIEW */}
                            {activeTab === "overview" && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-background/60 border border-border">
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Type</span>
                                            <span className="font-semibold text-sm capitalize">
                                                {data.job.jobType.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Experience</span>
                                            <span className="font-semibold text-sm capitalize">
                                                {data.job.experienceLevel} level
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Location</span>
                                            <span className="font-semibold text-sm">{data.job.location}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Applicants</span>
                                            <span className="font-bold text-sm text-foreground">
                                                {data.totalApplications} applied
                                            </span>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    {data.job.skills && data.job.skills.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                                Required Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {data.job.skills.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 text-foreground border border-border/70"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div>
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                            Job Description
                                        </h4>
                                        <div className="p-4 rounded-2xl bg-background/60 border border-border text-sm leading-relaxed whitespace-pre-wrap">
                                            {data.job.description}
                                        </div>
                                    </div>

                                    {/* Requirements */}
                                    <div>
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                            Role Requirements
                                        </h4>
                                        <div className="p-4 rounded-2xl bg-background/60 border border-border text-sm leading-relaxed whitespace-pre-wrap">
                                            {data.job.requirements}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: APPLICANTS */}
                            {activeTab === "applicants" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Candidate applications submitted for this position</span>
                                        <span>Scores cached in Redis (48h sliding TTL)</span>
                                    </div>

                                    {data.applications.length === 0 ? (
                                        <div className="py-16 text-center text-muted-foreground">
                                            <Users className="size-10 mx-auto text-muted-foreground/30 mb-2" />
                                            <p className="font-semibold text-foreground">No applicants yet</p>
                                            <p className="text-xs">Candidates who apply will appear here with AI match scores.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border/60 border border-border rounded-2xl bg-background/50 overflow-hidden">
                                            {data.applications.map((app) => (
                                                <div
                                                    key={app.id}
                                                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                                                >
                                                    <div className="min-w-0 flex-1 space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (onViewCandidate) {
                                                                        onClose();
                                                                        onViewCandidate(app.candidateId);
                                                                    }
                                                                }}
                                                                className="font-bold text-foreground text-sm hover:text-primary transition-colors cursor-pointer text-left"
                                                            >
                                                                {app.candidateName}
                                                            </button>
                                                            <StatusBadge status={app.status} />
                                                            {renderScoreBadge(app.matchScore)}
                                                        </div>
                                                        {app.headline && (
                                                            <p className="text-xs text-muted-foreground line-clamp-1 italic">
                                                                &ldquo;{app.headline}&rdquo;
                                                            </p>
                                                        )}
                                                        {app.skills && app.skills.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 pt-1">
                                                                {app.skills.slice(0, 4).map((sk) => (
                                                                    <span
                                                                        key={sk}
                                                                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/5 dark:bg-white/10 text-muted-foreground"
                                                                    >
                                                                        {sk}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            onClose();
                                                            onReviewApplicant(app.id);
                                                        }}
                                                        className="px-3.5 py-1.5 rounded-xl border border-border/80 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold text-foreground transition-all flex items-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-center"
                                                    >
                                                        <Eye className="size-3.5 text-primary" />
                                                        <span>Review</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 3: AI SUGGESTED MATCHES */}
                            {activeTab === "suggestions" && (
                                <div className="space-y-4">
                                    <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2">
                                        <Sparkles className="size-4 shrink-0" />
                                        <span>
                                            AI evaluated candidate backgrounds, skill overlap, and cover letters to rank the top matches for this role.
                                        </span>
                                    </div>

                                    {data.suggestions.length === 0 ? (
                                        <div className="py-16 text-center text-muted-foreground">
                                            <Sparkles className="size-10 mx-auto text-muted-foreground/30 mb-2" />
                                            <p className="font-semibold text-foreground">No candidate suggestions yet</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {data.suggestions.map((sug, idx) => (
                                                <div
                                                    key={sug.id}
                                                    className="p-4 rounded-2xl border border-border/80 bg-background/60 space-y-3 flex flex-col justify-between"
                                                >
                                                    <div className="space-y-2">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                                    Rank #{idx + 1}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (onViewCandidate) {
                                                                            onClose();
                                                                            onViewCandidate(sug.candidateId);
                                                                        }
                                                                    }}
                                                                    className="font-bold text-sm text-foreground hover:text-primary transition-colors cursor-pointer text-left block"
                                                                >
                                                                    {sug.candidateName}
                                                                </button>
                                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                                    {sug.headline || "Candidate"}
                                                                </p>
                                                            </div>
                                                            {renderScoreBadge(sug.matchScore)}
                                                        </div>

                                                        {sug.skills && sug.skills.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {sug.skills.slice(0, 3).map((sk) => (
                                                                    <span
                                                                        key={sk}
                                                                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                                                    >
                                                                        ✓ {sk}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            onClose();
                                                            onReviewApplicant(sug.id);
                                                        }}
                                                        className="w-full py-1.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                                    >
                                                        <Eye className="size-3.5" />
                                                        <span>View Submission</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-background/50 flex items-center justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl border border-border text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
