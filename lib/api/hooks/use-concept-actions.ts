import { useQuery } from "@tanstack/react-query";
import { conceptActionFixture } from "@/lib/concepts/fixture";
import type { ConceptActionData } from "@/lib/api/types";

/**
 * Fixture-backed until the Task 6-8 mastery routes publish their final response
 * contract. Swap only this query function for the proxy-backed API request.
 */
export function useConceptActions(examId: number) {
  return useQuery<ConceptActionData>({
    queryKey: ["concept-actions", examId],
    queryFn: async () => conceptActionFixture,
    enabled: examId > 0,
  });
}
