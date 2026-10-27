import { LucideIcon } from 'lucide-react';
import { Surface } from '@/components/ui/surface';

export function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  iconClassName: string;
}) {
  return (
    <Surface className="flex flex-col justify-between p-3.5">
      <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
        <span className="text-xs font-medium">{label}</span>
        <Icon className={`h-4 w-4 ${iconClassName}`} />
      </div>
      <div className="mt-2">
        <div className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {value}
        </div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{subtext}</div>
      </div>
    </Surface>
  );
}
