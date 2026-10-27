'use client';

import { useState } from 'react';
import { ChevronDown, Download } from 'lucide-react';
import { exportTransactionsToCsv, exportTransactionsToJson } from '@/lib/export-telemetry';
import { useTelemetryStore } from '@/store/telemetry-store';

export function ExportMenu() {
  const [open, setOpen] = useState(false);

  const exportRecords = (format: 'csv' | 'json') => {
    const records = useTelemetryStore.getState().getFilteredRecords();
    if (format === 'csv') {
      exportTransactionsToCsv(records);
    } else {
      exportTransactionsToJson(records);
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <Download className="h-3.5 w-3.5" />
        Export
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-32 rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => exportRecords('csv')}
            className="w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => exportRecords('json')}
            className="w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Export JSON
          </button>
        </div>
      )}
    </div>
  );
}
