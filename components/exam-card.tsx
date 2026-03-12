"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Exam } from "@/lib/api/types";

interface ExamCardProps {
  exam: Exam;
  onEdit: (exam: Exam) => void;
  onDelete: (exam: Exam) => void;
}

export function ExamCard({ exam, onEdit, onDelete }: ExamCardProps) {
  return (
    <Link href={`/exams/${exam.id}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md hover:shadow-coral/10">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{exam.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {exam.class_name} &middot; {exam.subject}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={exam.status} />
              {exam.status === "DRAFT" && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    onClick={(e) => e.preventDefault()}
                  >
                    &#8942;
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        onEdit(exam);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        onDelete(exam);
                      }}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {exam.total_marks} marks
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
