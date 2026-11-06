"use client"

import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

/** Segmented control (List/Board, Grid/List, Month/Week/Day) – styled by `.seg` / `.seg-btn`. */
function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return <ToggleGroupPrimitive.Root data-slot="toggle-group" className={cn("seg", className)} {...props} />
}

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn("seg-btn outline-none focus-visible:ring-2 focus-visible:ring-ring/40", className)}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
