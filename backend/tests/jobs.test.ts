import { describe, it, expect, beforeAll } from "vitest";
import { client, CSRF_HEADER, loginAndGetCookie } from "./helpers.js";
import { env } from "../src/config/env.js";

describe("Jobs Management & Applicant Breakdown", () => {
  let adminCookie: string;
  let createdJobId: number;
  const uniqueTitle = `Senior Full-Stack Engineer ${Date.now()}`;

  beforeAll(async () => {
    adminCookie = await loginAndGetCookie(env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD);
  });

  it("POST /api/v1/admin/jobs creates a new job post in draft status with skills", async () => {
    const res = await client
      .post("/api/v1/admin/jobs")
      .set(CSRF_HEADER)
      .set("Cookie", adminCookie)
      .send({
        title: uniqueTitle,
        company: "AnZ Tech",
        description: "We are looking for a senior engineer to lead full-stack systems.",
        requirements: "5+ years with React, Node.js, and TypeScript. Experience with MySQL.",
        location: "Remote",
        jobType: "full_time",
        experienceLevel: "senior",
        salaryMin: 90000,
        salaryMax: 130000,
        status: "draft",
        skills: ["React", "TypeScript", "Node.js"],
      });

    expect(res.status).toBe(201);
    expect(res.body.job).toBeDefined();
    expect(res.body.job.title).toBe(uniqueTitle);
    expect(res.body.job.status).toBe("draft");
    expect(res.body.job.skills).toEqual(expect.arrayContaining(["React", "TypeScript", "Node.js"]));

    createdJobId = res.body.job.id;
  });

  it("GET /api/v1/jobs (public) does NOT list draft jobs", async () => {
    const res = await client.get(`/api/v1/jobs?q=${encodeURIComponent(uniqueTitle)}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    const found = res.body.items.find((j: any) => j.id === createdJobId);
    expect(found).toBeUndefined();
  });

  it("PATCH /api/v1/admin/jobs/:id/status toggles job to active status", async () => {
    const res = await client
      .patch(`/api/v1/admin/jobs/${createdJobId}/status`)
      .set(CSRF_HEADER)
      .set("Cookie", adminCookie)
      .send({ status: "active" });

    expect(res.status).toBe(200);
    expect(res.body.job.status).toBe("active");
  });

  it("GET /api/v1/jobs (public) lists the job once it is active", async () => {
    const res = await client.get(`/api/v1/jobs?q=${encodeURIComponent(uniqueTitle)}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    const found = res.body.items.find((j: any) => j.id === createdJobId);
    expect(found).toBeDefined();
    expect(found.title).toBe(uniqueTitle);
  });

  it("GET /api/v1/admin/jobs lists job with applications and skillCounts structure", async () => {
    const res = await client
      .get("/api/v1/admin/jobs")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    const job = res.body.items.find((j: any) => j.id === createdJobId);
    expect(job).toBeDefined();
    expect(job.applications).toBeDefined();
    expect(job.applications.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(job.skillCounts)).toBe(true);
  });
});
