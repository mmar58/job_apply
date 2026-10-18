"use client";

import { useEffect, useState } from "react";
import { X, Loader2Icon, CheckCircle2, XCircle, Clock, FileText, User, Mail, MapPin } from "lucide-react";
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

    useEffect(() => {
        if (!applicationId) return;
        setLoading(true);
        setError(null);
        request<ApplicationDetailData>(`/admin/applications/${applicationId}`)
            .then((res) => {
                setData(res);
                setReviewNote(res.application.reviewNote || "");
            })
            .catch((err) => {
                setError(err instanceof ApiError ? err.message : "Failed to load application details");
            })
            .finally(() => setLoading(false));
    }, [applicationId]);

    if (!applicationId) return null;

    const handleUpdateStatus = async (status: "approved" | "rejected" | "pending") => {
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
            <div className="relative w-full max-w-2xl bg-card text-card-foreground rounded-2xl sm:rounded-3xl shadow-2xl border border-border max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
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
                        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
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
                                        <span className="text-xs text-muted-foreground">Current:</span>
                                        <StatusBadge status={data.application.status} />
                                    </div>
                                </div>
                            </div>

                            {/* Skills Match if any */}
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
                                    Cover Letter
                                </h4>
                                <div className="p-4 rounded-xl bg-background/80 border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                                    {data.application.coverLetter}
                                </div>
                            </div>

                            {/* Review Note */}
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Feedback / Review Note (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={reviewNote}
                                    onChange={(e) => setReviewNote(e.target.value)}
                                    placeholder="Add notes for the candidate or internal hiring record..."
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
                        className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        Close
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={updating || data?.application.status === "rejected"}
                            onClick={() => handleUpdateStatus("rejected")}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-400 hover:bg-rose-500/25 border border-rose-500/20 text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            <XCircle className="size-4" />
                            Reject
                        </button>
                        <button
                            type="button"
                            disabled={updating || data?.application.status === "approved"}
                            onClick={() => handleUpdateStatus("approved")}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
                        >
                            {updating ? (
                                <Loader2Icon className="size-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="size-4" />
                            )}
                            Approve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
