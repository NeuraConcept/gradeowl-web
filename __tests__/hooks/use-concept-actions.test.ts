import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { useConceptActions } from "@/lib/api/hooks/use-concept-actions";
import { server } from "@/mocks/server";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe("useConceptActions", () => {
  it("uses the authenticated concept-summary response instead of local recommendations", async () => {
    server.use(
      http.get("/api/proxy/exams/27/concept-summary", () =>
        HttpResponse.json({
          concepts: [
            {
              concept_id: 91,
              name: "Comparing quantities",
              pct_correct: 0.35,
              student_count: 1,
            },
          ],
        }),
      ),
    );

    const { result } = renderHook(() => useConceptActions(27), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      concepts: [
        {
          concept_id: 91,
          name: "Comparing quantities",
          pct_correct: 0.35,
          student_count: 1,
        },
      ],
    });
  });
});
