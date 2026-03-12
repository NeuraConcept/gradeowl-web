"use client";

import { useState } from "react";
import { Loader2, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageThumbnailProps {
  src: string;
  name: string;
  status: "uploading" | "done" | "error";
  onRemove?: () => void;
}

export function PageThumbnail({ src, name, status, onRemove }: PageThumbnailProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      style={{ width: 80, height: 96 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        className="h-full w-full rounded-md border border-border object-cover"
      />

      {/* Status overlay */}
      {status === "uploading" && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        </div>
      )}
      {status === "done" && hovered && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/30">
          <CheckCircle className="h-5 w-5 text-white" />
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-red-500/60">
          <span className="text-xs font-bold text-white">ERR</span>
        </div>
      )}

      {/* Remove button — visible on hover when not uploading */}
      {status !== "uploading" && hovered && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background shadow-sm transition-opacity"
          aria-label={`Remove ${name}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Filename */}
      <p className="mt-1 truncate text-center text-[10px] text-muted-foreground" style={{ maxWidth: 80 }}>
        {name}
      </p>
    </div>
  );
}
