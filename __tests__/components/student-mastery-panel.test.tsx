import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudentMasteryPanel } from "@/components/student-mastery-panel";
import type { StudentConceptMastery } from "@/lib/api/types";

const concepts: StudentConceptMastery[] = [
  {
    concept_id: 91,
    name: "Comparing quantities",
    pct_correct: 0.35,
    root_cause: [
      { concept_id: 44, name: "Ratio as comparison", hop: 1, confidence: 0.93 },
    ],
  },
  {
    concept_id: 92,
    name: "Plane Surface",
    pct_correct: 0.4,
  },
];

describe("StudentMasteryPanel", () => {
  it("shows the selected student's derived weak concept and backend prerequisite trace", () => {
    render(<StudentMasteryPanel concepts={concepts} />);

    expect(screen.getAllByText("Comparing quantities")).toHaveLength(2);
    expect(screen.getByText("35% correct")).toBeInTheDocument();
    expect(screen.getAllByText("Ratio as comparison")).toHaveLength(2);
  });

  it("uses plain language when no prerequisite root cause is identified", () => {
    render(<StudentMasteryPanel concepts={concepts} />);

    expect(screen.getByText("No prerequisite root cause identified for this concept.")).toBeInTheDocument();
    expect(screen.queryByText(/backend|endpoint|null|api|edge|node|payload|query/i)).not.toBeInTheDocument();
  });

  it("states when the backend has no derived mastery rather than using a sample student", () => {
    render(<StudentMasteryPanel concepts={[]} />);

    expect(screen.getByText(/No derived concept mastery is available/i)).toBeInTheDocument();
  });
});
