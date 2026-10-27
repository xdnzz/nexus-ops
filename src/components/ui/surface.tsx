import { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Surface({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60',
        className,
      )}
      {...props}
    />
  );
}
