import { Router } from "express";
import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { applications, jobs, roles, userRoles, users } from "../../db/schema/index.js";
import { PERMISSIONS } from "../../config/permissions.js";
import { requirePermission } from "../../middleware/auth.js";
import { getCandidateProfile } from "../candidates/routes.js";

export const dashboardRouter = Router();

dashboardRouter.get("/admin", requirePermission(PERMISSIONS.DASHBOARD_ADMIN), async (_req, res) => {
    const [jobRows, appRows, [candidates], recent, top] = await Promise.all([
        db.select({ status: jobs.status, n: count() }).from(jobs).groupBy(jobs.status),
        db.select({ status: applications.status, n: count() }).from(applications).groupBy(applications.status),
        db
            .select({ n: count() })
            .from(userRoles)
            .innerJoin(roles, eq(roles.id, userRoles.roleId))
            .where(eq(roles.name, "candidate")),
        db
            .select({
                id: applications.id,
                status: applications.status,
                createdAt: applications.createdAt,
                jobId: jobs.id,
                jobTitle: jobs.title,
                candidateName: users.name,
            })
            .from(applications)
            .innerJoin(jobs, eq(jobs.id, applications.jobId))
            .innerJoin(users, eq(users.id, applications.candidateId))
            .orderBy(desc(applications.createdAt))
            .limit(6),
        db
            .select({ id: jobs.id, title: jobs.title, status: jobs.status, n: sql<number>`count(${applications.id})` })
            .from(jobs)
            .leftJoin(applications, eq(applications.jobId, jobs.id))
            .groupBy(jobs.id, jobs.title, jobs.status)
            .orderBy(desc(sql`count(${applications.id})`))
            .limit(5),
    ]);

    const jobCounts = { draft: 0, active: 0, closed: 0, total: 0 };
    for (const r of jobRows) {
        jobCounts[r.status] = Number(r.n);
        jobCounts.total += Number(r.n);
    }
    const appCounts = { pending: 0, approved: 0, rejected: 0, total: 0 };
    for (const r of appRows) {
        appCounts[r.status] = Number(r.n);
        appCounts.total += Number(r.n);
    }

    res.json({
        jobs: jobCounts,
        applications: appCounts,
        candidates: Number(candidates?.n ?? 0),
        recentApplications: recent,
        topJobs: top.map((t) => ({ ...t, applications: Number(t.n), n: undefined })),
    });
});

dashboardRouter.get("/candidate", requirePermission(PERMISSIONS.DASHBOARD_CANDIDATE), async (req, res) => {
    const userId = req.user!.id;
    const [appRows, recent, profile, [open]] = await Promise.all([
        db
            .select({ status: applications.status, n: count() })
            .from(applications)
            .where(eq(applications.candidateId, userId))
            .groupBy(applications.status),
        db
            .select({
                id: applications.id,
                status: applications.status,
                createdAt: applications.createdAt,
                jobId: jobs.id,
                jobTitle: jobs.title,
                company: jobs.company,
            })
            .from(applications)
            .innerJoin(jobs, eq(jobs.id, applications.jobId))
            .where(eq(applications.candidateId, userId))
            .orderBy(desc(applications.createdAt))
            .limit(5),
        getCandidateProfile(userId),
        db.select({ n: count() }).from(jobs).where(eq(jobs.status, "active")),
    ]);

    const appCounts = { pending: 0, approved: 0, rejected: 0, total: 0 };
    for (const r of appRows) {
        appCounts[r.status] = Number(r.n);
        appCounts.total += Number(r.n);
    }

    const checks = [
        !!profile.headline,
        !!profile.bio,
        !!profile.phone,
        !!profile.address,
        !!profile.education,
        !!profile.experience,
        profile.skills.length > 0,
    ];
    const profileCompleteness = Math.round((checks.filter(Boolean).length / checks.length) * 100);

    res.json({
        applications: appCounts,
        recentApplications: recent,
        profileCompleteness,
        openJobs: Number(open?.n ?? 0),
    });
});
