export interface ConceptGraphNode {
  id: string;
  name: string;
}

export interface ConceptPrerequisiteEdge {
  /** The dependent concept. */
  from_id: string;
  /** The prerequisite concept. */
  to_id: string;
  confidence?: number;
}

export interface PrerequisiteTrace {
  nodes: ConceptGraphNode[];
  root_cause: ConceptGraphNode | null;
  is_foundational: boolean;
  cycle_detected: boolean;
}

/**
 * Finds at most two prerequisite hops from a weak concept. The curriculum graph
 * is not a DAG, so every traversal keeps a visited set and skips dangling edges.
 * `from_id` is the dependent and `to_id` is its prerequisite.
 */
export function tracePrerequisiteRootCause(
  conceptId: string,
  concepts: ConceptGraphNode[],
  edges: ConceptPrerequisiteEdge[],
): PrerequisiteTrace {
  const conceptsById = new Map(concepts.map((concept) => [concept.id, concept]));
  const visited = new Set([conceptId]);
  const nodes: ConceptGraphNode[] = [];
  let currentId = conceptId;
  let cycleDetected = false;

  for (let hop = 0; hop < 2; hop += 1) {
    const candidates = edges
      .filter((edge) => edge.from_id === currentId && conceptsById.has(edge.to_id))
      .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));

    const next = candidates.find((edge) => {
      if (visited.has(edge.to_id)) {
        cycleDetected = true;
        return false;
      }
      return true;
    });

    if (!next) break;

    const prerequisite = conceptsById.get(next.to_id);
    if (!prerequisite) break;
    nodes.push(prerequisite);
    visited.add(prerequisite.id);
    currentId = prerequisite.id;
  }

  return {
    nodes,
    root_cause: nodes.at(-1) ?? null,
    is_foundational: nodes.length === 0 && !cycleDetected,
    cycle_detected: cycleDetected,
  };
}
