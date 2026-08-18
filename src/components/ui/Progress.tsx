import * as React from "react";
import { cn } from "@/lib/utils";

const TONE = {
  primary: "var(--gradient-primary)",
  success: "var(--success)",
  warning: "var(--tertiary)",
  danger: "var(--error)",
} as const;

export function Progress({
  value,
  tone = "primary",
  className,
}: Readonly<{ value: number; tone?: keyof typeof TONE; className?: string }>) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("w-full h-2 rounded-full bg-[var(--bg-3)] overflow-hidden", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-1000 motion-reduce:transition-none"
        style={{ width: `${pct}%`, background: TONE[tone] }}
      />
    </div>
  );
}
