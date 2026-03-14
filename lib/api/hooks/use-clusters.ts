import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { ClusterResponse } from "@/lib/api/types";

export function useClusters(examId: number, question: number) {
  return useQuery({
    queryKey: ["clusters", examId, question],
    queryFn: () =>
      apiClient.get<ClusterResponse>(
        `/exams/${examId}/clusters?question=${question}`,
      ),
    enabled: !!examId && !!question,
  });
}

export function useApproveCluster(examId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clusterId, score }: { clusterId: number; score?: number }) =>
      apiClient.put(
        `/clusters/${clusterId}/approve`,
        score !== undefined ? { score_adjust: score } : undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters", examId] });
      queryClient.invalidateQueries({ queryKey: ["results", examId] });
    },
  });
}

export function useAdjustResult(examId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      resultId,
      score,
      notes,
    }: {
      resultId: number;
      score: number;
      notes?: string;
    }) =>
      apiClient.put(`/grading-results/${resultId}/adjust`, {
        teacher_adjusted_score: score,
        teacher_notes: notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters", examId] });
      queryClient.invalidateQueries({ queryKey: ["results", examId] });
    },
  });
}
