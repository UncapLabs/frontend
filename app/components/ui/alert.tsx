import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-2xl border bg-white p-6 text-sm flex gap-3 items-start shadow-sm transition-all",
  {
    variants: {
      variant: {
        default: "border-neutral-200 text-neutral-700",
        info: "border-blue-500 text-blue-700",
        warning: "border-[#FF9300] text-amber-700",
        success: "border-green-500 text-green-700",
        destructive: "border-red-500 text-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const alertIconVariants = cva(
  "w-8 h-8 rounded-lg flex justify-center items-center shrink-0",
  {
    variants: {
      variant: {
        default: "bg-neutral-100",
        info: "bg-blue-50",
        warning: "bg-[#FFF4E5]",
        success: "bg-green-50",
        destructive: "bg-red-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertIcon({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertIconVariants>) {
  return (
    <div
      data-slot="alert-icon"
      className={cn(alertIconVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <strong
      data-slot="alert-title"
      className={cn(
        "font-medium font-sora text-sm text-[#242424] leading-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "flex flex-col gap-1 text-xs font-normal font-sora text-[#AAA28E] leading-normal [&_p]:leading-normal [&_p]:text-xs [&_p]:text-[#AAA28E] [&_strong]:font-medium [&_strong]:text-sm [&_strong]:text-[#242424]",
        className
      )}
      {...props}
    />
  )
}

function AlertContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-content"
      className={cn("flex-1", className)}
      {...props}
    />
  )
}

export { Alert, AlertIcon, AlertTitle, AlertDescription, AlertContent }
