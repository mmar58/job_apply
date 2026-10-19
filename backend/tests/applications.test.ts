import { describe, it, expect, beforeAll } from "vitest";
import { client, CSRF_HEADER, uniqueEmail, loginAndGetCookie } from "./helpers.js";
import { env } from "../src/config/env.js";

describe("Job Applications Flow & Duplicate Guard", () => {
  let adminCookie: string;
  let candidateCookie: string;
  let candidateEmail: string;
  let testJobId: number;
  let applicationId: number;

  beforeAll(async () => {
    // 1. Admin login & create an active job with specific skills
    adminCookie = await loginAndGetCookie(env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD);

    const jobRes = await client
      .post("/api/v1/admin/jobs")
      .set(CSRF_HEADER)
      .set("Cookie", adminCookie)
      .send({
        title: `Backend Test Engineer ${Date.now()}`,
        company: "AnZ Test Lab",
        description: "Integration testing and reliability engineering role.",
        requirements: "Hands-on TypeScript, Vitest, MySQL experience.",
        location: "San Francisco, CA",
        jobType: "contract",
        experienceLevel: "mid",
        status: "active",
        skills: ["TypeScript", "Vitest", "MySQL"],
      });

    testJobId = jobRes.body.job.id;

    // 2. Register candidate & add matching skills
    candidateEmail = uniqueEmail("app_cand");
    const regRes = await client
      .post("/api/v1/auth/register")
      .set(CSRF_HEADER)
      .send({ name: "App Test Candidate", email: candidateEmail, password: "Password123!" });

    const raw = Array.isArray(regRes.headers["set-cookie"])
      ? regRes.headers["set-cookie"][0]
      : regRes.headers["set-cookie"];
    candidateCookie = raw.split(";")[0];

    // Update candidate profile with matching skills and details for >50% completeness
    await client
      .put("/api/v1/candidate/profile")
      .set(CSRF_HEADER)
      .set("Cookie", candidateCookie)
      .send({
        name: "App Test Candidate",
        headline: "Software Engineer",
        bio: "Experienced backend engineer specializing in TypeScript, Vitest, and MySQL.",
        phone: "+1234567890",
        address: "San Francisco, CA",
        education: "B.S. in Computer Science",
        experience: "5+ years backend software development",
        skills: ["TypeScript", "Vitest"],
      });
  });

  it("POST /api/v1/jobs/:id/apply successfully submits application with cover letter", async () => {
    const res = await client
      .post(`/api/v1/jobs/${testJobId}/apply`)
      .set(CSRF_HEADER)
      .set("Cookie", candidateCookie)
      .send({
        coverLetter: "I am excited to apply for this backend testing role. I have extensive experience with TypeScript, Vitest, and MySQL databases.",
      });

    expect(res.status).toBe(201);
    expect(res.body.application).toBeDefined();
    expect(res.body.application.jobId).toBe(testJobId);
    expect(res.body.application.status).toBe("pending");

    applicationId = res.body.application.id;
  });

  it("POST /api/v1/jobs/:id/apply prevents duplicate submissions with 409 Conflict", async () => {
    const res = await client
      .post(`/api/v1/jobs/${testJobId}/apply`)
      .set(CSRF_HEADER)
      .set("Cookie", candidateCookie)
      .send({
        coverLetter: "Second attempt to apply for the same job should be rejected by duplicate guard.",
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain("already applied");
  });

  it("GET /api/v1/candidate/applications lists submitted application as pending", async () => {
    const res = await client
      .get("/api/v1/candidate/applications")
      .set("Cookie", candidateCookie);

    expect(res.status).toBe(200);
    expect(res.body.applications).toBeDefined();
    const app = res.body.applications.find((a: any) => a.id === applicationId);
    expect(app).toBeDefined();
    expect(app.status).toBe("pending");
    expect(app.jobTitle).toContain("Backend Test Engineer");
  });

  it("GET /api/v1/candidate/applications/:id returns specific application details with job skills", async () => {
    const res = await client
      .get(`/api/v1/candidate/applications/${applicationId}`)
      .set("Cookie", candidateCookie);

    expect(res.status).toBe(200);
    expect(res.body.application).toBeDefined();
    expect(res.body.application.id).toBe(applicationId);
    expect(res.body.job).toBeDefined();
    expect(res.body.job.skills).toContain("TypeScript");
  });

  it("Admin views application in /api/v1/admin/applications", async () => {
    const res = await client
      .get(`/api/v1/admin/applications?jobId=${testJobId}`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    const app = res.body.items.find((a: any) => a.id === applicationId);
    expect(app).toBeDefined();
    expect(app.candidate?.email).toBe(candidateEmail);
  });

  it("Admin views application detail in /api/v1/admin/applications/:id", async () => {
    const res = await client
      .get(`/api/v1/admin/applications/${applicationId}`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.application).toBeDefined();
    expect(res.body.application.id).toBe(applicationId);
    expect(res.body.candidate).toBeDefined();
    expect(res.body.matchedSkills).toContain("TypeScript");
  });

  it("Admin reviews application with feedback note via PATCH /api/v1/admin/applications/:id", async () => {
    const res = await client
      .patch(`/api/v1/admin/applications/${applicationId}`)
      .set(CSRF_HEADER)
      .set("Cookie", adminCookie)
      .send({
        status: "shortlisted",
        note: "Excellent experience with Vitest and TypeScript. Approved for technical interview.",
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.status).toBe("shortlisted");
  });

  it("Candidate sees updated status and review note in /api/v1/candidate/applications", async () => {
    const res = await client
      .get("/api/v1/candidate/applications")
      .set("Cookie", candidateCookie);

    expect(res.status).toBe(200);
    const app = res.body.applications.find((a: any) => a.id === applicationId);
    expect(app).toBeDefined();
    expect(app.status).toBe("shortlisted");
    expect(app.reviewNote).toContain("Approved for technical interview");
  });

  it("Admin job details reflects applicant count and skill match count", async () => {
    const res = await client
      .get(`/api/v1/admin/jobs/${testJobId}`)
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.applications.total).toBe(1);
    expect(res.body.applications.shortlisted).toBe(1);

    // Skill counts check: TypeScript was present in candidate's skills
    const tsSkill = res.body.skillCounts.find((s: any) => s.skill.toLowerCase() === "typescript");
    expect(tsSkill).toBeDefined();
    expect(tsSkill.count).toBe(1);
  });
});
