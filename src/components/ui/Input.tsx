import * as React from "react";
import { cn } from "@/lib/utils";

const baseField =
  "w-full bg-[var(--bg-2)] border border-[var(--border-1)] rounded-xl px-3.5 py-2.5 text-[var(--text-0)] text-sm outline-none transition-colors focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_30%,transparent)] disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(baseField, "placeholder:text-[var(--text-3)]", className)} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(baseField, "placeholder:text-[var(--text-3)] resize-y min-h-24", className)} {...props} />
  )
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cn(baseField, "cursor-pointer", className)} {...props} />
  )
);
Select.displayName = "Select";

// Label positioned above the control (per the design taste guide), with optional error/hint.
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: Readonly<{
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div className={cn("flex flex-col gap-1.5 text-sm", className)}>
      <label htmlFor={htmlFor} className="text-[var(--text-3)] font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-xs text-[var(--error)]">{error}</span>
      ) : hint ? (
        <span className="text-xs text-[var(--text-3)]">{hint}</span>
      ) : null}
    </div>
  );
}
