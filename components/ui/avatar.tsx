"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

type Tone = "mint" | "sand" | "lilac" | "blue"

/** Initials avatar (`.avatar` + tone). */
function Avatar({
  className,
  tone,
  large,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & { tone?: Tone; large?: boolean }) {
  return <AvatarPrimitive.Root data-slot="avatar" className={cn("avatar", tone, large && "lg", className)} {...props} />
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("size-full object-cover", className)} {...props} />
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return <AvatarPrimitive.Fallback data-slot="avatar-fallback" className={cn(className)} {...props} />
}

/** Convenience: <UserAvatar ini="AM" tone="mint" /> */
function UserAvatar({ ini, tone, large, className }: { ini: string; tone?: Tone; large?: boolean; className?: string }) {
  return (
    <Avatar tone={tone} large={large} className={className}>
      <AvatarFallback>{ini}</AvatarFallback>
    </Avatar>
  )
}

export { Avatar, AvatarImage, AvatarFallback, UserAvatar }
