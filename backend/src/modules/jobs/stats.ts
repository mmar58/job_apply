import { and, count, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { applications, candidateSkills, jobSkills, skills } from "../../db/schema/index.js";

export async function skillsForJobs(jobIds: number[]): Promise<Map<number, string[]>> {
    const map = new Map<number, string[]>();
    if (!jobIds.length) return map;
    const rows = await db
        .select({ jobId: jobSkills.jobId, label: skills.label })
        .from(jobSkills)
        .innerJoin(skills, eq(skills.id, jobSkills.skillId))
        .where(inArray(jobSkills.jobId, jobIds));
    for (const r of rows) map.set(r.jobId, [...(map.get(r.jobId) ?? []), r.label]);
    return map;
}

export type ApplicationCounts = { total: number; pending: number; approved: number; rejected: number };
export type SkillCount = { skill: string; count: number };

/** Application totals (overall + per status) for each job. */
export async function applicationCountsForJobs(jobIds: number[]): Promise<Map<number, ApplicationCounts>> {
    const map = new Map<number, ApplicationCounts>();
    for (const id of jobIds) map.set(id, { total: 0, pending: 0, approved: 0, rejected: 0 });
    if (!jobIds.length) return map;
    const rows = await db
        .select({ jobId: applications.jobId, status: applications.status, n: count() })
        .from(applications)
        .where(inArray(applications.jobId, jobIds))
        .groupBy(applications.jobId, applications.status);
    for (const r of rows) {
        const c = map.get(r.jobId)!;
        c[r.status] = Number(r.n);
        c.total += Number(r.n);
    }
    return map;
}

/**
 * Skill based counts: for every skill required by a job, how many applicants have that skill.
 * Skills with zero matching applicants are included (count 0).
 */
export async function skillCountsForJobs(jobIds: number[]): Promise<Map<number, SkillCount[]>> {
    const map = new Map<number, SkillCount[]>();
    for (const id of jobIds) map.set(id, []);
    if (!jobIds.length) return map;
    const rows = await db
        .select({
            jobId: jobSkills.jobId,
            skill: skills.label,
            n: sql<number>`count(${candidateSkills.candidateId})`,
        })
        .from(jobSkills)
        .innerJoin(skills, eq(skills.id, jobSkills.skillId))
        .leftJoin(applications, eq(applications.jobId, jobSkills.jobId))
        .leftJoin(
            candidateSkills,
            and(eq(candidateSkills.candidateId, applications.candidateId), eq(candidateSkills.skillId, jobSkills.skillId)),
        )
        .where(inArray(jobSkills.jobId, jobIds))
        .groupBy(jobSkills.jobId, skills.id, skills.label);
    for (const r of rows) map.get(r.jobId)!.push({ skill: r.skill, count: Number(r.n) });
    for (const list of map.values()) list.sort((a, b) => b.count - a.count || a.skill.localeCompare(b.skill));
    return map;
}
