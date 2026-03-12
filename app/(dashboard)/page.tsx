"use client";

import { useState } from "react";
import { useExams, useDeleteExam } from "@/lib/api/hooks/use-exams";
import { ExamCard } from "@/components/exam-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Exam } from "@/lib/api/types";

export default function ExamListPage() {
  const { data: exams, isLoading } = useExams();
  const deleteExam = useDeleteExam();
  const router = useRouter();
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

  function handleEdit(exam: Exam) {
    router.push(`/exams/new?edit=${exam.id}`);
  }

  function handleDelete(exam: Exam) {
    setExamToDelete(exam);
  }

  async function confirmDelete() {
    if (!examToDelete) return;
    try {
      await deleteExam.mutateAsync(examToDelete.id);
      toast.success("Exam deleted");
    } catch {
      toast.error("Failed to delete exam");
    }
    setExamToDelete(null);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Exams</h1>
        <Link href="/exams/new">
          <Button>+ New Exam</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : exams?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg">No exams yet</p>
          <p className="text-sm">Create your first exam to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams?.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={!!examToDelete} onOpenChange={() => setExamToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exam</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{examToDelete?.title}&quot;?
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExamToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
