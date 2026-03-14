"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/lib/api/hooks/use-exams";

export default function ExamDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: exam } = useExam(parseInt(id, 10));

  useEffect(() => {
    if (!exam) return;
    const stepMap: Record<string, string> = {
      DRAFT: "upload",
      RUBRIC_REVIEW: "rubric",
      GRADING: "grading",
      GRADING_FAILED: "grading",
      CLUSTERING: "review",
      COMPLETE: "results",
    };
    const step = stepMap[exam.status] || "upload";
    router.replace(`/exams/${id}/${step}`);
  }, [exam, id, router]);

  return null;
}
