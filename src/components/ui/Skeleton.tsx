import * as React from "react";
import { cn } from "@/lib/utils";

// Skeletal shimmer that matches layout dimensions — replaces raw spinners
// where a content placeholder is more honest about what's loading.
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-xl bg-[var(--bg-2)]", className)}
      aria-hidden
      {...props}
    >
      <div className="absolute inset-0 animate-[energy-pulse_1.6s_infinite_linear] bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--primary)_12%,transparent),transparent)] motion-reduce:hidden" />
    </div>
  );
}
