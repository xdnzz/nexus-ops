'use client';

import { ExportMenu } from '@/components/export-menu';
import { FilterPill } from '@/components/ui/filter-pill';
import { useTelemetryStore } from '@/store/telemetry-store';
import { CurrencyCode, GridDensity, TransactionStatus } from '@/types/telemetry';

const STATUS_OPTIONS: { label: string; value: TransactionStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Settled', value: 'settled' },
  { label: 'Pending', value: 'pending' },
  { label: 'Flagged', value: 'flagged' },
  { label: 'Blocked', value: 'blocked' },
];

const CURRENCY_OPTIONS: CurrencyCode[] = ['USD', 'EUR', 'BRL', 'GBP'];

const DENSITY_OPTIONS: { label: string; value: GridDensity }[] = [
  { label: 'Compact', value: 'compact' },
  { label: 'Standard', value: 'standard' },
  { label: 'Comfortable', value: 'comfortable' },
];

export function TelemetryFilters() {
  const filters = useTelemetryStore((state) => state.filters);
  const setFilters = useTelemetryStore((state) => state.setFilters);
  const density = useTelemetryStore((state) => state.density);
  const setDensity = useTelemetryStore((state) => state.setDensity);

  return (
    <div
      role="search"
      aria-label="Filter transactions"
      className="flex min-h-12 flex-wrap items-center gap-2 border-b border-line bg-canvas px-4 py-2"
    >
      <label className="flex h-8 w-full shrink-0 items-center gap-2 rounded-md border border-line-subtle bg-subtle px-2.5 md:w-60">
        <img src="/figma/search.svg" alt="" className="md:hidden" />
        <span className="sr-only">Search hash, account, amount</span>
        <input
          id="telemetry-search-input"
          type="text"
          placeholder="Search hash, account, amount"
          value={filters.searchQuery}
          onChange={(event) => setFilters({ searchQuery: event.target.value })}
          className="w-full bg-transparent text-xs text-fg placeholder:text-fg-subtle md:text-xs"
        />
      </label>

      <div role="group" aria-label="Status" className="flex shrink-0 gap-2">
        {STATUS_OPTIONS.map((option) => (
          <FilterPill
            key={option.value}
            label={option.label}
            active={filters.status === option.value}
            onClick={() => setFilters({ status: option.value })}
          />
        ))}
      </div>

      <div role="group" aria-label="Currency and density" className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
        {CURRENCY_OPTIONS.map((currency) => (
          <FilterPill
            key={currency}
            label={currency}
            active={filters.currency === currency}
            onClick={() =>
              setFilters({ currency: filters.currency === currency ? 'all' : currency })
            }
          />
        ))}
        {DENSITY_OPTIONS.map((option) => (
          <FilterPill
            key={option.value}
            label={option.label}
            active={density === option.value}
            onClick={() => setDensity(option.value)}
          />
        ))}
        <ExportMenu />
      </div>
    </div>
  );
}
