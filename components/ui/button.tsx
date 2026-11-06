import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background,box-shadow,transform] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Kolara primary (green) */
        default:
          "bg-primary text-white shadow-[0_1px_2px_rgba(49,123,103,.25)] hover:bg-[var(--green-hover)]",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        /* white surface with hairline border */
        outline:
          "border border-[var(--line)] bg-[var(--surface)] font-normal text-[var(--ink)] hover:border-[var(--line-2)] hover:bg-[var(--surface-2)]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-[var(--ink-2)] hover:bg-[var(--bg)] hover:text-[var(--ink)]",
        link: "h-auto gap-1.5 p-0 text-xs text-[var(--green)] hover:underline",
      },
      size: {
        default: "h-9 rounded-[9px] px-3.5 text-[13px]",
        xs: "h-6 rounded-md px-2 text-xs",
        sm: "h-[30px] rounded-[9px] px-2.5 text-xs",
        lg: "h-11 rounded-[10px] px-5 text-[13px]",
        icon: "size-[34px] rounded-lg",
        "icon-xs": "size-[22px] rounded-md",
        "icon-sm": "size-[28px] rounded-[7px]",
        "icon-lg": "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
