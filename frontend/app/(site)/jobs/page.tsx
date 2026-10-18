"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Briefcase,
    Compass,
    ChevronLeft,
    ChevronRight,
    Loader2Icon,
    RotateCcw,
} from "lucide-react";
import { request, ApiError } from "@/lib/api-core";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { JobDetailsModal } from "@/components/jobs/job-details-modal";
import { ApplyModal } from "@/components/jobs/apply-modal";
import type { JobItem, JobListResponse, JobType, ExperienceLevel } from "@/lib/types";

function JobSearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const initialQ = searchParams.get("q") ?? "";
    const initialLocation = searchParams.get("location") ?? "";
    const initialJobType = (searchParams.get("jobType") as JobType) ?? "";
    const initialExpLevel = (searchParams.get("experienceLevel") as ExperienceLevel) ?? "";
    const initialPage = parseInt(searchParams.get("page") ?? "1", 10) || 1;

    const [search, setSearch] = useState(initialQ);
    const [location, setLocation] = useState(initialLocation);
    const [jobType, setJobType] = useState<JobType | "">(initialJobType);
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">(initialExpLevel);
    const [page, setPage] = useState(initialPage);

    const [jobs, setJobs] = useState<JobItem[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Selected job for Details or Apply modals
    const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [applyModalOpen, setApplyModalOpen] = useState(false);

    // Fetch jobs from backend
    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);

        const queryParams: Record<string, string | number> = {
            page,
            limit: 12,
        };
        if (search.trim()) queryParams.q = search.trim();
        if (location.trim()) queryParams.location = location.trim();
        if (jobType) queryParams.jobType = jobType;
        if (experienceLevel) queryParams.experienceLevel = experienceLevel;

        try {
            const data = await request<JobListResponse>("/jobs", {
                query: queryParams,
            });
            setJobs(data.items);
            setTotalPages(data.totalPages);
            setTotalResults(data.total);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Unable to load positions. Please check your connection.");
            }
        } finally {
            setLoading(false);
        }
    }, [search, location, jobType, experienceLevel, page]);

    // Fetch jobs when filters change
    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // Sync URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (search.trim()) params.set("q", search.trim());
        if (location.trim()) params.set("location", location.trim());
        if (jobType) params.set("jobType", jobType);
        if (experienceLevel) params.set("experienceLevel", experienceLevel);
        if (page > 1) params.set("page", page.toString());

        const newUrl = params.toString() ? `/jobs?${params.toString()}` : "/jobs";
        router.replace(newUrl, { scroll: false });
    }, [search, location, jobType, experienceLevel, page, router]);

    const handleReset = () => {
        setSearch("");
        setLocation("");
        setJobType("");
        setExperienceLevel("");
        setPage(1);
    };

    const handleViewDetails = (job: JobItem) => {
        setSelectedJob(job);
        setDetailsModalOpen(true);
    };

    const handleApply = (job: JobItem) => {
        setSelectedJob(job);
        setApplyModalOpen(true);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
            {/* Header Hero */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-foreground text-xs sm:text-sm font-medium border border-border/50">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Tech & Remote Opportunities
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                    Explore Open Opportunities
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                    Search through hundreds of verified roles, filter by technical discipline, and apply directly to hiring teams.
                </p>
            </div>

            {/* Filter Bar */}
            <JobFilters
                search={search}
                onSearchChange={(val) => {
                    setSearch(val);
                    setPage(1);
                }}
                location={location}
                onLocationChange={(val) => {
                    setLocation(val);
                    setPage(1);
                }}
                jobType={jobType}
                onJobTypeChange={(val) => {
                    setJobType(val);
                    setPage(1);
                }}
                experienceLevel={experienceLevel}
                onExperienceLevelChange={(val) => {
                    setExperienceLevel(val);
                    setPage(1);
                }}
                onReset={handleReset}
                totalResults={totalResults}
            />

            {/* Job Listings Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="h-64 bg-card rounded-2xl sm:rounded-3xl border border-border/70 p-6 space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-11 rounded-2xl bg-black/5 dark:bg-white/10" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-black/5 dark:bg-white/10 rounded-md w-1/3" />
                                    <div className="h-5 bg-black/5 dark:bg-white/10 rounded-md w-2/3" />
                                </div>
                            </div>
                            <div className="h-4 bg-black/5 dark:bg-white/10 rounded-md w-1/2" />
                            <div className="h-12 bg-black/5 dark:bg-white/10 rounded-md w-full" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="p-12 text-center rounded-2xl bg-card border border-destructive/30 max-w-lg mx-auto space-y-4">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                    <button
                        onClick={() => fetchJobs()}
                        className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                    >
                        <RotateCcw className="size-4" />
                        <span>Retry</span>
                    </button>
                </div>
            ) : jobs.length === 0 ? (
                <div className="p-12 sm:p-20 text-center rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-sm max-w-2xl mx-auto space-y-4">
                    <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <Compass className="size-7" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">No matching positions found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        We couldn&apos;t find any roles matching your current search criteria. Try loosening your filters or searching with different keywords.
                    </p>
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                        >
                            Reset All Filters
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onViewDetails={handleViewDetails}
                                onApply={handleApply}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 pt-6 border-t border-border/60">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                            >
                                <ChevronLeft className="size-4" />
                                <span>Previous</span>
                            </button>

                            <span className="text-xs sm:text-sm font-medium text-muted-foreground px-2">
                                Page <strong className="text-foreground">{page}</strong> of{" "}
                                <strong className="text-foreground">{totalPages}</strong>
                            </span>

                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className="px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                            >
                                <span>Next</span>
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <JobDetailsModal
                jobId={selectedJob?.id ?? null}
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                onApply={(job) => {
                    setSelectedJob(job);
                    setApplyModalOpen(true);
                }}
            />

            <ApplyModal
                job={selectedJob}
                isOpen={applyModalOpen}
                onClose={() => setApplyModalOpen(false)}
                onSuccess={() => {
                    fetchJobs();
                }}
            />
        </div>
    );
}

export default function JobsPage() {
    return (
        <Suspense
            fallback={
                <div className="w-full max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <Loader2Icon className="size-8 animate-spin text-primary" />
                    <p className="text-sm">Loading jobs board...</p>
                </div>
            }
        >
            <JobSearchContent />
        </Suspense>
    );
}
