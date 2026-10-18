import { Router } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import { applications, candidateSkills, jobSkills, jobs } from "../../db/schema/index.js";
import { PERMISSIONS } from "../../config/permissions.js";
import { badRequest, idParam, notFound, parse } from "../../lib/http.js";
import { requirePermission } from "../../middleware/auth.js";
import { loadCandidateCards, matchSkills, type CandidateCard } from "../applications/service.js";
import { skillsForJobs } from "../jobs/stats.js";
import { asData, generateJson } from "./gemini.js";

export const aiRouter = Router();
aiRouter.use(requirePermission(PERMISSIONS.AI_USE));

// ---------- 1. Generate a job description from a short prompt ----------
const generateSchema = z.object({ prompt: z.string().trim().min(5).max(1500) });
const generatedJobSchema = z.object({
    title: z.string(),
    description: z.string(),
    requirements: z.string(),
    skills: z.array(z.string()).default([]),
    jobType: z.enum(["full_time", "part_time", "contract", "internship", "remote"]).optional(),
    experienceLevel: z.enum(["entry", "mid", "senior", "lead"]).optional(),
});

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

// ---------- 2. Rank / suggest best candidates for a job ----------
const suggestQuerySchema = z.object({
    scope: z.enum(["applicants", "all"]).default("applicants"),
    limit: z.coerce.number().int().min(1).max(20).default(10),
});
const rankingSchema = z.object({
    ranking: z.array(
        z.object({
            candidateId: z.coerce.number(),
            score: z.coerce.number().min(0).max(100),
            reasoning: z.string(),
        }),
    ),
});

const forModel = (c: CandidateCard) => ({
    candidateId: c.id,
    headline: c.headline,
    bio: c.bio?.slice(0, 800) ?? null,
    experienceYears: c.experienceYears,
    education: c.education?.slice(0, 500) ?? null,
    experience: c.experience?.slice(0, 1200) ?? null,
    skills: c.skills,
    // Intentionally excludes name, email and phone.
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

// ---------- 3. Summarize a candidate (in the context of an application) ----------
const summarySchema = z.object({
    summary: z.string(),
    strengths: z.array(z.string()).default([]),
    concerns: z.array(z.string()).default([]),
    fitScore: z.coerce.number().min(0).max(100).optional(),
});

aiRouter.get("/applications/:id/summary", async (req, res) => {
    const id = idParam(req.params.id);
    const [a] = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
    if (!a) throw notFound("Application not found");
    const [job] = await db.select().from(jobs).where(eq(jobs.id, a.jobId)).limit(1);
    const candidate = (await loadCandidateCards([a.candidateId])).get(a.candidateId);
    if (!candidate || !job) throw badRequest("Missing candidate or job data");
    const requiredSkills = (await skillsForJobs([job.id])).get(job.id) ?? [];

    const result = await generateJson({
        system: `You are a recruiting assistant. Summarise a job candidate for a hiring manager.
Return JSON: {"summary": string (3-4 sentences), "strengths": string[] (max 4), "concerns": string[] (max 3, e.g. missing skills, gaps), "fitScore": number 0-100 for fit with the job}.
Base everything only on the provided data. Do not speculate about protected characteristics.`,
        prompt: `Job:\n${asData({
            title: job.title,
            requirements: job.requirements.slice(0, 2000),
            requiredSkills,
        })}\n\nCandidate:\n${asData({ ...forModel(candidate), coverLetter: a.coverLetter.slice(0, 3000) })}`,
        schema: summarySchema,
    });
    res.json({ ...result, matchedSkills: matchSkills(requiredSkills, candidate.skills).matched });
});
