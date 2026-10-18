"use client";

import { Building2, MapPin, DollarSign, Calendar, ArrowUpRight } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { JobItem } from "@/lib/types";

interface JobCardProps {
    job: JobItem;
    onViewDetails: (job: JobItem) => void;
    onApply: (job: JobItem) => void;
}

export function JobCard({ job, onViewDetails, onApply }: JobCardProps) {
    const formatSalary = (min: number | null, max: number | null) => {
        if (!min && !max) return null;
        if (min && max) return `$${Math.round(min / 1000)}k – $${Math.round(max / 1000)}k`;
        if (min) return `From $${Math.round(min / 1000)}k`;
        return `Up to $${Math.round(max! / 1000)}k`;
    };

    const salaryString = formatSalary(job.salaryMin, job.salaryMax);

    return (
        <div className="group relative bg-card text-card-foreground rounded-2xl sm:rounded-3xl border border-border/80 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
                {/* Header: Company Avatar & Badges */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm tracking-wider shrink-0 transition-transform group-hover:scale-105">
                            {job.company.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs font-semibold text-muted-foreground truncate block">
                                {job.company}
                            </span>
                            <h3
                                onClick={() => onViewDetails(job)}
                                className="font-bold text-base sm:text-lg text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer line-clamp-1"
                            >
                                {job.title}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <StatusBadge status={job.jobType} />
                    </div>
                </div>

                {/* Sub-meta: Location, Experience & Salary */}
                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <MapPin className="size-3.5 text-muted-foreground/80" />
                        <span>{job.location}</span>
                    </span>
                    <span>•</span>
                    <span className="capitalize">{job.experienceLevel} level</span>
                    {salaryString && (
                        <>
                            <span>•</span>
                            <span className="font-semibold text-foreground flex items-center gap-0.5">
                                <DollarSign className="size-3 text-emerald-600" />
                                <span>{salaryString}</span>
                            </span>
                        </>
                    )}
                </div>

                {/* Excerpt */}
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {job.excerpt}
                </p>

                {/* Skills tags */}
                {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.skills.slice(0, 4).map((skill) => (
                            <span
                                key={skill}
                                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-foreground/80 border border-border/60"
                            >
                                {skill}
                            </span>
                        ))}
                        {job.skills.length > 4 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 text-muted-foreground">
                                +{job.skills.length - 4} more
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Footer with Actions */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {job.deadline ? (
                        <>
                            <Calendar className="size-3.5 text-muted-foreground" />
                            <span>
                                Closes{" "}
                                {new Date(job.deadline).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </>
                    ) : (
                        <span>Open for applications</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onViewDetails(job)}
                        className="px-3 py-1.5 rounded-xl border border-border/80 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-semibold text-foreground transition-all cursor-pointer"
                    >
                        Details
                    </button>
                    <button
                        type="button"
                        onClick={() => onApply(job)}
                        className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                    >
                        <span>Apply</span>
                        <ArrowUpRight className="size-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
