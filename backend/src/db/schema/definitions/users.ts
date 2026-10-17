import { mysqlTable, int, boolean, varchar } from "drizzle-orm/mysql-core"
import { timestamps } from "./timestamps.js";

export const users = mysqlTable("users",
    {
        id: int("id").autoincrement().primaryKey(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        passwordHash: varchar("password_hash", { length: 255 }).notNull(),
        name: varchar("name", { length: 150 }).notNull(),
        isActive: boolean("is_active").notNull().default(true),
        ...timestamps,
    }
);