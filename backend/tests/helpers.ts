import request from "supertest";
import { createApp, SESSION_COOKIE } from "../src/app.js";
import { db, pool } from "../src/db/index.js";
import { env } from "../src/config/env.js";

export const app = createApp();
export const client = request(app);

export const CSRF_HEADER = { "X-Requested-With": "XMLHttpRequest" };

/** Generate unique test email */
export function uniqueEmail(prefix = "cand") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@test.com`;
}

/** Signs in with email and password and returns session cookie header string */
export async function loginAndGetCookie(email: string, password = env.SEED_ADMIN_PASSWORD): Promise<string> {
  const res = await client
    .post("/api/v1/auth/login")
    .set(CSRF_HEADER)
    .send({ email, password });

  if (res.status !== 200) {
    throw new Error(`Login failed for ${email} with status ${res.status}: ${JSON.stringify(res.body)}`);
  }

  const cookieHeader = res.headers["set-cookie"];
  if (!cookieHeader) throw new Error("No set-cookie header returned from login");

  const rawCookie = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader;
  return rawCookie.split(";")[0];
}
