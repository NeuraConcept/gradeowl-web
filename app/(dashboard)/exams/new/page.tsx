"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateExam } from "@/lib/api/hooks/use-exams";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CreateExamPage() {
  const router = useRouter();
  const createExam = useCreateExam();
  const [form, setForm] = useState({
    title: "",
    subject: "",
    class_name: "",
    total_marks: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.subject || !form.class_name || !form.total_marks) {
      toast.error("All fields are required");
      return;
    }
    try {
      const exam = await createExam.mutateAsync({
        title: form.title,
        subject: form.subject,
        class_name: form.class_name,
        total_marks: parseInt(form.total_marks, 10),
      });
      toast.success("Exam created");
      router.push(`/exams/${exam.id}`);
    } catch {
      toast.error("Failed to create exam");
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Create New Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Math Unit Test 3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Mathematics"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class_name">Class</Label>
              <Input
                id="class_name"
                value={form.class_name}
                onChange={(e) =>
                  setForm({ ...form, class_name: e.target.value })
                }
                placeholder="Class 10-A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_marks">Total Marks</Label>
              <Input
                id="total_marks"
                type="number"
                value={form.total_marks}
                onChange={(e) =>
                  setForm({ ...form, total_marks: e.target.value })
                }
                placeholder="50"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createExam.isPending}>
                {createExam.isPending ? "Creating..." : "Create Exam"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
