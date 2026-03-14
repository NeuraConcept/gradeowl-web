import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { apiClient, ApiError } from "@/lib/api/client";

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
});
