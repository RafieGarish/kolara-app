import * as React from "react"
import { cn } from "@/lib/utils"

export type PillStatus = "progress" | "review" | "todo" | "done"

/** Status pill (`.pill` + status colour) with the leading dot. */
function Badge({
  className,
  status = "todo",
  children,
  ...props
}: React.ComponentProps<"span"> & { status?: PillStatus }) {
  return (
    <span data-slot="badge" className={cn("pill", status, className)} {...props}>
      <i />
      {children}
    </span>
  )
}

export { Badge }
