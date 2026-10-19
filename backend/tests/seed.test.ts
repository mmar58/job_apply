import { describe, it, expect } from "vitest";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { db } from "../src/db/index.js";
import { permissions, rolePermissions, roles, users } from "../src/db/schema/index.js";
import { PERMISSION_DESCRIPTIONS, ROLE_DEFINITIONS } from "../src/config/permissions.js";
import { env } from "../src/config/env.js";
import { seed } from "../src/db/seed.js";

describe("Database Seed Script", () => {
  it("executes seed() without throwing any errors", async () => {
    await expect(seed()).resolves.toBeUndefined();
  });

  it("is idempotent: running seed() a second time succeeds cleanly", async () => {
    await expect(seed()).resolves.toBeUndefined();
  });

  it("populates all permission keys defined in PERMISSION_DESCRIPTIONS", async () => {
    const permRows = await db.select().from(permissions);
    const existingKeys = new Set(permRows.map((p) => p.key));

    const expectedKeys = Object.keys(PERMISSION_DESCRIPTIONS);
    expect(expectedKeys.length).toBeGreaterThan(0);

    for (const key of expectedKeys) {
      expect(existingKeys.has(key)).toBe(true);
    }
  });

  it("seeds the default roles: 'admin' and 'candidate'", async () => {
    const roleRows = await db.select().from(roles);
    const roleNames = roleRows.map((r) => r.name);

    expect(roleNames).toContain("admin");
    expect(roleNames).toContain("candidate");
  });

  it("maps the correct permissions to 'admin' and 'candidate' roles", async () => {
    const permRows = await db.select().from(permissions);
    const permMap = new Map(permRows.map((p) => [p.id, p.key]));

    for (const def of ROLE_DEFINITIONS) {
      const [role] = await db.select().from(roles).where(eq(roles.name, def.name));
      expect(role).toBeDefined();

      const rpRows = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, role.id));
      const rolePermKeys = rpRows.map((rp) => permMap.get(rp.permissionId));

      for (const expectedPerm of def.permissions) {
        expect(rolePermKeys).toContain(expectedPerm);
      }
    }
  });

  it("ensures default superadmin user exists with a valid hashed password", async () => {
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, env.SEED_ADMIN_EMAIL.toLowerCase()));

    expect(adminUser).toBeDefined();
    expect(adminUser.name).toBe(env.SEED_ADMIN_NAME);
    expect(adminUser.isActive).toBe(true);

    // Verify password hash with argon2
    const passwordValid = await argon2.verify(adminUser.passwordHash, env.SEED_ADMIN_PASSWORD);
    expect(passwordValid).toBe(true);
  });
});
