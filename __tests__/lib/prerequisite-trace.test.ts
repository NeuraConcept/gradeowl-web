import { describe, expect, it } from "vitest";
import { tracePrerequisiteRootCause } from "@/lib/concepts/prerequisite-trace";

const concepts = [
  { id: "fractions", name: "Equivalent fractions" },
  { id: "denominators", name: "Finding a common denominator" },
  { id: "multiplication", name: "Multiplication facts" },
  { id: "place-value", name: "Place value" },
];

describe("tracePrerequisiteRootCause", () => {
  it("follows dependent-to-prerequisite edges for at most two hops", () => {
    const trace = tracePrerequisiteRootCause("fractions", concepts, [
      { from_id: "fractions", to_id: "denominators", confidence: 0.7 },
      { from_id: "denominators", to_id: "multiplication", confidence: 0.9 },
    ]);

    expect(trace.nodes.map((node) => node.id)).toEqual(["denominators", "multiplication"]);
    expect(trace.root_cause?.id).toBe("multiplication");
    expect(trace.is_foundational).toBe(false);
  });

  it("does not loop when a prerequisite cycle points back to a visited concept", () => {
    const trace = tracePrerequisiteRootCause("fractions", concepts, [
      { from_id: "fractions", to_id: "denominators", confidence: 0.7 },
      { from_id: "denominators", to_id: "fractions", confidence: 0.9 },
      { from_id: "denominators", to_id: "multiplication", confidence: 0.6 },
    ]);

    expect(trace.nodes.map((node) => node.id)).toEqual(["denominators", "multiplication"]);
    expect(trace.cycle_detected).toBe(true);
  });

  it("marks a concept with no valid prerequisite as foundational", () => {
    const trace = tracePrerequisiteRootCause("place-value", concepts, [
      { from_id: "fractions", to_id: "missing", confidence: 1 },
    ]);

    expect(trace.nodes).toEqual([]);
    expect(trace.is_foundational).toBe(true);
  });
});
