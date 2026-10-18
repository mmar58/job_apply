"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Loader2Icon, Send, Building2, MapPin, CheckCircle2 } from "lucide-react";
import { request, ApiError } from "@/lib/api-core";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import type { JobItem } from "@/lib/types";

interface ApplyModalProps {
    job: JobItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ApplyModal({ job, isOpen, onClose, onSuccess }: ApplyModalProps) {
    const user = useAuthStore((state) => state.user);
    const [coverLetter, setCoverLetter] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !job) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (coverLetter.trim().length < 30) {
            setError("Please write at least 30 characters in your cover letter.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            await request(`/jobs/${job.id}/apply`, {
                method: "POST",
                body: { coverLetter: coverLetter.trim() },
            });
            toast.success("Application submitted successfully!");
            onSuccess();
            onClose();
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Failed to submit application. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-xl bg-card text-card-foreground rounded-2xl sm:rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
                    <div>
                        <h3 className="font-bold text-lg text-foreground">Apply for Position</h3>
                        <p className="text-xs text-muted-foreground">Submit your application to the hiring team</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Job Summary Banner */}
                <div className="p-4 sm:p-5 bg-background/60 border-b border-border/80 flex items-start gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
                        {job.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm sm:text-base text-foreground">{job.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                                <Building2 className="size-3" />
                                {job.company}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <MapPin className="size-3" />
                                {job.location}
                            </span>
                        </div>
                    </div>
                </div>

                {!user ? (
                    <div className="p-6 text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            You must be signed in with a candidate account to apply for this job.
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <Link
                                href="/login"
                                className="px-5 py-2.5 rounded-xl border border-border hover:bg-black/5 dark:hover:bg-white/10 text-sm font-semibold text-foreground transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/register"
                                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Cover Letter / Pitch *
                                </label>
                                <span
                                    className={`text-xs ${
                                        coverLetter.length < 30 ? "text-amber-600" : "text-emerald-600"
                                    }`}
                                >
                                    {coverLetter.length}/30 characters minimum
                                </span>
                            </div>
                            <textarea
                                required
                                rows={6}
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                placeholder="Explain why you are the ideal fit for this role, mentioning relevant experience, achievements, and technical strengths..."
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none leading-relaxed"
                            />
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-xl border border-border hover:bg-black/5 dark:hover:bg-white/10 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || coverLetter.length < 30}
                                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2Icon className="size-4 animate-spin" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="size-4" />
                                        <span>Submit Application</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
