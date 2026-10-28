import { StatusBadge, statusLabel } from '@/components/ui/status-badge';
import { formatClockTime, formatPlainAmount, shortenAccount } from '@/lib/format';
import { GridColumnId, TransactionRecord } from '@/types/telemetry';

const METHOD_LABEL: Record<TransactionRecord['method'], string> = {
  ach: 'ACH',
  wire: 'WIRE',
  card: 'CARD',
  crypto: 'CRYPTO',
  instant_pix: 'PIX',
};

export function GridCell({
  columnId,
  record,
}: {
  columnId: GridColumnId;
  record: TransactionRecord;
}) {
  switch (columnId) {
    case 'id':
    case 'timestamp':
    case 'origin':
    case 'destination':
      return <span className="font-mono text-[12px] leading-4 font-normal text-fg">{cellText(columnId, record)}</span>;
    case 'amount':
      return (
        <span className="font-mono text-[12px] leading-4 font-normal text-fg">{formatPlainAmount(record.amount)}</span>
      );
    case 'method':
      return <span className="font-sans text-[12px] leading-4 font-normal text-fg-muted">{METHOD_LABEL[record.method]}</span>;
    case 'status':
      return <StatusBadge status={record.status} />;
    case 'riskScore':
      return <span className="font-mono text-[12px] leading-4 font-normal text-fg">{statusLabel(record.status)}</span>;
    case 'latency':
      return <span className="font-mono text-[12px] leading-4 font-normal text-fg">{record.latencyMs}</span>;
    default:
      return null;
  }
}

function cellText(columnId: GridColumnId, record: TransactionRecord) {
  if (columnId === 'id') return record.id;
  if (columnId === 'timestamp') return formatClockTime(record.timestamp);
  if (columnId === 'origin') return shortenAccount(record.originAccount);
  return shortenAccount(record.destinationAccount);
}
