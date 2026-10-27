import { RISK_BAR_CLASS, RISK_TEXT_CLASS, riskTone } from '@/lib/format';
import { cn } from '@/lib/utils';

export function RiskScore({ score, className }: { score: number; className?: string }) {
  return <span className={cn(RISK_TEXT_CLASS[riskTone(score)], className)}>{score}/100</span>;
}

export function RiskBar({ score }: { score: number }) {
  return (
    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div
        style={{ width: `${score}%` }}
        className={cn('h-full', RISK_BAR_CLASS[riskTone(score)])}
      />
    </div>
  );
}
