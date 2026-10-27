'use client';

import { X } from 'lucide-react';
import { OperatorActions } from '@/components/operator-actions';
import { TelemetryPayload } from '@/components/telemetry-payload';
import { DetailField } from '@/components/ui/detail-field';
import { MethodBadge } from '@/components/ui/method-badge';
import { RiskBar, RiskScore } from '@/components/ui/risk-score';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatMoney } from '@/lib/format';
import { useTelemetryStore } from '@/store/telemetry-store';

export function TransactionDrawer() {
  const selectedRecordId = useTelemetryStore((state) => state.selectedRecordId);
  const setSelectedRecordId = useTelemetryStore((state) => state.setSelectedRecordId);
  const updateRecordStatus = useTelemetryStore((state) => state.updateRecordStatus);
  const records = useTelemetryStore((state) => state.records);

  const record = records.find((item) => item.id === selectedRecordId);

  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-lg flex-col border-l border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100">
                {record.id}
              </span>
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {record.region}
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Recorded at {new Date(record.timestamp).toISOString()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedRecordId(null)}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto py-4 text-xs">
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div>
              <span className="text-[11px] font-medium text-zinc-500">Transaction Amount</span>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {formatMoney(record.amount, record.currency)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-zinc-500">Current Status</span>
              <div className="mt-1">
                <StatusBadge status={record.status} />
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Routing and Accounts
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <DetailField label="Origin:" mono>
                {record.originAccount}
              </DetailField>
              <DetailField label="Destination:" mono>
                {record.destinationAccount}
              </DetailField>
              <DetailField label="Payment Method:">
                <MethodBadge method={record.method} />
              </DetailField>
              <DetailField label="Gateway Latency:">{record.latencyMs} ms</DetailField>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Anti-Fraud Risk Assessment
              </h4>
              <RiskScore score={record.riskScore} className="font-mono font-bold" />
            </div>
            <RiskBar score={record.riskScore} />
          </div>

          <TelemetryPayload record={record} />
        </div>

        <OperatorActions onStatusChange={(status) => updateRecordStatus(record.id, status)} />
      </div>
    </div>
  );
}
