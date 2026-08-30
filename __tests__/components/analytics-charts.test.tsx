import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnalyticsCharts } from "@/components/analytics-charts";
import type { AnalyticsResponse } from "@/lib/api/types";

vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => null,
}));

const analytics: AnalyticsResponse = {
  questions: [
    {
      question_number: 1,
      max_marks: 10,
      avg_score: 5,
      attempts: 2,
      above_80_pct: 50,
      below_40_pct: 50,
    },
    {
      question_number: 2,
      max_marks: 10,
      avg_score: 0,
      attempts: 0,
      above_80_pct: 0,
      below_40_pct: 0,
    },
  ],
  overall: {
    total_students: 4,
    avg_percentage: 50,
    pass_count: 2,
    fail_count: 2,
  },
};

describe("AnalyticsCharts", () => {
  it("renders backend question-band percentages directly instead of recalculating them from the class size", () => {
    render(<AnalyticsCharts data={analytics} />);

    const questionTable = within(screen.getByRole("table"));
    expect(questionTable.getAllByText("50.0%")).toHaveLength(2);
    expect(questionTable.getAllByText("0.0%")).toHaveLength(2);
  });
});
