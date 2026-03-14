import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type {
  ResultsResponse,
  AnalyticsResponse,
  AnnotatedPage,
} from "@/lib/api/types";

export function useResults(examId: number) {
  return useQuery({
    queryKey: ["results", examId],
    queryFn: () => apiClient.get<ResultsResponse>(`/exams/${examId}/results`),
    enabled: !!examId,
  });
}

export function useAnalytics(examId: number) {
  return useQuery({
    queryKey: ["analytics", examId],
    queryFn: () =>
      apiClient.get<AnalyticsResponse>(`/exams/${examId}/analytics`),
    enabled: !!examId,
  });
}

export function useAnnotatedPages(submissionId: number) {
  return useQuery({
    queryKey: ["annotated-pages", submissionId],
    queryFn: () =>
      apiClient.get<AnnotatedPage[]>(`/submissions/${submissionId}/annotated`),
    enabled: !!submissionId,
  });
}

export function useFinalizeExam(examId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(`/exams/${examId}/finalize`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      queryClient.invalidateQueries({ queryKey: ["results", examId] });
    },
  });
}

export async function exportCSV(examId: number) {
  const res = await fetch(`/api/proxy/exams/${examId}/results/export`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `exam-${examId}-results.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
