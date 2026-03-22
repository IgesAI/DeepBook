"use client";

import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";
import { Loader2, Search, FileText, Mic, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  { key: "researching", label: "Deep Research", icon: Search },
  { key: "formatting", label: "Crafting Script", icon: FileText },
  { key: "generating", label: "Narrating Audio", icon: Mic },
];

export function ProgressTracker({ audiobookId, onComplete }: ProgressTrackerProps) {
  const [job, setJob] = useState<Job>({
    status: "queued",
    progress: "Starting...",
    percent: 0,
  });

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
        // silently ignore network errors during polling
      }
    }

    poll();
    interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [audiobookId, onComplete]);

  const isError = job.status === "error";
  const isComplete = job.status === "complete";

  function getStepState(stepKey: string) {
    const order = ["researching", "formatting", "generating"];
    const currentIdx = order.indexOf(job.status);
    const stepIdx = order.indexOf(stepKey);
    if (isComplete) return "done";
    if (stepIdx < currentIdx) return "done";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] max-w-md mx-auto text-center gap-8 py-12">
      {isError ? (
        <>
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-white/50">{job.progress}</p>
          </div>
        </>
      ) : isComplete ? (
        <>
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Ready!</h2>
            <p className="text-sm text-white/50">Loading your audiobook...</p>
          </div>
        </>
      ) : (
        <>
          {/* Animated icon */}
          <div className="relative">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
            <div className="absolute -inset-3 rounded-3xl border border-amber-500/10 animate-ping" />
          </div>

          {/* Progress bar */}
          <div className="w-full space-y-2">
            <Progress value={job.percent} animated={job.percent > 0 && job.percent < 100} />
            <p className="text-sm text-white/50">{job.progress}</p>
          </div>

          {/* Steps */}
          <div className="w-full space-y-2">
            {STEPS.map(({ key, label, icon: Icon }) => {
              const state = getStepState(key);
              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                    state === "active" && "bg-amber-500/10 border border-amber-500/20",
                    state === "done" && "opacity-50",
                    state === "pending" && "opacity-25"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0",
                      state === "active" && "bg-amber-500/20 text-amber-400",
                      state === "done" && "bg-emerald-500/20 text-emerald-400",
                      state === "pending" && "bg-white/5 text-white/30"
                    )}
                  >
                    {state === "done" ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : state === "active" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      state === "active" ? "text-white" : "text-white/50"
                    )}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-white/30">
            Deep research can take 5–15 minutes. Feel free to come back later.
          </p>
        </>
      )}
    </div>
  );
}
