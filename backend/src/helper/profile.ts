import type { CandidateProfileType } from "../types/profile.d.ts";
export function calculateProfileCompleteness(profile: CandidateProfileType): number {
    const checks = [
        !!profile.headline,
        !!profile.bio,
        !!profile.phone,
        !!profile.address,
        !!profile.education,
        !!profile.experience,
        Boolean(profile.skills && profile.skills.length > 0),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}