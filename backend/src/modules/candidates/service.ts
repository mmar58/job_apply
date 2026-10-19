import { db } from "../../db/index.js";
import { candidateProfiles, candidateSkills, skills, users } from "../../db/schema/index.js";
import { eq } from "drizzle-orm";

export async function getCandidateProfile(userId: number) {
    const [row] = await db
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
        .where(eq(users.id, userId))
        .limit(1);
    const skillRows = await db
        .select({ label: skills.label })
        .from(candidateSkills)
        .innerJoin(skills, eq(skills.id, candidateSkills.skillId))
        .where(eq(candidateSkills.candidateId, userId));
    return {
        ...row,
        location: row?.address ?? null,
        experienceYears: row?.experienceYears ?? 0,
        skills: skillRows.map((s) => s.label),
    };
}