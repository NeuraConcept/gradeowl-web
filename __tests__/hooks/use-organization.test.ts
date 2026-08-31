import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { useOrganization } from "@/lib/api/hooks/use-organization";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe("useOrganization", () => {
  it("identifies a 403 from /orgs/me as no membership", async () => {
    server.use(
      http.get("/api/proxy/orgs/me", () =>
        HttpResponse.json(
          { detail: "Join a school before using this feature" },
          { status: 403 },
        ),
      ),
    );

    const { result } = renderHook(() => useOrganization(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isNoMembership).toBe(true));
  });
});
