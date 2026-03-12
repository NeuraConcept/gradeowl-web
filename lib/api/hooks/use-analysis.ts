import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { AnalysisProgress } from "@/lib/api/types";

export function useAnalysisProgress(examId: number, enabled = true) {
  return useQuery({
    queryKey: ["analysis-progress", examId],
    queryFn: () =>
      apiClient.get<AnalysisProgress>(`/exams/${examId}/analysis-progress`),
    enabled: !!examId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const isActive =
        data.answers_analyzing > 0 || data.reconciliation_analyzing > 0;
      return isActive ? 2000 : false;
    },
  });
}

export function useAnalyzeQP(examId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(`/exams/${examId}/analyze-qp`),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["analysis-progress", examId],
      }),
  });
}

export function useCancelAnalysis(examId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(`/exams/${examId}/cancel-analysis`),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["analysis-progress", examId],
      }),
  });
}

export function useRetryAnalysis(examId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(`/exams/${examId}/retry-analysis`),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["analysis-progress", examId],
      }),
  });
}
