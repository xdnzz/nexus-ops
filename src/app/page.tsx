'use client';

import { MetricsHeader } from '@/components/metrics-header';
import { TelemetryFilters } from '@/components/telemetry-filters';
import { TelemetryGrid } from '@/components/telemetry-grid';
import { TransactionDrawer } from '@/components/transaction-drawer';
import { useTelemetryShortcuts } from '@/hooks/use-telemetry-shortcuts';

export default function Home() {
  useTelemetryShortcuts();

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-zinc-50/50 p-4 md:p-6 dark:bg-black">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4">
        <MetricsHeader />
        <TelemetryFilters />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <TelemetryGrid />
        </div>
      </div>
      <TransactionDrawer />
    </main>
  );
}
