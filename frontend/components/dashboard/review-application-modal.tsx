"use client";

import { useEffect, useState } from "react";
import {
    X,
    Loader2Icon,
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    User,
    Mail,
    Sparkles,
    BookmarkCheck,
    Award,
} from "lucide-react";
import { request, ApiError } from "@/lib/api-core";
import { toast } from "sonner";
import { StatusBadge } from "./status-badge";
import type { ApplicationStatus } from "@/lib/types";

interface ReviewApplicationModalProps {
    applicationId: number | null;
    onClose: () => void;
    onReviewed: () => void;
}

interface ApplicationDetailData {
    application: {
        id: number;
        status: ApplicationStatus;
        coverLetter: string;
        reviewNote: string | null;
        reviewedAt: string | null;
        createdAt: string;
    };
    job?: {
        id: number;
        title: string;
        company: string;
        skills: string[];
    };
    candidate?: {
        id: number;
        name: string;
        email: string;
        headline: string | null;
        address: string | null;
        experienceYears: number;
        skills: string[];
    } | null;
    matchedSkills?: string[];
    aiSummary?: AiSummaryResult | null;
}

interface AiSummaryResult {
    summary: string;
    strengths: string[];
    concerns: string[];
    feedback?: string;
    fitScore?: number;
    fromCache?: boolean;
}

