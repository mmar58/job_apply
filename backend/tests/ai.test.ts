import { describe, it, expect, beforeAll } from "vitest";
import { client, CSRF_HEADER, uniqueEmail, loginAndGetCookie } from "./helpers.js";
import { env } from "../src/config/env.js";

describe("Google Gemini AI Endpoints", () => {
  let adminCookie: string;
  let candidateCookie: string;

  beforeAll(async () => {
    adminCookie = await loginAndGetCookie(env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD);

    const candEmail = uniqueEmail("ai_cand");
    const regRes = await client
      .post("/api/v1/auth/register")
      .set(CSRF_HEADER)
      .send({ name: "AI Cand", email: candEmail, password: "Password123!" });

    const raw = Array.isArray(regRes.headers["set-cookie"])
      ? regRes.headers["set-cookie"][0]
      : regRes.headers["set-cookie"];
    candidateCookie = raw.split(";")[0];
  });

  it("blocks candidates from calling AI endpoints with 403 Forbidden", async () => {
    const res = await client
      .post("/api/v1/ai/job-description")
      .set(CSRF_HEADER)
      .set("Cookie", candidateCookie)
      .send({ prompt: "Senior Full Stack Dev" });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("permission");

    const suggestRes = await client
      .get("/api/v1/ai/jobs/1/suggest-candidates")
      .set("Cookie", candidateCookie);

    expect(suggestRes.status).toBe(403);
  });

  it("validates that prompt must be at least 5 characters", async () => {
    const res = await client
      .post("/api/v1/ai/job-description")
      .set(CSRF_HEADER)
      .set("Cookie", adminCookie)
      .send({ prompt: "dev" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("GET /api/v1/ai/jobs/:id/suggest-candidates returns 404 for non-existent job", async () => {
    const res = await client
      .get("/api/v1/ai/jobs/999999/suggest-candidates")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(404);
  });

  it("GET /api/v1/ai/applications/:id/summary?cachedOnly=true returns 404 for non-existent application", async () => {
    const res = await client
      .get("/api/v1/ai/applications/999999/summary?cachedOnly=true")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(404);
  });

  it("GET /api/v1/ai/jobs/:jobId/candidates/:candidateId/feedback?cachedOnly=true returns cache status", async () => {
    const res = await client
      .get("/api/v1/ai/jobs/999999/candidates/999999/feedback?cachedOnly=true")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.cached).toBe(false);
    expect(res.body.data).toBeNull();
  });

  it("handles AI generation or returns 503 gracefully if key is not configured", async () => {
    const res = await client
      .post("/api/v1/ai/job-description")
      .set(CSRF_HEADER)
      .set("Cookie", adminCookie)
      .send({ prompt: "Senior Rust and WebAssembly systems engineer" });

    if (!env.GEMINI_API_KEY) {
      expect(res.status).toBe(503);
      expect(res.body.error).toContain("AI is not configured");
    } else {
      expect([200, 429, 502]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.job).toBeDefined();
        expect(res.body.job.title).toBeDefined();
        expect(res.body.job.skills).toBeInstanceOf(Array);
      }
    }
  }, 60000);
});
