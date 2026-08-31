import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { StudentMasteryResponse } from "@/lib/api/types";

/** Reads the selected student's backend-derived mastery and prerequisite trace. */
export function useStudentMastery(studentId: number | null) {
  return useQuery<StudentMasteryResponse>({
    queryKey: ["student-mastery", studentId],
    queryFn: () => apiClient.get<StudentMasteryResponse>(`/students/${studentId}/mastery`),
    enabled: studentId !== null && studentId > 0,
  });
}
