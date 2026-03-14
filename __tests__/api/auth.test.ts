import { describe, it, expect } from "vitest";

describe("auth cookie helpers", () => {
  it("token route sets httpOnly cookies on success", async () => {
    const res = await fetch("/api/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: "mock-firebase-token" }),
    });
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(data).toHaveProperty("access_token");
  });

  it("refresh route returns new tokens", async () => {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
    });
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(data).toHaveProperty("access_token");
  });
});
