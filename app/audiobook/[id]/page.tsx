"use client";

import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ChapterList } from "@/components/ChapterList";
import { ProgressTracker } from "@/components/ProgressTracker";
import { Badge } from "@/components/ui/badge";
import { gradientForId } from "@/lib/utils";
import { cn } from "@/lib/utils";

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
  voiceId: string;
  voiceName: string;
  status: string;
  chapters: Chapter[];
}

export default function AudiobookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [audiobook, setAudiobook] = useState<Audiobook | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sequel state
  const [generatingSequel, setGeneratingSequel] = useState(false);

  const fetchAudiobook = useCallback(async () => {
    const res = await fetch(`/api/audiobooks/${id}`);
    if (res.ok) setAudiobook(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchAudiobook(); }, [fetchAudiobook]);

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    await fetch(`/api/audiobooks/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  async function handleSequel() {
    if (!audiobook) return;
    setGeneratingSequel(true);
    const res = await fetch("/api/audiobooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: audiobook.title || audiobook.topic,
        voiceId: audiobook.voiceId,
        voiceName: audiobook.voiceName,
        sequelOf: audiobook.id,
      }),
    });
    if (res.ok) {
      const sequel = await res.json();
      router.push(`/audiobook/${sequel.id}`);
    } else {
      setGeneratingSequel(false);
    }
  }

  const isProcessing = audiobook && ["queued", "researching", "formatting", "generating"].includes(audiobook.status);
  const isReady      = audiobook?.status === "complete";
  const currentChapter = audiobook?.chapters[currentChapterIndex];
  const gradient     = id ? gradientForId(id) : "from-amber-900/60 to-orange-900/40";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!audiobook) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
        <span className="material-symbols-outlined text-on-surface-variant/20 text-5xl">menu_book</span>
        <h1 className="font-headline font-semibold text-xl text-on-surface">Audiobook not found</h1>
        <p className="text-sm font-label text-on-surface-variant/40">This audiobook may have been deleted.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav active="library" />

      {/* ── Processing state ── */}
      {isProcessing && (
        <main className="flex-1 pt-20 lg:pl-64 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-sm">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-8`}>
              <span className="material-symbols-outlined text-white/20 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_stories
              </span>
            </div>
            <div className="text-center mb-6">
              <p className="text-[10px] font-label text-on-surface-variant/40 uppercase tracking-[0.2em] mb-2">Creating</p>
              <h1 className="font-headline font-semibold text-xl text-on-surface leading-snug">{audiobook.topic}</h1>
            </div>
            <ProgressTracker audiobookId={id} onComplete={fetchAudiobook} />
          </div>
        </main>
      )}

      {/* ── Ready state ── */}
      {isReady && audiobook.chapters.length > 0 && (
        <main className="flex-1 pt-20 lg:pl-64 flex overflow-hidden" style={{ height: "100vh" }}>

          {/* Sidebar */}
          <aside className="hidden md:flex flex-col w-72 lg:w-80 border-r border-white/[0.06] overflow-y-auto flex-shrink-0 pt-4 pb-6">
            {/* Cover */}
            <div className="px-4 mb-5">
              <div className={`h-44 rounded-[1.5rem] bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
                <div className="noise-overlay" />
                <span className="material-symbols-outlined text-white/10 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_stories
                </span>
              </div>
              <div className="mt-4 px-1 space-y-1">
                <h2 className="font-headline font-semibold text-on-surface text-sm leading-snug">
                  {audiobook.title || audiobook.topic}
                </h2>
                {audiobook.voiceName && (
                  <p className="text-xs font-label text-on-surface-variant/40 flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>mic</span>
                    {audiobook.voiceName}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 mb-5 space-y-2">
              {/* Download */}
              <a
                href={`/api/audiobooks/${id}/download`}
                download
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-2xl glass-card border-0 text-on-surface-variant/60 hover:text-on-surface text-xs font-label transition-colors group"
              >
                <span className="material-symbols-outlined group-hover:text-primary transition-colors" style={{ fontSize: "16px" }}>download</span>
                Download full audiobook
              </a>

              {/* Generate Sequel */}
              <button
                onClick={handleSequel}
                disabled={generatingSequel}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary/15 text-xs font-label transition-colors disabled:opacity-50"
              >
                {generatingSequel ? (
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: "16px", animationDuration: "1s" }}>progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>auto_stories</span>
                )}
                {generatingSequel ? "Starting sequel..." : "Generate Sequel"}
              </button>

              {/* Delete */}
              {confirmDelete ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-error/15 border border-error/25 text-error text-xs font-label font-medium hover:bg-error/20 transition-colors disabled:opacity-50"
                  >
                    {deleting ? (
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: "14px", animationDuration: "1s" }}>progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>delete_forever</span>
                    )}
                    Confirm delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-2.5 rounded-2xl glass-card border-0 text-on-surface-variant/50 hover:text-on-surface text-xs font-label transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleDelete}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2.5 rounded-2xl glass-card border-0",
                    "text-on-surface-variant/40 hover:text-error text-xs font-label transition-colors"
                  )}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                  Delete audiobook
                </button>
              )}
            </div>

            {/* Chapter list */}
            <div className="px-3 flex-1">
              <p className="text-[10px] font-label text-on-surface-variant/25 uppercase tracking-[0.18em] px-3 mb-3">
                {audiobook.chapters.length} Chapters
              </p>
              <ChapterList
                chapters={audiobook.chapters}
                currentIndex={currentChapterIndex}
                onSelect={setCurrentChapterIndex}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full px-5 py-8 flex flex-col gap-6">

              {/* Mobile badges */}
              <div className="md:hidden flex items-center gap-2 flex-wrap">
                <Badge variant="outline">
                  Ch {currentChapter?.number} of {audiobook.chapters.length}
                </Badge>
                {audiobook.voiceName && (
                  <Badge variant="outline">
                    <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>mic</span>
                    {audiobook.voiceName}
                  </Badge>
                )}
              </div>

              {/* Audio Player */}
              <AudioPlayer
                chapters={audiobook.chapters}
                initialChapter={currentChapterIndex}
                onChapterChange={setCurrentChapterIndex}
              />

              {/* Mobile actions */}
              <div className="md:hidden flex gap-2">
                <a
                  href={`/api/audiobooks/${id}/download`}
                  download
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl glass-card border-0 text-on-surface-variant/60 text-xs font-label"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>download</span>
                  Download
                </a>
                <button
                  onClick={handleSequel}
                  disabled={generatingSequel}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary text-xs font-label disabled:opacity-50"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>auto_stories</span>
                  {generatingSequel ? "Starting..." : "Sequel"}
                </button>
              </div>

              {/* Mobile chapter list */}
              <div className="md:hidden glass-card rounded-[1.5rem] p-4">
                <p className="text-[10px] font-label text-on-surface-variant/30 uppercase tracking-[0.18em] mb-3">
                  {audiobook.chapters.length} Chapters
                </p>
                <ChapterList
                  chapters={audiobook.chapters}
                  currentIndex={currentChapterIndex}
                  onSelect={setCurrentChapterIndex}
                />
              </div>

              {/* Chapter text */}
              {currentChapter && (
                <div className="glass-card rounded-[1.5rem] p-6 md:p-8">
                  <div className="text-[10px] font-label text-on-surface-variant/30 uppercase tracking-[0.18em] mb-3">
                    Chapter {currentChapter.number}
                  </div>
                  <h2 className="font-headline font-semibold text-xl text-on-surface mb-6 leading-snug">
                    {currentChapter.title}
                  </h2>
                  <div className="chapter-prose">
                    {currentChapter.content
                      .split("\n\n")
                      .filter(Boolean)
                      .map((para, i) => <p key={i}>{para}</p>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ── Error / unexpected state ── */}
      {!isProcessing && !isReady && (
        <main className="flex-1 pt-20 lg:pl-64 flex items-center justify-center px-6">
          <div className="text-center">
            <span className="material-symbols-outlined text-error/50 text-4xl mb-4 block">error</span>
            <h1 className="font-headline font-semibold text-lg text-on-surface mb-2">
              {audiobook.status === "error" ? "Something went wrong" : "No chapters yet"}
            </h1>
            <p className="text-sm font-label text-on-surface-variant/40 mb-4">
              {audiobook.status === "error"
                ? "The audiobook failed to generate. Please try again."
                : "This audiobook is still being processed."}
            </p>
            <button
              onClick={handleDelete}
              className="text-xs font-label text-on-surface-variant/30 hover:text-error transition-colors"
            >
              Delete and start over
            </button>
          </div>
        </main>
      )}
    </div>
  );
}
