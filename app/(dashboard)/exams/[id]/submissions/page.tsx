"use client";

import { use, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DropZone } from "@/components/drop-zone";
import { useSubmissions, useUploadSubmissions } from "@/lib/api/hooks/use-submissions";
import { splitPdfToPages } from "@/lib/pdf-split";
import type { SubmissionStatus } from "@/lib/api/types";

const statusStyle: Record<SubmissionStatus, { label: string; className: string }> = {
  UPLOADED: { label: "Uploaded", className: "bg-gray-100 text-gray-600" },
  PROCESSING: { label: "Processing", className: "bg-warm-yellow text-warning" },
  GRADED: { label: "Graded", className: "bg-green-100 text-success" },
  REVIEWED: { label: "Reviewed", className: "bg-soft-pink/30 text-coral" },
};

export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const examId = parseInt(id, 10);

  const { data: submissions = [], isLoading } = useSubmissions(examId);
  const uploadSubmissions = useUploadSubmissions(examId);

  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    setIsProcessingPDF(true);
    const expanded: File[] = [];
    for (const file of files) {
      if (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      ) {
        try {
          const pages = await splitPdfToPages(file);
          expanded.push(...pages);
        } catch {
          toast.error(`Failed to split PDF: ${file.name}`);
        }
      } else {
        expanded.push(file);
      }
    }
    setPendingFiles((prev) => [...prev, ...expanded]);
    setIsProcessingPDF(false);
  }, []);

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => setPendingFiles([]);

  const handleUpload = async () => {
    if (!studentIdentifier.trim()) {
      toast.error("Please enter a student identifier");
      return;
    }
    if (pendingFiles.length === 0) {
      toast.error("Please add at least one page");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("student_identifier", studentIdentifier.trim());
    for (const file of pendingFiles) {
      formData.append("files", file);
    }

    try {
      await uploadSubmissions.mutateAsync(formData);
      toast.success("Submission uploaded successfully");
      setStudentIdentifier("");
      setPendingFiles([]);
    } catch {
      toast.error("Failed to upload submission");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Submission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="student-id">Student Identifier</Label>
            <Input
              id="student-id"
              placeholder="e.g. Roll No, Name, or ID"
              value={studentIdentifier}
              onChange={(e) => setStudentIdentifier(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <DropZone
            onFiles={handleFiles}
            label="Drop student answer sheet pages here"
            disabled={isUploading || isProcessingPDF}
          />

          {isProcessingPDF && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing PDF...
            </div>
          )}

          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {pendingFiles.length} page{pendingFiles.length > 1 ? "s" : ""} selected
              </p>
              <div className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-md border border-border p-2">
                {pendingFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate text-muted-foreground">
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="shrink-0 text-muted-foreground hover:text-red-600"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={
                isUploading ||
                isProcessingPDF ||
                pendingFiles.length === 0 ||
                !studentIdentifier.trim()
              }
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload
            </Button>
            {pendingFiles.length > 0 && (
              <Button variant="outline" onClick={clearFiles} disabled={isUploading}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submissions table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions ({submissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : submissions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No submissions yet. Upload the first one above.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium">Student</th>
                    <th className="px-4 py-2 text-left font-medium">Pages</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => {
                    const s = statusStyle[sub.status];
                    return (
                      <tr
                        key={sub.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-2 font-medium">
                          {sub.student_identifier}
                        </td>
                        <td className="px-4 py-2">{sub.page_count}</td>
                        <td className="px-4 py-2">
                          <Badge className={s.className} variant="outline">
                            {s.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
