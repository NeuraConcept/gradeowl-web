"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClusterGroup } from "@/lib/api/types";

export interface SampleAnswer {
  student_identifier: string;
  feedback: string;
  score: number;
}

interface ClusterPanelProps {
  cluster: ClusterGroup;
  maxMarks: number;
  onSelectSample: (sample: SampleAnswer) => void;
  selectedSample?: SampleAnswer;
}

export function ClusterPanel({
  cluster,
  maxMarks,
  onSelectSample,
  selectedSample,
}: ClusterPanelProps) {
  const [expandedSubClusters, setExpandedSubClusters] = useState<Set<number>>(
    new Set()
  );

  const toggleSubCluster = (clusterId: number) => {
    setExpandedSubClusters((prev) => {
      const next = new Set(prev);
      if (next.has(clusterId)) {
        next.delete(clusterId);
      } else {
        next.add(clusterId);
      }
      return next;
    });
  };

  const scoreColor = (score: number, max: number) => {
    const pct = max > 0 ? score / max : 0;
    if (pct > 0.8) return "text-success";
    if (pct >= 0.4) return "text-warning";
    return "text-coral";
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      {/* Cluster header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-foreground leading-snug flex-1">
          {cluster.rubric_pattern}
        </p>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0">
            <Users className="h-2.5 w-2.5 mr-0.5" />
            {cluster.total_count}
          </Badge>
          <Badge className="bg-green-100 text-success text-[10px] px-1.5 py-0">
            avg {cluster.avg_score.toFixed(1)}
          </Badge>
        </div>
      </div>

      {/* Sub-clusters */}
      <div className="space-y-1">
        {cluster.sub_clusters.map((sub) => {
          const isExpanded = expandedSubClusters.has(sub.cluster_id);
          return (
            <div
              key={sub.cluster_id}
              className="rounded-md border border-border/60 bg-muted/30"
            >
              {/* Sub-cluster header */}
              <button
                onClick={() => toggleSubCluster(sub.cluster_id)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-left hover:bg-muted/50 rounded-md transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-xs font-medium">
                    Sub-cluster #{sub.cluster_id}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-muted-foreground">{sub.count} students</span>
                  <span className={cn("font-semibold", scoreColor(sub.avg_score, maxMarks))}>
                    avg {sub.avg_score.toFixed(1)}
                  </span>
                </div>
              </button>

              {/* Sample answers */}
              {isExpanded && (
                <div className="px-2.5 pb-2 space-y-1 border-t border-border/60 pt-1.5">
                  {sub.sample_answers.map((sample, idx) => {
                    const isSelected =
                      selectedSample?.student_identifier === sample.student_identifier;
                    return (
                      <Button
                        key={idx}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start h-auto py-1.5 px-2 text-left rounded-md",
                          isSelected && "bg-soft-pink/20 border border-soft-pink/40"
                        )}
                        onClick={() => onSelectSample(sample)}
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className="text-xs font-medium truncate">
                            {sample.student_identifier}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-semibold shrink-0",
                              scoreColor(sample.score, maxMarks)
                            )}
                          >
                            {sample.score}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 text-left line-clamp-1 w-full">
                          {sample.feedback}
                        </p>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
