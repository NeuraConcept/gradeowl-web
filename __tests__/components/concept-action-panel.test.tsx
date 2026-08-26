import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConceptActionPanel } from "@/components/concept-action-panel";
import type { ConceptActionRecommendation } from "@/lib/api/types";

const recommendations: ConceptActionRecommendation[] = [
  {
    concept_id: "fractions-equivalent",
    concept_name: "Equivalent fractions",
    mastery_pct: 0.38,
    evidence: "Q. 6: 17 of 28 students missed the equivalent-fractions check.",
    prerequisite_trace: [
      { concept_id: "common-denominators", name: "Finding a common denominator" },
      { concept_id: "multiplication-facts", name: "Multiplication facts" },
    ],
    is_foundational: false,
    action: {
      kind: "RECHECK_QUESTION",
      title: "Recheck: Which fraction is equivalent to 3/4?",
      detail: "Use this one-question check with the 17 students who missed Q. 6.",
    },
  },
  {
    concept_id: "place-value",
    concept_name: "Place value",
    mastery_pct: 0.46,
    evidence: "Q. 2: 12 of 28 students need another look.",
    prerequisite_trace: [],
    is_foundational: true,
    action: {
      kind: "SMALL_GROUP_FLAG",
      title: "Flag a small group for place-value practice",
      detail: "Pull the 12 students for a ten-minute place-value repair task.",
    },
  },
];

describe("ConceptActionPanel", () => {
  it("turns a weak concept and two-hop root cause into an approvable recheck", () => {
    render(<ConceptActionPanel recommendations={recommendations} source="fixture" />);

    expect(screen.getAllByText("Equivalent fractions").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Multiplication facts").length).toBeGreaterThan(0);
    expect(screen.getByText("Recheck: Which fraction is equivalent to 3/4?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Approve recheck" }));
    expect(screen.getByText("Approved for this review")).toBeInTheDocument();
  });

  it("explains that a weak foundational concept has no upstream gap", () => {
    render(<ConceptActionPanel recommendations={recommendations} source="fixture" />);

    expect(
      screen.getByText("This is a foundational concept — no upstream gap."),
    ).toBeInTheDocument();
  });
});
