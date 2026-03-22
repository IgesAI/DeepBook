"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { gradientForId } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface AudiobookCardProps {
  id: string;
  topic: string;
  title: string;
  voiceName: string;
  status: string;
  chapterCount: number;
  createdAt: string | Date;
}

const STATUS: Record<string, { label: string; variant: "primary" | "secondary" | "tertiary" | "error" | "outline" }> = {
  queued:      { label: "Queued",        variant: "outline" },
  researching: { label: "Researching",   variant: "tertiary" },
  formatting:  { label: "Writing",       variant: "primary" },
  generating:  { label: "Narrating",     variant: "primary" },
  complete:    { label: "Ready",         variant: "secondary" },
  error:       { label: "Error",         variant: "error" },
};

export function AudiobookCard({ id, topic, title, voiceName, status, chapterCount, createdAt }: AudiobookCardProps) {
  const router = useRouter();
  const gradient = gradientForId(id);
  const st = STATUS[status] || STATUS.queued;
  const isReady = status === "complete";
  const isProcessing = ["queued", "researching", "formatting", "generating"].includes(status);
  const date = new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    await fetch(`/api/audiobooks/${id}`, { method: "DELETE" });
    router.refresh();
  }

  function cancelDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(false);
  }

  return (
    <div className="relative group">
      <Link
        href={`/audiobook/${id}`}
        className="block glass-card rounded-[1.5rem] overflow-hidden hover:shadow-[0_0_40px_rgba(255,185,95,0.08)] transition-all duration-300 hover:ring-1 hover:ring-primary/20"
      >
        {/* Cover */}
        <div className={`relative h-36 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
          <div className="noise-overlay" />
          <span className="material-symbols-outlined text-white/15 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_stories
          </span>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high/80 to-transparent" />
          <div className="absolute top-3 right-3">
            <Badge variant={st.variant}>{st.label}</Badge>
          </div>
          {isProcessing && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
              <div className="h-full bg-primary animate-pulse w-1/2 rounded-full" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-headline font-semibold text-on-surface text-sm leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {isReady && title ? title : topic}
          </h3>
          {isReady && title && (
            <p className="text-xs text-on-surface-variant/50 mb-2 line-clamp-1">{topic}</p>
          )}
          <div className="flex items-center gap-3 text-[11px] text-on-surface-variant/50 font-label mt-2">
            {voiceName && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>mic</span>
                {voiceName}
              </span>
            )}
            {isReady && chapterCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>auto_stories</span>
                {chapterCount} ch
              </span>
            )}
            <span className="ml-auto flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>schedule</span>
              {date}
            </span>
          </div>
        </div>
      </Link>

      {/* Delete button — shown on hover */}
      <div className={cn(
        "absolute top-2 left-2 transition-all duration-200",
        confirming ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        {confirming ? (
          <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-error text-white text-xs font-label font-medium shadow-lg disabled:opacity-50"
            >
              {deleting ? (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: "12px", animationDuration: "1s" }}>progress_activity</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>delete</span>
              )}
              Delete
            </button>
            <button
              onClick={cancelDelete}
              className="p-1.5 rounded-xl glass-card-high text-on-surface-variant/60 hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>close</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-xl glass-card-high text-on-surface-variant/40 hover:text-error transition-colors"
            title="Delete audiobook"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>delete</span>
          </button>
        )}
      </div>
    </div>
  );
}
