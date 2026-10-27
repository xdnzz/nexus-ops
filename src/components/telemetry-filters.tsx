'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, RotateCcw, Download, ChevronDown } from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetry-store';
import { CurrencyCode, GridDensity, TransactionStatus } from '@/types/telemetry';
import { exportTransactionsToCsv, exportTransactionsToJson } from '@/lib/export-telemetry';

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
  const filteredRecords = useTelemetryStore((state) => state.getFilteredRecords());

  const [exportOpen, setExportOpen] = useState(false);

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    filters.status !== 'all' ||
    filters.currency !== 'all' ||
    filters.minRiskScore !== undefined;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            id="telemetry-search-input"
            type="text"
            placeholder="Search by ID, origin or destination account... (Press '/' to focus)"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50/50 py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.status}
            aria-label="Filter by transaction status"
            onChange={(e) => setFilters({ status: e.target.value as TransactionStatus | 'all' })}
            className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={filters.currency}
            aria-label="Filter by currency"
            onChange={(e) => setFilters({ currency: e.target.value as CurrencyCode | 'all' })}
            className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {CURRENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

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
              onChange={(e) =>
                setFilters({
                  minRiskScore: e.target.value ? Number(e.target.value) : undefined,
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

          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Download className="h-3.5 w-3.5" />
              Export
              <ChevronDown className="h-3 w-3" />
            </button>

            {exportOpen && (
              <div className="absolute right-0 z-20 mt-1 w-32 rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    exportTransactionsToCsv(filteredRecords);
                    setExportOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportTransactionsToJson(filteredRecords);
                    setExportOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Export JSON
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center rounded-md border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-800 dark:bg-zinc-800/80">
          {DENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDensity(opt.value)}
              className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                density === opt.value
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}