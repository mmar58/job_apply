export interface CandidateProfileType {
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
}