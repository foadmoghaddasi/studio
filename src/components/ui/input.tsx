
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-full px-3 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground", // Base styles: h-10 to h-12, py-2 to py-3, ensured text-base
          "border border-[hsl(var(--input-border-color-hsl))]", // Default border
          "bg-[var(--input-background)]", // Default background
          "placeholder:text-[var(--input-placeholder)]", // Placeholder text color
          "focus-visible:outline-none focus-visible:border-2 focus-visible:border-[hsl(var(--input-border-color-hsl))] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background", // Focus styles
          "disabled:cursor-not-allowed disabled:opacity-50", // Disabled styles
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
