import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full rounded-xl bg-white/5 border border-white/10",
        "px-4 py-3 text-sm text-white placeholder:text-white/30",
        "focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40",
        "transition-all duration-150 resize-none",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
