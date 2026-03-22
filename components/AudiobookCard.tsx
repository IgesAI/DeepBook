import Link from "next/link";
import { BookOpen, Clock, Mic } from "lucide-react";
import { Badge } from "./ui/badge";
import { gradientForId } from "@/lib/utils";

interface AudiobookCardProps {
  id: string;
  topic: string;
  title: string;
  voiceName: string;
  status: string;
  chapterCount: number;
  createdAt: string | Date;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "amber" | "green" | "red" | "blue" | "default" | "outline" }
> = {
  queued: { label: "Queued", variant: "outline" },
  researching: { label: "Researching", variant: "blue" },
  formatting: { label: "Formatting", variant: "amber" },
  generating: { label: "Generating Audio", variant: "amber" },
  complete: { label: "Ready", variant: "green" },
  error: { label: "Error", variant: "red" },
};

export function AudiobookCard({
  id,
  topic,
  title,
  voiceName,
  status,
  chapterCount,
  createdAt,
}: AudiobookCardProps) {
  const gradient = gradientForId(id);
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.queued;
  const isReady = status === "complete";
  const isProcessing = ["queued", "researching", "formatting", "generating"].includes(status);

  const date = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/audiobook/${id}`}
      className="group block rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/15 hover:bg-white/[0.05] transition-all duration-200 overflow-hidden"
    >
      {/* Cover */}
      <div
        className={`relative h-32 bg-gradient-to-br ${gradient} flex items-center justify-center`}
      >
        <BookOpen className="w-10 h-10 text-white/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 right-3">
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
        {isProcessing && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
            <div className="h-full bg-amber-500 animate-pulse w-1/2" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm leading-snug mb-1 group-hover:text-amber-400 transition-colors line-clamp-2">
          {isReady && title ? title : topic}
        </h3>
        {isReady && title && (
          <p className="text-xs text-white/40 mb-3 line-clamp-1">{topic}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-white/35 mt-2">
          {voiceName && (
            <span className="flex items-center gap-1">
              <Mic className="w-3 h-3" />
              {voiceName}
            </span>
          )}
          {isReady && chapterCount > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {chapterCount} chapters
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            {date}
          </span>
        </div>
      </div>
    </Link>
  );
}
