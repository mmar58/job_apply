import { mysqlEnum, mysqlTable, int, text, varchar, index, date } from "drizzle-orm/mysql-core";
import { users } from "./users.js";
import { timestamps } from "./timestamps.js";
export const jobStatuses = ["draft", "active", "closed"] as const;
export const jobTypes = ["full_time", "part_time", "contract", "internship", "remote"] as const;
export const experienceLevels = ["entry", "mid", "senior", "lead"] as const;

export const jobs = mysqlTable("jobs",
    {
        id: int("id").autoincrement().primaryKey(),
        title: varchar("title", { length: 200 }).notNull(),
        company: varchar("company", { length: 150 }).notNull().default("AnZ"),
        description: text("description").notNull(),
        requirements: text("requirements").notNull(),
        location: varchar("location", { length: 150 }).notNull(),
        jobType: mysqlEnum("job_type", jobTypes).notNull().default("full_time"),
        experienceLevel: mysqlEnum("experience_level", experienceLevels).notNull().default("mid"),
        salaryMin: int("salary_min"),
        salaryMax: int("salary_max"),
        status: mysqlEnum("status", jobStatuses).notNull().default("draft"),
        deadline: date("deadline", { mode: "string" }),
        createdBy: int("created_by")
            .notNull()
            .references(() => users.id),
        ...timestamps,
    },
    (t) => [index("jobs_status_idx").on(t.status)],
);