import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-semibold whitespace-nowrap rounded-lg border",
  {
    variants: {
      variant: {
        subtle: "text-[var(--primary)] bg-[rgba(143,245,255,0.08)] border-[rgba(143,245,255,0.12)]",
        success:
          "text-[var(--success)] bg-[color-mix(in_srgb,var(--success)_12%,transparent)] border-[color-mix(in_srgb,var(--success)_25%,transparent)]",
        warning:
          "text-[var(--tertiary)] bg-[color-mix(in_srgb,var(--tertiary)_12%,transparent)] border-[color-mix(in_srgb,var(--tertiary)_25%,transparent)]",
        danger:
          "text-[var(--error)] bg-[color-mix(in_srgb,var(--error)_12%,transparent)] border-[color-mix(in_srgb,var(--error)_25%,transparent)]",
        neutral: "text-[var(--text-2)] bg-[var(--bg-2)] border-[var(--border-1)]",
      },
      size: { sm: "text-[10px] px-2 py-0.5", md: "text-[11px] px-2.5 py-1" },
    },
    defaultVariants: { variant: "subtle", size: "md" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
