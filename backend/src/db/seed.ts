import argon2 from "argon2";
import { and, eq, inArray } from "drizzle-orm";
import { db, pool } from "./index.js";
import { env } from "../config/env.js";
import { PERMISSION_DESCRIPTIONS, ROLE_DEFINITIONS, type PermissionKey } from "../config/permissions.js";
import { permissions, roles, rolePermissions, userRoles, users } from "./schema/index.js";

/** Idempotent: safe to run many times. Syncs permissions/roles and ensures the first admin exists. */
async function seed() {
    // 1. Permissions
    const keys = Object.keys(PERMISSION_DESCRIPTIONS) as PermissionKey[];
    await db
        .insert(permissions)
        .ignore()
        .values(keys.map((key) => ({ key, description: PERMISSION_DESCRIPTIONS[key] })));

    for (const key of keys) {
        await db.update(permissions).set({ description: PERMISSION_DESCRIPTIONS[key] }).where(eq(permissions.key, key));
    }
    const permRows = await db.select().from(permissions);
    const permId = new Map(permRows.map((p) => [p.key, p.id]));

    // 2. Roles and their permissions
    for (const def of ROLE_DEFINITIONS) {
        await db
            .insert(roles)
            .values({ name: def.name, description: def.description })
            .onDuplicateKeyUpdate({ set: { description: def.description } });
        const [role] = await db.select().from(roles).where(eq(roles.name, def.name)).limit(1);

        const wanted = def.permissions.map((k) => permId.get(k)!).filter(Boolean);
        const existing = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, role.id));
        const existingIds = new Set(existing.map((e) => e.permissionId));

        const toAdd = wanted.filter((id) => !existingIds.has(id));
        if (toAdd.length) {
            await db.insert(rolePermissions).values(toAdd.map((permissionId) => ({ roleId: role.id, permissionId })));
        }
        const toRemove = [...existingIds].filter((id) => !wanted.includes(id));
        if (toRemove.length) {
            await db
                .delete(rolePermissions)
                .where(and(eq(rolePermissions.roleId, role.id), inArray(rolePermissions.permissionId, toRemove)));
        }
    }

    // 3. Ensure SuperAdmin (idempotent)
    const email = env.SEED_ADMIN_EMAIL.toLowerCase();
    const [existingAdmin] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!existingAdmin) {
        const passwordHash = await argon2.hash(env.SEED_ADMIN_PASSWORD);
        const [res] = await db.insert(users).values({ email, name: env.SEED_ADMIN_NAME, passwordHash });
        const [adminRole] = await db.select().from(roles).where(eq(roles.name, "admin")).limit(1);
        await db.insert(userRoles).values({ userId: res.insertId, roleId: adminRole.id });
        console.log(`Created admin user ${email}`);
    } else {
        console.log(`Admin user ${email} already exists`);
    }

    console.log("Seed complete.");
}

export { seed };

const isDirectRun =
    process.argv[1]?.replace(/\\/g, "/").endsWith("src/db/seed.ts") ||
    process.argv[1]?.replace(/\\/g, "/").endsWith("src/db/seed.js");

if (isDirectRun) {
    seed()
        .catch((err) => {
            console.error(err);
            process.exitCode = 1;
        })
        .finally(() => pool.end());
}
