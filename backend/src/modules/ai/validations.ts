import z from "zod";
export const generateSchema = z.object({ prompt: z.string().trim().min(5).max(1500) });
export const generatedJobSchema = z.object({
    title: z.string(),
    description: z.string(),
    requirements: z.string(),
    skills: z.array(z.string()).default([]),
    jobType: z.enum(["full_time", "part_time", "contract", "internship", "remote"]).optional(),
    experienceLevel: z.enum(["entry", "mid", "senior", "lead"]).optional(),
});
export const suggestQuerySchema = z.object({
    scope: z.enum(["applicants", "all"]).default("applicants"),
    limit: z.coerce.number().int().min(1).max(20).default(10),
});
export const rankingSchema = z.object({
    ranking: z.array(
        z.object({
            candidateId: z.coerce.number(),
            score: z.coerce.number().min(0).max(100),
            reasoning: z.string(),
        }),
    ),
});