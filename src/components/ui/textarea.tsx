
import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg px-3 py-2 text-base ring-offset-background file:text-sm file:font-medium file:text-foreground', // Base styles, ensured text-base
          'border border-[hsl(var(--input-border-color-hsl))]', // Default border
          'bg-[var(--input-background)]', // Default background
          'placeholder:text-[var(--input-placeholder)]', // Placeholder text color
          'focus-visible:outline-none focus-visible:border-2 focus-visible:border-[hsl(var(--input-border-color-hsl))] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background', // Focus styles
          'disabled:cursor-not-allowed disabled:opacity-50', // Disabled styles
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
