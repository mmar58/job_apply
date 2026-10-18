import { eq, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import { candidateProfiles, candidateSkills, skills, users } from "../../db/schema/index.js";
import type { CandidateProfileType } from "../../types/profile.js";

/** Candidate user + profile + skills for the given ids. */
export async function loadCandidateCards(ids: number[]): Promise<Map<number, CandidateProfileType>> {
    const map = new Map<number, CandidateProfileType>();
    if (!ids.length) return map;

    const rows = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            headline: candidateProfiles.headline,
            bio: candidateProfiles.bio,
            phone: candidateProfiles.phone,
            address: candidateProfiles.address,
            experienceYears: candidateProfiles.experienceYears,
            education: candidateProfiles.education,
            experience: candidateProfiles.experience,
            linkedinUrl: candidateProfiles.linkedinUrl,
            githubUrl: candidateProfiles.githubUrl,
            portfolioUrl: candidateProfiles.portfolioUrl,
        })
        .from(users)
        .leftJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
        .where(inArray(users.id, ids));
    for (const r of rows) map.set(r.id, { ...r, experienceYears: r.experienceYears ?? 0, skills: [] });

    const skillRows = await db
        .select({ candidateId: candidateSkills.candidateId, label: skills.label })
        .from(candidateSkills)
        .innerJoin(skills, eq(skills.id, candidateSkills.skillId))
        .where(inArray(candidateSkills.candidateId, ids));
    for (const s of skillRows) map.get(s.candidateId)?.skills.push(s.label);
    return map;
}

export const lower = (xs: string[]) => xs.map((x) => x.toLowerCase());

/** Which of the job's skills does the candidate have? */
export function matchSkills(jobSkills: string[], candidateSkills: string[]) {
    const have = new Set(lower(candidateSkills));
    const matched = jobSkills.filter((s) => have.has(s.toLowerCase()));
    return { matched, total: jobSkills.length };
}
