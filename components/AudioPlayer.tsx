"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";

interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  audioPath: string;
}

interface AudioPlayerProps {
  chapters: Chapter[];
  initialChapter?: number;
  onChapterChange?: (index: number) => void;
}

export function AudioPlayer({
  chapters,
  initialChapter = 0,
  onChapterChange,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialChapter);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [buffering, setBuffering] = useState(false);

  const current = chapters[currentIndex];

  const goToChapter = useCallback(
    (index: number) => {
      if (index < 0 || index >= chapters.length) return;
      setCurrentIndex(index);
      setCurrentTime(0);
      setIsPlaying(false);
      onChapterChange?.(index);
    },
    [chapters.length, onChapterChange]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (currentIndex < chapters.length - 1) {
        goToChapter(currentIndex + 1);
        // Auto-play next chapter
        setTimeout(() => audioRef.current?.play(), 100);
      } else {
        setIsPlaying(false);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("loadedmetadata", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("loadedmetadata", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [currentIndex, chapters.length, goToChapter]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
  }

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
      {/* Hidden audio element */}
      {current?.audioPath && (
        <audio
          ref={audioRef}
          key={current.audioPath}
          src={current.audioPath}
          muted={muted}
          preload="metadata"
        />
      )}

      {/* Chapter info */}
      <div className="px-6 pt-5 pb-4">
        <div className="text-xs text-white/40 mb-1 uppercase tracking-widest">
          Chapter {current?.number}
        </div>
        <h3 className="text-lg font-semibold text-white leading-snug">
          {current?.title}
        </h3>
      </div>

      {/* Seekbar */}
      <div className="px-6 pb-3">
        <div
          className="cursor-pointer group py-2"
          onClick={seek}
        >
          <div className="relative h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-amber-500 transition-none"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-white/30 mt-1">
          <span>{formatDuration(currentTime)}</span>
          <span>{duration > 0 ? formatDuration(duration) : "--:--"}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-6 pb-5">
        <button
          onClick={() => setMuted(!muted)}
          className="text-white/30 hover:text-white/70 transition-colors"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={() => goToChapter(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="text-white/50 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            disabled={!current?.audioPath}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-150",
              "bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {buffering ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <button
            onClick={() => goToChapter(currentIndex + 1)}
            disabled={currentIndex === chapters.length - 1}
            className="text-white/50 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {current?.audioPath && (
          <a
            href={current.audioPath}
            download={`chapter-${current.number}.mp3`}
            className="text-white/30 hover:text-white/70 transition-colors"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
