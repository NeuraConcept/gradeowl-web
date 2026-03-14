import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { SubmissionSummary, SubmissionDetail } from "@/lib/api/types";

export function useSubmissions(examId: number) {
  return useQuery({
    queryKey: ["submissions", examId],
    queryFn: () =>
      apiClient.get<SubmissionSummary[]>(`/exams/${examId}/submissions`),
    enabled: !!examId,
  });
}

export function useSubmission(submissionId: number) {
  return useQuery({
    queryKey: ["submission", submissionId],
    queryFn: () =>
      apiClient.get<SubmissionDetail>(`/submissions/${submissionId}`),
    enabled: !!submissionId,
  });
}

export function useUploadSubmissions(examId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient.upload(`/exams/${examId}/submissions`, formData),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["submissions", examId] }),
  });
}
