import { mysqlEnum, mysqlTable, int, text, timestamp, unique, index } from "drizzle-orm/mysql-core";
import { jobs } from "./jobs.js";
import { users } from "./users.js";
import { timestamps } from "./timestamps.js";

export const applicationStatuses = ["pending", "shortlisted", "hired", "rejected"] as const;

export const applications = mysqlTable("applications",
    {
        id: int("id").autoincrement().primaryKey(),
        jobId: int("job_id")
            .notNull()
            .references(() => jobs.id, { onDelete: "cascade" }),
        candidateId: int("candidate_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        coverLetter: text("cover_letter").notNull(),
        status: mysqlEnum("status", applicationStatuses).notNull().default("pending"),
        reviewNote: text("review_note"),
        reviewedBy: int("reviewed_by").references(() => users.id),
        reviewedAt: timestamp("reviewed_at"),
        ...timestamps,
    },
    (t) => [
        unique("applications_job_candidate_uq").on(t.jobId, t.candidateId),
        index("applications_status_idx").on(t.status),
    ],
);