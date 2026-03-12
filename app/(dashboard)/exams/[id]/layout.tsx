"use client";

import { use } from "react";
import { useExam } from "@/lib/api/hooks/use-exams";
import { useAnalysisProgress } from "@/lib/api/hooks/use-analysis";
import { useRubric } from "@/lib/api/hooks/use-rubric";
import { useSubmissions } from "@/lib/api/hooks/use-submissions";
import { ExamStepper } from "@/components/exam-stepper";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const examId = parseInt(id, 10);
  const { data: exam, isLoading } = useExam(examId);
  const { data: analysis } = useAnalysisProgress(examId);
  const { data: rubrics } = useRubric(examId);
  const { data: submissions } = useSubmissions(examId);

  const analysisComplete = analysis
    ? analysis.answers_done === analysis.total_questions &&
      analysis.total_questions > 0
    : false;
  const rubricApproved = rubrics
    ? rubrics.every((r) => r.teacher_approved) && rubrics.length > 0
    : false;
  const hasSubmissions = (submissions?.length ?? 0) > 0;

  if (isLoading) return <Skeleton className="h-48" />;
  if (!exam) return <div>Exam not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{exam.title}</h1>
          <p className="text-sm text-muted-foreground">
            {exam.class_name} &middot; {exam.subject} &middot;{" "}
            {exam.total_marks} marks
          </p>
        </div>
        <StatusBadge status={exam.status} />
      </div>

      <ExamStepper
        examId={examId}
        examStatus={exam.status}
        analysisComplete={analysisComplete}
        rubricApproved={rubricApproved}
        hasSubmissions={hasSubmissions}
      />

      {children}
    </div>
  );
}
