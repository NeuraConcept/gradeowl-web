"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Play, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { useGradingProgress, useStartGrading, useRetryGrading } from "@/lib/api/hooks/use-grading";
import { ApiError } from "@/lib/api/client";

export default function GradingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const examId = parseInt(id, 10);
  const router = useRouter();

  const { data: progress, isLoading } = useGradingProgress(examId);
  const startGrading = useStartGrading(examId);
  const retryGrading = useRetryGrading(examId);

  // Auto-navigate to review when clustering starts
  useEffect(() => {
    if (progress?.exam_status === "CLUSTERING") {
      router.push(`/exams/${id}/review`);
    }
  }, [progress?.exam_status, id, router]);

  const handleStartGrading = async () => {
    try {
      await startGrading.mutateAsync();
      toast.success("Grading started");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.info("Grading is already in progress");
      } else {
        toast.error("Failed to start grading");
      }
    }
  };

  const handleRetryGrading = async () => {
    try {
      await retryGrading.mutateAsync();
      toast.success("Retrying failed submissions");
    } catch {
      toast.error("Failed to retry grading");
    }
  };

  const pct = progress?.progress_pct ?? 0;
  const isGrading = progress?.exam_status === "GRADING";
  const hasFailed = (progress?.failed ?? 0) > 0;

  const stats = progress
    ? [
        { label: "Total", value: progress.total_pages },
        { label: "Done", value: progress.done },
        { label: "In Progress", value: progress.in_progress },
        { label: "Failed", value: progress.failed },
        { label: "Queued", value: progress.queued },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Grading Progress</h2>
        <div className="flex gap-2">
          {!isGrading && (
            <Button
              onClick={handleStartGrading}
              disabled={startGrading.isPending}
            >
              {startGrading.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Start Grading
            </Button>
          )}
          {hasFailed && (
            <Button
              variant="outline"
              onClick={handleRetryGrading}
              disabled={retryGrading.isPending}
            >
              {retryGrading.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Retry Failed
            </Button>
          )}
        </div>
      </div>

      {/* Progress card */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-1">
            <Progress value={pct}>
              <ProgressLabel>
                {isGrading ? "Grading in progress..." : "Grading progress"}
              </ProgressLabel>
              <ProgressValue>{() => `${pct.toFixed(0)}%`}</ProgressValue>
            </Progress>
          </div>

          {/* Stats grid */}
          {stats.length > 0 && (
            <div className="grid grid-cols-5 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border bg-muted/40 p-3 text-center"
                >
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Status message */}
          {!progress && (
            <p className="text-center text-sm text-muted-foreground">
              No grading data yet. Click &quot;Start Grading&quot; to begin.
            </p>
          )}

          {isGrading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Auto-refreshing every 3 seconds...
            </div>
          )}

          {progress?.exam_status === "GRADING_FAILED" && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Grading failed. Use &quot;Retry Failed&quot; to resume.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
