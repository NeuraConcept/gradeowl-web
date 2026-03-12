"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AnalyticsResponse } from "@/lib/api/types";

const CORAL = "#E36A6A";

interface AnalyticsChartsProps {
  data: AnalyticsResponse;
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const { questions, overall } = data;

  const chartData = questions.map((q) => ({
    name: `Q${q.question_number}`,
    avg: parseFloat(q.avg_score.toFixed(2)),
    max: q.max_marks,
  }));

  const passRate =
    overall.total_students > 0
      ? ((overall.pass_count / overall.total_students) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Overall summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card size="sm">
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold">{overall.total_students}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground">Avg Percentage</p>
            <p
              className={cn(
                "text-2xl font-bold",
                overall.avg_percentage > 80
                  ? "text-success"
                  : overall.avg_percentage >= 40
                    ? "text-warning"
                    : "text-coral"
              )}
            >
              {overall.avg_percentage.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground">Passed</p>
            <p className="text-2xl font-bold text-success">
              {overall.pass_count}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({passRate}%)
              </span>
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground">Failed</p>
            <p className="text-2xl font-bold text-coral">{overall.fail_count}</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-question bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Average Score per Question</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No analytics data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 60)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid oklch(0.92 0.01 60)",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [
                    typeof value === "number" ? value : value,
                    "Avg Score",
                  ]}
                />
                <Bar dataKey="avg" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CORAL} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Per-question detail table */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Question Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="pb-2 text-left font-medium">Q#</th>
                    <th className="pb-2 text-left font-medium">Max</th>
                    <th className="pb-2 text-left font-medium">Avg</th>
                    <th className="pb-2 text-left font-medium">Attempts</th>
                    <th className="pb-2 text-left font-medium">&gt;80%</th>
                    <th className="pb-2 text-left font-medium">&lt;40%</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.question_number} className="border-b border-border/50 last:border-0">
                      <td className="py-1.5 font-medium">Q{q.question_number}</td>
                      <td className="py-1.5">{q.max_marks}</td>
                      <td className="py-1.5 font-semibold text-coral">
                        {q.avg_score.toFixed(1)}
                      </td>
                      <td className="py-1.5">{q.attempts}</td>
                      <td className="py-1.5 text-success">{q.above_80_pct}%</td>
                      <td className="py-1.5 text-coral">{q.below_40_pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
