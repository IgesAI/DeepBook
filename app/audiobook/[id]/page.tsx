"use client";

import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import { Nav } from "@/components/Nav";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ChapterList } from "@/components/ChapterList";
import { ProgressTracker } from "@/components/ProgressTracker";
import { Badge } from "@/components/ui/badge";
import { Mic, BookOpen, Download } from "lucide-react";
import { gradientForId } from "@/lib/utils";

interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  audioPath: string;
}

interface Audiobook {
  id: string;
  topic: string;
  title: string;
  voiceName: string;
  status: string;
  chapters: Chapter[];
}

export default function AudiobookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [audiobook, setAudiobook] = useState<Audiobook | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const fetchAudiobook = useCallback(async () => {
    const res = await fetch(`/api/audiobooks/${id}`);
    if (res.ok) {
      const data = await res.json();
      setAudiobook(data);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchAudiobook();
  }, [fetchAudiobook]);

  const isProcessing =
    audiobook &&
    ["queued", "researching", "formatting", "generating"].includes(
      audiobook.status
    );
  const isReady = audiobook?.status === "complete";
  const currentChapter = audiobook?.chapters[currentChapterIndex];
  const gradient = id ? gradientForId(id) : "from-amber-900/60 to-orange-900/40";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!audiobook) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
        <h1 className="text-xl font-semibold text-white">Audiobook not found</h1>
        <p className="text-sm text-white/40">
          This audiobook may have been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav title={isReady && audiobook.title ? audiobook.title : audiobook.topic} />

      {isProcessing ? (
        // ── Processing State
        <main className="flex-1 pt-14 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-sm">
            {/* Mini cover */}
            <div
              className={`h-24 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-8 mx-auto w-24`}
            >
              <BookOpen className="w-8 h-8 text-white/20" />
            </div>
            <div className="text-center mb-8">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-2">
                Creating
              </p>
              <h1 className="text-xl font-semibold text-white leading-snug">
                {audiobook.topic}
              </h1>
            </div>
            <ProgressTracker
              audiobookId={id}
              onComplete={fetchAudiobook}
            />
          </div>
        </main>
      ) : isReady && audiobook.chapters.length > 0 ? (
        // ── Ready State — Player Layout
        <main className="flex-1 pt-14 flex overflow-hidden h-screen">
          {/* Sidebar — Chapter List */}
          <aside className="hidden md:flex flex-col w-72 lg:w-80 border-r border-white/[0.06] pt-6 pb-6 overflow-y-auto flex-shrink-0">
            {/* Book cover */}
            <div className="px-4 mb-6">
              <div
                className={`h-40 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
              >
                <BookOpen className="w-12 h-12 text-white/20" />
              </div>
              <div className="mt-4">
                <h2 className="font-semibold text-white text-sm leading-snug mb-1">
                  {audiobook.title || audiobook.topic}
                </h2>
                {audiobook.voiceName && (
                  <p className="text-xs text-white/35 flex items-center gap-1 mt-1">
                    <Mic className="w-3 h-3" />
                    {audiobook.voiceName}
                  </p>
                )}
                <a
                  href={`/api/audiobooks/${id}/download`}
                  download
                  className="mt-3 flex items-center gap-2 text-xs text-white/35 hover:text-amber-400 transition-colors group"
                >
                  <Download className="w-3.5 h-3.5 group-hover:text-amber-400" />
                  Download full audiobook (.mp3)
                </a>
              </div>
            </div>

            {/* Chapter list */}
            <div className="px-3 flex-1">
              <p className="text-[10px] text-white/25 uppercase tracking-widest px-3 mb-3">
                {audiobook.chapters.length} Chapters
              </p>
              <ChapterList
                chapters={audiobook.chapters}
                currentIndex={currentChapterIndex}
                onSelect={setCurrentChapterIndex}
              />
            </div>
          </aside>

          {/* Main — Player + Text */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
              {/* Mobile chapter badge */}
              <div className="md:hidden flex items-center gap-2">
                <Badge variant="outline">
                  Ch {currentChapter?.number} of {audiobook.chapters.length}
                </Badge>
              </div>

              {/* Audio Player */}
              {audiobook.chapters.length > 0 && (
                <AudioPlayer
                  chapters={audiobook.chapters}
                  initialChapter={currentChapterIndex}
                  onChapterChange={setCurrentChapterIndex}
                />
              )}

              {/* Chapter Text */}
              {currentChapter && (
                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6 md:p-8">
                  <div className="text-xs text-white/30 uppercase tracking-widest mb-3">
                    Chapter {currentChapter.number}
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-6 leading-snug">
                    {currentChapter.title}
                  </h2>
                  <div className="chapter-prose">
                    {currentChapter.content
                      .split("\n\n")
                      .filter(Boolean)
                      .map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        // ── Error / unexpected state
        <main className="flex-1 pt-14 flex items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-lg font-semibold text-white mb-2">
              {audiobook.status === "error"
                ? "Something went wrong"
                : "No chapters yet"}
            </h1>
            <p className="text-sm text-white/40">
              {audiobook.status === "error"
                ? "The audiobook failed to generate. Please try again."
                : "This audiobook is still being processed."}
            </p>
          </div>
        </main>
      )}
    </div>
  );
}
