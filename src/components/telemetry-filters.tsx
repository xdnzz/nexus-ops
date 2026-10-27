'use client';

import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { ExportMenu } from '@/components/export-menu';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SelectField } from '@/components/ui/select-field';
import { Surface } from '@/components/ui/surface';
import { useTelemetryStore } from '@/store/telemetry-store';
import { CurrencyCode, GridDensity, TransactionStatus } from '@/types/telemetry';

const STATUS_OPTIONS: { label: string; value: TransactionStatus | 'all' }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Settled', value: 'settled' },
  { label: 'Pending', value: 'pending' },
  { label: 'Flagged', value: 'flagged' },
  { label: 'Blocked', value: 'blocked' },
];

const CURRENCY_OPTIONS: { label: string; value: CurrencyCode | 'all' }[] = [
  { label: 'All Currencies', value: 'all' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
  { label: 'BRL', value: 'BRL' },
];

const DENSITY_OPTIONS: { label: string; value: GridDensity }[] = [
  { label: 'Compact', value: 'compact' },
  { label: 'Standard', value: 'standard' },
  { label: 'Comfortable', value: 'comfortable' },
];

export function TelemetryFilters() {
  const filters = useTelemetryStore((state) => state.filters);
  const setFilters = useTelemetryStore((state) => state.setFilters);
  const resetFilters = useTelemetryStore((state) => state.resetFilters);
  const density = useTelemetryStore((state) => state.density);
  const setDensity = useTelemetryStore((state) => state.setDensity);

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    filters.status !== 'all' ||
    filters.currency !== 'all' ||
    filters.minRiskScore > 0;

  return (
    <Surface className="flex flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            id="telemetry-search-input"
            type="text"
            placeholder="Search by ID, origin or destination account... (Press '/' to focus)"
            value={filters.searchQuery}
            onChange={(event) => setFilters({ searchQuery: event.target.value })}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50/50 py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SelectField
            label="Filter by transaction status"
            value={filters.status}
            options={STATUS_OPTIONS}
            onChange={(status) => setFilters({ status })}
          />
          <SelectField
            label="Filter by currency"
            value={filters.currency}
            options={CURRENCY_OPTIONS}
            onChange={(currency) => setFilters({ currency })}
          />

          <div className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <SlidersHorizontal className="h-3 w-3 text-zinc-400" />
            <span>Risk &ge;</span>
            <input
              type="number"
              min={0}
              max={100}
              placeholder="0"
              aria-label="Minimum risk score"
              value={filters.minRiskScore ?? ''}
              onChange={(event) =>
                setFilters({
                  minRiskScore: event.target.value ? Number(event.target.value) : undefined,
                })
              }
              className="w-10 rounded border-0 bg-transparent p-0 text-center font-medium text-zinc-900 focus:outline-hidden dark:text-zinc-100"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}

          <ExportMenu />
        </div>

        <SegmentedControl value={density} options={DENSITY_OPTIONS} onChange={setDensity} />
      </div>
    </Surface>
  );
}
