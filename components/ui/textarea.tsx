import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full rounded-2xl glass-card px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40",
        "focus:outline-none focus:ring-2 focus:ring-primary/40",
        "transition-all duration-200 resize-none",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
export { Textarea };
