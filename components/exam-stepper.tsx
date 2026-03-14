"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ExamStatus } from "@/lib/api/types";

const steps = [
  { label: "Upload", path: "upload" },
  { label: "Rubric", path: "rubric" },
  { label: "Submissions", path: "submissions" },
  { label: "Grading", path: "grading" },
  { label: "Review", path: "review" },
  { label: "Results", path: "results" },
];

function getStepState(
  stepIndex: number,
  examStatus: ExamStatus,
  analysisComplete: boolean,
  rubricApproved: boolean,
  hasSubmissions: boolean,
): "done" | "active" | "locked" {
  if (stepIndex === 0) return analysisComplete ? "done" : "active";
  if (!analysisComplete) return "locked";
  if (stepIndex === 1) return rubricApproved ? "done" : "active";
  if (stepIndex === 2) {
    if (!rubricApproved) return "locked";
    return hasSubmissions ? "done" : "active";
  }
  if (stepIndex === 3) {
    if (!rubricApproved || !hasSubmissions) return "locked";
    if (["CLUSTERING", "COMPLETE"].includes(examStatus)) return "done";
    if (["GRADING", "GRADING_FAILED"].includes(examStatus)) return "active";
    return "active";
  }
  if (stepIndex === 4) {
    if (!["CLUSTERING", "COMPLETE"].includes(examStatus)) return "locked";
    return examStatus === "COMPLETE" ? "done" : "active";
  }
  if (stepIndex === 5) {
    if (!["CLUSTERING", "COMPLETE"].includes(examStatus)) return "locked";
    return examStatus === "COMPLETE" ? "done" : "active";
  }
  return "locked";
}

interface ExamStepperProps {
  examId: number;
  examStatus: ExamStatus;
  analysisComplete: boolean;
  rubricApproved: boolean;
  hasSubmissions: boolean;
}

export function ExamStepper({
  examId,
  examStatus,
  analysisComplete,
  rubricApproved,
  hasSubmissions,
}: ExamStepperProps) {
  const pathname = usePathname();

  return (
    <div className="flex gap-2">
      {steps.map((step, i) => {
        const state = getStepState(
          i,
          examStatus,
          analysisComplete,
          rubricApproved,
          hasSubmissions,
        );
        const isCurrentPath = pathname.endsWith(`/${step.path}`);

        return (
          <Link
            key={step.path}
            href={
              state === "locked" ? "#" : `/exams/${examId}/${step.path}`
            }
            className={cn(
              "flex flex-1 flex-col items-center rounded-lg border-2 p-3 text-center transition-colors",
              state === "done" && "border-success bg-green-50",
              state === "active" && "border-coral bg-soft-pink/20",
              state === "locked" &&
                "cursor-not-allowed border-border bg-card opacity-50",
              isCurrentPath &&
                state !== "locked" &&
                "ring-2 ring-coral ring-offset-2",
            )}
            onClick={(e) => state === "locked" && e.preventDefault()}
          >
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wide",
                state === "done" && "text-success",
                state === "active" && "text-coral",
                state === "locked" && "text-muted-foreground",
              )}
            >
              Step {i + 1}
            </span>
            <span
              className={cn(
                "mt-1 text-xs font-semibold",
                state === "done" && "text-success",
                state === "active" && "text-coral",
                state === "locked" && "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
