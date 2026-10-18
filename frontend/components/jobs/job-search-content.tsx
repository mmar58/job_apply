import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Compass
} from "lucide-react";
import { request, ApiError } from "@/lib/api-core";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { JobDetailsModal } from "@/components/jobs/job-details-modal";
import { ApplyModal } from "@/components/jobs/apply-modal";
import type { JobItem, JobListResponse, JobType, ExperienceLevel } from "@/lib/types";
import JobHeaderHero from "@/components/jobs/job-header-hero";
import JobLoadingView from "@/components/jobs/job-loading-view";
import JobErrorView from "@/components/jobs/job-error-view";
import PaginationWidget from "@/components/common/widgets/pagination-widget";

export default function JobSearchContent() {
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
            <JobHeaderHero />
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
                <JobLoadingView />
            ) : error ? (
                <JobErrorView error={error} fetchJobs={fetchJobs} />
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
                        <PaginationWidget currentPage={page} totalPages={totalPages} onPageChange={(page) => setPage(page)} />
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