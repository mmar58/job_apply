import { Router } from "express";
import { and, desc, eq, count } from "drizzle-orm";
import { db } from "../../db/index.js";
import { applications, jobSkills, jobs, users } from "../../db/schema/index.js";
import { PERMISSIONS } from "../../config/permissions.js";
import { conflict, idParam, notFound, parse } from "../../lib/http.js";
import { resolveSkillIds } from "../../lib/skills.js";
import { can, requirePermission } from "../../middleware/auth.js";
import { jobInputSchema, jobStatusSchema } from "./validations.js";
import { listJobs, jobWithSkills } from "./helper.js";
import { loadCandidateCards } from "../applications/service.js";
import { getOrComputeMatchScore } from "../ai/service.js";
import { applicationCountsForJobs, skillCountsForJobs } from "./stats.js";


// ---------------- Public ----------------
export const publicJobsRouter = Router();

publicJobsRouter.get("/", async (req, res) => {
    res.json(await listJobs(req.query, true));
});

publicJobsRouter.get("/:id", async (req, res) => {
    const id = idParam(req.params.id);
    const job = await jobWithSkills(id);
    if (!job) throw notFound("Job not found");

    const isPublic = job.status === "active" && (!job.deadline || job.deadline >= new Date().toISOString().slice(0, 10));
    if (!isPublic && !can(req.user, PERMISSIONS.JOB_VIEW_ALL)) throw notFound("Job not found");

    let applied = false;
    if (req.user && can(req.user, PERMISSIONS.APPLICATION_APPLY)) {
        const [a] = await db
            .select({ id: applications.id })
            .from(applications)
            .where(and(eq(applications.jobId, id), eq(applications.candidateId, req.user.id)))
            .limit(1);
        applied = !!a;
    }
    const [{ n: totalApps }] = await db
        .select({ n: count() })
        .from(applications)
        .where(eq(applications.jobId, id));

    const { createdBy: _c, ...safe } = job;
    res.json({ job: { ...safe, applicantCount: Number(totalApps) }, applied, applicantCount: Number(totalApps) });
});

// ---------------- Admin ----------------
export const adminJobsRouter = Router();

adminJobsRouter.get("/", requirePermission(PERMISSIONS.JOB_VIEW_ALL), async (req, res) => {
    res.json(await listJobs(req.query, false));
});

adminJobsRouter.post("/", requirePermission(PERMISSIONS.JOB_CREATE), async (req, res) => {
    const { skills: skillNames, ...data } = parse(jobInputSchema, req.body);
    const id = await db.transaction(async (tx) => {
        const [r] = await tx.insert(jobs).values({ ...data, createdBy: req.user!.id });
        const skillIds = await resolveSkillIds(skillNames, tx);
        if (skillIds.length) await tx.insert(jobSkills).values(skillIds.map((skillId) => ({ jobId: r.insertId, skillId })));
        return r.insertId;
    });
    res.status(201).json({ job: await jobWithSkills(id) });
});

adminJobsRouter.get("/:id/details", requirePermission(PERMISSIONS.JOB_VIEW_ALL), async (req, res) => {
    const id = idParam(req.params.id);
    const job = await jobWithSkills(id);
    if (!job) throw notFound("Job not found");

    // Fetch all applications for this job
    const appRows = await db
        .select({
            id: applications.id,
            candidateId: applications.candidateId,
            status: applications.status,
            coverLetter: applications.coverLetter,
            reviewNote: applications.reviewNote,
            createdAt: applications.createdAt,
            candidateName: users.name,
            candidateEmail: users.email,
        })
        .from(applications)
        .innerJoin(users, eq(users.id, applications.candidateId))
        .where(eq(applications.jobId, id))
        .orderBy(desc(applications.createdAt));

    const candidateIds = [...new Set(appRows.map((a) => a.candidateId))];
    const cardMap = await loadCandidateCards(candidateIds);

    const appsWithScores = await Promise.all(
        appRows.map(async (a) => {
            const card = cardMap.get(a.candidateId);
            const matchScore = await getOrComputeMatchScore(id, a.candidateId, a.coverLetter);
            return {
                ...a,
                headline: card?.headline || null,
                skills: card?.skills || [],
                experienceYears: card?.experienceYears || 0,
                matchScore,
            };
        })
    );

    // Sort applicants by match score descending to suggest most matching candidates
    const suggestions = [...appsWithScores]
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

    const [creator] = await db.select({ name: users.name }).from(users).where(eq(users.id, job.createdBy)).limit(1);

    res.json({
        job: { ...job, createdByName: creator?.name ?? null },
        applications: appsWithScores,
        suggestions,
        totalApplications: appRows.length,
    });
});

adminJobsRouter.get("/:id", requirePermission(PERMISSIONS.JOB_VIEW_ALL), async (req, res) => {
    const id = idParam(req.params.id);
    const job = await jobWithSkills(id);
    if (!job) throw notFound("Job not found");
    const [counts, skillCounts] = await Promise.all([applicationCountsForJobs([id]), skillCountsForJobs([id])]);
    const [creator] = await db.select({ name: users.name }).from(users).where(eq(users.id, job.createdBy)).limit(1);
    res.json({
        job: { ...job, createdByName: creator?.name ?? null },
        applications: counts.get(id),
        skillCounts: skillCounts.get(id) ?? [],
    });
});

adminJobsRouter.put("/:id", requirePermission(PERMISSIONS.JOB_UPDATE), async (req, res) => {
    const id = idParam(req.params.id);
    const { skills: skillNames, ...data } = parse(jobInputSchema, req.body);
    const [existing] = await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.id, id)).limit(1);
    if (!existing) throw notFound("Job not found");

    await db.transaction(async (tx) => {
        await tx.update(jobs).set(data).where(eq(jobs.id, id));
        const skillIds = await resolveSkillIds(skillNames, tx);
        await tx.delete(jobSkills).where(eq(jobSkills.jobId, id));
        if (skillIds.length) await tx.insert(jobSkills).values(skillIds.map((skillId) => ({ jobId: id, skillId })));
    });
    res.json({ job: await jobWithSkills(id) });
});

adminJobsRouter.patch("/:id/status", requirePermission(PERMISSIONS.JOB_UPDATE), async (req, res) => {
    const id = idParam(req.params.id);
    const { status } = parse(jobStatusSchema, req.body);
    const [existing] = await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.id, id)).limit(1);
    if (!existing) throw notFound("Job not found");
    await db.update(jobs).set({ status }).where(eq(jobs.id, id));
    res.json({ job: await jobWithSkills(id) });
});

adminJobsRouter.delete("/:id", requirePermission(PERMISSIONS.JOB_DELETE), async (req, res) => {
    const id = idParam(req.params.id);
    const [{ n }] = await db.select({ n: count() }).from(applications).where(eq(applications.jobId, id));
    if (Number(n) > 0) throw conflict("This job has applications. Close it instead of deleting it.");
    const [r] = await db.delete(jobs).where(eq(jobs.id, id));
    if (r.affectedRows === 0) throw notFound("Job not found");
    res.json({ ok: true });
});
