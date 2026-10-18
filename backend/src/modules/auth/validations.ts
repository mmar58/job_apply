import z from "zod";
import { nameSchema, emailSchema, passwordSchema } from "../../lib/schema/application-schema.js";
export const registerSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
});

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase(),
    password: z.string().min(1),
});