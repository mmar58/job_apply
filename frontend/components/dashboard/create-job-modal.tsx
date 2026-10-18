"use client";

import { useState } from "react";
import { X, Loader2Icon, Plus, Briefcase, MapPin, DollarSign, Calendar } from "lucide-react";
import { request, ApiError } from "@/lib/api-core";
import { toast } from "sonner";
import type { JobType, ExperienceLevel, JobStatus } from "@/lib/types";

interface CreateJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateJobModal({ isOpen, onClose, onSuccess }: CreateJobModalProps) {
    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("AnZ");
    const [location, setLocation] = useState("Remote");
    const [jobType, setJobType] = useState<JobType>("full_time");
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("mid");
    const [salaryMin, setSalaryMin] = useState<string>("");
    const [salaryMax, setSalaryMax] = useState<string>("");
    const [status, setStatus] = useState<JobStatus>("active");
    const [deadline, setDeadline] = useState<string>("");
    const [skillsInput, setSkillsInput] = useState("TypeScript, React, Node.js");
    const [description, setDescription] = useState("");
    const [requirements, setRequirements] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const skills = skillsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        const payload = {
            title: title.trim(),
            company: company.trim() || "AnZ",
            location: location.trim(),
            jobType,
            experienceLevel,
            salaryMin: salaryMin ? parseInt(salaryMin, 10) : null,
            salaryMax: salaryMax ? parseInt(salaryMax, 10) : null,
            status,
            deadline: deadline || null,
            skills,
            description: description.trim(),
            requirements: requirements.trim(),
        };

        try {
            await request("/admin/jobs", {
                method: "POST",
                body: payload,
            });
            toast.success("Job posted successfully!");
            onSuccess();
            onClose();
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Failed to create job. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-2xl bg-card text-card-foreground rounded-2xl sm:rounded-3xl shadow-2xl border border-border max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
                    <div className="flex items-center gap-2">
                        <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Briefcase className="size-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-foreground">Post a New Job</h3>
                            <p className="text-xs text-muted-foreground">Fill in the details to publish an open position</p>
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

                {/* Form content */}
                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
                    {error && (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Job Title *
                            </label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Senior Full-Stack Engineer"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Company *
                            </label>
                            <input
                                required
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="Company name"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Location *
                            </label>
                            <input
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Remote, or New York, NY"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Job Type
                            </label>
                            <select
                                value={jobType}
                                onChange={(e) => setJobType(e.target.value as JobType)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="full_time">Full Time</option>
                                <option value="part_time">Part Time</option>
                                <option value="remote">Remote</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Experience Level
                            </label>
                            <select
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="entry">Entry Level</option>
                                <option value="mid">Mid Level</option>
                                <option value="senior">Senior Level</option>
                                <option value="lead">Lead / Principal</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Min Salary (USD/yr)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={salaryMin}
                                onChange={(e) => setSalaryMin(e.target.value)}
                                placeholder="e.g. 80000"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Max Salary (USD/yr)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={salaryMax}
                                onChange={(e) => setSalaryMax(e.target.value)}
                                placeholder="e.g. 130000"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Publication Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as JobStatus)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="active">Active (Visible immediately)</option>
                                <option value="draft">Draft (Private)</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Application Deadline
                            </label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Required Skills (comma-separated)
                            </label>
                            <input
                                value={skillsInput}
                                onChange={(e) => setSkillsInput(e.target.value)}
                                placeholder="React, Node.js, TypeScript, PostgreSQL"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Job Description * (min 20 characters)
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the role responsibilities, team dynamics, and mission..."
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Requirements * (min 10 characters)
                            </label>
                            <textarea
                                required
                                rows={3}
                                value={requirements}
                                onChange={(e) => setRequirements(e.target.value)}
                                placeholder="List required qualifications, experience, and nice-to-haves..."
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-border hover:bg-black/5 dark:hover:bg-white/10 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2Icon className="size-4 animate-spin" />
                                    <span>Posting...</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="size-4" />
                                    <span>Post Job</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
