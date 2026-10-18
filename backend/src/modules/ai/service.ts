import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import { applications, jobs } from "../../db/schema/index.js";
import { loadCandidateCards, matchSkills } from "../applications/service.js";
import { skillsForJobs } from "../jobs/stats.js";
import { asData, generateJson } from "./gemini.js";
import {
    getCachedMatchScore,
    setCachedMatchScore,
    getCachedSummary,
    setCachedSummary,
} from "../../lib/redis.js";
import type { CandidateProfileType } from "../../types/profile.js";

const scoreSchema = z.object({
    score: z.coerce.number().min(0).max(100),
    reasoning: z.string().optional(),
});

const summaryFeedbackSchema = z.object({
    summary: z.string(),
    strengths: z.array(z.string()).default([]),
    concerns: z.array(z.string()).default([]),
    feedback: z.string().optional(),
    fitScore: z.coerce.number().min(0).max(100).optional(),
});

export const forModel = (c: CandidateProfileType) => ({
    candidateId: c.id,
    headline: c.headline,
    bio: c.bio?.slice(0, 800) ?? null,
    experienceYears: c.experienceYears,
    education: c.education?.slice(0, 500) ?? null,
    experience: c.experience?.slice(0, 1200) ?? null,
    skills: c.skills,
    // Intentionally excludes name, email and phone.
});

export type CandidateSummaryFeedback = z.infer<typeof summaryFeedbackSchema> & {
    matchedSkills: string[];
    score: number;
};

/**
 * Get or compute candidate matching score (0 - 100).
 * Caches in Redis with 48-hour sliding TTL (renews on every access).
 */
export async function getOrComputeMatchScore(
    jobId: number,
    candidateId: number,
    coverLetter?: string,
): Promise<number> {
    // 1. Check Redis cache with 48h sliding TTL
    const cached = await getCachedMatchScore(jobId, candidateId);
    if (cached !== null) {
        return cached;
    }

    // 2. Fetch Job and Candidate data
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    const candidateMap = await loadCandidateCards([candidateId]);
    const candidate = candidateMap.get(candidateId);

    if (!job || !candidate) {
        return 50; // default baseline if not found
    }

    const jobSkillsList = (await skillsForJobs([jobId])).get(jobId) ?? [];
    const skillMatch = matchSkills(jobSkillsList, candidate.skills);

    // If coverLetter wasn't passed, fetch from application if exists
    let letter = coverLetter;
    if (!letter) {
        const [app] = await db
            .select({ coverLetter: applications.coverLetter })
            .from(applications)
            .where(eq(applications.jobId, jobId))
            .limit(1);
        letter = app?.coverLetter || "";
    }

    let calculatedScore = 50;

    try {
        const result = await generateJson({
            system: `You are an AI recruitment evaluator. Evaluate how well the candidate matches the job post based on their profile, skills, experience, and cover letter.
Return JSON: {"score": number between 0 and 100, "reasoning": string (1 concise sentence)}.
Be realistic: 90+ requires excellent skill match and experience, 70-89 is a solid match, 50-69 is moderate, below 50 has significant gaps.`,
            prompt: `Job Requirements:
${asData({
                title: job.title,
                experienceLevel: job.experienceLevel,
                requiredSkills: jobSkillsList,
                description: job.description.slice(0, 2000),
                requirements: job.requirements.slice(0, 1500),
            })}

Candidate Profile & Submission:
${asData({
                headline: candidate.headline,
                bio: candidate.bio,
                experienceYears: candidate.experienceYears,
                skills: candidate.skills,
                education: candidate.education,
                experience: candidate.experience,
                coverLetter: letter?.slice(0, 2500),
            })}`,
            schema: scoreSchema,
        });

        calculatedScore = Math.round(result.score);
    } catch (err) {
        // Fallback: heuristic calculation based on skill overlap & experience
        const skillRatio = jobSkillsList.length > 0 ? skillMatch.matched.length / jobSkillsList.length : 0.5;
        const expScore = Math.min(candidate.experienceYears * 10, 40);
        calculatedScore = Math.round(Math.min(100, Math.max(20, skillRatio * 60 + expScore)));
    }

    // 3. Store in Redis with 48h TTL
    await setCachedMatchScore(jobId, candidateId, calculatedScore);
    return calculatedScore;
}

/**
 * Get or compute candidate summary & feedback on job suitability.
 * Caches in Redis for 20 minutes to save tokens.
 */
export async function getOrComputeSummaryAndFeedback(
    applicationId: number,
): Promise<CandidateSummaryFeedback> {
    const [app] = await db.select().from(applications).where(eq(applications.id, applicationId)).limit(1);
    if (!app) throw new Error("Application not found");

    const [job] = await db.select().from(jobs).where(eq(jobs.id, app.jobId)).limit(1);
    const candidateMap = await loadCandidateCards([app.candidateId]);
    const candidate = candidateMap.get(app.candidateId);
    if (!job || !candidate) throw new Error("Missing candidate or job details");

    // Check 20-minute Redis cache
    const cached = await getCachedSummary<CandidateSummaryFeedback>(job.id, candidate.id);
    if (cached) {
        return cached;
    }

    const jobSkillsList = (await skillsForJobs([job.id])).get(job.id) ?? [];
    const matchedSkills = matchSkills(jobSkillsList, candidate.skills).matched;

    // Get or compute the 48h sliding match score
    const score = await getOrComputeMatchScore(job.id, candidate.id, app.coverLetter);

    const result = await generateJson({
        system: `You are an AI hiring assistant. Summarise the candidate's profile and provide constructive feedback on their fit for this specific job position.
Return JSON: {
  "summary": string (3-4 sentences outlining qualifications and background),
  "strengths": string[] (up to 4 bullet points of strongest matches),
  "concerns": string[] (up to 3 areas for growth or missing requirements),
  "feedback": string (actionable advice for the hiring manager and candidate)
}`,
        prompt: `Job:\n${asData({
            title: job.title,
            experienceLevel: job.experienceLevel,
            requiredSkills: jobSkillsList,
            requirements: job.requirements.slice(0, 2000),
        })}\n\nCandidate Profile & Application:\n${asData({
            headline: candidate.headline,
            bio: candidate.bio,
            experienceYears: candidate.experienceYears,
            skills: candidate.skills,
            education: candidate.education,
            experience: candidate.experience,
            coverLetter: app.coverLetter.slice(0, 2500),
        })}`,
        schema: summaryFeedbackSchema,
    });

    const response: CandidateSummaryFeedback = {
        summary: result.summary,
        strengths: result.strengths,
        concerns: result.concerns,
        feedback: result.feedback || "Candidate demonstrates relevant foundation for this role.",
        fitScore: score,
        score,
        matchedSkills,
    };

    // Cache in Redis for 20 minutes (1200 seconds)
    await setCachedSummary(job.id, candidate.id, response);

    return response;
}
