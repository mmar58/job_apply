import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import { candidateProfiles, candidateSkills, skills, users } from "../../db/schema/index.js";
import { PERMISSIONS } from "../../config/permissions.js";
import { parse } from "../../lib/http.js";
import { resolveSkillIds } from "../../lib/skills.js";
import { requirePermission } from "../../middleware/auth.js";

export const candidateRouter = Router();
candidateRouter.use(requirePermission(PERMISSIONS.PROFILE_MANAGE));

const optionalText = (max: number) =>
    z
        .string()
        .trim()
        .max(max)
        .optional()
        .nullable()
        .transform((v) => (v ? v : null));

const optionalUrl = z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^https?:\/\//i.test(v), "Must start with http:// or https://");

const profileSchema = z.object({
    name: z.string().trim().min(2).max(150).optional(),
    headline: optionalText(200),
    bio: optionalText(5000),
    phone: optionalText(40),
    location: optionalText(150),
    experienceYears: z.coerce.number().int().min(0).max(70).default(0),
    education: optionalText(5000),
    experience: optionalText(8000),
    linkedinUrl: optionalUrl,
    githubUrl: optionalUrl,
    portfolioUrl: optionalUrl,
    skills: z.array(z.string()).max(60).default([]),
});

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
    return { ...row, experienceYears: row?.experienceYears ?? 0, skills: skillRows.map((s) => s.label) };
}

candidateRouter.get("/profile", async (req, res) => {
    res.json({ profile: await getCandidateProfile(req.user!.id) });
});

candidateRouter.put("/profile", async (req, res) => {
    const { name, skills: skillNames, ...fields } = parse(profileSchema, req.body);
    const userId = req.user!.id;

    await db.transaction(async (tx) => {
        if (name) await tx.update(users).set({ name }).where(eq(users.id, userId));
        await tx
            .insert(candidateProfiles)
            .values({ userId, ...fields })
            .onDuplicateKeyUpdate({ set: fields });

        const skillIds = await resolveSkillIds(skillNames, tx);
        await tx.delete(candidateSkills).where(eq(candidateSkills.candidateId, userId));
        if (skillIds.length) {
            await tx.insert(candidateSkills).values(skillIds.map((skillId) => ({ candidateId: userId, skillId })));
        }
    });

    res.json({ profile: await getCandidateProfile(userId) });
});
