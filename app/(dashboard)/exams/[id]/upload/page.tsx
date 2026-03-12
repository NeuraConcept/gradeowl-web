"use client";

import { use, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropZone } from "@/components/drop-zone";
import { PageThumbnail } from "@/components/page-thumbnail";
import { AnalysisProgressView } from "@/components/analysis-progress";
import { useExam } from "@/lib/api/hooks/use-exams";
import {
  useQuestionPaper,
  useAnswerKey,
  useUploadQP,
  useUploadAK,
} from "@/lib/api/hooks/use-upload";
import {
  useAnalysisProgress,
  useAnalyzeQP,
  useCancelAnalysis,
  useRetryAnalysis,
} from "@/lib/api/hooks/use-analysis";
import { splitPdfToPages } from "@/lib/pdf-split";

interface PendingFile {
  file: File;
  previewUrl: string;
  status: "uploading" | "done" | "error";
}

export default function UploadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const examId = parseInt(id, 10);

  const { data: exam } = useExam(examId);
  const { data: qpPages = [] } = useQuestionPaper(examId);
  const { data: akPages = [] } = useAnswerKey(examId);
  const { data: analysis } = useAnalysisProgress(examId);

  const uploadQP = useUploadQP(examId);
  const uploadAK = useUploadAK(examId);
  const analyzeQP = useAnalyzeQP(examId);
  const cancelAnalysis = useCancelAnalysis(examId);
  const retryAnalysis = useRetryAnalysis(examId);

  const [pendingQP, setPendingQP] = useState<PendingFile[]>([]);
  const [pendingAK, setPendingAK] = useState<PendingFile[]>([]);
  const [isProcessingQP, setIsProcessingQP] = useState(false);
  const [isProcessingAK, setIsProcessingAK] = useState(false);

  // Expand PDF files into individual page files
  async function expandFiles(files: File[]): Promise<File[]> {
    const result: File[] = [];
    for (const file of files) {
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        try {
          const pages = await splitPdfToPages(file);
          result.push(...pages);
        } catch {
          toast.error(`Failed to split PDF: ${file.name}`);
        }
      } else {
        result.push(file);
      }
    }
    return result;
  }

  const handleQPFiles = useCallback(
    async (files: File[]) => {
      setIsProcessingQP(true);
      const expanded = await expandFiles(files);
      const pending: PendingFile[] = expanded.map((f) => ({
        file: f,
        previewUrl: URL.createObjectURL(f),
        status: "uploading",
      }));
      setPendingQP((prev) => [...prev, ...pending]);
      setIsProcessingQP(false);

      // Upload each file
      for (let i = 0; i < expanded.length; i++) {
        const formData = new FormData();
        formData.append("file", expanded[i]);
        try {
          await uploadQP.mutateAsync(formData);
          setPendingQP((prev) =>
            prev.map((p) =>
              p.previewUrl === pending[i].previewUrl
                ? { ...p, status: "done" }
                : p
            )
          );
        } catch {
          setPendingQP((prev) =>
            prev.map((p) =>
              p.previewUrl === pending[i].previewUrl
                ? { ...p, status: "error" }
                : p
            )
          );
          toast.error(`Failed to upload ${expanded[i].name}`);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uploadQP]
  );

  const handleAKFiles = useCallback(
    async (files: File[]) => {
      setIsProcessingAK(true);
      const expanded = await expandFiles(files);
      const pending: PendingFile[] = expanded.map((f) => ({
        file: f,
        previewUrl: URL.createObjectURL(f),
        status: "uploading",
      }));
      setPendingAK((prev) => [...prev, ...pending]);
      setIsProcessingAK(false);

      for (let i = 0; i < expanded.length; i++) {
        const formData = new FormData();
        formData.append("file", expanded[i]);
        try {
          await uploadAK.mutateAsync(formData);
          setPendingAK((prev) =>
            prev.map((p) =>
              p.previewUrl === pending[i].previewUrl
                ? { ...p, status: "done" }
                : p
            )
          );
        } catch {
          setPendingAK((prev) =>
            prev.map((p) =>
              p.previewUrl === pending[i].previewUrl
                ? { ...p, status: "error" }
                : p
            )
          );
          toast.error(`Failed to upload ${expanded[i].name}`);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uploadAK]
  );

  const removeQPPending = (previewUrl: string) => {
    setPendingQP((prev) => {
      const item = prev.find((p) => p.previewUrl === previewUrl);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.previewUrl !== previewUrl);
    });
  };

  const removeAKPending = (previewUrl: string) => {
    setPendingAK((prev) => {
      const item = prev.find((p) => p.previewUrl === previewUrl);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.previewUrl !== previewUrl);
    });
  };

  const isAnalyzing =
    analysis &&
    (analysis.answers_analyzing > 0 ||
      analysis.answers_pending > 0 ||
      analysis.reconciliation_analyzing > 0 ||
      analysis.reconciliation_pending > 0);
  const analysisDone =
    analysis &&
    analysis.total_questions > 0 &&
    analysis.answers_done === analysis.total_questions;
  const hasFailed = analysis && analysis.answers_failed > 0;

  const totalQP = qpPages.length + pendingQP.length;
  const totalAK = akPages.length + pendingAK.length;

  if (!exam) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="qp">
        <TabsList>
          <TabsTrigger value="qp">
            Question Paper ({totalQP} pages)
          </TabsTrigger>
          <TabsTrigger value="ak">
            Answer Key ({totalAK} pages)
          </TabsTrigger>
        </TabsList>

        {/* Question Paper Tab */}
        <TabsContent value="qp">
          <Card>
            <CardHeader>
              <CardTitle>Question Paper</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DropZone
                onFiles={handleQPFiles}
                label="Drop question paper pages here"
                disabled={isProcessingQP}
              />

              {isProcessingQP && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing PDF...
                </div>
              )}

              {(qpPages.length > 0 || pendingQP.length > 0) && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {qpPages.map((page) => (
                    <PageThumbnail
                      key={page.id}
                      src={`/api/proxy/static/uploads/${page.image_path}`}
                      name={`Page ${page.page_number}`}
                      status="done"
                    />
                  ))}
                  {pendingQP.map((p) => (
                    <PageThumbnail
                      key={p.previewUrl}
                      src={p.previewUrl}
                      name={p.file.name}
                      status={p.status}
                      onRemove={
                        p.status !== "uploading"
                          ? () => removeQPPending(p.previewUrl)
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Answer Key Tab */}
        <TabsContent value="ak">
          <Card>
            <CardHeader>
              <CardTitle>Answer Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DropZone
                onFiles={handleAKFiles}
                label="Drop answer key pages here"
                disabled={isProcessingAK}
              />

              {isProcessingAK && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing PDF...
                </div>
              )}

              {(akPages.length > 0 || pendingAK.length > 0) && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {akPages.map((page) => (
                    <PageThumbnail
                      key={page.id}
                      src={`/api/proxy/static/uploads/${page.image_path}`}
                      name={`Page ${page.page_number}`}
                      status="done"
                    />
                  ))}
                  {pendingAK.map((p) => (
                    <PageThumbnail
                      key={p.previewUrl}
                      src={p.previewUrl}
                      name={p.file.name}
                      status={p.status}
                      onRemove={
                        p.status !== "uploading"
                          ? () => removeAKPending(p.previewUrl)
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analysis Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Question Paper Analysis</CardTitle>
            <div className="flex gap-2">
              {!isAnalyzing && !analysisDone && (
                <Button
                  onClick={() => analyzeQP.mutate()}
                  disabled={analyzeQP.isPending || qpPages.length === 0}
                  size="sm"
                >
                  {analyzeQP.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Analyze
                </Button>
              )}
              {isAnalyzing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelAnalysis.mutate()}
                  disabled={cancelAnalysis.isPending}
                >
                  Cancel
                </Button>
              )}
              {hasFailed && !isAnalyzing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => retryAnalysis.mutate()}
                  disabled={retryAnalysis.isPending}
                >
                  Retry Failed
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {analysis ? (
            <AnalysisProgressView data={analysis} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Upload question paper and answer key pages, then click &quot;Analyze&quot; to
              extract questions.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
