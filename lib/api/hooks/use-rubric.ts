import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Rubric, RubricUpdate } from "@/lib/api/types";

export function useRubric(examId: number) {
  return useQuery({
    queryKey: ["rubric", examId],
    queryFn: () => apiClient.get<Rubric[]>(`/exams/${examId}/rubric`),
    enabled: !!examId,
  });
}

export function useGenerateRubric(examId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.post<Rubric[]>(`/exams/${examId}/rubric/generate`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["rubric", examId] }),
  });
}

export function useSaveRubric(examId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rubrics: RubricUpdate[]) =>
      apiClient.put(`/exams/${examId}/rubric`, rubrics),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rubric", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
    },
  });
}

export function useApproveRubric(examId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(`/exams/${examId}/rubric/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rubric", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
    },
  });
}
