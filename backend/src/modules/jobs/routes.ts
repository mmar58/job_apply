import { Router } from "express";
import { and, desc, eq, exists, gte, isNull, like, or, sql, count, type SQL } from "drizzle-orm";
import { db } from "../../db/index.js";
import { applications, jobSkills, jobs, skills, users } from "../../db/schema/index.js";
import { PERMISSIONS } from "../../config/permissions.js";
import { conflict, idParam, notFound, parse } from "../../lib/http.js";
import { normalizeSkill, resolveSkillIds } from "../../lib/skills.js";
import { can, requirePermission } from "../../middleware/auth.js";
import { jobInputSchema, jobListQuerySchema, jobStatusSchema } from "./schema.js";
import { applicationCountsForJobs, skillCountsForJobs, skillsForJobs } from "./stats.js";

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

function filtersFromQuery(q: ReturnType<typeof jobListQuerySchema.parse>, publicOnly: boolean): SQL[] {
    const where: SQL[] = [];
    if (publicOnly) {
        where.push(eq(jobs.status, "active"));
        where.push(or(isNull(jobs.deadline), gte(jobs.deadline, sql`CURDATE()`))!);
    } else if (q.status) {
        where.push(eq(jobs.status, q.status));
    }
    if (q.q) {
        const term = `%${escapeLike(q.q)}%`;
        where.push(or(like(jobs.title, term), like(jobs.company, term), like(jobs.description, term))!);
    }
    if (q.location) where.push(like(jobs.location, `%${escapeLike(q.location)}%`));
    if (q.jobType) where.push(eq(jobs.jobType, q.jobType));
    if (q.experienceLevel) where.push(eq(jobs.experienceLevel, q.experienceLevel));
    if (q.skill) {
        where.push(
            exists(
                db
                    .select({ one: sql`1` })
                    .from(jobSkills)
                    .innerJoin(skills, eq(skills.id, jobSkills.skillId))
                    .where(and(eq(jobSkills.jobId, jobs.id), eq(skills.name, normalizeSkill(q.skill)))),
            ),
        );
    }
    return where;
}

const excerpt = (text: string, n = 220) => (text.length > n ? `${text.slice(0, n).trimEnd()}…` : text);

async function listJobs(query: unknown, publicOnly: boolean) {
    const q = parse(jobListQuerySchema, query);
    const where = and(...filtersFromQuery(q, publicOnly));

    const [{ total }] = await db.select({ total: count() }).from(jobs).where(where);
    const rows = await db
        .select()
        .from(jobs)
        .where(where)
        .orderBy(desc(jobs.createdAt), desc(jobs.id))
        .limit(q.limit)
        .offset((q.page - 1) * q.limit);

    const ids = rows.map((r) => r.id);
    const skillMap = await skillsForJobs(ids);
    const base = rows.map(({ description, requirements: _r, ...job }) => ({
        ...job,
        excerpt: excerpt(description),
        skills: skillMap.get(job.id) ?? [],
    }));

    let items: any[] = base;
    if (!publicOnly) {
        const [counts, skillCounts] = await Promise.all([applicationCountsForJobs(ids), skillCountsForJobs(ids)]);
        items = base.map((j) => ({
            ...j,
            applications: counts.get(j.id),
            skillCounts: skillCounts.get(j.id) ?? [],
        }));
    }

    return {
        items,
        page: q.page,
        limit: q.limit,
        total: Number(total),
        totalPages: Math.max(1, Math.ceil(Number(total) / q.limit)),
    };
}

async function jobWithSkills(id: number) {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    if (!job) return null;
    const skillMap = await skillsForJobs([id]);
    return { ...job, skills: skillMap.get(id) ?? [] };
}

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
    const { createdBy: _c, ...safe } = job;
    res.json({ job: safe, applied });
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
