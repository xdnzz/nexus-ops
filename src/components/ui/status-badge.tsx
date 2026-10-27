import { TransactionStatus } from '@/types/telemetry';

const STATUS_CLASS: Record<TransactionStatus, string> = {
  settled: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-400',
  flagged: 'bg-purple-500/10 text-purple-700 ring-1 ring-purple-500/20 dark:text-purple-400',
  blocked: 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-400',
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_CLASS[status]}`}
    >
      {status}
    </span>
  );
}
