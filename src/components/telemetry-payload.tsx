'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { TransactionRecord } from '@/types/telemetry';

export function TelemetryPayload({ record }: { record: TransactionRecord }) {
  const [copied, setCopied] = useState(false);

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="font-mono text-[11px] text-zinc-500">Raw Telemetry Payload</span>
        <button
          type="button"
          onClick={copyJson}
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
  );
}
