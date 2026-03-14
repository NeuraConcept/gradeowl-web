import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { QuestionPaperPage, AnswerKeyPage } from "@/lib/api/types";

export function useQuestionPaper(examId: number) {
  return useQuery({
    queryKey: ["question-paper", examId],
    queryFn: () =>
      apiClient.get<QuestionPaperPage[]>(`/exams/${examId}/question-paper`),
    enabled: !!examId,
  });
}

export function useAnswerKey(examId: number) {
  return useQuery({
    queryKey: ["answer-key", examId],
    queryFn: () =>
      apiClient.get<AnswerKeyPage[]>(`/exams/${examId}/answer-key`),
    enabled: !!examId,
  });
}

export function useUploadQP(examId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient.upload(`/exams/${examId}/question-paper`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-paper", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
    },
  });
}

export function useUploadAK(examId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient.upload(`/exams/${examId}/answer-key`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answer-key", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
    },
  });
}
