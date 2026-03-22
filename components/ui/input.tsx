import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl bg-white/5 border border-white/10",
        "px-4 text-sm text-white placeholder:text-white/30",
        "focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40",
        "transition-all duration-150",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
