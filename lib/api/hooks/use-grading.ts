import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { GradingProgress } from "@/lib/api/types";

export function useGradingProgress(examId: number, enabled = true) {
  return useQuery({
    queryKey: ["grading-progress", examId],
    queryFn: () =>
      apiClient.get<GradingProgress>(`/exams/${examId}/grading-progress`),
    enabled: !!examId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      return data.exam_status === "GRADING" ? 3000 : false;
    },
  });
}

export function useStartGrading(examId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(`/exams/${examId}/grade`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grading-progress", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
    },
  });
}

export function useRetryGrading(examId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(`/exams/${examId}/retry-failed`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["grading-progress", examId] }),
  });
}
