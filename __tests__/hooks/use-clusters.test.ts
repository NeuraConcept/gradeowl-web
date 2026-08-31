import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { useAdjustResult, useApproveCluster } from "@/lib/api/hooks/use-clusters";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe("useApproveCluster", () => {
  it("approves a cluster at the selected exam and question scope", async () => {
    let requestUrl: URL | undefined;
    let requestBody: unknown;
    server.use(
      http.put("/api/proxy/exams/41/clusters/7/approve", async ({ request }) => {
        requestUrl = new URL(request.url);
        requestBody = await request.json();
        return HttpResponse.json({ detail: "Cluster 7 approved", count: 1 });
      }),
    );

    const { result } = renderHook(() => useApproveCluster(41), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ clusterId: 7, question: 3, score: 8.5 });

    expect(requestUrl?.pathname).toBe("/api/proxy/exams/41/clusters/7/approve");
    expect(requestUrl?.search).toBe("?question=3");
    expect(requestBody).toEqual({ score: 8.5 });
  });
});

describe("useAdjustResult", () => {
  it("sends the backend score adjustment shape", async () => {
    let requestBody: unknown;
    server.use(
      http.put("/api/proxy/grading-results/17/adjust", async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ detail: "Score adjusted", id: 17, new_score: 7.5 });
      }),
    );

    const { result } = renderHook(() => useAdjustResult(41), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      resultId: 17,
      score: 7.5,
      notes: "Deducted for missing diagram",
    });

    expect(requestBody).toEqual({
      score: 7.5,
      notes: "Deducted for missing diagram",
    });
  });
});
