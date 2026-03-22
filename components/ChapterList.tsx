"use client";

import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

interface Chapter {
  id: string;
  number: number;
  title: string;
  audioPath: string;
}

interface ChapterListProps {
  chapters: Chapter[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function ChapterList({
  chapters,
  currentIndex,
  onSelect,
}: ChapterListProps) {
  return (
    <div className="space-y-0.5">
      {chapters.map((chapter, i) => {
        const isActive = i === currentIndex;
        return (
          <button
            key={chapter.id}
            onClick={() => onSelect(i)}
            className={cn(
              "w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group",
              isActive
                ? "bg-amber-500/10 border border-amber-500/20"
                : "hover:bg-white/[0.04] border border-transparent"
            )}
          >
            {/* Chapter number indicator */}
            <div
              className={cn(
                "flex-shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold transition-colors",
                isActive
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-white/5 text-white/30 group-hover:text-white/50"
              )}
            >
              {isActive ? (
                <BookOpen className="w-2.5 h-2.5" />
              ) : (
                chapter.number
              )}
            </div>

            <span
              className={cn(
                "text-sm leading-snug transition-colors",
                isActive
                  ? "text-white font-medium"
                  : "text-white/50 group-hover:text-white/70"
              )}
            >
              {chapter.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
