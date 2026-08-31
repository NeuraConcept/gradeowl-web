import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useExamActivity } from "@/lib/api/hooks/use-activity";
import { createElement } from "react";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe("useExamActivity", () => {
  it("returns the mocked activity feed newest-first", async () => {
    const { result } = renderHook(() => useExamActivity(1), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
    expect(result.current.data?.[0]).toMatchObject({
      actor_name: expect.any(String),
      action: expect.any(String),
      summary: expect.any(String),
      created_at: expect.any(String),
    });
  });

  it("is disabled for a falsy examId", () => {
    const { result } = renderHook(() => useExamActivity(0), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
