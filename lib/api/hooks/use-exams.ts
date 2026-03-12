import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type {
  Exam,
  CreateExamRequest,
  UpdateExamRequest,
} from "@/lib/api/types";

export function useExams() {
  return useQuery({
    queryKey: ["exams"],
    queryFn: () => apiClient.get<Exam[]>("/exams"),
  });
}

export function useExam(id: number) {
  return useQuery({
    queryKey: ["exam", id],
    queryFn: () => apiClient.get<Exam>(`/exams/${id}`),
    enabled: !!id,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamRequest) =>
      apiClient.post<Exam>("/exams", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
}

export function useUpdateExam(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateExamRequest) =>
      apiClient.put<Exam>(`/exams/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam", id] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/exams/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
}
