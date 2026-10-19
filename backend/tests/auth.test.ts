import { describe, it, expect } from "vitest";
import { client, CSRF_HEADER, uniqueEmail } from "./helpers.js";
import { SESSION_COOKIE } from "../src/app.js";

describe("Authentication Module", () => {
  const candidateEmail = uniqueEmail("auth_cand");
  const candidatePassword = "Password123!";
  let sessionCookie: string;

  it("POST /api/v1/auth/register creates a candidate account with session cookie", async () => {
    const res = await client
      .post("/api/v1/auth/register")
      .set(CSRF_HEADER)
      .send({
        name: "Test Candidate",
        email: candidateEmail,
        password: candidatePassword,
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(candidateEmail);
    expect(res.body.user.roles).toContain("candidate");
    expect(res.body.user.permissions).toContain("application:apply");

    // Session cookie should be set
    const cookie = res.headers["set-cookie"];
    expect(cookie).toBeDefined();
    const raw = Array.isArray(cookie) ? cookie[0] : cookie;
    sessionCookie = raw.split(";")[0];
    expect(sessionCookie).toContain(SESSION_COOKIE);
  });

  it("POST /api/v1/auth/register rejects duplicate email with 409 Conflict", async () => {
    const res = await client
      .post("/api/v1/auth/register")
      .set(CSRF_HEADER)
      .send({
        name: "Duplicate User",
        email: candidateEmail,
        password: candidatePassword,
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain("already exists");
  });

  it("POST /api/v1/auth/register validates email format and password length", async () => {
    const res = await client
      .post("/api/v1/auth/register")
      .set(CSRF_HEADER)
      .send({
        name: "A",
        email: "not-an-email",
        password: "short",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("POST /api/v1/auth/login succeeds with valid credentials", async () => {
    const res = await client
      .post("/api/v1/auth/login")
      .set(CSRF_HEADER)
      .send({
        email: candidateEmail,
        password: candidatePassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(candidateEmail);

    const cookie = res.headers["set-cookie"];
    const raw = Array.isArray(cookie) ? cookie[0] : cookie;
    sessionCookie = raw.split(";")[0];
  });

  it("POST /api/v1/auth/login fails with 401 for wrong password", async () => {
    const res = await client
      .post("/api/v1/auth/login")
      .set(CSRF_HEADER)
      .send({
        email: candidateEmail,
        password: "IncorrectPassword!",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("Invalid email or password");
  });

  it("GET /api/v1/auth/me returns 401 when unauthenticated", async () => {
    const res = await client.get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/auth/me returns user profile and permissions with session cookie", async () => {
    const res = await client
      .get("/api/v1/auth/me")
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(candidateEmail);
    expect(res.body.user.roles).toContain("candidate");
    expect(res.body.user.permissions).toContain("profile:manage");
  });

  it("POST /api/v1/auth/logout destroys the session", async () => {
    const logoutRes = await client
      .post("/api/v1/auth/logout")
      .set(CSRF_HEADER)
      .set("Cookie", sessionCookie);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.ok).toBe(true);

    // After logout, /me should return 401
    const meRes = await client
      .get("/api/v1/auth/me")
      .set("Cookie", sessionCookie);

    expect(meRes.status).toBe(401);
  });
});
