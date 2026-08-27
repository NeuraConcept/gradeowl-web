import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { ConceptSummaryResponse } from "@/lib/api/types";

/** Reads only the backend's derived, exam-level concept summary through the auth proxy. */
export function useConceptActions(examId: number) {
  return useQuery<ConceptSummaryResponse>({
    queryKey: ["concept-actions", examId],
    queryFn: () => apiClient.get<ConceptSummaryResponse>(`/exams/${examId}/concept-summary`),
    enabled: examId > 0,
  });
}
