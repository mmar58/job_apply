"use client";

import { useEffect, useState } from "react";
import {
    X,
    Building2,
    MapPin,
    DollarSign,
    Calendar,
    Briefcase,
    Send,
    Loader2Icon,
    CheckCircle2,
} from "lucide-react";
import { request, ApiError } from "@/lib/api-core";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { JobItem } from "@/lib/types";

interface JobDetailsModalProps {
    jobId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onApply: (job: JobItem) => void;
}

interface FullJobData extends JobItem {
    description: string;
    requirements: string;
}

export function JobDetailsModal({
    jobId,
    isOpen,
    onClose,
    onApply,
}: JobDetailsModalProps) {
    const [job, setJob] = useState<FullJobData | null>(null);
    const [applied, setApplied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !jobId) return;
        setLoading(true);
        setError(null);
        request<{ job: FullJobData; applied: boolean }>(`/jobs/${jobId}`)
            .then((res) => {
                setJob(res.job);
                setApplied(res.applied);
            })
            .catch((err) => {
                setError(err instanceof ApiError ? err.message : "Failed to load job details");
            })
            .finally(() => setLoading(false));
    }, [isOpen, jobId]);

    if (!isOpen || !jobId) return null;

    const formatSalary = (min: number | null, max: number | null) => {
        if (!min && !max) return "Competitive Compensation";
        if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()} / year`;
        if (min) return `From $${min.toLocaleString()} / year`;
        return `Up to $${max!.toLocaleString()} / year`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-3xl bg-card text-card-foreground rounded-2xl sm:rounded-3xl shadow-2xl border border-border max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-border bg-background/50">
                    <div className="flex items-start gap-3.5">
                        <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                            {job?.company ? job.company.slice(0, 2).toUpperCase() : "AZ"}
                        </div>
                        <div>
                            <h3 className="font-extrabold text-xl sm:text-2xl text-foreground tracking-tight">
                                {job?.title ?? "Loading..."}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                                <span className="font-semibold text-foreground">{job?.company}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="size-3.5" />
                                    {job?.location}
                                </span>
                            </div>
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

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-6 flex-1">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                            <Loader2Icon className="size-8 animate-spin text-primary" />
                            <p className="text-sm">Loading full position requirements...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-destructive">
                            {error}
                        </div>
                    ) : job ? (
                        <>
                            {/* Badges / Meta row */}
                            <div className="flex flex-wrap items-center gap-2.5 p-3.5 rounded-xl bg-background/60 border border-border">
                                <StatusBadge status={job.jobType} />
                                <StatusBadge status={job.experienceLevel} />
                                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 ml-auto">
                                    <DollarSign className="size-3.5 text-emerald-600" />
                                    <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                                </div>
                            </div>

                            {/* Deadline if present */}
                            {job.deadline && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="size-4 text-primary" />
                                    <span>
                                        Application Deadline:{" "}
                                        <strong className="text-foreground">
                                            {new Date(job.deadline).toLocaleDateString(undefined, {
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </strong>
                                    </span>
                                </div>
                            )}

                            {/* Skills required */}
                            {job.skills && job.skills.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                                        Required Skills & Technologies
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 text-foreground border border-border/60"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                    About the Role
                                </h4>
                                <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                    {job.description}
                                </div>
                            </div>

                            {/* Requirements */}
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                    Requirements & Qualifications
                                </h4>
                                <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                    {job.requirements}
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer with Apply CTA */}
                <div className="p-4 sm:p-5 border-t border-border bg-background/50 flex items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl border border-border hover:bg-black/5 dark:hover:bg-white/10 text-sm font-medium transition-colors"
                    >
                        Close
                    </button>

                    {job && (
                        <div>
                            {applied ? (
                                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-sm font-semibold">
                                    <CheckCircle2 className="size-4" />
                                    <span>Already Applied</span>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        onApply(job);
                                    }}
                                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                                >
                                    <Send className="size-4" />
                                    <span>Apply for this Job</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
