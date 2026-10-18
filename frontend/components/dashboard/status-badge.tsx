import { cn } from "@/lib/utils";
import type { ApplicationStatus, JobStatus, JobType, ExperienceLevel } from "@/lib/types";

interface StatusBadgeProps {
    status?: ApplicationStatus | JobStatus | JobType | ExperienceLevel | string;
    variant?: "application" | "job" | "type" | "experience";
    className?: string;
}

export function StatusBadge({ status, variant = "application", className }: StatusBadgeProps) {
    if (!status) return null;

    const normalized = status.toLowerCase();

    // Map style variants based on status value
    let colorClasses = "bg-muted text-muted-foreground border-border";
    let label = status.replace(/_/g, " ");

    if (normalized === "approved" || normalized === "active") {
        colorClasses = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
        label = normalized === "approved" ? "Approved" : "Active";
    } else if (normalized === "pending" || normalized === "draft") {
        colorClasses = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
        label = normalized === "pending" ? "Pending" : "Draft";
    } else if (normalized === "rejected" || normalized === "closed") {
        colorClasses = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
        label = normalized === "rejected" ? "Rejected" : "Closed";
    } else if (normalized === "remote") {
        colorClasses = "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20";
        label = "Remote";
    } else if (normalized === "full_time") {
        colorClasses = "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
        label = "Full Time";
    } else if (normalized === "part_time") {
        colorClasses = "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
        label = "Part Time";
    } else if (normalized === "contract") {
        colorClasses = "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20";
        label = "Contract";
    } else if (normalized === "internship") {
        colorClasses = "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20";
        label = "Internship";
    } else if (normalized === "entry") {
        colorClasses = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
        label = "Entry Level";
    } else if (normalized === "mid") {
        colorClasses = "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20";
        label = "Mid Level";
    } else if (normalized === "senior") {
        colorClasses = "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
        label = "Senior";
    } else if (normalized === "lead") {
        colorClasses = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
        label = "Lead / Staff";
    }

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize transition-colors select-none",
                colorClasses,
                className
            )}
        >
            {label}
        </span>
    );
}
