import NextLink from "next/link"
import * as React from "react"

import { cn } from "@/lib/utils"

export const Link = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <NextLink href={props.href as string} className={cn(className)} ref={ref} {...props}>
        {children}
      </NextLink>
    )
  },
)
Link.displayName = "Link"
