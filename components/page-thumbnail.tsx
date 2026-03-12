"use client";

import { Loader2, CheckCircle, X } from "lucide-react";

interface PageThumbnailProps {
  src: string;
  name: string;
  status: "uploading" | "done" | "error";
  onRemove?: () => void;
}

export function PageThumbnail({ src, name, status, onRemove }: PageThumbnailProps) {
  return (
    <div className="group relative h-24 w-20">
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
      {status === "done" && (
        <div className="absolute inset-0 hidden items-center justify-center rounded-md bg-black/30 group-hover:flex">
          <CheckCircle className="h-5 w-5 text-white" />
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-red-500/60">
          <span className="text-xs font-bold text-white">ERR</span>
        </div>
      )}

      {/* Remove button — visible on hover when not uploading */}
      {status !== "uploading" && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={`Remove ${name}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Filename */}
      <p className="mt-1 w-20 truncate text-center text-[10px] text-muted-foreground">
        {name}
      </p>
    </div>
  );
}
