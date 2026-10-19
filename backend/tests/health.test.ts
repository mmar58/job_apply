import { describe, it, expect } from "vitest";
import { client, CSRF_HEADER } from "./helpers.js";

describe("Health & CSRF Security", () => {
  it("GET /api/health returns { ok: true }", async () => {
    const res = await client.get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("blocks mutating requests without the custom CSRF header", async () => {
    // Non-GET request without X-Requested-With should be rejected with 403
    const res = await client
      .post("/api/auth/login")
      .send({ email: "invalid@example.com", password: "wrong" });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Missing X-Requested-With header");
  });

  it("returns 404 for unknown endpoints", async () => {
    const res = await client.get("/api/non-existent-endpoint-xyz");
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
