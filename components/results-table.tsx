"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScoreCell } from "@/components/score-cell";
import { cn } from "@/lib/utils";
import type { StudentResult, ResultsSummary, SubmissionStatus } from "@/lib/api/types";

const submissionStatusConfig: Record<SubmissionStatus, { label: string; className: string }> = {
  UPLOADED: { label: "Uploaded", className: "bg-gray-100 text-gray-600" },
  PROCESSING: { label: "Processing", className: "bg-warm-yellow text-warning" },
  GRADED: { label: "Graded", className: "bg-green-100 text-success" },
  REVIEWED: { label: "Reviewed", className: "bg-soft-pink/30 text-coral" },
};

function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const config = submissionStatusConfig[status];
  return (
    <Badge className={cn("font-semibold", config.className)}>{config.label}</Badge>
  );
}

interface ResultsTableProps {
  results: StudentResult[];
  summary: ResultsSummary;
  onRowClick: (result: StudentResult) => void;
}

type SortKey = "student_identifier" | "total_score" | "status";
type SortDir = "asc" | "desc";

export function ResultsTable({ results, summary, onRowClick }: ResultsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("student_identifier");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...results].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "student_identifier") {
      cmp = a.student_identifier.localeCompare(b.student_identifier);
    } else if (sortKey === "total_score") {
      cmp = a.total_score - b.total_score;
    } else if (sortKey === "status") {
      cmp = a.status.localeCompare(b.status);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  // Derive question numbers from first result
  const questionNums =
    results.length > 0
      ? results[0].questions.map((q) => q.question_number)
      : [];

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="h-3 w-3 ml-0.5 text-muted-foreground/60" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 ml-0.5" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-0.5" />
    );
  };

  // Stat card color
  const pctColor = (score: number, max: number) => {
    const pct = max > 0 ? score / max : 0;
    if (pct > 0.8) return "text-success";
    if (pct >= 0.4) return "text-warning";
    return "text-coral";
  };

  return (
    <div className="space-y-4">
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card size="sm">
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold">{summary.total_students}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground">Average Score</p>
            <p className={cn("text-2xl font-bold", pctColor(summary.avg_score, results[0]?.max_possible ?? 100))}>
              {summary.avg_score.toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground">Highest Score</p>
            <p className="text-2xl font-bold text-success">{summary.max_score}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground">Lowest Score</p>
            <p className="text-2xl font-bold text-coral">{summary.min_score}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  className="flex items-center text-xs font-medium hover:text-foreground"
                  onClick={() => handleSort("student_identifier")}
                >
                  Student <SortIcon col="student_identifier" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center text-xs font-medium hover:text-foreground"
                  onClick={() => handleSort("total_score")}
                >
                  Total <SortIcon col="total_score" />
                </button>
              </TableHead>
              {questionNums.map((qn) => (
                <TableHead key={qn} className="text-xs">
                  Q{qn}
                </TableHead>
              ))}
              <TableHead>
                <button
                  className="flex items-center text-xs font-medium hover:text-foreground"
                  onClick={() => handleSort("status")}
                >
                  Status <SortIcon col="status" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((result) => (
              <TableRow
                key={result.student_identifier}
                className="cursor-pointer"
                onClick={() => onRowClick(result)}
              >
                <TableCell className="font-medium text-sm">
                  {result.student_identifier}
                </TableCell>
                <TableCell>
                  <ScoreCell score={result.total_score} maxScore={result.max_possible} />
                </TableCell>
                {result.questions.map((q) => (
                  <TableCell key={q.question_number}>
                    <ScoreCell score={q.effective_score} maxScore={q.max_score} />
                  </TableCell>
                ))}
                <TableCell>
                  <SubmissionStatusBadge status={result.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
