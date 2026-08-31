import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { ExamActivity } from "@/lib/api/types";

export function useExamActivity(examId: number) {
  return useQuery<ExamActivity[]>({
    queryKey: ["activity", examId],
    queryFn: () => apiClient.get<ExamActivity[]>(`/exams/${examId}/activity?limit=50`),
    enabled: !!examId,
  });
}
