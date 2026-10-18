"use client";

import { useEffect, useState, useMemo } from "react";
import {
    X,
    Users,
    Search,
    Loader2Icon,
    Sparkles,
    Eye,
    Briefcase,
    Mail,
    ArrowUpDown,
    Filter,
} from "lucide-react";
import { request, ApiError } from "@/lib/api-core";
import type { AdminCandidateCard } from "@/lib/types";

interface AdminCandidatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCandidate: (candidateId: number) => void;
}

export function AdminCandidatesModal({
    isOpen,
    onClose,
    onSelectCandidate,
}: AdminCandidatesModalProps) {
    const [candidates, setCandidates] = useState<AdminCandidateCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [completenessFilter, setCompletenessFilter] = useState<"all" | "complete" | "incomplete">("all");

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        setError(null);

        request<{ candidates: AdminCandidateCard[] }>("/admin/candidates")
            .then((res) => setCandidates(res.candidates))
            .catch((err) => {
                setError(err instanceof ApiError ? err.message : "Failed to load candidates directory");
            })
            .finally(() => setLoading(false));
    }, [isOpen]);

    const filteredCandidates = useMemo(() => {
        return candidates.filter((c) => {
            // Search filter
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.headline && c.headline.toLowerCase().includes(q)) ||
                (c.skills && c.skills.some((s) => s.toLowerCase().includes(q)));

            if (!matchesSearch) return false;

            // Completeness filter
            if (completenessFilter === "complete") return c.completeness > 50;
            if (completenessFilter === "incomplete") return c.completeness <= 50;
            return true;
        });
    }, [candidates, searchQuery, completenessFilter]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-4xl bg-card text-card-foreground rounded-2xl sm:rounded-3xl shadow-2xl border border-border max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-purple-500/10 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                            <Users className="size-5" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-lg text-foreground">
                                Candidate Talent Pool
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {candidates.length} registered candidate{candidates.length === 1 ? "" : "s"} on the portal
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

                {/* Filters & Search Toolbar */}
                <div className="px-6 py-3.5 border-b border-border bg-background/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                        <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, headline, or skills..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background/60 focus:bg-background text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 bg-background/60 p-1 rounded-xl border border-border text-xs font-semibold shrink-0">
                        <button
                            type="button"
                            onClick={() => setCompletenessFilter("all")}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                completenessFilter === "all"
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            All ({candidates.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setCompletenessFilter("complete")}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                completenessFilter === "complete"
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Ready (&gt;50%)
                        </button>
                        <button
                            type="button"
                            onClick={() => setCompletenessFilter("incomplete")}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                completenessFilter === "incomplete"
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Incomplete
                        </button>
                    </div>
                </div>

                {/* Candidates List Body */}
                <div className="overflow-y-auto p-6 space-y-4 flex-1">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                            <Loader2Icon className="size-8 animate-spin text-primary" />
                            <p className="text-sm">Loading candidates directory...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-sm text-destructive">
                            {error}
                        </div>
                    ) : filteredCandidates.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground space-y-2">
                            <Users className="size-12 mx-auto text-muted-foreground/30" />
                            <p className="font-semibold text-foreground text-sm">No candidates match your search</p>
                            <p className="text-xs">
                                Try adjusting your keywords or clearing the completeness filter.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {filteredCandidates.map((candidate) => {
                                const initials = candidate.name
                                    ? candidate.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .toUpperCase()
                                          .slice(0, 2)
                                    : "CA";

                                return (
                                    <div
                                        key={candidate.id}
                                        className="p-4 rounded-2xl border border-border/80 bg-background/50 hover:bg-background/90 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                            <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                                {initials}
                                            </div>

                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="font-bold text-foreground text-sm truncate">
                                                        {candidate.name}
                                                    </h4>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                            candidate.completeness > 50
                                                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
                                                                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25"
                                                        }`}
                                                    >
                                                        {candidate.completeness}% profile
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">•</span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Briefcase className="size-3" />
                                                        {candidate.applicationsCount} applied
                                                    </span>
                                                </div>

                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {candidate.headline || candidate.email}
                                                </p>

                                                {candidate.skills && candidate.skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 pt-1">
                                                        {candidate.skills.slice(0, 5).map((skill) => (
                                                            <span
                                                                key={skill}
                                                                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/5 dark:bg-white/10 text-muted-foreground"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {candidate.skills.length > 5 && (
                                                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-black/5 dark:bg-white/10 text-muted-foreground">
                                                                +{candidate.skills.length - 5}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                            <button
                                                type="button"
                                                onClick={() => onSelectCandidate(candidate.id)}
                                                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                            >
                                                <Eye className="size-3.5" />
                                                <span>View Profile</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 border-t border-border bg-background/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Click &ldquo;View Profile&rdquo; to inspect candidate skills, resume notes & history</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-xl border border-border hover:bg-black/5 dark:hover:bg-white/10 font-medium transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
