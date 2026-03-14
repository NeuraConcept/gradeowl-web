import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ExamStatus } from "@/lib/api/types";

const statusConfig: Record<ExamStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  RUBRIC_REVIEW: {
    label: "Rubric Review",
    className: "bg-soft-pink/30 text-coral",
  },
  GRADING: { label: "Grading", className: "bg-warm-yellow text-warning" },
  CLUSTERING: { label: "Clustering", className: "bg-warm-yellow text-warning" },
  GRADING_FAILED: {
    label: "Failed",
    className: "bg-red-100 text-red-600",
  },
  COMPLETE: { label: "Complete", className: "bg-green-100 text-success" },
};

export function StatusBadge({ status }: { status: ExamStatus }) {
  const config = statusConfig[status];
  return (
    <Badge className={cn("font-semibold", config.className)}>
      {config.label}
    </Badge>
  );
}
