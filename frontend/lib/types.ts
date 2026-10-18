export type Permission = string;

export type AuthUser = {
    id: number;
    email: string;
    name: string;
    roles: string[];
    permissions: Permission[];
};

export type JobType = "full_time" | "part_time" | "contract" | "internship" | "remote";
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead";
export type JobStatus = "draft" | "active" | "closed";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface JobItem {
    id: number;
    title: string;
    company: string;
    location: string;
    jobType: JobType;
    experienceLevel: ExperienceLevel;
    salaryMin: number | null;
    salaryMax: number | null;
    status: JobStatus;
    deadline: string | null;
    createdAt: string;
    updatedAt: string;
    excerpt: string;
    skills: string[];
    applications?: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
}

export interface JobListResponse {
    items: JobItem[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface AdminDashboardData {
    jobs: {
        draft: number;
        active: number;
        closed: number;
        total: number;
    };
    applications: {
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    };
    candidates: number;
    recentApplications: Array<{
        id: number;
        status: ApplicationStatus;
        createdAt: string;
        jobId: number;
        jobTitle: string;
        candidateName: string;
    }>;
    topJobs: Array<{
        id: number;
        title: string;
        status: JobStatus;
        applications: number;
    }>;
}

export interface CandidateDashboardData {
    applications: {
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    };
    recentApplications: Array<{
        id: number;
        status: ApplicationStatus;
        createdAt: string;
        jobId: number;
        jobTitle: string;
        company: string;
    }>;
    profileCompleteness: number;
    openJobs: number;
}

export interface CandidateApplicationItem {
    id: number;
    status: ApplicationStatus;
    coverLetter: string;
    reviewNote: string | null;
    reviewedAt: string | null;
    createdAt: string;
    jobId: number;
    jobTitle: string;
    company: string;
    location: string;
    jobStatus: JobStatus;
}