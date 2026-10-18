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
export type ApplicationStatus = "pending" | "shortlisted" | "hired" | "rejected";

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
    applicantCount?: number;
    applicationsCount?: number;
    applications?: {
        total: number;
        pending: number;
        shortlisted: number;
        hired: number;
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
        shortlisted: number;
        hired: number;
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
        candidateId: number;
        matchScore?: number;
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
        shortlisted: number;
        hired: number;
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
    totalApplications?: number;
}

export interface AdminJobApplicant {
    id: number;
    candidateId: number;
    status: ApplicationStatus;
    coverLetter: string;
    reviewNote: string | null;
    createdAt: string;
    candidateName: string;
    candidateEmail: string;
    headline: string | null;
    skills: string[];
    experienceYears: number;
    matchScore: number;
}

export interface AdminJobDetail {
    job: JobItem & {
        description: string;
        requirements: string;
        createdByName?: string | null;
    };
    applications: AdminJobApplicant[];
    suggestions: AdminJobApplicant[];
    totalApplications: number;
}

export interface AdminCandidateCard {
    id: number;
    name: string;
    email: string;
    headline: string | null;
    bio: string | null;
    phone: string | null;
    address: string | null;
    experienceYears: number;
    education: string | null;
    experience: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    portfolioUrl: string | null;
    skills: string[];
    applicationsCount: number;
    completeness: number;
    applications?: Array<{
        id: number;
        status: ApplicationStatus;
        createdAt: string;
        jobId: number;
        jobTitle: string;
        company: string;
    }>;
}