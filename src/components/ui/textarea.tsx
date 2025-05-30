
import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[120px] w-full rounded-2xl px-4 py-3 text-base ring-offset-background file:text-sm file:font-medium file:text-foreground', // rounded-2xl, increased min-h, px-4
          'bg-[var(--input-background)]', 
          'placeholder:text-[var(--input-placeholder)]', 
          'focus-visible:outline-none focus-visible:border-2 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1', // Adjusted focus
          'disabled:cursor-not-allowed disabled:opacity-50', 
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

    