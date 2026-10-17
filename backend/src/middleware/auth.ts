import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { permissions, rolePermissions, roles, userRoles, users } from "../db/schema/index.js";
import { forbidden, unauthorized } from "../lib/http.js";
import { db } from "../db/index.js";

// Load user with their roles and role permissions 
export async function loadAuthUser(userId: number): Promise<Express.AuthUser | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || !user.isActive) return null;

    const rows = await db
        .select({ role: roles.name, permission: permissions.key })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(userRoles.userId, userId));

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: [...new Set(rows.map((r) => r.role))],
        permissions: [...new Set(rows.map((r) => r.permission).filter((p): p is string => !!p))],
    };
}

//Attaches req.user when a valid session exists. Never rejects.
export async function attachUser(req: Request, res: Response, next: NextFunction) {
    const userId = req.session?.userId;
    if (userId) {
        const user = await loadAuthUser(userId);
        // If user data found, attaching the user in request object
        if (user) req.user = user;
        // Else clearing the userId from session
        else req.session.userId = undefined
    }
    next();
}

// Strictly checks Auth
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.user) throw next(unauthorized())
    next();
}

// Checks if user has required permissions
export function requirePermission(...needed: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return next(unauthorized());
        const hasP = new Set(req.user.permissions);
        if (!needed.every((p) => hasP.has(p))) return next(forbidden());
        next();
    };
}

export function can(user: Express.AuthUser | undefined, permission: string) {
    return !!user && user.permissions.includes(permission);
}