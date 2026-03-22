"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "glass" | "amber-fill";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "glass", size = "md", loading, children, disabled, ...props }, ref) => {
    const variants = {
      "amber-fill":
        "bg-primary text-on-primary-fixed font-bold shadow-[0_0_40px_rgba(255,185,95,0.3)] hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(255,185,95,0.4)]",
      primary:
        "bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20",
      secondary:
        "bg-secondary/10 border border-secondary/30 text-secondary hover:bg-secondary/20",
      glass:
        "glass-card border-0 text-on-surface hover:bg-white/10",
      ghost:
        "bg-transparent text-on-surface-variant hover:bg-white/5 hover:text-on-surface",
    };
    const sizes = {
      sm:   "h-8 px-3 text-xs rounded-xl",
      md:   "h-10 px-4 text-sm rounded-2xl",
      lg:   "h-12 px-6 text-sm rounded-full",
      icon: "h-10 w-10 rounded-full",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-label transition-all duration-200 cursor-pointer select-none",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export { Button };
