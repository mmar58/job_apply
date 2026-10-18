import { Router } from "express";
import argon2 from "argon2";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import { roles, userRoles, users } from "../../db/schema/index.js";
import { PERMISSIONS } from "../../config/permissions.js";
import { badRequest, conflict, idParam, parse } from "../../lib/http.js";
import { requirePermission } from "../../middleware/auth.js";
import { createUserSchema } from "./validations.js";
import { fetchCandidateProfile, fetchCandidatesList } from "./service.js";

export const usersRouter = Router();
export const adminCandidatesRouter = Router();

adminCandidatesRouter.get("/", requirePermission(PERMISSIONS.USER_VIEW), async (_req, res) => {
    const candidates = await fetchCandidatesList();
    res.json({ candidates });
});

adminCandidatesRouter.get("/:id", requirePermission(PERMISSIONS.USER_VIEW), async (req, res) => {
    const candidateId = idParam(req.params.id);
    const candidate = await fetchCandidateProfile(candidateId);
    res.json({ candidate });
});

usersRouter.get("/candidates", requirePermission(PERMISSIONS.USER_VIEW), async (_req, res) => {
    const candidates = await fetchCandidatesList();
    res.json({ candidates });
});

usersRouter.get("/candidates/:id", requirePermission(PERMISSIONS.USER_VIEW), async (req, res) => {
    const candidateId = idParam(req.params.id);
    const candidate = await fetchCandidateProfile(candidateId);
    res.json({ candidate });
});

usersRouter.get("/roles", requirePermission(PERMISSIONS.USER_VIEW), async (_req, res) => {
    res.json({ roles: await db.select().from(roles) });
});

usersRouter.get("/", requirePermission(PERMISSIONS.USER_VIEW), async (_req, res) => {
    const rows = await db
        .select({ id: users.id, name: users.name, email: users.email, isActive: users.isActive, createdAt: users.createdAt })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(200);
    const ids = rows.map((r) => r.id);
    const roleRows = ids.length
        ? await db
            .select({ userId: userRoles.userId, role: roles.name })
            .from(userRoles)
            .innerJoin(roles, eq(roles.id, userRoles.roleId))
            .where(inArray(userRoles.userId, ids))
        : [];
    res.json({
        users: rows.map((u) => ({ ...u, roles: roleRows.filter((r) => r.userId === u.id).map((r) => r.role) })),
    });
});

// Admins can create users with any existing role (default: admin).
usersRouter.post("/", requirePermission(PERMISSIONS.USER_CREATE), async (req, res) => {
    const input = parse(createUserSchema, req.body);
    const [role] = await db.select().from(roles).where(eq(roles.name, input.role)).limit(1);
    if (!role) throw badRequest(`Unknown role "${input.role}"`);

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
    if (existing) throw conflict("An account with this email already exists");

    const passwordHash = await argon2.hash(input.password);
    const id = await db.transaction(async (tx) => {
        const [r] = await tx.insert(users).values({ email: input.email, name: input.name, passwordHash });
        await tx.insert(userRoles).values({ userId: r.insertId, roleId: role.id });
        return r.insertId;
    });
    res.status(201).json({ user: { id, name: input.name, email: input.email, roles: [role.name] } });
});
