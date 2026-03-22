"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Voice {
  voice_id: string;
  name: string;
  preview_url: string;
  labels: Record<string, string>;
}

interface VoiceSelectorProps {
  value: string;
  onChange: (voiceId: string, voiceName: string) => void;
}

export function VoiceSelector({ value, onChange }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/voices")
      .then((r) => r.json())
      .then((data) => {
        setVoices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function previewVoice(voice: Voice, e: React.MouseEvent) {
    e.stopPropagation();
    if (!voice.preview_url) return;

    if (playing === voice.voice_id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }

    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(voice.preview_url);
    audioRef.current = audio;
    audio.onended = () => setPlaying(null);
    audio.play();
    setPlaying(voice.voice_id);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-on-surface-variant/50 text-sm font-label py-2">
        <span className="material-symbols-outlined text-base animate-spin" style={{ animationDuration: "1s" }}>
          progress_activity
        </span>
        Loading voices...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {voices.map((voice) => {
        const isSelected = value === voice.voice_id;
        const isPlaying = playing === voice.voice_id;
        const description = voice.labels?.description || voice.labels?.use_case || "Narrator";
        const accent = voice.labels?.accent || "";

        return (
          <div
            key={voice.voice_id}
            role="button"
            tabIndex={0}
            onClick={() => onChange(voice.voice_id, voice.name)}
            onKeyDown={(e) => e.key === "Enter" && onChange(voice.voice_id, voice.name)}
            className={cn(
              "relative flex items-start gap-3 p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer",
              isSelected
                ? "bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(255,185,95,0.08)]"
                : "glass-card border-0 hover:ring-1 hover:ring-white/15"
            )}
          >
            <div
              className={cn(
                "mt-0.5 flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-xl transition-colors",
                isSelected ? "bg-primary/20 text-primary" : "bg-white/5 text-on-surface-variant/50"
              )}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>mic</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-label font-medium text-sm text-on-surface truncate">{voice.name}</div>
              <div className="text-xs text-on-surface-variant/50 capitalize truncate">
                {[description, accent].filter(Boolean).join(" · ")}
              </div>
            </div>

            <div className="flex-shrink-0 flex items-center gap-1">
              {voice.preview_url && (
                <button
                  type="button"
                  onClick={(e) => previewVoice(voice, e)}
                  className="text-on-surface-variant/30 hover:text-primary transition-colors p-0.5"
                  title={isPlaying ? "Stop preview" : "Preview voice"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                    {isPlaying ? "stop" : "play_circle"}
                  </span>
                </button>
              )}
              {isSelected && (
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
