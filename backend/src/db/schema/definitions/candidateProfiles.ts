import { mysqlTable, int, varchar, text } from "drizzle-orm/mysql-core";
import { users } from "./users.js";
import { timestamps } from "./timestamps.js";
export const candidateProfiles = mysqlTable("candidate_profiles",
    {
        id: int("id").primaryKey().references(() =>
            users.id, { onDelete: "cascade" }
        ),
        headline: varchar("headline", { length: 200 }),
        bio: text("bio"),
        phone: varchar("phone", { length: 20 }),
        address: varchar("address", { length: 255 }),
        experienceYears: int("experience_years").notNull().default(0),
        education: text("education"),
        experience: text("experience"),
        linkedinUrl: varchar("linkedin_url", { length: 255 }),
        githubUrl: varchar("github_url", { length: 255 }),
        portfolioUrl: varchar("portfolio_url", { length: 255 }),
        ...timestamps,
    }
);