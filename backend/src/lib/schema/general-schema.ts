import z from "zod";

export const optionalText = (max: number) =>
    z
        .string()
        .trim()
        .max(max)
        .optional()
        .nullable()
        .transform((v) => (v ? v : null));

export const optionalUrl = z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^https?:\/\//i.test(v), "Must start with http:// or https://");

export const optionalInt = z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.number().int().min(0).nullable(),
);

export const optionalDate = z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
        .nullable(),
);