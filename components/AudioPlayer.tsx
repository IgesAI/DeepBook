"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { formatDuration } from "@/lib/utils";

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

export function AudioPlayer({ chapters, initialChapter = 0, onChapterChange }: AudioPlayerProps) {
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
    if (isPlaying) audio.pause();
    else audio.play();
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
    <div className="glass-card-high rounded-[1.5rem] overflow-hidden">
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
      <div className="px-6 pt-6 pb-4">
        <div className="text-[10px] font-label text-on-surface-variant/40 mb-1 uppercase tracking-[0.18em]">
          Chapter {current?.number} of {chapters.length}
        </div>
        <h3 className="text-lg font-headline font-semibold text-on-surface leading-snug">
          {current?.title}
        </h3>
      </div>

      {/* Seekbar */}
      <div className="px-6 pb-2">
        <div className="cursor-pointer group py-2" onClick={seek}>
          <div className="relative h-1 rounded-full bg-white/8 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-none"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs font-label text-on-surface-variant/40 mt-0.5">
          <span>{formatDuration(currentTime)}</span>
          <span>{duration > 0 ? formatDuration(duration) : "--:--"}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-6 pb-6 pt-2">
        {/* Mute */}
        <button
          onClick={() => setMuted(!muted)}
          className="text-on-surface-variant/30 hover:text-on-surface-variant transition-colors p-1"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            {muted ? "volume_off" : "volume_up"}
          </span>
        </button>

        {/* Prev / Play / Next */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => goToChapter(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="text-on-surface-variant/50 hover:text-on-surface transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>skip_previous</span>
          </button>

          <button
            onClick={togglePlay}
            disabled={!current?.audioPath}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-on-primary-fixed hover:scale-105 transition-all duration-150 shadow-[0_0_30px_rgba(255,185,95,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {buffering ? (
              <span className="material-symbols-outlined animate-spin" style={{ fontSize: "22px", animationDuration: "1s" }}>
                progress_activity
              </span>
            ) : isPlaying ? (
              <span className="material-symbols-outlined" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>pause</span>
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1", marginLeft: "2px" }}>play_arrow</span>
            )}
          </button>

          <button
            onClick={() => goToChapter(currentIndex + 1)}
            disabled={currentIndex === chapters.length - 1}
            className="text-on-surface-variant/50 hover:text-on-surface transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>skip_next</span>
          </button>
        </div>

        {/* Download chapter */}
        {current?.audioPath ? (
          <a
            href={current.audioPath}
            download={`chapter-${current.number}.mp3`}
            className="text-on-surface-variant/30 hover:text-primary transition-colors p-1"
            title="Download chapter"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>download</span>
          </a>
        ) : (
          <div className="w-8" />
        )}
      </div>
    </div>
  );
}
