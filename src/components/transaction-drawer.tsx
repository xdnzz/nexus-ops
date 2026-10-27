'use client';

import { useState } from 'react';
import { X, ShieldAlert, CheckCircle, Ban, Copy, Check } from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetry-store';
import { TransactionStatus } from '@/types/telemetry';

export function TransactionDrawer() {
  const selectedRecordId = useTelemetryStore((state) => state.selectedRecordId);
  const setSelectedRecordId = useTelemetryStore((state) => state.setSelectedRecordId);
  const updateRecordStatus = useTelemetryStore((state) => state.updateRecordStatus);
  const records = useTelemetryStore((state) => state.records);

  const [copied, setCopied] = useState(false);

  const record = records.find((r) => r.id === selectedRecordId);

  if (!record) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = (newStatus: TransactionStatus) => {
    updateRecordStatus(record.id, newStatus);
  };

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
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: record.currency,
                }).format(record.amount)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-zinc-500">Current Status</span>
              <div className="mt-1 font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                {record.status}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Routing and Accounts
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-zinc-400">Origin:</span>
                <p className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                  {record.originAccount}
                </p>
              </div>
              <div>
                <span className="text-zinc-400">Destination:</span>
                <p className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                  {record.destinationAccount}
                </p>
              </div>
              <div>
                <span className="text-zinc-400">Payment Method:</span>
                <p className="font-medium uppercase text-zinc-800 dark:text-zinc-200">
                  {record.method}
                </p>
              </div>
              <div>
                <span className="text-zinc-400">Gateway Latency:</span>
                <p className="font-medium text-zinc-800 dark:text-zinc-200">{record.latencyMs} ms</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Anti-Fraud Risk Assessment
              </h4>
              <span
                className={`font-mono font-bold ${
                  record.riskScore >= 75
                    ? 'text-rose-500'
                    : record.riskScore >= 40
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                }`}
              >
                {record.riskScore}/100
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                style={{ width: `${record.riskScore}%` }}
                className={`h-full ${
                  record.riskScore >= 75
                    ? 'bg-rose-500'
                    : record.riskScore >= 40
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
              <span className="font-mono text-[11px] text-zinc-500">Raw Telemetry Payload</span>
              <button
                type="button"
                onClick={handleCopyJson}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="max-h-40 overflow-auto p-3 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
              {JSON.stringify(record, null, 2)}
            </pre>
          </div>
        </div>

        <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <span className="mb-2 block text-[11px] font-medium text-zinc-500">Operator Actions</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleStatusChange('settled')}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Settle
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('flagged')}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-amber-600 py-2 text-xs font-semibold text-white hover:bg-amber-700"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Flag
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('blocked')}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-rose-600 py-2 text-xs font-semibold text-white hover:bg-rose-700"
            >
              <Ban className="h-3.5 w-3.5" />
              Block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}