import * as React from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"article">) {
  return <article data-slot="card" className={cn("card", className)} {...props} />
}
function CardHeader({ className, ...props }: React.ComponentProps<"header">) {
  return <header data-slot="card-header" className={cn("card-head", className)} {...props} />
}
function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 data-slot="card-title" className={cn(className)} {...props} />
}
function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="card-description" className={cn(className)} {...props} />
}
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn(className)} {...props} />
}
function CardFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return <footer data-slot="card-footer" className={cn(className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
