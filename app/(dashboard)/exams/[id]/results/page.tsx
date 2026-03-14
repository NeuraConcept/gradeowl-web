"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Flag, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ResultsTable } from "@/components/results-table";
import { AnalyticsCharts } from "@/components/analytics-charts";
import {
  useResults,
  useAnalytics,
  useAnnotatedPages,
  useFinalizeExam,
  exportCSV,
} from "@/lib/api/hooks/use-results";
import { useSubmissions } from "@/lib/api/hooks/use-submissions";
import type { StudentResult } from "@/lib/api/types";

export default function ResultsPage({
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

  return <ResultsPageContent examId={examId} />;
}

function ResultsPageContent({ examId }: { examId: number }) {
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);
  const [annotatedPageIndex, setAnnotatedPageIndex] = useState(0);
  const [csvExporting, setCsvExporting] = useState(false);

  const { data: resultsData, isLoading: resultsLoading } = useResults(examId);
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics(examId);
  const { data: submissions } = useSubmissions(examId);
  const finalizeExam = useFinalizeExam(examId);

  // Look up submissionId for selected student
  const submissionId =
    selectedResult && submissions
      ? (submissions.find(
          (s) => s.student_identifier === selectedResult.student_identifier
        )?.id ?? 0)
      : 0;

  const { data: annotatedPages, isLoading: pagesLoading } = useAnnotatedPages(submissionId);

  const handleRowClick = (result: StudentResult) => {
    setSelectedResult(result);
    setAnnotatedPageIndex(0);
  };

  const handleExportCSV = async () => {
    setCsvExporting(true);
    try {
      await exportCSV(examId);
      toast.success("Export started");
    } catch {
      toast.error("Export failed");
    } finally {
      setCsvExporting(false);
    }
  };

  const handleFinalize = () => {
    finalizeExam.mutate(undefined, {
      onSuccess: () => toast.success("Exam finalized"),
      onError: () => toast.error("Failed to finalize exam"),
    });
  };

  const pages = annotatedPages ?? [];
  const currentPage = pages[annotatedPageIndex];

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Results</h2>
          <p className="text-sm text-muted-foreground">
            View graded results and analytics for this exam.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleExportCSV}
            disabled={csvExporting || resultsLoading}
          >
            {csvExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Export CSV
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleFinalize}
            disabled={finalizeExam.isPending}
          >
            {finalizeExam.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Flag className="h-3.5 w-3.5" />
            )}
            Finalize Exam
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="results">
        <TabsList>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Results Tab */}
        <TabsContent value="results" className="mt-4">
          {resultsLoading ? (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} className="h-20 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-48 rounded-xl" />
            </div>
          ) : resultsData ? (
            <ResultsTable
              results={resultsData.results}
              summary={resultsData.summary}
              onRowClick={handleRowClick}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No results available yet. Results appear once grading is complete.
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          {analyticsLoading ? (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} className="h-20 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-72 rounded-xl" />
            </div>
          ) : analyticsData ? (
            <AnalyticsCharts data={analyticsData} />
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No analytics data available yet.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Annotated pages dialog */}
      <Dialog
        open={Boolean(selectedResult)}
        onOpenChange={(open) => {
          if (!open) setSelectedResult(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedResult?.student_identifier} — Answer Sheets
            </DialogTitle>
          </DialogHeader>

          {pagesLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : pages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No annotated pages available for this submission.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Image viewer */}
              <div className="relative rounded-lg overflow-hidden border border-border bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentPage?.annotated_url ?? currentPage?.original_url}
                  alt={`Page ${currentPage?.page_number}`}
                  className="w-full object-contain max-h-[420px]"
                />
                <div className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
                  {annotatedPageIndex + 1} / {pages.length}
                </div>
              </div>

              {/* Page navigation */}
              {pages.length > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setAnnotatedPageIndex((i) => Math.max(0, i - 1))}
                    disabled={annotatedPageIndex === 0}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Page {currentPage?.page_number}
                  </span>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() =>
                      setAnnotatedPageIndex((i) => Math.min(pages.length - 1, i + 1))
                    }
                    disabled={annotatedPageIndex === pages.length - 1}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  );
}
