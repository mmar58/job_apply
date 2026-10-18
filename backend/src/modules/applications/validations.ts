import z from "zod";
import { applicationStatuses } from "../../db/schema/index.js";
import { paginationSchema, querySchema } from "../../lib/schema/application-schema.js";

export const applySchema = z.object({
    coverLetter: z.string().trim().min(30, "Please write at least a few sentences").max(5000),
});

export const reviewSchema = z.object({
    status: z.enum(applicationStatuses),
    note: z.string().trim().max(2000).optional().nullable(),
});

export const listQuerySchema = z.object({
    status: z.enum(applicationStatuses).optional(),
    jobId: z.coerce.number().int().positive().optional(),
    q: querySchema,
    page: paginationSchema,
    limit: z.coerce.number().int().min(1).max(100).default(20),
});