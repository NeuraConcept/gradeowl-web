"use client";

import { Badge } from "@/components/ui/badge";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import type { AnalysisProgress, AnalysisStatus } from "@/lib/api/types";

interface AnalysisProgressViewProps {
  data: AnalysisProgress;
}

const statusStyle: Record<
  AnalysisStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "Pending", className: "bg-gray-100 text-gray-600" },
  ANALYZING: {
    label: "Analyzing",
    className: "bg-warm-yellow text-warning",
  },
  DONE: { label: "Done", className: "bg-green-100 text-success" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-600" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-600" },
};

function StatusPill({ status }: { status: AnalysisStatus }) {
  const s = statusStyle[status];
  return (
    <Badge className={s.className} variant="outline">
      {s.label}
    </Badge>
  );
}

export function AnalysisProgressView({ data }: AnalysisProgressViewProps) {
  const progressPct =
    data.total_questions > 0
      ? Math.round((data.answers_done / data.total_questions) * 100)
      : 0;

  const stats = [
    { label: "Pending", value: data.answers_pending },
    { label: "Analyzing", value: data.answers_analyzing },
    { label: "Done", value: data.answers_done },
    { label: "Failed", value: data.answers_failed },
    { label: "Reconciled", value: data.reconciliation_done },
  ];

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-1">
        <Progress value={progressPct}>
          <ProgressLabel>Analysis Progress</ProgressLabel>
          <ProgressValue>{() => `${progressPct}%`}</ProgressValue>
        </Progress>
        <p className="text-xs text-muted-foreground">
          {data.answers_done} / {data.total_questions} questions analysed
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-5 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-border bg-muted/40 p-2 text-center"
          >
            <p className="text-lg font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Per-question table */}
      {data.questions.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Question</th>
                <th className="px-3 py-2 text-left font-medium">Type</th>
                <th className="px-3 py-2 text-left font-medium">Marks</th>
                <th className="px-3 py-2 text-left font-medium">Answer Status</th>
                <th className="px-3 py-2 text-left font-medium">Reconciliation</th>
              </tr>
            </thead>
            <tbody>
              {data.questions.map((q) => (
                <tr
                  key={q.question_label}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-3 py-2 font-medium">{q.question_label}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {q.question_type}
                  </td>
                  <td className="px-3 py-2">{q.estimated_marks}</td>
                  <td className="px-3 py-2">
                    <StatusPill status={q.answer_status} />
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill status={q.reconciliation_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
