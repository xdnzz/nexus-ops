'use client';

import { Activity, AlertTriangle, CheckCircle2, Clock, DollarSign, Radio } from 'lucide-react';
import { MetricCard } from '@/components/ui/metric-card';
import { useLiveIngestion } from '@/hooks/use-live-ingestion';
import { useTelemetryMetrics } from '@/hooks/use-filtered-telemetry';
import { formatMoney } from '@/lib/format';
import { useTelemetryStore } from '@/store/telemetry-store';

export function MetricsHeader() {
  const metrics = useTelemetryMetrics();
  const isStreaming = useTelemetryStore((state) => state.isStreaming);
  const toggleStreaming = useTelemetryStore((state) => state.toggleStreaming);
  useLiveIngestion();

  const cards = [
    {
      label: 'Total Volume (USD)',
      value: formatMoney(metrics.volumeTotalUsd, 'USD', 0),
      subtext: `${metrics.totalProcessed.toLocaleString('en-US')} transactions`,
      icon: DollarSign,
      iconClassName: 'text-emerald-500',
    },
    {
      label: 'Settled Rate',
      value: `${metrics.settledRate}%`,
      subtext: 'Settled vs Total',
      icon: CheckCircle2,
      iconClassName: 'text-blue-500',
    },
    {
      label: 'Average Latency',
      value: `${metrics.averageLatencyMs} ms`,
      subtext: 'Transit time',
      icon: Clock,
      iconClassName: 'text-amber-500',
    },
    {
      label: 'Risk Alerts',
      value: metrics.flaggedRiskCount.toString(),
      subtext: 'Flagged / Blocked',
      icon: AlertTriangle,
      iconClassName: metrics.flaggedRiskCount > 0 ? 'text-rose-500' : 'text-zinc-400',
    },
    {
      label: 'Network Throughput',
      value: `${metrics.throughputPerSecond}/s`,
      subtext: 'Transactions per second',
      icon: Activity,
      iconClassName: 'text-indigo-500',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Nexus Ops
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Financial telemetry console and real-time transaction monitoring engine
          </p>
        </div>

        <button
          type="button"
          onClick={toggleStreaming}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            isStreaming
              ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/30 hover:bg-emerald-500/20 dark:text-emerald-400'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          <Radio className={`h-3.5 w-3.5 ${isStreaming ? 'animate-pulse text-emerald-500' : ''}`} />
          {isStreaming ? 'Live Ingestion Active' : 'Start Live Feed'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}
