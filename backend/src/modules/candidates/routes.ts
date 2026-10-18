import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import { candidateProfiles, candidateSkills, skills, users } from "../../db/schema/index.js";
import { PERMISSIONS } from "../../config/permissions.js";
import { parse } from "../../lib/http.js";
import { resolveSkillIds } from "../../lib/skills.js";
import { requirePermission } from "../../middleware/auth.js";
import { calculateProfileCompleteness } from "../../helper/profile.js";
import { getCandidateProfile } from "./service.js";
import { profileSchema } from "./validations.js";

export const candidateRouter = Router();
candidateRouter.use(requirePermission(PERMISSIONS.PROFILE_MANAGE));

candidateRouter.get("/profile", async (req, res) => {
    const profile = await getCandidateProfile(req.user!.id);
    res.json({ profile, completeness: calculateProfileCompleteness(profile) });
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
