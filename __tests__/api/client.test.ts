import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { apiClient, ApiError, getApiErrorMessage } from "@/lib/api/client";

describe("apiClient", () => {
  it("fetches from /api/proxy base URL", async () => {
    const exams = await apiClient.get<unknown[]>("/exams");
    expect(Array.isArray(exams)).toBe(true);
  });

  it("throws on non-OK response", async () => {
    server.use(
      http.get("/api/proxy/nonexistent-endpoint", () => {
        return HttpResponse.json(
          { detail: "Not found" },
          { status: 404 },
        );
      }),
    );

    await expect(apiClient.get("/nonexistent-endpoint")).rejects.toThrow(
      ApiError,
    );
  });

  it("uses the backend detail for an API error", () => {
    expect(
      getApiErrorMessage(
        new ApiError(403, "Join a school before using this feature"),
        "Failed to create exam",
      ),
    ).toBe("Join a school before using this feature");
  });

  it("retries on 401 after refreshing tokens", async () => {
    let callCount = 0;
    server.use(
      http.get("/api/proxy/protected", () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json(
            { detail: "Unauthorized" },
            { status: 401 },
          );
        }
        return HttpResponse.json({ data: "success" });
      }),
    );

    const result = await apiClient.get<{ data: string }>("/protected");
    expect(result.data).toBe("success");
    expect(callCount).toBe(2);
  });

  it("keeps the backend detail when a refreshed request is forbidden", async () => {
    server.use(
      http.get("/api/proxy/forbidden-after-refresh", () =>
        HttpResponse.json(
          { detail: "Join a school before using this feature" },
          { status: 401 },
        ),
      ),
      http.post("/api/auth/refresh", () => HttpResponse.json({ ok: true })),
    );

    await expect(apiClient.get("/forbidden-after-refresh")).rejects.toMatchObject({
      status: 401,
      detail: "Join a school before using this feature",
    });
  });
});
