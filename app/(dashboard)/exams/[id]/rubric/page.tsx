"use client";

import { use, useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, Save, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { RubricEditor } from "@/components/rubric-editor";
import { useRubric, useGenerateRubric, useSaveRubric, useApproveRubric } from "@/lib/api/hooks/use-rubric";
import type { RubricCriterion, RubricUpdate } from "@/lib/api/types";

export default function RubricPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const examId = parseInt(id, 10);

  const { data: rubrics, isLoading } = useRubric(examId);
  const generateRubric = useGenerateRubric(examId);
  const saveRubric = useSaveRubric(examId);
  const approveRubric = useApproveRubric(examId);

  // Track edits: Map<questionNumber, { criteria, maxMarks }>
  const [edits, setEdits] = useState<
    Map<number, { criteria: RubricCriterion[]; maxMarks: number }>
  >(new Map());
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);

  const handleChange = (
    questionNumber: number,
    criteria: RubricCriterion[],
    maxMarks: number
  ) => {
    setEdits((prev) => {
      const next = new Map(prev);
      next.set(questionNumber, { criteria, maxMarks });
      return next;
    });
  };

  const handleSave = async () => {
    if (!rubrics) return;

    // Validate marks tally
    const invalid: number[] = [];
    for (const [qNum, edit] of edits.entries()) {
      const rubric = rubrics.find((r) => r.question_number === qNum);
      if (!rubric) continue;
      const total = edit.criteria.reduce((sum, c) => sum + (c.marks || 0), 0);
      if (total !== edit.maxMarks) invalid.push(qNum);
    }

    if (invalid.length > 0) {
      toast.error(
        `Marks don't add up for question${invalid.length > 1 ? "s" : ""}: ${invalid.join(", ")}`
      );
      return;
    }

    const updates: RubricUpdate[] = Array.from(edits.entries()).map(
      ([questionNumber, { criteria, maxMarks }]) => ({
        question_number: questionNumber,
        max_marks: maxMarks,
        criteria_json: criteria,
      })
    );

    try {
      await saveRubric.mutateAsync(updates);
      toast.success("Rubric saved successfully");
      setEdits(new Map());
    } catch {
      toast.error("Failed to save rubric");
    }
  };

  const handleApproveAll = async () => {
    try {
      await approveRubric.mutateAsync();
      toast.success("All rubrics approved");
    } catch {
      toast.error("Failed to approve rubrics");
    }
  };

  const handleGenerate = () => {
    if (rubrics && rubrics.length > 0) {
      // Show confirmation if rubrics already exist
      setShowRegenerateDialog(true);
    } else {
      generateRubric.mutate(undefined, {
        onSuccess: () => toast.success("Rubric generated"),
        onError: () => toast.error("Failed to generate rubric"),
      });
    }
  };

  const confirmRegenerate = () => {
    setShowRegenerateDialog(false);
    generateRubric.mutate(undefined, {
      onSuccess: () => {
        toast.success("Rubric regenerated");
        setEdits(new Map());
      },
      onError: () => toast.error("Failed to regenerate rubric"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasRubrics = rubrics && rubrics.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Rubric Review</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generateRubric.isPending}
          >
            {generateRubric.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {hasRubrics ? "Regenerate" : "Generate"}
          </Button>
          {hasRubrics && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={saveRubric.isPending || edits.size === 0}
              >
                {saveRubric.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
              <Button
                size="sm"
                onClick={handleApproveAll}
                disabled={approveRubric.isPending}
              >
                {approveRubric.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="mr-2 h-4 w-4" />
                )}
                Approve All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Rubric cards or empty state */}
      {hasRubrics ? (
        <div className="space-y-4">
          {rubrics.map((rubric) => (
            <RubricEditor
              key={`${rubric.id}-${rubric.updated_at}`}
              rubric={rubric}
              onChange={handleChange}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">
            No rubric generated yet. Upload and analyse your question paper
            first, then click &quot;Generate&quot; to create a rubric.
          </p>
        </div>
      )}

      {/* Regenerate confirmation dialog */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Rubric?</DialogTitle>
            <DialogDescription>
              This will overwrite all existing rubric criteria and any unsaved
              edits. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmRegenerate}
              disabled={generateRubric.isPending}
            >
              {generateRubric.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
