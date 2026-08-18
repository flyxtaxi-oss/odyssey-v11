import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Boutons du design system "DeepSpace" — une seule source de vérité, accessible.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-display font-semibold tracking-[0.02em] transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-0)] disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        solid:
          "text-[#00343a] font-bold bg-[linear-gradient(135deg,var(--primary),var(--primary-dim))] hover:shadow-[0_0_28px_rgba(143,245,255,0.30)] hover:-translate-y-px",
        subtle:
          "text-[var(--primary)] bg-[rgba(143,245,255,0.08)] border border-[rgba(143,245,255,0.20)] backdrop-blur-md hover:bg-[rgba(143,245,255,0.15)] hover:border-[rgba(143,245,255,0.40)] hover:-translate-y-px",
        outline:
          "text-[var(--text-1)] bg-transparent border border-[var(--border-1)] hover:border-[var(--primary)] hover:text-[var(--text-0)]",
        ghost: "text-[var(--text-2)] hover:text-[var(--text-0)] hover:bg-[var(--bg-2)]",
        danger: "text-white bg-[var(--error)] hover:bg-[var(--error-dim)]",
      },
      size: {
        sm: "text-xs px-3 py-2",
        md: "text-[13px] px-5 py-2.5",
        lg: "text-sm px-7 py-3.5",
        icon: "p-2.5",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { buttonVariants };
