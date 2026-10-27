import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function DetailField({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <span className="text-zinc-400">{label}</span>
      <div className={cn('font-medium text-zinc-800 dark:text-zinc-200', mono && 'font-mono')}>
        {children}
      </div>
    </div>
  );
}
