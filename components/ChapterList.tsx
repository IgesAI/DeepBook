"use client";

import { cn } from "@/lib/utils";

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

export function ChapterList({ chapters, currentIndex, onSelect }: ChapterListProps) {
  return (
    <div className="space-y-0.5">
      {chapters.map((chapter, i) => {
        const isActive = i === currentIndex;
        return (
          <button
            key={chapter.id}
            onClick={() => onSelect(i)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all duration-200 group",
              isActive
                ? "bg-primary/10 ring-1 ring-primary/20"
                : "hover:bg-white/5 ring-1 ring-transparent"
            )}
          >
            {/* Number / active indicator */}
            <div
              className={cn(
                "flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-label font-bold transition-all",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "bg-surface-container-highest text-on-surface-variant/40 group-hover:text-on-surface-variant"
              )}
            >
              {isActive ? (
                <span className="material-symbols-outlined" style={{ fontSize: "12px", fontVariationSettings: "'FILL' 1" }}>
                  graphic_eq
                </span>
              ) : (
                chapter.number
              )}
            </div>

            <span
              className={cn(
                "text-sm font-label leading-snug transition-colors flex-1",
                isActive
                  ? "text-primary font-medium"
                  : "text-on-surface-variant/60 group-hover:text-on-surface-variant"
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
