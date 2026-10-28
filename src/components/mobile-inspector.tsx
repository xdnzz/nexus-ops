'use client';

import { useEffect } from 'react';
import { StatusBadge } from '@/components/ui/status-badge';
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

  useEffect(() => {
    const root = document.getElementById('mobile-inspector');
    if (!root || root.getClientRects().length === 0) return;
    document.getElementById('inspector-back')?.focus();
  }, [record?.id]);

  if (!record) return null;

  return (
    <div id="mobile-inspector" className="flex min-h-0 flex-1 flex-col bg-canvas">
      <header className="flex items-center justify-between border-b border-line bg-surface px-4 pt-4 pb-3">
        <button
          id="inspector-back"
          type="button"
          onClick={() => {
            setSelectedRecordId(null);
            window.requestAnimationFrame(() => document.getElementById('ledger')?.focus());
          }}
          className="flex min-h-8 items-center gap-2 text-sm font-medium text-fg"
        >
          <img src="/figma/chevron.svg" alt="" />
          Ledger
        </button>
        <h1 className="m-0 font-mono text-xs font-normal text-fg-muted">Inspector</h1>
      </header>
      <div
        tabIndex={0}
        aria-label="Inspector details"
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3"
      >
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

        <section aria-labelledby="mobile-heuristics" className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3">
          <h2 id="mobile-heuristics" className="m-0 text-xs font-medium text-fg-muted">
            Risk heuristics
          </h2>
          {riskHeuristics(record).map((item) => {
            const tone = heuristicTone(item.value);
            const [textClass, barClass] = TONE_CLASS[tone].split(' ');
            return (
              <div
                key={item.label}
                role="meter"
                aria-label={item.label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={item.value}
                className="flex w-full flex-col gap-1.5"
              >
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

        <section aria-labelledby="mobile-audit" className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3">
          <h2 id="mobile-audit" className="m-0 text-xs font-medium text-fg-muted">
            Audit trail
          </h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {auditTrail(record).map((event) => (
              <li key={event.message}>
                <p className="font-mono text-[11px] text-fg-subtle">{event.time}</p>
                <p className="text-[13px] text-fg">{event.message}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="mobile-payload" className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3 text-xs">
          <h2 id="mobile-payload" className="m-0 font-medium text-fg-muted">
            Raw payload
          </h2>
          <pre className="font-mono whitespace-pre-wrap text-fg">{payloadPreview(record)}</pre>
        </section>
      </div>
    </div>
  );
}
