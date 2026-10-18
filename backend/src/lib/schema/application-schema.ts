import z from "zod";
export const nameSchema = z.string().trim().min(2).max(150);
export const emailSchema = z.string().trim().toLowerCase().max(255).pipe(z.email());
export const passwordSchema = z.string().min(8).max(128);
export const roleSchema = z.string().trim().min(1).default("candidate");
export const querySchema = z.string().trim().max(100).optional();
export const paginationSchema = z.coerce.number().int().min(1).default(1);