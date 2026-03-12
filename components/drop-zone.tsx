"use client";

import { useRef, useState, useCallback } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const ACCEPTED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
]);

function isAccepted(file: File): boolean {
  if (ACCEPTED_MIME.has(file.type)) return true;
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return ACCEPTED_EXTENSIONS.has(ext);
}

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  label?: string;
  disabled?: boolean;
}

export function DropZone({ onFiles, label, disabled }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const valid = Array.from(fileList).filter(isAccepted);
      if (valid.length > 0) onFiles(valid);
    },
    [onFiles]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
        isDragOver
          ? "border-coral bg-soft-pink/20"
          : "border-border hover:border-coral/50 hover:bg-warm-yellow/30",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <Upload className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">
        {label ?? "Drop files here or click to browse"}
      </p>
      <p className="text-xs text-muted-foreground">
        JPG, PNG, WEBP, or PDF
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}
