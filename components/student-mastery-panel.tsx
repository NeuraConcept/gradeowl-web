import { ArrowRight, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentConceptMastery } from "@/lib/api/types";

function masteryLabel(masteryPct: number) {
  return `${Math.round(masteryPct * 100)}% correct`;
}

export function StudentMasteryPanel({ concepts }: { concepts: StudentConceptMastery[] }) {
  if (concepts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No derived concept mastery is available for this student yet. Confirm question tags and grading results first.
      </p>
    );
  }

  const weakConcepts = concepts.filter((concept) => concept.pct_correct < 0.6);
  if (weakConcepts.length === 0) {
    return <p className="text-sm text-muted-foreground">No derived weak concepts are below 60% correct.</p>;
  }

  return (
    <div className="space-y-3">
      {weakConcepts.map((concept) => {
        const rootCause = concept.root_cause?.at(-1);
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
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-muted/35 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <GitBranch className="size-3.5" aria-hidden="true" />
                  Prerequisite trace
                </div>
                {concept.root_cause?.length ? (
                  <>
                    <div className="flex flex-wrap items-center gap-1.5 text-sm">
                      <span className="font-medium">{concept.name}</span>
                      {concept.root_cause.map((node) => (
                        <span key={node.concept_id} className="flex items-center gap-1.5">
                          <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                          <span>{node.name}</span>
                        </span>
                      ))}
                    </div>
                    {rootCause ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Upstream prerequisite: <span className="font-medium text-foreground">{rootCause.name}</span>
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    The backend returned no prerequisite edge for this concept.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
