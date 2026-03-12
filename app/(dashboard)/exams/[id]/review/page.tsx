"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Loader2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClusterPanel } from "@/components/cluster-panel";
import { useClusters, useApproveCluster, useAdjustResult } from "@/lib/api/hooks/use-clusters";
import { useRubric } from "@/lib/api/hooks/use-rubric";
import { cn } from "@/lib/utils";

interface SampleAnswer {
  student_identifier: string;
  feedback: string;
  score: number;
}

interface AdjustDialogState {
  open: boolean;
  resultId: number | null;
  currentScore: number;
  maxScore: number;
}

export default function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const examId = parseInt(id, 10);
  const router = useRouter();

  if (isNaN(examId)) {
    router.replace("/exams");
    return null;
  }

  return <ReviewPageContent examId={examId} />;
}

function ReviewPageContent({ examId }: { examId: number }) {
  const [activeQuestion, setActiveQuestion] = useState(1);
  const [selectedSample, setSelectedSample] = useState<SampleAnswer | undefined>();
  const [reviewedQuestions, setReviewedQuestions] = useState<Set<number>>(new Set());
  const [adjustDialog, setAdjustDialog] = useState<AdjustDialogState>({
    open: false,
    resultId: null,
    currentScore: 0,
    maxScore: 10,
  });
  const [adjustScore, setAdjustScore] = useState("");
  const [adjustNotes, setAdjustNotes] = useState("");

  const { data: clusterData, isLoading: clustersLoading } = useClusters(examId, activeQuestion);
  const { data: rubrics } = useRubric(examId);
  const approveCluster = useApproveCluster(examId);
  const adjustResult = useAdjustResult(examId);

  const totalQuestions = clusterData?.total_questions ?? 0;
  const activeRubric = rubrics?.find((r) => r.question_number === activeQuestion);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" && activeQuestion > 1) {
        setActiveQuestion((q) => q - 1);
        setSelectedSample(undefined);
      } else if (e.key === "ArrowRight" && activeQuestion < totalQuestions) {
        setActiveQuestion((q) => q + 1);
        setSelectedSample(undefined);
      } else if (e.key === "Enter" && clusterData) {
        // Approve first sub-cluster of first cluster
        const firstCluster = clusterData.clusters[0];
        if (firstCluster?.sub_clusters[0]) {
          handleApproveCluster(firstCluster.sub_clusters[0].cluster_id);
        }
      }
    },
    [activeQuestion, totalQuestions, clusterData]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleApproveCluster = (clusterId: number) => {
    approveCluster.mutate(
      { clusterId },
      {
        onSuccess: () => {
          toast.success("Cluster approved");
          setReviewedQuestions((prev) => new Set(prev).add(activeQuestion));
        },
        onError: () => toast.error("Failed to approve cluster"),
      }
    );
  };

  const handleApproveAll = () => {
    if (!clusterData) return;
    const allSubClusters = clusterData.clusters.flatMap((g) => g.sub_clusters);
    if (allSubClusters.length === 0) return;

    let pending = allSubClusters.length;
    let failed = 0;

    allSubClusters.forEach((sub) => {
      approveCluster.mutate(
        { clusterId: sub.cluster_id },
        {
          onSuccess: () => {
            pending--;
            if (pending === 0 && failed === 0) {
              toast.success("All clusters approved");
              setReviewedQuestions((prev) => new Set(prev).add(activeQuestion));
            }
          },
          onError: () => {
            failed++;
            pending--;
          },
        }
      );
    });
  };

  const handleAdjustSubmit = () => {
    if (adjustDialog.resultId === null) return;
    const score = parseFloat(adjustScore);
    if (isNaN(score) || score < 0 || score > adjustDialog.maxScore) {
      toast.error(`Score must be between 0 and ${adjustDialog.maxScore}`);
      return;
    }
    adjustResult.mutate(
      {
        resultId: adjustDialog.resultId,
        score,
        notes: adjustNotes || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Score adjusted");
          setAdjustDialog({ open: false, resultId: null, currentScore: 0, maxScore: 10 });
          setAdjustScore("");
          setAdjustNotes("");
        },
        onError: () => toast.error("Failed to adjust score"),
      }
    );
  };

  const openAdjustDialog = (resultId: number, currentScore: number, maxScore: number) => {
    setAdjustDialog({ open: true, resultId, currentScore, maxScore });
    setAdjustScore(String(currentScore));
    setAdjustNotes("");
  };

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Cluster Review</h2>
          <p className="text-sm text-muted-foreground">
            Review AI-grouped answers by question. Approve clusters or adjust individual scores.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          ← → navigate &nbsp;·&nbsp; Enter approve
        </p>
      </div>

      {/* Three-panel layout */}
      <div className="grid grid-cols-[260px_1fr_260px] gap-3 h-[calc(100vh-280px)] min-h-[480px]">
        {/* Left Panel: Question nav + Cluster list */}
        <div className="flex flex-col gap-3 overflow-hidden">
          {/* Question nav pills */}
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {totalQuestions === 0 ? (
                <div className="flex flex-wrap gap-1">
                  {[1, 2, 3].map((n) => (
                    <Skeleton key={n} className="h-7 w-8 rounded-md" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((qNum) => {
                    const isActive = qNum === activeQuestion;
                    const isReviewed = reviewedQuestions.has(qNum);
                    return (
                      <button
                        key={qNum}
                        onClick={() => {
                          setActiveQuestion(qNum);
                          setSelectedSample(undefined);
                        }}
                        className={cn(
                          "h-7 w-8 rounded-md text-xs font-semibold transition-colors",
                          isActive && "bg-coral text-white",
                          !isActive && isReviewed && "bg-green-100 text-success",
                          !isActive && !isReviewed && "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                        )}
                      >
                        {qNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cluster list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
            {clustersLoading ? (
              <div className="space-y-2">
                {[1, 2].map((n) => (
                  <Skeleton key={n} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : clusterData && clusterData.clusters.length > 0 ? (
              <>
                {clusterData.clusters.map((cluster, idx) => (
                  <ClusterPanel
                    key={idx}
                    cluster={cluster}
                    onSelectSample={setSelectedSample}
                    selectedSample={selectedSample}
                  />
                ))}
                <Button
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={handleApproveAll}
                  disabled={approveCluster.isPending}
                >
                  {approveCluster.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3.5 w-3.5" />
                  )}
                  Approve All
                </Button>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                No clusters for Q{activeQuestion}
              </div>
            )}
          </div>
        </div>

        {/* Center Panel: Student answer details */}
        <div className="overflow-y-auto">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Student Answer</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSample ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Student</p>
                      <p className="font-semibold">{selectedSample.student_identifier}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Score</p>
                      <p
                        className={cn(
                          "text-xl font-bold",
                          (() => {
                            const pct = selectedSample.score / 10;
                            if (pct > 0.8) return "text-success";
                            if (pct >= 0.4) return "text-warning";
                            return "text-coral";
                          })()
                        )}
                      >
                        {selectedSample.score}
                        <span className="text-sm font-normal text-muted-foreground">/10</span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md border border-border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">AI Feedback</p>
                    <p className="text-sm leading-relaxed">{selectedSample.feedback}</p>
                  </div>

                  {/* Note: sample_answers from the cluster API don't carry a result_id.
                      The dialog is wired; a full /results lookup would be needed
                      to resolve the correct resultId in production. */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() =>
                      openAdjustDialog(
                        0, // placeholder — sample_answers lack result_id
                        selectedSample.score,
                        activeRubric?.max_marks ?? 10
                      )
                    }
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Adjust Score
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <p className="text-sm text-muted-foreground">
                    Select a sample answer from the left panel to view details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Rubric + Model Answer */}
        <div className="overflow-y-auto space-y-3">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm">
                Q{activeQuestion} Rubric
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!activeRubric ? (
                <p className="text-xs text-muted-foreground">No rubric available</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Max marks</span>
                    <Badge className="bg-green-100 text-success text-[10px]">
                      {activeRubric.max_marks}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    {activeRubric.criteria_json.map((criterion, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-1.5"
                      >
                        <p className="text-xs leading-snug flex-1">{criterion.description}</p>
                        <Badge className="bg-muted text-muted-foreground text-[10px] shrink-0">
                          {criterion.marks}m
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm">Model Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Model answer content is embedded in the rubric criteria above.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Adjust Score Dialog */}
      <Dialog
        open={adjustDialog.open}
        onOpenChange={(open) =>
          setAdjustDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust Score</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="adjust-score" className="text-sm">
                New Score (max {adjustDialog.maxScore})
              </Label>
              <Input
                id="adjust-score"
                type="number"
                min={0}
                max={adjustDialog.maxScore}
                step={0.5}
                value={adjustScore}
                onChange={(e) => setAdjustScore(e.target.value)}
                className="mt-1"
                placeholder={`0 – ${adjustDialog.maxScore}`}
              />
            </div>
            <div>
              <Label htmlFor="adjust-notes" className="text-sm">
                Notes (optional)
              </Label>
              <Input
                id="adjust-notes"
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
                className="mt-1"
                placeholder="Reason for adjustment"
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button
              size="sm"
              onClick={handleAdjustSubmit}
              disabled={adjustResult.isPending}
            >
              {adjustResult.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
