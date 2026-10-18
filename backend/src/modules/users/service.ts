import { db } from "../../db/index.js";
import { userRoles, applications, jobs, roles } from "../../db/schema/index.js";
import { count, eq, inArray, desc } from "drizzle-orm";
import { notFound } from "../../lib/http.js";
import { loadCandidateCards } from "../applications/service.js";
import { calculateProfileCompleteness } from "../../helper/profile.js";

export async function fetchCandidatesList() {
    const candidateRoleRows = await db
        .select({ userId: userRoles.userId })
        .from(userRoles)
        .innerJoin(roles, eq(roles.id, userRoles.roleId))
        .where(eq(roles.name, "candidate"));

    const ids = candidateRoleRows.map((r) => r.userId);
    if (!ids.length) {
        return [];
    }

    const cardMap = await loadCandidateCards(ids);

    const appCountRows = await db
        .select({ candidateId: applications.candidateId, n: count() })
        .from(applications)
        .where(inArray(applications.candidateId, ids))
        .groupBy(applications.candidateId);
    const countMap = new Map(appCountRows.map((r) => [r.candidateId, Number(r.n)]));

    return [...cardMap.values()].map((c) => ({
        ...c,
        applicationsCount: countMap.get(c.id) ?? 0,
        completeness: calculateProfileCompleteness(c),
    }));
}

export async function fetchCandidateProfile(candidateId: number) {
    const cardMap = await loadCandidateCards([candidateId]);
    const candidate = cardMap.get(candidateId);
    if (!candidate) throw notFound("Candidate not found");

    const apps = await db
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
        .where(eq(applications.candidateId, candidateId))
        .orderBy(desc(applications.createdAt));

    return {
        ...candidate,
        completeness: calculateProfileCompleteness(candidate),
        applications: apps,
    };
}
