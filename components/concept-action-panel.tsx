"use client";

import { useState } from "react";
import { ArrowRight, Check, GitBranch, Lightbulb, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConceptActionData, ConceptActionKind } from "@/lib/api/types";

const actionButtonLabel: Record<ConceptActionKind, string> = {
  REPAIR_TASK: "Approve repair task",
  RECHECK_QUESTION: "Approve recheck",
  SMALL_GROUP_FLAG: "Approve small-group flag",
};

function masteryLabel(masteryPct: number) {
  return `${Math.round(masteryPct * 100)}% correct`;
}

export function ConceptActionPanel({
  recommendations,
  source,
}: Pick<ConceptActionData, "recommendations" | "source">) {
  const [approvedConcepts, setApprovedConcepts] = useState<Set<string>>(new Set());

  if (recommendations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No concept evidence is available yet. Confirm question concepts and grading results to generate a repair action.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {source === "fixture" && (
        <div className="rounded-lg border border-warm-yellow bg-warm-yellow/45 px-3 py-2 text-xs text-muted-foreground">
          Fixture preview — displayed evidence and approvals are local while the concept/mastery API is being completed.
        </div>
      )}

      {recommendations.map((recommendation) => {
        const approved = approvedConcepts.has(recommendation.concept_id);
        const rootCause = recommendation.prerequisite_trace.at(-1);
        return (
          <Card key={recommendation.concept_id}>
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Weak concept</p>
                  <CardTitle>{recommendation.concept_name}</CardTitle>
                </div>
                <Badge variant="destructive">{masteryLabel(recommendation.mastery_pct)}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{recommendation.evidence}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/35 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <GitBranch className="size-3.5" />
                  Prerequisite trace
                </div>
                {recommendation.is_foundational ? (
                  <p className="text-sm">This is a foundational concept — no upstream gap.</p>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-1.5 text-sm">
                      <span className="font-medium">{recommendation.concept_name}</span>
                      {recommendation.prerequisite_trace.map((node) => (
                        <span key={node.concept_id} className="flex items-center gap-1.5">
                          <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                          <span>{node.name}</span>
                        </span>
                      ))}
                    </div>
                    {rootCause && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Likely root cause: <span className="font-medium text-foreground">{rootCause.name}</span>
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-coral/30 bg-soft-pink/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2.5">
                  {recommendation.action.kind === "SMALL_GROUP_FLAG" ? (
                    <Users className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden="true" />
                  ) : (
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden="true" />
                  )}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Next step</p>
                    <p className="font-medium">{recommendation.action.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{recommendation.action.detail}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={approved ? "secondary" : "default"}
                  disabled={approved}
                  onClick={() =>
                    setApprovedConcepts((current) => new Set(current).add(recommendation.concept_id))
                  }
                >
                  {approved ? <Check className="size-3.5" /> : null}
                  {approved ? "Approved for this review" : actionButtonLabel[recommendation.action.kind]}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
