'use client';

import { useMemo } from 'react';
import { useLiveIngestion } from '@/hooks/use-live-ingestion';
import { useFilteredRecords, useTelemetryMetrics } from '@/hooks/use-filtered-telemetry';
import { formatCompactUsd } from '@/lib/format';
import { useTelemetryStore } from '@/store/telemetry-store';

function percentile(values: number[], ratio: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(ratio * sorted.length) - 1));
  return sorted[index];
}

function useConsoleStats() {
  const metrics = useTelemetryMetrics();
  const records = useFilteredRecords();

  const p99Latency = useMemo(
    () => percentile(records.map((record) => record.latencyMs), 0.99),
    [records],
  );
  const flagRate =
    metrics.totalProcessed === 0 ? 0 : (metrics.flaggedRiskCount / metrics.totalProcessed) * 100;
  const throughput = Math.round(metrics.throughputPerSecond);

  const stats = [
    {
      label: 'Total processed',
      value: metrics.totalProcessed.toLocaleString('en-US'),
      delta: `+${Math.round(metrics.settledRate)}`,
      deltaClass: 'text-settled',
    },
    {
      label: 'Settled volume',
      value: formatCompactUsd(metrics.volumeTotalUsd),
      delta: `+${metrics.settledRate.toFixed(1)}%`,
      deltaClass: 'text-settled',
    },
    {
      label: 'P99 latency',
      value: `${p99Latency}ms`,
      delta: `−${Math.max(metrics.averageLatencyMs - p99Latency, 0)}ms`,
      deltaClass: 'text-settled',
    },
    {
      label: 'Risk flag rate',
      value: `${flagRate.toFixed(1)}%`,
      delta: `+${(flagRate / 10).toFixed(1)}%`,
      deltaClass: 'text-flagged',
    },
  ];

  return { stats, throughput };
}

export function MetricsHeader() {
  const { stats, throughput } = useConsoleStats();
  const isStreaming = useTelemetryStore((state) => state.isStreaming);
  const toggleStreaming = useTelemetryStore((state) => state.toggleStreaming);
  useLiveIngestion();

  return (
    <header className="box-border border-b border-line bg-surface md:h-16">
      <div className="flex items-center justify-between gap-5 px-4 pt-4 pb-3 md:h-full md:justify-start md:py-0">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-[2px] bg-settled" />
          <p className="font-mono text-xs font-medium text-fg md:font-sans md:text-sm md:leading-[18px]">
            NEXUS // OPS
          </p>
        </div>
        <button
          type="button"
          onClick={toggleStreaming}
          className="flex items-center gap-2 rounded-full bg-subtle px-2 py-1 md:h-7 md:py-0"
        >
          <img src="/figma/dot-settled.svg" alt="" className={isStreaming ? 'animate-pulse' : ''} />
          <span className="font-mono text-[11px] text-fg-muted md:hidden">{throughput} TX/S</span>
          <span className="hidden font-mono text-xs font-medium text-settled md:inline">
            {`LIVE STREAMING · ${throughput} TX/S`}
          </span>
        </button>
        <div className="hidden min-w-0 flex-1 items-center justify-end gap-5 md:flex">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-0.5 whitespace-nowrap">
              <p className="text-[11px] font-medium uppercase leading-[15px] text-fg-subtle">
                {stat.label}
              </p>
              <div className="flex items-center gap-2 font-mono font-medium">
                <span className="text-sm leading-[18px] text-fg">{stat.value}</span>
                <span className={`text-xs leading-4 ${stat.deltaClass}`}>{stat.delta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

export function MobileMetrics() {
  const { stats } = useConsoleStats();

  return (
    <div className="grid grid-cols-2 gap-2 px-4 pt-1 pb-3 md:hidden">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1 rounded-lg border border-line bg-surface px-3 py-2.5">
          <p className="text-[11px] font-medium text-fg-muted">{stat.label}</p>
          <p className="font-mono text-lg font-medium text-fg">{stat.value}</p>
          <p className={`font-mono text-xs font-medium ${stat.deltaClass}`}>{stat.delta}</p>
        </div>
      ))}
    </div>
  );
}
