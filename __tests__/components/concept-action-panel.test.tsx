import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConceptActionPanel } from "@/components/concept-action-panel";
import type { ConceptMasterySummary } from "@/lib/api/types";

const concepts: ConceptMasterySummary[] = [
  {
    concept_id: 91,
    name: "Comparing quantities",
    pct_correct: 0.35,
    student_count: 1,
  },
];

describe("ConceptActionPanel", () => {
  it("turns an actual weak class concept into a transparent teacher next step", () => {
    render(<ConceptActionPanel concepts={concepts} />);

    expect(screen.getByText("Comparing quantities")).toBeInTheDocument();
    expect(screen.getByText("35% correct")).toBeInTheDocument();
    expect(screen.getByText("Based on 1 graded student.")).toBeInTheDocument();
    expect(screen.getByText(/revisit Comparing quantities/i)).toBeInTheDocument();
  });

  it("makes an absent concept summary explicit instead of filling it with sample recommendations", () => {
    render(<ConceptActionPanel concepts={[]} />);

    expect(
      screen.getByText(/No confirmed question-to-concept tags are available/i),
    ).toBeInTheDocument();
  });

  it("reports an unavailable backend diagnosis instead of showing stale local data", () => {
    render(<ConceptActionPanel concepts={[]} error />);

    expect(screen.getByText(/Concept diagnosis could not be loaded/i)).toBeInTheDocument();
  });
});
