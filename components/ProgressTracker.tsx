"use client";

import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Job {
  status: string;
  progress: string;
  percent: number;
}

interface ProgressTrackerProps {
  audiobookId: string;
  onComplete?: () => void;
}

const STEPS = [
  { key: "researching", label: "Deep Research",     icon: "search"         },
  { key: "formatting",  label: "Crafting Script",   icon: "edit_document"  },
  { key: "generating",  label: "Narrating Audio",   icon: "record_voice_over" },
];

const STATUS_MESSAGES: Record<string, string[]> = {
  queued:      ["Your request is queued...", "Starting the process..."],
  researching: [
    "Scanning primary sources...",
    "Cross-referencing literature...",
    "Synthesising key findings...",
    "Analysing core concepts...",
    "Building comprehensive overview...",
    "Evaluating expert perspectives...",
    "Compiling research notes...",
  ],
  formatting: [
    "Structuring chapters...",
    "Crafting the narrative arc...",
    "Refining the script...",
    "Adding depth to each section...",
    "Polishing the writing...",
  ],
  generating: [
    "Recording narrator voice...",
    "Rendering narration audio...",
    "Processing chapter audio...",
    "Finalising audio tracks...",
    "Assembling the audiobook...",
  ],
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function ProgressTracker({ audiobookId, onComplete }: ProgressTrackerProps) {
  const router = useRouter();
  const [job, setJob] = useState<Job>({ status: "queued", progress: "Starting...", percent: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Polling
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function poll() {
      try {
        const res = await fetch(`/api/jobs/${audiobookId}`);
        if (!res.ok) return;
        const data: Job = await res.json();
        setJob(data);

        if (data.status === "complete") {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 1200);
        } else if (data.status === "error") {
          clearInterval(interval);
        }
      } catch {
        // silently ignore network errors
      }
    }

    poll();
    interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [audiobookId, onComplete]);

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Rotate status messages
  useEffect(() => {
    const messages = STATUS_MESSAGES[job.status] || STATUS_MESSAGES.queued;
    setMsgIndex(0);
    const t = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 4000);
    return () => clearInterval(t);
  }, [job.status]);

  async function handleCancel() {
    if (!confirmCancel) { setConfirmCancel(true); return; }
    setCancelling(true);
    await fetch(`/api/audiobooks/${audiobookId}/cancel`, { method: "POST" });
    router.push("/dashboard");
  }

  const isError    = job.status === "error";
  const isComplete = job.status === "complete";
  const messages   = STATUS_MESSAGES[job.status] || STATUS_MESSAGES.queued;
  const currentMsg = messages[msgIndex] ?? messages[0];

  function getStepState(stepKey: string) {
    const order = ["researching", "formatting", "generating"];
    const currentIdx = order.indexOf(job.status);
    const stepIdx    = order.indexOf(stepKey);
    if (isComplete)            return "done";
    if (stepIdx < currentIdx)  return "done";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-12">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-error/10 ring-1 ring-error/20">
          <span className="material-symbols-outlined text-error text-3xl">error</span>
        </div>
        <div>
          <h2 className="text-xl font-headline font-semibold text-on-surface mb-2">Something went wrong</h2>
          <p className="text-sm text-on-surface-variant/60">{job.progress}</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-12">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 ring-1 ring-secondary/20">
          <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <div>
          <h2 className="text-xl font-headline font-semibold text-on-surface mb-2">Ready to listen</h2>
          <p className="text-sm text-on-surface-variant/50">Loading your audiobook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-8 py-8">

      {/* ── Ambient ring animation ── */}
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Outermost ring */}
        <div className="absolute inset-0 rounded-full border border-primary/8 animate-pulse-ring" />
        {/* Rotating dashed ring */}
        <div className="absolute inset-3 rounded-full border border-dashed border-primary/15 animate-spin-slow" />
        {/* Inner reverse ring */}
        <div className="absolute inset-7 rounded-full border border-primary/20 animate-spin-reverse" />
        {/* Core orb */}
        <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 ring-1 ring-primary/25 shadow-[0_0_30px_rgba(255,185,95,0.2)]">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
          >
            auto_stories
          </span>
        </div>
      </div>

      {/* ── Stage label + rotating message ── */}
      <div className="space-y-2">
        <div className="text-[10px] font-label text-on-surface-variant/40 uppercase tracking-[0.2em]">
          {STEPS.find((s) => s.key === job.status)?.label ?? "Processing"}
        </div>
        <p
          key={currentMsg}
          className="text-sm font-label text-on-surface-variant/70 animate-fade-cycle"
        >
          {currentMsg}
        </p>
      </div>

      {/* ── Progress bar ── */}
      <div className="w-full max-w-xs space-y-2">
        <Progress value={job.percent} color="primary" />
        <div className="flex justify-between text-[11px] font-label text-on-surface-variant/40">
          <span>{job.percent > 0 ? `${job.percent}%` : "Starting..."}</span>
          <span>{formatElapsed(elapsed)} elapsed</span>
        </div>
      </div>

      {/* ── Stage steps ── */}
      <div className="w-full max-w-xs space-y-1.5">
        {STEPS.map(({ key, label, icon }) => {
          const state = getStepState(key);
          return (
            <div
              key={key}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-500",
                state === "active"  && "bg-primary/8 ring-1 ring-primary/15",
                state === "done"    && "opacity-50",
                state === "pending" && "opacity-20"
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-xl transition-all",
                  state === "active"  && "bg-primary/20 text-primary",
                  state === "done"    && "bg-secondary/20 text-secondary",
                  state === "pending" && "bg-surface-container text-on-surface-variant/30"
                )}
              >
                {state === "done" ? (
                  <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>check</span>
                ) : state === "active" ? (
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: "14px", animationDuration: "2s" }}>progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{icon}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-label",
                  state === "active" ? "text-on-surface font-medium" : "text-on-surface-variant/60"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Reassurance copy ── */}
      <div className="space-y-1 text-center">
        <p className="text-xs font-label text-on-surface-variant/35">
          Thorough research takes 5–15 minutes.
        </p>
        <p className="text-xs font-label text-on-surface-variant/25">
          You can safely close this tab. Your audiobook will be ready when you return.
        </p>
      </div>

      {/* ── Cancel button ── */}
      <div className="flex items-center gap-2">
        {confirmCancel ? (
          <>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-error/15 border border-error/25 text-error text-xs font-label font-medium hover:bg-error/20 transition-colors disabled:opacity-50"
            >
              {cancelling ? (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: "13px", animationDuration: "1s" }}>progress_activity</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>delete_forever</span>
              )}
              {cancelling ? "Cancelling..." : "Yes, cancel it"}
            </button>
            <button
              onClick={() => setConfirmCancel(false)}
              className="px-3 py-2 rounded-xl glass-card text-on-surface-variant/50 hover:text-on-surface text-xs font-label transition-colors"
            >
              Keep going
            </button>
          </>
        ) : (
          <button
            onClick={handleCancel}
            className="text-xs font-label text-on-surface-variant/25 hover:text-on-surface-variant/50 transition-colors"
          >
            Cancel generation
          </button>
        )}
      </div>
    </div>
  );
}
