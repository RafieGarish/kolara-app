"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

/** Thin Kolara bar (`.bar`). `large` = the 6px momentum bar. */
function Progress({
  className,
  value,
  large,
  indicatorClassName,
  indicatorStyle,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  large?: boolean
  indicatorClassName?: string
  indicatorStyle?: React.CSSProperties
}) {
  return (
    <ProgressPrimitive.Root data-slot="progress" value={value} className={cn("bar", large && "lg", className)} {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={indicatorClassName}
        style={{ width: `${value || 0}%`, ...indicatorStyle }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
