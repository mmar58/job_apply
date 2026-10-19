import { describe, it, expect, beforeAll } from "vitest";
import { client, CSRF_HEADER, uniqueEmail } from "./helpers.js";

describe("Candidate Profile & Skills Module", () => {
  let candidateCookie: string;
  let candidateEmail: string;

  beforeAll(async () => {
    candidateEmail = uniqueEmail("profile_cand");
    const regRes = await client
      .post("/api/v1/auth/register")
      .set(CSRF_HEADER)
      .send({ name: "Profile Candidate", email: candidateEmail, password: "Password123!" });

    const raw = Array.isArray(regRes.headers["set-cookie"])
      ? regRes.headers["set-cookie"][0]
      : regRes.headers["set-cookie"];
    candidateCookie = raw.split(";")[0];
  });

  it("GET /api/v1/candidate/profile returns candidate profile with empty skills initially", async () => {
    const res = await client
      .get("/api/v1/candidate/profile")
      .set("Cookie", candidateCookie);

    expect(res.status).toBe(200);
    expect(res.body.profile).toBeDefined();
    expect(res.body.profile.email).toBe(candidateEmail);
    expect(res.body.profile.skills).toEqual([]);
    expect(res.body.profile.experienceYears).toBe(0);
    expect(res.body.completeness).toBeDefined();
  });

  it("PUT /api/v1/candidate/profile updates bio, headline, links, and skills", async () => {
    const res = await client
      .put("/api/v1/candidate/profile")
      .set(CSRF_HEADER)
      .set("Cookie", candidateCookie)
      .send({
        name: "Updated Full Name",
        headline: "Full-Stack Software Engineer",
        bio: "Specializing in React, TypeScript, and Node.js with 5+ years of experience.",
        experienceYears: 5,
        location: "New York, NY",
        linkedinUrl: "https://linkedin.com/in/testcandidate",
        githubUrl: "https://github.com/testcandidate",
        portfolioUrl: "https://testcandidate.dev",
        skills: ["React", "TypeScript", "Node.js", "MySQL"],
      });

    expect(res.status).toBe(200);
    const profile = res.body.profile;
    expect(profile.name).toBe("Updated Full Name");
    expect(profile.headline).toBe("Full-Stack Software Engineer");
    expect(profile.experienceYears).toBe(5);
    expect(profile.address).toBe("New York, NY");
    expect(profile.location).toBe("New York, NY");
    expect(profile.skills).toHaveLength(4);
    expect(profile.skills).toContain("React");
    expect(profile.skills).toContain("TypeScript");
    expect(profile.skills).toContain("Node.js");
    expect(profile.skills).toContain("MySQL");
  });

  it("PUT /api/v1/candidate/profile syncs removed skills properly", async () => {
    const res = await client
      .put("/api/v1/candidate/profile")
      .set(CSRF_HEADER)
      .set("Cookie", candidateCookie)
      .send({
        skills: ["React", "TypeScript"], // Removed Node.js & MySQL
      });

    expect(res.status).toBe(200);
    expect(res.body.profile.skills).toHaveLength(2);
    expect(res.body.profile.skills).toContain("React");
    expect(res.body.profile.skills).not.toContain("MySQL");
  });

  it("GET /api/v1/dashboard/candidate reflects profile completeness score", async () => {
    const res = await client
      .get("/api/v1/dashboard/candidate")
      .set("Cookie", candidateCookie);

    expect(res.status).toBe(200);
    expect(res.body.profileCompleteness).toBeGreaterThan(0);
    expect(res.body.applications).toBeDefined();
    expect(res.body.applications.total).toBe(0);
  });
});
