import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

async function loadHandler(appEnv: string, bypass: string, nodeEnv = "test") {
  vi.resetModules();
  vi.stubEnv("APP_ENV", appEnv);
  vi.stubEnv("DEV_AUTH_BYPASS", bypass);
  vi.stubEnv("NODE_ENV", nodeEnv);
  return (await import("@/app/api/auth/dev-login/route")).GET;
}

describe("dev login route", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns 404 without explicit development settings", async () => {
    const GET = await loadHandler("production", "true");
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const response = await GET(new NextRequest("http://localhost/api/auth/dev-login?email=demo@example.test"));

    expect(response.status).toBe(404);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects a missing email without calling the backend", async () => {
    const GET = await loadHandler("development", "true");
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const response = await GET(new NextRequest("http://localhost/api/auth/dev-login"));

    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("exchanges an explicit development email once and sets secure httpOnly auth cookies", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "access-token",
          refresh_token: "refresh-token",
          token_type: "bearer",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchSpy);
    const GET = await loadHandler("development", "true", "production");

    const response = await GET(
      new NextRequest("http://localhost/api/auth/dev-login?email=teacher@example.test&name=Test+Teacher"),
    );

    expect(response.status).toBe(307);
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:8000/auth/dev-login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "teacher@example.test", full_name: "Test Teacher" }),
      }),
    );
    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain("gradeowl_access_token=access-token");
    expect(setCookie).toContain("gradeowl_refresh_token=refresh-token");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Secure");
    expect(setCookie).toContain("SameSite=strict");
  });
});
