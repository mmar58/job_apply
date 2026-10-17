import { mysqlTable, int, varchar, primaryKey } from "drizzle-orm/mysql-core";
import { users } from "./users.js";
export const roles = mysqlTable("roles",
    {
        id: int("id").autoincrement().primaryKey(),
        name: varchar("name", { length: 50 }).notNull().unique(),
        description: varchar("description", { length: 255 }),
    }
);

export const userRoles = mysqlTable("user_roles",
    {
        userId: int("user_id").notNull().references(() =>
            users.id, { onDelete: "cascade" }
        ),
        roleId: int("role_id").notNull().references(() =>
            roles.id, { onDelete: "cascade" }
        ),
    },
    (t) => [primaryKey({ columns: [t.userId, t.roleId] })]
)

