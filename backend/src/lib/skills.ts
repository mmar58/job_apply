import { inArray, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { skills } from "../db/schema/index.js";

export function normalizeSkill(raw: string): string {
    return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Clean user supplied skill names: trim, dedupe (case-insensitive), cap length and count. */
export function cleanSkillList(input: string[] | undefined, max = 40): { name: string; label: string }[] {
    const seen = new Map<string, string>();
    for (const raw of input ?? []) {
        const label = raw.trim().replace(/\s+/g, " ").slice(0, 80);
        if (!label) continue;
        const name = normalizeSkill(label);
        if (!seen.has(name)) seen.set(name, label);
        if (seen.size >= max) break;
    }
    return [...seen.entries()].map(([name, label]) => ({ name, label }));
}

type Executor = Pick<typeof db, "insert" | "select">;

/** Ensure all skills exist and return their ids. */
export async function resolveSkillIds(input: string[] | undefined, tx: Executor = db): Promise<number[]> {
    const cleaned = cleanSkillList(input);
    if (cleaned.length === 0) return [];
    await tx
        .insert(skills)
        .values(cleaned)
        .onDuplicateKeyUpdate({ set: { id: sql`${skills.id}` } });
    const rows = await tx
        .select({ id: skills.id })
        .from(skills)
        .where(
            inArray(
                skills.name,
                cleaned.map((c) => c.name),
            ),
        );
    return rows.map((r) => r.id);
}
