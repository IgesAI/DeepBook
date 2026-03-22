import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl glass-card px-4 text-sm text-on-surface placeholder:text-on-surface-variant/40",
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-0",
        "transition-all duration-200",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
export { Input };
