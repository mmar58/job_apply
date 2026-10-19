import z from "zod";
import { optionalText, optionalUrl } from "../../lib/schema/general-schema.js";
import { nameSchema, roleSchema } from "../../lib/schema/application-schema.js";

export const profileSchema = z.object({
    name: nameSchema.optional(),
    headline: optionalText(200),
    bio: optionalText(5000),
    phone: optionalText(40),
    address: optionalText(255),
    location: optionalText(255),
    experienceYears: z.coerce.number().int().min(0).max(70).default(0),
    education: optionalText(5000),
    experience: optionalText(8000),
    linkedinUrl: optionalUrl,
    githubUrl: optionalUrl,
    portfolioUrl: optionalUrl,
    skills: z.array(z.string()).max(60).default([]),
});