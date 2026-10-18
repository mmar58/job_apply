"use client";

import { Search, MapPin, SlidersHorizontal, RotateCcw } from "lucide-react";
import type { JobType, ExperienceLevel } from "@/lib/types";

interface JobFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    location: string;
    onLocationChange: (value: string) => void;
    jobType: JobType | "";
    onJobTypeChange: (value: JobType | "") => void;
    experienceLevel: ExperienceLevel | "";
    onExperienceLevelChange: (value: ExperienceLevel | "") => void;
    onReset: () => void;
    totalResults: number;
}

const JOB_TYPES: { label: string; value: JobType | "" }[] = [
    { label: "All Types", value: "" },
    { label: "Full Time", value: "full_time" },
    { label: "Remote", value: "remote" },
    { label: "Part Time", value: "part_time" },
    { label: "Contract", value: "contract" },
    { label: "Internship", value: "internship" },
];

const EXPERIENCE_LEVELS: { label: string; value: ExperienceLevel | "" }[] = [
    { label: "All Levels", value: "" },
    { label: "Entry Level", value: "entry" },
    { label: "Mid Level", value: "mid" },
    { label: "Senior Level", value: "senior" },
    { label: "Lead / Principal", value: "lead" },
];

export function JobFilters({
    search,
    onSearchChange,
    location,
    onLocationChange,
    jobType,
    onJobTypeChange,
    experienceLevel,
    onExperienceLevelChange,
    onReset,
    totalResults,
}: JobFiltersProps) {
    const hasActiveFilters = Boolean(search || location || jobType || experienceLevel);

    return (
        <div className="w-full bg-card rounded-2xl sm:rounded-3xl border border-border/80 shadow-md p-4 sm:p-6 space-y-4">
            {/* Top search & location bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Search input */}
                <div className="md:col-span-5 relative flex items-center">
                    <Search className="size-4 text-muted-foreground absolute left-3.5 pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search title, tech stack, or company..."
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                </div>

                {/* Location input */}
                <div className="md:col-span-4 relative flex items-center">
                    <MapPin className="size-4 text-muted-foreground absolute left-3.5 pointer-events-none" />
                    <input
                        value={location}
                        onChange={(e) => onLocationChange(e.target.value)}
                        placeholder="Location (e.g. Remote, NY)..."
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                </div>

                {/* Experience Level dropdown */}
                <div className="md:col-span-3">
                    <select
                        value={experienceLevel}
                        onChange={(e) => onExperienceLevelChange(e.target.value as ExperienceLevel | "")}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    >
                        {EXPERIENCE_LEVELS.map((lvl) => (
                            <option key={lvl.value} value={lvl.value}>
                                {lvl.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Bottom Row: Job Type Pills & Reset */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
                {/* Pills scroll container */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                    {JOB_TYPES.map((type) => {
                        const isSelected = jobType === type.value;
                        return (
                            <button
                                key={type.label}
                                type="button"
                                onClick={() => onJobTypeChange(type.value)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                    isSelected
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 border border-border/60"
                                }`}
                            >
                                {type.label}
                            </button>
                        );
                    })}
                </div>

                {/* Results Count & Reset */}
                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-muted-foreground shrink-0">
                    <span className="font-medium">
                        <strong className="text-foreground">{totalResults}</strong> positions found
                    </span>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onReset}
                            className="inline-flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
                        >
                            <RotateCcw className="size-3" />
                            <span>Reset Filters</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
