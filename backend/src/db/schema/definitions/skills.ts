import { mysqlTable, int, varchar, primaryKey } from "drizzle-orm/mysql-core";
import { users } from "./users.js";
import { jobs } from "./jobs.js";

export const skills = mysqlTable("skills",
    {
        id: int("id").autoincrement().primaryKey(),
        name: varchar("name", { length: 80 }).notNull().unique(), // stored lowercase-normalized
        label: varchar("label", { length: 80 }).notNull(), // display form
    });

export const candidateSkills = mysqlTable("candidate_skills",
    {
        candidateId: int("candidate_id").notNull().references(() =>
            users.id, { onDelete: "cascade" }),
        skillId: int("skill_id").notNull().references(() =>
            skills.id, { onDelete: "cascade" }),
    },
    (t) => [primaryKey({ columns: [t.candidateId, t.skillId] })]
)
export const jobSkills = mysqlTable("job_skills",
    {
        jobId: int("job_id")
            .notNull()
            .references(() => jobs.id, { onDelete: "cascade" }),
        skillId: int("skill_id")
            .notNull()
            .references(() => skills.id, { onDelete: "cascade" }),
    },
    (t) => [primaryKey({ columns: [t.jobId, t.skillId] })],
);