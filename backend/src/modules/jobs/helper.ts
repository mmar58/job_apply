import { db } from "../../db/index.js";
import { and, desc, eq, exists, gte, isNull, like, or, sql, count, type SQL } from "drizzle-orm";
import { jobSkills, jobs, skills } from "../../db/schema/index.js";
import { jobListQuerySchema } from "./validations.js";
import { normalizeSkill } from "../../lib/skills.js";
import { skillCountsForJobs, skillsForJobs, applicationCountsForJobs } from "./stats.js";
import { parse } from "../../lib/http.js";


export const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export function filtersFromQuery(q: ReturnType<typeof jobListQuerySchema.parse>, publicOnly: boolean): SQL[] {
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

export async function listJobs(query: unknown, publicOnly: boolean) {
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
    const [skillMap, counts] = await Promise.all([
        skillsForJobs(ids),
        applicationCountsForJobs(ids),
    ]);

    const base = rows.map(({ description, requirements: _r, ...job }) => ({
        ...job,
        excerpt: excerpt(description),
        skills: skillMap.get(job.id) ?? [],
        applicantCount: counts.get(job.id)?.total ?? 0,
        applications: counts.get(job.id),
    }));

    let items: any[] = base;
    if (!publicOnly) {
        const skillCounts = await skillCountsForJobs(ids);
        items = base.map((j) => ({
            ...j,
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

export async function jobWithSkills(id: number) {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    if (!job) return null;
    const skillMap = await skillsForJobs([id]);
    return { ...job, skills: skillMap.get(id) ?? [] };
}