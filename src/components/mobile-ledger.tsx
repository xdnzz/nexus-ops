'use client';

import { StatusBadge } from '@/components/ui/status-badge';
import { useFilteredRecords } from '@/hooks/use-filtered-telemetry';
import { formatClockTime, formatMoney, shortenAccount } from '@/lib/format';
import { useTelemetryStore } from '@/store/telemetry-store';
import { TransactionRecord } from '@/types/telemetry';

const METHOD_LABEL: Record<TransactionRecord['method'], string> = {
  ach: 'ACH',
  wire: 'WIRE',
  card: 'CARD',
  crypto: 'CRYPTO',
  instant_pix: 'PIX',
};

export function MobileLedger() {
  const records = useFilteredRecords();
  const setSelectedRecordId = useTelemetryStore((state) => state.setSelectedRecordId);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {records.map((record) => (
        <button
          key={record.id}
          type="button"
          onClick={() => setSelectedRecordId(record.id)}
          className="flex w-full flex-col gap-1.5 border-b border-line bg-canvas px-4 py-3 text-left"
        >
          <span className="flex w-full items-center justify-between">
            <span className="font-mono text-[13px] font-medium text-fg">{record.id}</span>
            <StatusBadge status={record.status} />
          </span>
          <span className="flex w-full items-center justify-between">
            <span className="font-mono text-base font-medium text-fg">
              {formatMoney(record.amount, record.currency)}
            </span>
            <span className="text-[11px] font-medium text-fg-muted">{METHOD_LABEL[record.method]}</span>
          </span>
          <span className="block font-mono text-[11px] text-fg-subtle">
            {shortenAccount(record.originAccount)} → {shortenAccount(record.destinationAccount)}
          </span>
          <span className="block font-mono text-[11px] text-fg-muted">
            {formatClockTime(record.timestamp)} · {record.latencyMs}ms
          </span>
        </button>
      ))}
    </div>
  );
}

export function MobilePeek() {
  const records = useFilteredRecords();
  const selectedRecordId = useTelemetryStore((state) => state.selectedRecordId);
  const setSelectedRecordId = useTelemetryStore((state) => state.setSelectedRecordId);
  const record = records.find((item) => item.id === selectedRecordId) ?? records[0];

  if (!record) return null;

  return (
    <button
      type="button"
      onClick={() => setSelectedRecordId(record.id)}
      className="flex w-full items-center gap-3 border-t border-line-subtle bg-surface px-4 pt-3 pb-4 text-left"
    >
      <StatusBadge status={record.status} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-mono text-xs font-medium text-fg">{record.id}</span>
        <span className="font-mono text-xs text-fg-muted">
          {formatMoney(record.amount, record.currency)}
        </span>
      </span>
      <span className="text-[13px] font-medium text-fg">View</span>
    </button>
  );
}
