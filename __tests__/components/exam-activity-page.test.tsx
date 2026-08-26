import { Suspense } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ExamActivityPage from "@/app/(dashboard)/exams/[id]/activity/page";

const mocks = vi.hoisted(() => ({
  refetch: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("@/lib/api/hooks/use-activity", () => ({
  useExamActivity: () => ({
    data: undefined,
    isLoading: false,
    isError: true,
    refetch: mocks.refetch,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

describe("ExamActivityPage", () => {
  beforeEach(() => mocks.refetch.mockReset());

  it("shows a retryable error when the activity request fails", async () => {
    const params = Promise.resolve({ id: "41" });

    await act(async () => {
      render(
        <Suspense fallback={null}>
          <ExamActivityPage params={params} />
        </Suspense>,
      );
      await params;
    });

    expect(screen.getByText("Unable to load exam activity.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
});
