import { MethodBadge } from '@/components/ui/method-badge';
import { RiskScore } from '@/components/ui/risk-score';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatClockTime, formatMoney } from '@/lib/format';
import { GridColumnId, TransactionRecord } from '@/types/telemetry';

export function GridCell({
  columnId,
  record,
}: {
  columnId: GridColumnId;
  record: TransactionRecord;
}) {
  switch (columnId) {
    case 'id':
      return <span className="font-mono text-zinc-600 dark:text-zinc-400">{record.id}</span>;
    case 'timestamp':
      return <span className="text-zinc-500 dark:text-zinc-400">{formatClockTime(record.timestamp)}</span>;
    case 'origin':
      return <span className="font-mono text-zinc-700 dark:text-zinc-300">{record.originAccount}</span>;
    case 'destination':
      return (
        <span className="font-mono text-zinc-700 dark:text-zinc-300">{record.destinationAccount}</span>
      );
    case 'amount':
      return (
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {formatMoney(record.amount, record.currency)}
        </span>
      );
    case 'method':
      return <MethodBadge method={record.method} />;
    case 'status':
      return <StatusBadge status={record.status} />;
    case 'riskScore':
      return <RiskScore score={record.riskScore} />;
    case 'latency':
      return <span className="text-zinc-500 dark:text-zinc-400">{record.latencyMs}ms</span>;
    default:
      return null;
  }
}
