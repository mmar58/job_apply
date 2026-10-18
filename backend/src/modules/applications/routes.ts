import { Router } from "express";
import { and, count, desc, eq, gte, isNull, like, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import { applicationStatuses, applications, jobs, users } from "../../db/schema/index.js";
import { PERMISSIONS } from "../../config/permissions.js";
import { conflict, idParam, notFound, parse } from "../../lib/http.js";
import { requirePermission } from "../../middleware/auth.js";
import { skillsForJobs } from "../jobs/stats.js";
import { loadCandidateCards, matchSkills } from "./service.js";

const applySchema = z.object({
    coverLetter: z.string().trim().min(30, "Please write at least a few sentences").max(5000),
});

const reviewSchema = z.object({
    status: z.enum(["approved", "rejected", "pending"]),
    note: z.string().trim().max(2000).optional().nullable(),
});

const listQuerySchema = z.object({
    status: z.enum(applicationStatuses).optional(),
    jobId: z.coerce.number().int().positive().optional(),
    q: z.string().trim().max(100).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ---------------- Candidate ----------------
export const candidateApplicationsRouter = Router();

candidateApplicationsRouter.post("/jobs/:id/apply", requirePermission(PERMISSIONS.APPLICATION_APPLY), async (req, res) => {
    const jobId = idParam(req.params.id);
    const { coverLetter } = parse(applySchema, req.body);
    const candidateId = req.user!.id;

    const [job] = await db
        .select({ id: jobs.id })
        .from(jobs)
        .where(
            and(eq(jobs.id, jobId), eq(jobs.status, "active"), or(isNull(jobs.deadline), gte(jobs.deadline, sql`CURDATE()`))),
        )
        .limit(1);
    if (!job) throw notFound("This job is not open for applications");

    const [dup] = await db
        .select({ id: applications.id })
        .from(applications)
        .where(and(eq(applications.jobId, jobId), eq(applications.candidateId, candidateId)))
        .limit(1);
    if (dup) throw conflict("You have already applied for this job");

    try {
        const [r] = await db.insert(applications).values({ jobId, candidateId, coverLetter });
        res.status(201).json({ application: { id: r.insertId, jobId, status: "pending" } });
    } catch (e: any) {
        if (e?.code === "ER_DUP_ENTRY" || e?.cause?.code === "ER_DUP_ENTRY") throw conflict("You have already applied for this job");
        throw e;
    }
});

candidateApplicationsRouter.get(
    "/candidate/applications",
    requirePermission(PERMISSIONS.APPLICATION_VIEW_OWN),
    async (req, res) => {
        const rows = await db
            .select({
                id: applications.id,
                status: applications.status,
                coverLetter: applications.coverLetter,
                reviewNote: applications.reviewNote,
                reviewedAt: applications.reviewedAt,
                createdAt: applications.createdAt,
                jobId: jobs.id,
                jobTitle: jobs.title,
                company: jobs.company,
                location: jobs.location,
                jobStatus: jobs.status,
            })
            .from(applications)
            .innerJoin(jobs, eq(jobs.id, applications.jobId))
            .where(eq(applications.candidateId, req.user!.id))
            .orderBy(desc(applications.createdAt));
        res.json({ applications: rows });
    },
);

// ---------------- Admin ----------------
export const adminApplicationsRouter = Router();

adminApplicationsRouter.get("/", requirePermission(PERMISSIONS.APPLICATION_VIEW_ALL), async (req, res) => {
    const q = parse(listQuerySchema, req.query);
    const where: SQL[] = [];
    if (q.status) where.push(eq(applications.status, q.status));
    if (q.jobId) where.push(eq(applications.jobId, q.jobId));
    if (q.q) {
        const term = `%${q.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
        where.push(or(like(users.name, term), like(users.email, term))!);
    }
    const cond = and(...where);

    const [{ total }] = await db
        .select({ total: count() })
        .from(applications)
        .innerJoin(users, eq(users.id, applications.candidateId))
        .where(cond);

    const rows = await db
        .select({
            id: applications.id,
            status: applications.status,
            coverLetter: applications.coverLetter,
            reviewNote: applications.reviewNote,
            reviewedAt: applications.reviewedAt,
            createdAt: applications.createdAt,
            jobId: jobs.id,
            jobTitle: jobs.title,
            candidateId: users.id,
        })
        .from(applications)
        .innerJoin(users, eq(users.id, applications.candidateId))
        .innerJoin(jobs, eq(jobs.id, applications.jobId))
        .where(cond)
        .orderBy(desc(applications.createdAt), desc(applications.id))
        .limit(q.limit)
        .offset((q.page - 1) * q.limit);

    const [cards, jobSkillMap] = await Promise.all([
        loadCandidateCards([...new Set(rows.map((r) => r.candidateId))]),
        skillsForJobs([...new Set(rows.map((r) => r.jobId))]),
    ]);

    const items = rows.map(({ candidateId, ...a }) => {
        const c = cards.get(candidateId);
        const jobSkills = jobSkillMap.get(a.jobId) ?? [];
        const match = matchSkills(jobSkills, c?.skills ?? []);
        return {
            ...a,
            candidate: c && {
                id: c.id,
                name: c.name,
                email: c.email,
                headline: c.headline,
                address: c.address,
                experienceYears: c.experienceYears,
                skills: c.skills,
            },
            matchedSkills: match.matched,
            requiredSkillCount: match.total,
        };
    });

    res.json({
        items,
        page: q.page,
        limit: q.limit,
        total: Number(total),
        totalPages: Math.max(1, Math.ceil(Number(total) / q.limit)),
    });
});

adminApplicationsRouter.get("/:id", requirePermission(PERMISSIONS.APPLICATION_VIEW_ALL), async (req, res) => {
    const id = idParam(req.params.id);
    const [a] = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
    if (!a) throw notFound("Application not found");
    const [job] = await db.select().from(jobs).where(eq(jobs.id, a.jobId)).limit(1);
    const cards = await loadCandidateCards([a.candidateId]);
    const candidate = cards.get(a.candidateId) ?? null;
    const jobSkills = (await skillsForJobs([a.jobId])).get(a.jobId) ?? [];
    const match = matchSkills(jobSkills, candidate?.skills ?? []);
    res.json({
        application: {
            id: a.id,
            status: a.status,
            coverLetter: a.coverLetter,
            reviewNote: a.reviewNote,
            reviewedAt: a.reviewedAt,
            createdAt: a.createdAt,
        },
        job: job && { id: job.id, title: job.title, company: job.company, skills: jobSkills },
        candidate,
        matchedSkills: match.matched,
    });
});

adminApplicationsRouter.patch("/:id", requirePermission(PERMISSIONS.APPLICATION_REVIEW), async (req, res) => {
    const id = idParam(req.params.id);
    const { status, note } = parse(reviewSchema, req.body);
    const [a] = await db.select({ id: applications.id }).from(applications).where(eq(applications.id, id)).limit(1);
    if (!a) throw notFound("Application not found");

    await db
        .update(applications)
        .set({
            status,
            reviewNote: note ?? null,
            reviewedBy: status === "pending" ? null : req.user!.id,
            reviewedAt: status === "pending" ? null : new Date(),
        })
        .where(eq(applications.id, id));
    res.json({ ok: true, id, status });
});
