'use client';

import { StatusBadge, statusLabel } from '@/components/ui/status-badge';
import { formatClockTime, formatMoney, shortenAccount } from '@/lib/format';
import { auditTrail, heuristicTone, payloadPreview, riskHeuristics } from '@/lib/inspector';
import { useTelemetryStore } from '@/store/telemetry-store';
import { TransactionRecord } from '@/types/telemetry';

const METHOD_LABEL: Record<TransactionRecord['method'], string> = {
  ach: 'ACH',
  wire: 'WIRE',
  card: 'CARD',
  crypto: 'CRYPTO',
  instant_pix: 'PIX',
};

const TONE_CLASS = {
  settled: 'text-settled bg-settled',
  pending: 'text-pending bg-pending',
  flagged: 'text-flagged bg-flagged',
};

export function MobileInspector() {
  const selectedRecordId = useTelemetryStore((state) => state.selectedRecordId);
  const setSelectedRecordId = useTelemetryStore((state) => state.setSelectedRecordId);
  const records = useTelemetryStore((state) => state.records);
  const record = records.find((item) => item.id === selectedRecordId);

  if (!record) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      <header className="flex items-center justify-between border-b border-line bg-surface px-4 pt-4 pb-3">
        <button
          type="button"
          onClick={() => setSelectedRecordId(null)}
          className="flex items-center gap-2 text-sm font-medium text-fg"
        >
          <img src="/figma/chevron.svg" alt="" />
          Ledger
        </button>
        <p className="font-mono text-xs text-fg-muted">Inspector</p>
      </header>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
        <section className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-base font-medium text-fg">{record.id}</p>
            <StatusBadge status={record.status} />
          </div>
          <p className="font-mono text-[22px] font-medium text-fg">
            {formatMoney(record.amount, record.currency)}
          </p>
          <p className="font-mono text-xs text-fg-muted">
            {METHOD_LABEL[record.method]} · {record.latencyMs}ms · {formatClockTime(record.timestamp)}
          </p>
          <p className="font-mono text-[11px] text-fg-subtle">{record.originAccount}</p>
          <p className="font-mono text-xs text-fg-muted">
            {shortenAccount(record.originAccount)} → {shortenAccount(record.destinationAccount)}
          </p>
        </section>

        <section className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3">
          <p className="text-xs font-medium text-fg-muted">Risk heuristics</p>
          {riskHeuristics(record).map((item) => {
            const tone = heuristicTone(item.value);
            const [textClass, barClass] = TONE_CLASS[tone].split(' ');
            return (
              <div key={item.label} className="flex w-full flex-col gap-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-fg">{item.label}</span>
                  <span className={`font-mono font-medium ${textClass}`}>{item.value}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-subtle">
                  <div className={`h-1 ${barClass}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            );
          })}
        </section>

        <section className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3">
          <p className="text-xs font-medium text-fg-muted">Audit trail</p>
          {auditTrail(record).map((event) => (
            <div key={event.message}>
              <p className="font-mono text-[11px] text-fg-subtle">{event.time}</p>
              <p className="text-[13px] text-fg">{event.message}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3 text-xs">
          <p className="font-medium text-fg-muted">Raw payload</p>
          <pre className="font-mono whitespace-pre-wrap text-fg">{payloadPreview(record)}</pre>
          <p className="sr-only">{statusLabel(record.status)}</p>
        </section>
      </div>
    </div>
  );
}
