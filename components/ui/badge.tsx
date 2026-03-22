import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary" | "tertiary" | "error" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default:    "bg-surface-container-high text-on-surface-variant",
    primary:    "bg-primary/15 text-primary border border-primary/25",
    secondary:  "bg-secondary/15 text-secondary border border-secondary/25",
    tertiary:   "bg-tertiary/15 text-tertiary border border-tertiary/25",
    error:      "bg-error/15 text-error border border-error/25",
    outline:    "border border-outline-variant text-on-surface-variant",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-label font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
export { Badge };
