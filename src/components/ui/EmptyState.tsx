import * as React from "react";
import { cn } from "@/lib/utils";

// Composed empty state with guidance + optional action — never a bare "no data".
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: Readonly<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        "glass-panel flex flex-col items-center justify-center text-center gap-3 py-14 px-8",
        className
      )}
    >
      {icon && <div className="text-[var(--text-3)] mb-1">{icon}</div>}
      <h3 className="text-lg font-bold font-display text-[var(--text-0)]">{title}</h3>
      {description && <p className="text-sm text-[var(--text-3)] max-w-sm">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
