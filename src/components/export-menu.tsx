'use client';

import { exportTransactionsToCsv } from '@/lib/export-telemetry';
import { useTelemetryStore } from '@/store/telemetry-store';

export function ExportMenu() {
  return (
    <button
      type="button"
      onClick={() => exportTransactionsToCsv(useTelemetryStore.getState().getFilteredRecords())}
      className="flex h-8 shrink-0 items-center rounded-md border border-line-subtle bg-muted px-2.5 text-xs font-medium whitespace-nowrap text-fg"
    >
      Export CSV
    </button>
  );
}
