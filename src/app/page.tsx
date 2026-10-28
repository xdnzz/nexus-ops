'use client';

import { MetricsHeader, MobileMetrics } from '@/components/metrics-header';
import { MobileInspector } from '@/components/mobile-inspector';
import { MobileLedger, MobilePeek } from '@/components/mobile-ledger';
import { TelemetryFilters } from '@/components/telemetry-filters';
import { TelemetryGrid } from '@/components/telemetry-grid';
import { TransactionDrawer } from '@/components/transaction-drawer';
import { useTelemetryShortcuts } from '@/hooks/use-telemetry-shortcuts';
import { useTelemetryStore } from '@/store/telemetry-store';

export default function Home() {
  useTelemetryShortcuts();
  const selectedRecordId = useTelemetryStore((state) => state.selectedRecordId);
  const mobileDetail = Boolean(selectedRecordId);

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-canvas text-fg">
      <a
        href="#ledger"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-fg focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-canvas"
      >
        Skip to ledger
      </a>
      <p className="sr-only">
        Shortcuts: slash focuses search, space toggles live streaming when no control is focused, D
        cycles density, R resets filters, and Escape closes the inspector. Arrow keys move through
        the ledger.
      </p>
      <div className={mobileDetail ? 'hidden md:contents' : 'contents'}>
        <MetricsHeader />
        <TelemetryFilters />
        <MobileMetrics />
      </div>

      <div className="flex min-h-0 flex-1">
        <section
          id="ledger"
          tabIndex={-1}
          aria-label="Transactions"
          className={`${mobileDetail ? 'hidden md:flex' : 'flex'} min-h-0 min-w-0 flex-1 flex-col`}
        >
          <div className="hidden min-h-0 flex-1 md:flex">
            <TelemetryGrid />
          </div>
          <div className="flex min-h-0 flex-1 flex-col md:hidden">
            <MobileLedger />
            <MobilePeek />
          </div>
        </section>

        <div className="hidden md:flex">
          <TransactionDrawer />
        </div>

        {mobileDetail && (
          <div className="flex min-h-0 min-w-0 flex-1 md:hidden">
            <MobileInspector />
          </div>
        )}
      </div>
    </main>
  );
}
