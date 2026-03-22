"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  color?: "primary" | "secondary";
}

function Progress({ className, value = 0, color = "secondary", ...props }: ProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-white/5", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700",
          color === "secondary" ? "bg-secondary glow-emerald" : "bg-primary glow-amber"
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
export { Progress };
