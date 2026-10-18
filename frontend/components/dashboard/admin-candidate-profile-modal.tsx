"use client";

import { useEffect, useState } from "react";
import {
    X,
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    GraduationCap,
    Globe,
    ExternalLink,
    Loader2Icon,
    Award,
    FileText,
    Clock,
    Sparkles,
} from "lucide-react";
import { request, ApiError } from "@/lib/api-core";
import { StatusBadge } from "./status-badge";
import type { AdminCandidateCard } from "@/lib/types";

interface AdminCandidateProfileModalProps {
    candidateId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onReviewApplication?: (applicationId: number) => void;
}

export function AdminCandidateProfileModal({
    candidateId,
    isOpen,
    onClose,
    onReviewApplication,
}: AdminCandidateProfileModalProps) {
    const [candidate, setCandidate] = useState<AdminCandidateCard | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !candidateId) return;
        setLoading(true);
        setError(null);

        request<{ candidate: AdminCandidateCard }>(`/admin/candidates/${candidateId}`)
            .then((res) => {
                setCandidate(res.candidate);
            })
            .catch((err) => {
                setError(err instanceof ApiError ? err.message : "Failed to load candidate profile");
            })
            .finally(() => setLoading(false));
    }, [isOpen, candidateId]);

    if (!isOpen || !candidateId) return null;

    const initials = candidate?.name
        ? candidate.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "CA";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-3xl bg-card text-card-foreground rounded-2xl sm:rounded-3xl shadow-2xl border border-border max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
                    <div className="flex items-center gap-3">
                        <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                            {initials}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-lg text-foreground truncate">
                                    {candidate?.name ?? "Candidate Profile"}
                                </h3>
                                {candidate && (
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                            candidate.completeness > 50
                                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                        }`}
                                    >
                                        {candidate.completeness}% Complete
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {candidate?.headline || "Registered Candidate"}
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

                {/* Body Content */}
                <div className="overflow-y-auto p-6 space-y-6 flex-1">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                            <Loader2Icon className="size-8 animate-spin text-primary" />
                            <p className="text-sm">Loading candidate profile...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-destructive">
                            {error}
                        </div>
                    ) : candidate ? (
                        <>
                            {/* Contact & Meta Quick Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-background/60 border border-border">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <Mail className="size-4 text-muted-foreground shrink-0" />
                                    <div className="min-w-0">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                                            Email
                                        </span>
                                        <span className="text-xs font-medium text-foreground truncate block">
                                            {candidate.email}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 min-w-0">
                                    <Phone className="size-4 text-muted-foreground shrink-0" />
                                    <div className="min-w-0">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                                            Phone
                                        </span>
                                        <span className="text-xs font-medium text-foreground truncate block">
                                            {candidate.phone || "Not provided"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 min-w-0">
                                    <MapPin className="size-4 text-muted-foreground shrink-0" />
                                    <div className="min-w-0">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                                            Location
                                        </span>
                                        <span className="text-xs font-medium text-foreground truncate block">
                                            {candidate.address || "Not provided"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Completeness Bar */}
                            <div className="space-y-1.5 p-4 rounded-2xl bg-background/40 border border-border/70">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                                        <Sparkles className="size-3.5 text-primary" />
                                        Profile Strength
                                    </span>
                                    <span className="font-bold text-foreground">
                                        {candidate.completeness}% Complete
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            candidate.completeness > 50
                                                ? "bg-emerald-500"
                                                : "bg-amber-500"
                                        }`}
                                        style={{ width: `${Math.max(candidate.completeness, 5)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Bio / Summary */}
                            {candidate.bio && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        About & Bio
                                    </h4>
                                    <div className="p-4 rounded-2xl bg-background/60 border border-border text-sm leading-relaxed whitespace-pre-wrap">
                                        {candidate.bio}
                                    </div>
                                </div>
                            )}

                            {/* Skills */}
                            {candidate.skills && candidate.skills.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Award className="size-3.5" />
                                        Skills & Expertise
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {candidate.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Experience & Education */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-background/60 border border-border space-y-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Briefcase className="size-3.5" />
                                        Work Experience ({candidate.experienceYears} Years)
                                    </h4>
                                    <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                        {candidate.experience || "No specific experience details logged."}
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-background/60 border border-border space-y-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <GraduationCap className="size-3.5" />
                                        Education & Credentials
                                    </h4>
                                    <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                        {candidate.education || "No education credentials recorded."}
                                    </p>
                                </div>
                            </div>

                            {/* Social / External Links */}
                            {(candidate.linkedinUrl || candidate.githubUrl || candidate.portfolioUrl) && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Globe className="size-3.5" />
                                        Profiles & Portfolios
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.linkedinUrl && (
                                            <a
                                                href={candidate.linkedinUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-1.5 rounded-xl border border-border/80 bg-background/60 hover:bg-background text-xs font-semibold text-primary inline-flex items-center gap-1.5 transition-colors"
                                            >
                                                <span>LinkedIn</span>
                                                <ExternalLink className="size-3" />
                                            </a>
                                        )}
                                        {candidate.githubUrl && (
                                            <a
                                                href={candidate.githubUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-1.5 rounded-xl border border-border/80 bg-background/60 hover:bg-background text-xs font-semibold text-foreground inline-flex items-center gap-1.5 transition-colors"
                                            >
                                                <span>GitHub</span>
                                                <ExternalLink className="size-3" />
                                            </a>
                                        )}
                                        {candidate.portfolioUrl && (
                                            <a
                                                href={candidate.portfolioUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-1.5 rounded-xl border border-border/80 bg-background/60 hover:bg-background text-xs font-semibold text-emerald-600 inline-flex items-center gap-1.5 transition-colors"
                                            >
                                                <span>Personal Portfolio</span>
                                                <ExternalLink className="size-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Applications History */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <FileText className="size-3.5" />
                                        Application History ({candidate.applications?.length ?? 0})
                                    </h4>
                                </div>

                                {!candidate.applications || candidate.applications.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">
                                        Candidate has not applied to any job postings yet.
                                    </p>
                                ) : (
                                    <div className="divide-y divide-border/60 border border-border rounded-2xl bg-background/50 overflow-hidden">
                                        {candidate.applications.map((app) => (
                                            <div
                                                key={app.id}
                                                className="p-3.5 flex items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                                            >
                                                <div className="min-w-0">
                                                    <span className="font-semibold text-sm text-foreground block truncate">
                                                        {app.jobTitle}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                        <span>{app.company}</span>
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

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <StatusBadge status={app.status} />
                                                    {onReviewApplication && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                onClose();
                                                                onReviewApplication(app.id);
                                                            }}
                                                            className="px-2.5 py-1 rounded-lg border border-border/80 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold text-primary transition-all cursor-pointer"
                                                        >
                                                            Review
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 border-t border-border bg-background/50 flex items-center justify-end">
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