export function ReviewApplicationModal({
    applicationId,
    onClose,
    onReviewed,
}: ReviewApplicationModalProps) {
    const [data, setData] = useState<ApplicationDetailData | null>(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [reviewNote, setReviewNote] = useState("");
    const [error, setError] = useState<string | null>(null);

    // AI Summary & Feedback state (Cached in Redis for 20 minutes)
    const [aiSummary, setAiSummary] = useState<AiSummaryResult | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);

    useEffect(() => {
        if (!applicationId) return;
        setLoading(true);
        setError(null);
        setAiSummary(null);
        request<ApplicationDetailData>(`/admin/applications/${applicationId}`)
            .then((res) => {
                setData(res);
                setReviewNote(res.application.reviewNote || "");
                if (res.aiSummary) {
                    setAiSummary(res.aiSummary);
                }
            })
            .catch((err) => {
                setError(err instanceof ApiError ? err.message : "Failed to load application details");
            })
            .finally(() => setLoading(false));
    }, [applicationId]);

    const handleFetchAiSummary = async () => {
        if (!applicationId) return;
        setLoadingAi(true);
        try {
            // Force generate new AI feedback and update in Redis cache
            const res = await request<AiSummaryResult>(`/ai/applications/${applicationId}/summary?force=true`);
            setAiSummary(res);
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Failed to generate AI feedback");
        } finally {
            setLoadingAi(false);
        }
    };

    if (!applicationId) return null;

    const handleUpdateStatus = async (status: ApplicationStatus) => {
        setUpdating(true);
        setError(null);
        try {
            await request(`/admin/applications/${applicationId}`, {
                method: "PATCH",
                body: {
                    status,
                    note: reviewNote.trim() || null,
                },
            });
            toast.success(`Application marked as ${status}`);
            onReviewed();
            onClose();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to update application status");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-3xl bg-card text-card-foreground rounded-2xl sm:rounded-3xl shadow-2xl border border-border max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
                    <div className="flex items-center gap-2">
                        <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <FileText className="size-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-foreground">Review Application #{applicationId}</h3>
                            <p className="text-xs text-muted-foreground">Examine candidate submission and decide outcome</p>
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

                {/* Body */}
                <div className="overflow-y-auto p-6 space-y-6 flex-1">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
                            <Loader2Icon className="size-7 animate-spin text-primary" />
                            <p className="text-sm">Loading application data...</p>
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                            {error}
                        </div>
                    ) : data ? (
                        <>
                            {/* Candidate & Job Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-background/60 border border-border">
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                        Candidate
                                    </span>
                                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                                        <User className="size-4 text-primary" />
                                        {data.candidate?.name ?? "Applicant"}
                                    </div>
                                    {data.candidate?.email && (
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <Mail className="size-3" />
                                            {data.candidate.email}
                                        </div>
                                    )}
                                    {data.candidate?.headline && (
                                        <p className="text-xs text-muted-foreground mt-1 italic">
                                            &ldquo;{data.candidate.headline}&rdquo;
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                        Applied For
                                    </span>
                                    <div className="font-semibold text-foreground">
                                        {data.job?.title ?? "Position"}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        {data.job?.company}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Current Status:</span>
                                        <StatusBadge status={data.application.status} />
                                    </div>
                                </div>
                            </div>

                            {/* AI Summary / Feedback Card (20m Redis Cache) */}
                            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="size-4 text-primary" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                            AI Profile Summary & Job Fit
                                        </h4>

                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleFetchAiSummary}
                                        disabled={loadingAi}
                                        className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-60"
                                        title={aiSummary ? "Generate fresh evaluation and update cache" : "Generate AI evaluation"}
                                    >
                                        {loadingAi ? (
                                            <Loader2Icon className="size-3.5 animate-spin" />
                                        ) : (
                                            <Sparkles className="size-3.5" />
                                        )}
                                        <span>{aiSummary ? "Regenerate AI Feedback" : "Generate AI Feedback"}</span>
                                    </button>
                                </div>

                                {aiSummary && (
                                    <div className="space-y-3 text-xs text-foreground/90 pt-1">
                                        <p className="leading-relaxed">{aiSummary.summary}</p>
                                        {aiSummary.strengths && aiSummary.strengths.length > 0 && (
                                            <div>
                                                <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
                                                    Strengths:
                                                </span>
                                                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                                    {aiSummary.strengths.map((s, idx) => (
                                                        <li key={idx}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {aiSummary.concerns && aiSummary.concerns.length > 0 && (
                                            <div>
                                                <span className="font-semibold text-amber-700 dark:text-amber-400 block mb-1">
                                                    Considerations / Gaps:
                                                </span>
                                                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                                    {aiSummary.concerns.map((c, idx) => (
                                                        <li key={idx}>{c}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {aiSummary.feedback && (
                                            <div className="p-2.5 rounded-lg bg-card border border-border/80">
                                                <strong className="text-primary block mb-0.5">Advice / Feedback:</strong>
                                                <p className="text-muted-foreground">{aiSummary.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Matched Skills */}
                            {data.matchedSkills && data.matchedSkills.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        Matched Skills ({data.matchedSkills.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {data.matchedSkills.map((sk) => (
                                            <span
                                                key={sk}
                                                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                            >
                                                ✓ {sk}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cover Letter */}
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Submitted Cover Letter
                                </h4>
                                <div className="p-4 rounded-xl bg-background/80 border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                                    {data.application.coverLetter}
                                </div>
                            </div>

                            {/* Review Note */}
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Review Note / Hiring Feedback (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={reviewNote}
                                    onChange={(e) => setReviewNote(e.target.value)}
                                    placeholder="Add notes for candidate feedback or internal record..."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                />
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer Decisions */}
                <div className="p-4 sm:p-5 border-t border-border bg-background/50 flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={updating}
                        className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        Close
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Reject */}
                        <button
                            type="button"
                            disabled={updating || data?.application.status === "rejected"}
                            onClick={() => handleUpdateStatus("rejected")}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-400 hover:bg-rose-500/25 border border-rose-500/20 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            <XCircle className="size-4" />
                            Reject
                        </button>

                        {/* Shortlist */}
                        <button
                            type="button"
                            disabled={updating || data?.application.status === "shortlisted"}
                            onClick={() => handleUpdateStatus("shortlisted")}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/20 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            <BookmarkCheck className="size-4" />
                            Shortlist
                        </button>

                        {/* Hire */}
                        <button
                            type="button"
                            disabled={updating || data?.application.status === "hired"}
                            onClick={() => handleUpdateStatus("hired")}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {updating ? (
                                <Loader2Icon className="size-4 animate-spin" />
                            ) : (
                                <Award className="size-4" />
                            )}
                            Hire
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
