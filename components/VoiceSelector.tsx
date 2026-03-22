"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Play, Square, Check, Loader2 } from "lucide-react";
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

    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(voice.preview_url);
    audioRef.current = audio;
    audio.onended = () => setPlaying(null);
    audio.play();
    setPlaying(voice.voice_id);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading voices...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {voices.map((voice) => {
        const isSelected = value === voice.voice_id;
        const isPlaying = playing === voice.voice_id;
        const description =
          voice.labels?.description || voice.labels?.use_case || "Narrator";
        const accent = voice.labels?.accent || "";

        return (
          <div
            key={voice.voice_id}
            role="button"
            tabIndex={0}
            onClick={() => onChange(voice.voice_id, voice.name)}
            onKeyDown={(e) => e.key === "Enter" && onChange(voice.voice_id, voice.name)}
            className={cn(
              "relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer",
              isSelected
                ? "bg-amber-500/10 border-amber-500/40 text-white"
                : "bg-white/[0.03] border-white/[0.07] text-white/70 hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
            )}
          >
            <div
              className={cn(
                "mt-0.5 flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-colors",
                isSelected
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-white/10 text-white/40"
              )}
            >
              <Mic className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{voice.name}</div>
              <div className="text-xs text-white/40 capitalize truncate">
                {[description, accent].filter(Boolean).join(" · ")}
              </div>
            </div>

            {/* Preview & check — use a real button here since no nesting issue with div parent */}
            <div className="flex-shrink-0 flex items-center gap-1">
              {voice.preview_url && (
                <button
                  type="button"
                  onClick={(e) => previewVoice(voice, e)}
                  className="text-white/30 hover:text-white/70 transition-colors"
                  title="Preview voice"
                >
                  {isPlaying ? (
                    <Square className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                </button>
              )}
              {isSelected && (
                <Check className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
