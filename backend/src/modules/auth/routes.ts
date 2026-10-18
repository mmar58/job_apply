import { Router } from "express";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import { users, userRoles, roles, permissions, rolePermissions, candidateProfiles } from "../../db/schema/index.js";
import { loadAuthUser, requireAuth } from "../../middleware/auth.js";
import { conflict, parse, unauthorized } from "../../lib/http.js";
import { DEFAULT_SIGNUP_ROLE } from "../../config/permissions.js";

import { SESSION_COOKIE } from "../../app.js";

export const authRouter = Router();

const registerSchema = z.object({
    name: z.string().trim().min(2).max(150),
    email: z.string().trim().toLowerCase().max(255).pipe(z.email()),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const loginSchema = z.object({
    email: z.string().trim().toLowerCase(),
    password: z.string().min(1),
});

function regenerate(req: Express.Request): Promise<void> {
    return new Promise((resolve, reject) => {
        req.session.regenerate((err: Error) => {
            if (err) reject(err);
            else resolve();
        })
    })
}
function saveSession(req: Express.Request): Promise<void> {
    return new Promise((resolve, reject) => {
        req.session.save(err => {
            if (err) reject(err);
            else resolve();
        })
    })
}
async function startSession(req: Express.Request, userId: number): Promise<void> {
    await regenerate(req); // prevents session fixation
    req.session.userId = userId;
    await saveSession(req);
}

authRouter.post("/register", async (req, res) => {
    const input = parse(registerSchema, req.body);
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
    if (existing) throw conflict("An account with this email already exists");
    const [role] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, DEFAULT_SIGNUP_ROLE)).limit(1);
    if (!role) throw new Error("Cannot proceed with signup. Please contact admin.");

    const passwordHash = await argon2.hash(input.password);
    const userId = await db.transaction(async (tx) => {
        const [result] = await tx.insert(users).values({
            email: input.email,
            passwordHash,
            name: input.name
        });
        await tx.insert(userRoles).values({
            userId: result.insertId,
            roleId: role.id
        })
        await tx.insert(candidateProfiles).values({
            userId: result.insertId,
        })
        return result.insertId;
    })
    await startSession(req, userId)
    res.status(201).json({ user: await loadAuthUser(userId) });
})

authRouter.post("/login", async (req, res) => {
    console.log("login request: ", req.body);
    const input = parse(loginSchema, req.body);
    const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

    // Always verify against a hash to keep timing similar for unknown emails.
    const ok = user ? await argon2.verify(user.passwordHash, input.password) : false;
    if (!user || !ok || !user.isActive) throw unauthorized("Invalid email or password");

    await startSession(req, user.id);
    res.json({ user: await loadAuthUser(user.id) });
});

authRouter.post("/logout", (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie(SESSION_COOKIE);
        res.json({ ok: true });
    });
});

authRouter.get("/me", requireAuth, (req, res) => {
    res.json({ user: req.user });
});