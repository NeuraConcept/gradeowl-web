import { Suspense } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ReviewPage from "@/app/(dashboard)/exams/[id]/review/page";

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("@/lib/api/hooks/use-clusters", () => ({
  useClusters: () => ({
    data: {
      total_questions: 1,
      clusters: [
        {
          rubric_pattern: { label: "Full marks", criteria_met: [], criteria_missed: [] },
          total_count: 2,
          avg_score: 7,
          sub_clusters: [
            { cluster_id: 11, count: 1, avg_score: 8.5, sample_answers: [] },
            { cluster_id: 12, count: 1, avg_score: 5.5, sample_answers: [] },
          ],
        },
      ],
    },
    isLoading: false,
  }),
  useApproveCluster: () => ({ mutateAsync: mocks.mutateAsync, isPending: false }),
  useAdjustResult: () => ({ mutate: vi.fn() }),
}));

vi.mock("@/lib/api/hooks/use-rubric", () => ({
  useRubric: () => ({
    data: [{ question_number: 1, max_marks: 10, criteria: [] }],
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("ReviewPage", () => {
  beforeEach(() => {
    mocks.mutateAsync.mockReset();
    mocks.mutateAsync.mockResolvedValue({ detail: "Cluster approved" });
  });

  it("approves every subcluster with its average score", async () => {
    const params = Promise.resolve({ id: "41" });

    await act(async () => {
      render(
        <Suspense fallback={null}>
          <ReviewPage params={params} />
        </Suspense>,
      );
      await params;
    });

    fireEvent.click(await screen.findByRole("button", { name: "Approve All" }));

    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalledTimes(2));
    expect(mocks.mutateAsync).toHaveBeenNthCalledWith(1, {
      clusterId: 11,
      question: 1,
      score: 8.5,
    });
    expect(mocks.mutateAsync).toHaveBeenNthCalledWith(2, {
      clusterId: 12,
      question: 1,
      score: 5.5,
    });
  });
});
