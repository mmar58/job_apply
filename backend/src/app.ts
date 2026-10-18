import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import rateLimit from "express-rate-limit";
import { env, isProd } from "./config/env.js";
import { requireCustomHeader } from "./middleware/security.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { attachUser, requireAuth } from "./middleware/auth.js";
import { authRouter } from "./modules/auth/routes.js";
import { usersRouter } from "./modules/users/routes.js";
import { candidateRouter } from "./modules/candidates/routes.js";
import { adminJobsRouter, publicJobsRouter } from "./modules/jobs/routes.js";
import { adminApplicationsRouter, candidateApplicationsRouter } from "./modules/applications/routes.js";
import { dashboardRouter } from "./modules/dashboard/routes.js";
import { aiRouter } from "./modules/ai/routes.js";

export const SESSION_COOKIE = "anz.session";

export function createApp() {
    const app = express();
    if (isProd) app.set("trust proxy", 1);

    app.use(helmet());
    app.use(cors({
        origin: env.CLIENT_ORIGIN.split(",").map(o => o.trim()),
        credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const MySQLStore = MySQLStoreFactory(session);
    const maxAge = env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    const store = new MySQLStore({
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        createDatabaseTable: true,
        expiration: maxAge,
        clearExpired: true,
        checkExpirationInterval: 15 * 60 * 1000,
    });

    app.use(session({
        name: SESSION_COOKIE,
        store: store,
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: { httpOnly: true, sameSite: "lax", secure: isProd, maxAge },
    }))

    app.use(requireCustomHeader);
    app.use(attachUser)

    app.get("/api/health", (req, res) => {
        res.json({ status: "ok" });
    });

    const authLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 60, standardHeaders: "draft-8", legacyHeaders: false });
    const aiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 15, standardHeaders: "draft-8", legacyHeaders: false });

    app.use("/api/v1/auth", authLimiter, authRouter);
    app.use("/api/v1/jobs", publicJobsRouter);
    app.use("/api/v1", candidateApplicationsRouter);

    app.use("/api/v1/candidate", requireAuth, candidateRouter);
    app.use("/api/v1/dashboard", requireAuth, dashboardRouter);
    app.use("/api/v1/admin/jobs", requireAuth, adminJobsRouter);
    app.use("/api/v1/admin/applications", requireAuth, adminApplicationsRouter);
    app.use("/api/v1/admin/users", requireAuth, usersRouter);
    app.use("/api/v1/ai", requireAuth, aiLimiter, aiRouter);

    app.use(notFoundHandler)
    app.use(errorHandler)

    return app;
}