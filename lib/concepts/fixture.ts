import type { ConceptActionData, ConceptActionRecommendation } from "@/lib/api/types";
import { tracePrerequisiteRootCause, type ConceptGraphNode } from "@/lib/concepts/prerequisite-trace";

const concepts: ConceptGraphNode[] = [
  { id: "equivalent-fractions", name: "Equivalent fractions" },
  { id: "common-denominators", name: "Finding a common denominator" },
  { id: "multiplication-facts", name: "Multiplication facts" },
  { id: "place-value", name: "Place value" },
];

const prerequisiteEdges = [
  { from_id: "equivalent-fractions", to_id: "common-denominators", confidence: 0.92 },
  { from_id: "common-denominators", to_id: "multiplication-facts", confidence: 0.89 },
  // A real graph can contain cycles; this edge demonstrates that the trace helper ignores a visited node.
  { from_id: "common-denominators", to_id: "equivalent-fractions", confidence: 0.55 },
];

function makeRecommendation(
  conceptId: string,
  masteryPct: number,
  evidence: string,
  action: ConceptActionRecommendation["action"],
): ConceptActionRecommendation {
  const concept = concepts.find((candidate) => candidate.id === conceptId);
  if (!concept) throw new Error(`Fixture concept not found: ${conceptId}`);

  const trace = tracePrerequisiteRootCause(conceptId, concepts, prerequisiteEdges);
  return {
    concept_id: concept.id,
    concept_name: concept.name,
    mastery_pct: masteryPct,
    evidence,
    prerequisite_trace: trace.nodes.map((node) => ({ concept_id: node.id, name: node.name })),
    is_foundational: trace.is_foundational,
    action,
  };
}

/**
 * TEMPORARY FIXTURE ADAPTER: replace this source with the Task 6-8 API response
 * when it is available. Keeping the shape here lets the UI be exercised without
 * inventing an endpoint contract while backend work is concurrent.
 */
export const conceptActionFixture: ConceptActionData = {
  source: "fixture",
  recommendations: [
    makeRecommendation(
      "equivalent-fractions",
      0.38,
      "Q. 6: 17 of 28 students missed the equivalent-fractions check.",
      {
        kind: "RECHECK_QUESTION",
        title: "Recheck: Which fraction is equivalent to 3/4?",
        detail: "Use this one-question check with the 17 students who missed Q. 6.",
      },
    ),
    makeRecommendation(
      "place-value",
      0.46,
      "Q. 2: 12 of 28 students need another look at digit values.",
      {
        kind: "SMALL_GROUP_FLAG",
        title: "Flag a small group for place-value practice",
        detail: "Pull the 12 students for a ten-minute place-value repair task.",
      },
    ),
  ],
};
