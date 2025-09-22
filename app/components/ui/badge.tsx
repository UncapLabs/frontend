import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2 py-1 h-6 justify-center rounded-md border text-xs font-normal font-sora transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-100 border-neutral-200 text-neutral-600",
        secondary:
          "bg-neutral-100 border-neutral-200 text-neutral-600",
        destructive:
          "bg-red-500/10 border-red-500/20 text-red-700",
        outline: "border-neutral-200 text-neutral-800",
        warning:
          "bg-amber-500/10 border-amber-500/20 text-amber-700",
        success:
          "bg-emerald-500/10 border-emerald-500/20 text-emerald-700",
        pending:
          "bg-neutral-100 border-neutral-200 text-neutral-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
