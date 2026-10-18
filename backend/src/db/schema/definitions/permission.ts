import { mysqlTable, int, varchar, primaryKey } from "drizzle-orm/mysql-core";
import { roles } from "./roles.js";

export const permissions = mysqlTable("permissions",
    {
        id: int("id").autoincrement().primaryKey(),
        key: varchar("key", { length: 100 }).notNull().unique(),
        description: varchar("description", { length: 255 }),
    }
)
export const rolePermissions = mysqlTable("role_permissions",
    {
        roleId: int("role_id").notNull().references(
            () => roles.id, { onDelete: "cascade" }),
        permissionId: int("permission_id").notNull().references(
            () => permissions.id, { onDelete: "cascade" }),
    },
    (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })]
)