import { Router } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { applications, candidateSkills, jobSkills, jobs } from "../../db/schema/index.js";
import { PERMISSIONS } from "../../config/permissions.js";
import { idParam, notFound, parse } from "../../lib/http.js";
import { requirePermission } from "../../middleware/auth.js";
import { forModel } from "./service.js";
import { loadCandidateCards, matchSkills } from "../applications/service.js";
import { skillsForJobs } from "../jobs/stats.js";
import { asData, generateJson } from "./gemini.js";
import { generateSchema, generatedJobSchema, suggestQuerySchema, rankingSchema } from "./validations.js";

export const aiRouter = Router();
aiRouter.use(requirePermission(PERMISSIONS.AI_USE));

//Generate a job description from a short prompt
aiRouter.post("/job-description", async (req, res) => {
    const { prompt } = parse(generateSchema, req.body);
    const result = await generateJson({
        system: `You are an HR assistant for "AnZ Job Portal". Turn a short hiring brief into a complete, professional job post.
Return JSON: {"title": string, "description": string (multi-paragraph, plain text, may use short "- " bullet lines for responsibilities), "requirements": string (plain text, "- " bullet lines), "skills": string[] (5-12 concise skill names), "jobType": one of full_time|part_time|contract|internship|remote, "experienceLevel": one of entry|mid|senior|lead}.
Do not invent salary, company perks or legal claims.`,
        prompt: `Hiring brief:\n${asData(prompt)}`,
        schema: generatedJobSchema,
    });
    res.json({ job: { ...result, skills: result.skills.slice(0, 15) } });
});



aiRouter.get("/jobs/:id/suggest-candidates", async (req, res) => {
    const jobId = idParam(req.params.id);
    const { scope, limit } = parse(suggestQuerySchema, req.query);

    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (!job) throw notFound("Job not found");
    const requiredSkills = (await skillsForJobs([jobId])).get(jobId) ?? [];

    const applicantRows = await db
        .select({ candidateId: applications.candidateId, applicationId: applications.id })
        .from(applications)
        .where(eq(applications.jobId, jobId));
    const applicantMap = new Map(applicantRows.map((a) => [a.candidateId, a.applicationId]));

    let candidateIds = [...applicantMap.keys()];

    if (scope === "all") {
        // Pre-filter in SQL: candidates sharing the most skills with the job.
        const overlap = await db
            .select({ candidateId: candidateSkills.candidateId, n: sql<number>`count(*)` })
            .from(candidateSkills)
            .innerJoin(jobSkills, and(eq(jobSkills.skillId, candidateSkills.skillId), eq(jobSkills.jobId, jobId)))
            .groupBy(candidateSkills.candidateId)
            .orderBy(desc(sql`count(*)`))
            .limit(40);
        candidateIds = [...new Set([...candidateIds, ...overlap.map((o) => o.candidateId)])];
    }

    if (candidateIds.length === 0) {
        return res.json({ suggestions: [], message: "No candidates to evaluate yet." });
    }

    const cards = await loadCandidateCards(candidateIds);
    // Keep model input bounded: best skill overlap first.
    const pool = [...cards.values()]
        .map((c) => ({ c, overlap: matchSkills(requiredSkills, c.skills).matched.length }))
        .sort((a, b) => b.overlap - a.overlap || b.c.experienceYears - a.c.experienceYears)
        .slice(0, 25)
        .map((x) => x.c);

    const result = await generateJson({
        system: `You are a recruiting assistant. Rank the candidates for the job by suitability using skills, experience level and relevance of their background.
Return JSON: {"ranking": [{"candidateId": number, "score": number 0-100, "reasoning": string (1-2 concise sentences, mention concrete matches and gaps)}]}.
Only include candidateIds from the provided list. Order from best to worst. Be fair and base conclusions only on the provided information.`,
        prompt: `Job:\n${asData({
            title: job.title,
            experienceLevel: job.experienceLevel,
            jobType: job.jobType,
            description: job.description.slice(0, 2500),
            requirements: job.requirements.slice(0, 2000),
            requiredSkills,
        })}\n\nCandidates:\n${asData(pool.map(forModel))}`,
        schema: rankingSchema,
    });

    const valid = new Set(pool.map((c) => c.id));
    const suggestions = result.ranking
        .filter((r) => valid.has(r.candidateId))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((r) => {
            const c = cards.get(r.candidateId)!;
            return {
                candidateId: c.id,
                name: c.name,
                headline: c.headline,
                experienceYears: c.experienceYears,
                skills: c.skills,
                matchedSkills: matchSkills(requiredSkills, c.skills).matched,
                score: Math.round(r.score),
                reasoning: r.reasoning,
                applicationId: applicantMap.get(c.id) ?? null,
                applied: applicantMap.has(c.id),
            };
        });

    res.json({ suggestions });
});

import {
    CandidateSummaryFeedback,
    getOrComputeJobCandidateFeedback,
    getOrComputeMatchScore,
    getOrComputeSummaryAndFeedback,
} from "./service.js";
import { getCachedSummary } from "../../lib/redis.js";

aiRouter.get("/applications/:id/summary", async (req, res) => {
    const id = idParam(req.params.id);
    const force = req.query.force === "true";
    const cachedOnly = req.query.cachedOnly === "true";

    if (cachedOnly) {
        const [app] = await db
            .select({ jobId: applications.jobId, candidateId: applications.candidateId })
            .from(applications)
            .where(eq(applications.id, id))
            .limit(1);
        if (!app) throw notFound("Application not found");
        const cached = await getCachedSummary<CandidateSummaryFeedback>(app.jobId, app.candidateId);
        return res.json({ cached: !!cached, data: cached ? { ...cached, fromCache: true } : null });
    }

    const data = await getOrComputeSummaryAndFeedback(id, force);
    res.json(data);
});

aiRouter.get("/jobs/:jobId/candidates/:candidateId/feedback", async (req, res) => {
    const jobId = idParam(req.params.jobId);
    const candidateId = idParam(req.params.candidateId);
    const force = req.query.force === "true";
    const cachedOnly = req.query.cachedOnly === "true";

    if (cachedOnly) {
        const cached = await getCachedSummary<CandidateSummaryFeedback>(jobId, candidateId);
        return res.json({ cached: !!cached, data: cached ? { ...cached, fromCache: true } : null });
    }

    const data = await getOrComputeJobCandidateFeedback(jobId, candidateId, force);
    res.json(data);
});

aiRouter.get("/jobs/:id/match-score/:candidateId", async (req, res) => {
    const jobId = idParam(req.params.id);
    const candidateId = idParam(req.params.candidateId);
    const score = await getOrComputeMatchScore(jobId, candidateId);
    res.json({ jobId, candidateId, score });
});
