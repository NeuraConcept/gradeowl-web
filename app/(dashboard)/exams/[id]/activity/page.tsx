"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { History, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useExamActivity } from "@/lib/api/hooks/use-activity";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { ExamActivity } from "@/lib/api/types";

type ActivityTone = "success" | "warning" | "danger" | "default";

const toneDot: Record<ActivityTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-red-500",
  default: "bg-coral",
};

const toneBadgeText: Record<ActivityTone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-red-600",
  default: "text-coral",
};

function activityTone(action: string): ActivityTone {
  const verb = action.split(".").pop() ?? "";
  if (verb === "approved" || verb === "finalized") return "success";
  if (verb === "started" || verb === "retried") return "warning";
  if (verb === "cancelled" || verb === "failed") return "danger";
  return "default";
}

function humanizeAction(action: string): string {
  const words = action.split(".").join(" ").split("_").join(" ").trim().split(/\s+/);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function ExamActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const examId = parseInt(id, 10);
  const router = useRouter();

  if (isNaN(examId)) {
    router.replace("/exams");
    return null;
  }

  return <ExamActivityPageContent examId={examId} />;
}

function ExamActivityPageContent({ examId }: { examId: number }) {
  const { data: activities, isLoading, isError, refetch } = useExamActivity(examId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Activity</h2>
        <p className="text-sm text-muted-foreground">
          Who did what on this exam, newest first.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="space-y-5 py-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex gap-3">
                <Skeleton className="mt-1 size-3.5 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-1/3 rounded" />
                  <Skeleton className="h-3 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-10 text-center">
          <RefreshCw className="h-8 w-8 text-destructive/70" />
          <div>
            <p className="text-sm font-medium">Unable to load exam activity.</p>
            <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ) : !activities || activities.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-10 text-center">
          <History className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">No activity yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Uploads, rubric approvals, grading, and score adjustments on this
            exam will show up here as they happen.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="py-2">
            <ol className="relative">
              {activities.map((activity: ExamActivity, idx: number) => {
                const tone = activityTone(activity.action);
                const isLast = idx === activities.length - 1;
                return (
                  <li key={activity.id} className={cn("relative flex gap-3", !isLast && "pb-5")}>
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className="absolute top-4 left-[6.5px] h-[calc(100%-0.5rem)] w-px bg-border"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "relative z-10 mt-1 size-3.5 shrink-0 rounded-full border-2 border-card",
                        toneDot[tone],
                      )}
                    />
                    <div className="min-w-0 flex-1 pb-0.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="text-sm">
                          <span className="font-semibold">{activity.actor_name}</span>
                          <span className={cn("ml-1.5 font-medium", toneBadgeText[tone])}>
                            {humanizeAction(activity.action)}
                          </span>
                        </p>
                        <time
                          dateTime={activity.created_at}
                          title={new Date(activity.created_at).toLocaleString()}
                          className="shrink-0 text-xs text-muted-foreground"
                        >
                          {formatRelativeTime(activity.created_at)}
                        </time>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{activity.summary}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
