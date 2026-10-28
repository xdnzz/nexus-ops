'use client';

import { StatusBadge } from '@/components/ui/status-badge';
import { useTelemetryStore } from '@/store/telemetry-store';
import { auditTrail, heuristicTone, payloadPreview, riskHeuristics } from '@/lib/inspector';

const TONE_CLASS = {
  settled: 'text-settled bg-settled',
  pending: 'text-pending bg-pending',
  flagged: 'text-flagged bg-flagged',
};

export function TransactionDrawer() {
  const selectedRecordId = useTelemetryStore((state) => state.selectedRecordId);
  const records = useTelemetryStore((state) => state.records);
  const record = records.find((item) => item.id === selectedRecordId) ?? records[0];

  if (!record) return null;

  const heuristics = riskHeuristics(record);

  return (
    <aside className="flex h-full w-[360px] shrink-0 flex-col gap-3.5 overflow-y-auto border-l border-line bg-surface p-4">
      <p className="text-[11px] font-medium leading-[15px] text-fg-subtle">INSPECTOR</p>
      <p className="font-mono text-[18px] font-medium leading-[22px] text-fg">{record.id}</p>
      <p className="font-mono text-[12px] leading-4 font-normal text-fg-muted">{record.originAccount}</p>
      <StatusBadge status={record.status} />

      <p className="text-[11px] font-medium leading-[15px] text-fg-subtle">RISK HEURISTICS</p>
      {heuristics.map((item) => {
        const tone = heuristicTone(item.value);
        const [textClass, barClass] = TONE_CLASS[tone].split(' ');
        return (
          <div key={item.label} className="flex w-full flex-col gap-1">
            <div className="flex items-start justify-between text-[12px] leading-4">
              <span className="font-sans font-normal text-fg-muted">{item.label}</span>
              <span className={`font-mono font-medium ${textClass}`}>{item.value}</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-subtle">
              <div className={`h-1 ${barClass}`} style={{ width: `${item.value}%` }} />
            </div>
          </div>
        );
      })}

      <p className="text-[11px] font-medium leading-[15px] text-fg-subtle">AUDIT TRAIL</p>
      {auditTrail(record).map((event) => (
        <div key={event.message} className="flex items-center gap-2">
          <img src="/figma/dot-flagged.svg" alt="" />
          <span className="font-mono text-[12px] leading-4 font-normal text-fg-subtle">{event.time}</span>
          <span className="font-sans text-[12px] leading-4 font-normal text-fg">{event.message}</span>
        </div>
      ))}

      <p className="text-[11px] font-medium leading-[15px] text-fg-subtle">RAW PAYLOAD</p>
      <pre className="w-full rounded-md bg-canvas p-2.5 font-mono text-[12px] leading-4 font-normal whitespace-pre-wrap text-fg-muted">
        {payloadPreview(record)}
      </pre>
    </aside>
  );
}
