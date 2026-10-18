import z from "zod";
import { nameSchema, emailSchema, passwordSchema } from "../../lib/schema/application-schema.js";
export const createUserSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: z.string().trim().min(1).default("candidate"),
});