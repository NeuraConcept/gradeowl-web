import { cn } from "@/lib/utils";

interface ScoreCellProps {
  score: number;
  maxScore: number;
}

export function ScoreCell({ score, maxScore }: ScoreCellProps) {
  const pct = maxScore > 0 ? score / maxScore : 0;

  const colorClass =
    pct > 0.8
      ? "text-success"
      : pct >= 0.4
        ? "text-warning"
        : "text-coral";

  return (
    <span className={cn("font-semibold tabular-nums", colorClass)}>
      {score}/{maxScore}
    </span>
  );
}
