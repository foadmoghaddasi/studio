
"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      // Root background and border for checked state
      "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
      // Root background and border for unchecked state
      "data-[state=unchecked]:bg-primary/10 data-[state=unchecked]:border-primary",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block rounded-full shadow-lg ring-0 transition-all", // transition-all for size, color, transform
        // Unchecked state: 16x16px, primary color, 8px offset
        "data-[state=unchecked]:h-4 data-[state=unchecked]:w-4",
        "data-[state=unchecked]:bg-primary",
        "data-[state=unchecked]:translate-x-2 data-[state=unchecked]:rtl:-translate-x-2", // 8px offset (0.5rem)
        // Checked state: 24x24px, background color (white), 8px offset from the other side
        "data-[state=checked]:h-6 data-[state=checked]:w-6",
        "data-[state=checked]:bg-background",
        // Calculation for checked translate: track_inner_width (52-4=48) - thumb_width (24) - offset (8) = 16px. 16px is translate-x-4.
        "data-[state=checked]:ltr:translate-x-4 data-[state=checked]:rtl:-translate-x-4"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
