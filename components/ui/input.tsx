import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[9px] border border-[var(--line)] bg-[var(--surface)] px-3 text-[13px] text-[var(--ink)] transition-[color,box-shadow] outline-none placeholder:text-[var(--ink-3)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-[var(--green)] focus-visible:ring-[3px] focus-visible:ring-[rgba(49,123,103,.12)]",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
