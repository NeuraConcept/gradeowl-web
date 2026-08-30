"use client";

import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConceptMasterySummary } from "@/lib/api/types";

function masteryLabel(masteryPct: number) {
  return `${Math.round(masteryPct * 100)}% correct`;
}

export function ConceptActionPanel({
  concepts,
  error = false,
}: {
  concepts: ConceptMasterySummary[];
  error?: boolean;
}) {
  if (error) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Concept diagnosis could not be loaded. Please try again before presenting this step.
      </div>
    );
  }

  if (concepts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No confirmed question-to-concept tags are available for this exam yet. Confirm tags and graded results to see a class concept diagnosis.
      </div>
    );
  }

  const weakConcepts = concepts.filter((concept) => concept.pct_correct < 0.6);
  if (weakConcepts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No class concepts are below 60% correct in the confirmed, graded evidence for this exam.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {weakConcepts.map((concept) => {
        const studentLabel = concept.student_count === 1 ? "student" : "students";
        return (
          <Card key={concept.concept_id}>
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Weak concept</p>
                  <CardTitle>{concept.name}</CardTitle>
                </div>
                <Badge variant="destructive">{masteryLabel(concept.pct_correct)}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {concept.student_count} graded {studentLabel}.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2.5 rounded-lg border border-coral/30 bg-soft-pink/20 p-3">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden="true" />
                <div className="flex gap-2.5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Next step</p>
                    <p className="font-medium">Revisit {concept.name} with a short repair check.</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      No prerequisite root cause identified at this class level.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
