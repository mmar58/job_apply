import { describe, it, expect, beforeAll } from "vitest";
import { client, CSRF_HEADER, uniqueEmail, loginAndGetCookie } from "./helpers.js";
import { env } from "../src/config/env.js";

describe("RBAC & Route Protection", () => {
  let candidateCookie: string;
  let adminCookie: string;

  beforeAll(async () => {
    // 1. Create a candidate
    const candEmail = uniqueEmail("rbac_cand");
    const regRes = await client
      .post("/api/v1/auth/register")
      .set(CSRF_HEADER)
      .send({ name: "RBAC Cand", email: candEmail, password: "Password123!" });

    const candRaw = Array.isArray(regRes.headers["set-cookie"])
      ? regRes.headers["set-cookie"][0]
      : regRes.headers["set-cookie"];
    candidateCookie = candRaw.split(";")[0];

    // 2. Sign in as Admin
    adminCookie = await loginAndGetCookie(env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD);
  });

  it("blocks unauthenticated access to /api/v1/admin/jobs with 401", async () => {
    const res = await client.get("/api/v1/admin/jobs");
    expect(res.status).toBe(401);
  });

  it("blocks candidate from accessing /api/v1/admin/jobs with 403 Forbidden", async () => {
    const res = await client
      .get("/api/v1/admin/jobs")
      .set("Cookie", candidateCookie);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("permission");
  });

  it("blocks candidate from accessing /api/v1/admin/applications with 403 Forbidden", async () => {
    const res = await client
      .get("/api/v1/admin/applications")
      .set("Cookie", candidateCookie);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("permission");
  });

  it("blocks candidate from accessing /api/v1/dashboard/admin with 403 Forbidden", async () => {
    const res = await client
      .get("/api/v1/dashboard/admin")
      .set("Cookie", candidateCookie);

    expect(res.status).toBe(403);
  });

  it("allows candidate to access /api/v1/dashboard/candidate with 200", async () => {
    const res = await client
      .get("/api/v1/dashboard/candidate")
      .set("Cookie", candidateCookie);

    expect(res.status).toBe(200);
    expect(res.body.profileCompleteness).toBeDefined();
  });

  it("allows admin to access /api/v1/admin/jobs with 200", async () => {
    const res = await client
      .get("/api/v1/admin/jobs")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it("allows admin to access /api/v1/admin/applications with 200", async () => {
    const res = await client
      .get("/api/v1/admin/applications")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it("allows admin to access /api/v1/dashboard/admin with 200", async () => {
    const res = await client
      .get("/api/v1/dashboard/admin")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.jobs).toBeDefined();
    expect(res.body.jobs.total).toBeGreaterThanOrEqual(0);
  });
});
