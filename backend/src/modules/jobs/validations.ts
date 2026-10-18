import { z } from "zod";
import { experienceLevels, jobStatuses, jobTypes } from "../../db/schema/index.js";
import { optionalDate, optionalInt } from "../../lib/schema/general-schema.js";
import { querySchema, paginationSchema } from "../../lib/schema/application-schema.js";

export const jobInputSchema = z
    .object({
        title: z.string().trim().min(3).max(200),
        company: z.string().trim().min(1).max(150).default("AnZ"),
        description: z.string().trim().min(20, "Description is too short").max(20000),
        requirements: z.string().trim().min(10, "Requirements are too short").max(20000),
        location: z.string().trim().min(2).max(150),
        jobType: z.enum(jobTypes).default("full_time"),
        experienceLevel: z.enum(experienceLevels).default("mid"),
        salaryMin: optionalInt.default(null),
        salaryMax: optionalInt.default(null),
        status: z.enum(jobStatuses).default("draft"),
        deadline: optionalDate.default(null),
        skills: z.array(z.string()).max(40).default([]),
    })
    .refine((v) => v.salaryMin === null || v.salaryMax === null || v.salaryMin <= v.salaryMax, {
        message: "Minimum salary cannot exceed maximum salary",
        path: ["salaryMax"],
    });

export const jobStatusSchema = z.object({ status: z.enum(jobStatuses) });

export const jobListQuerySchema = z.object({
    q: querySchema,
    location: z.string().trim().max(100).optional(),
    jobType: z.enum(jobTypes).optional(),
    experienceLevel: z.enum(experienceLevels).optional(),
    skill: z.string().trim().max(80).optional(),
    status: z.enum(jobStatuses).optional(), // admin list only
    page: paginationSchema,
    limit: z.coerce.number().int().min(1).max(50).default(12),
});
