'use client';

import { useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Radio,
} from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetry-store';
import { generateMockTransaction } from '@/lib/mock-telemetry';

export function MetricsHeader() {
  const metrics = useTelemetryStore((state) => state.getMetrics());
  const isStreaming = useTelemetryStore((state) => state.isStreaming);
  const toggleStreaming = useTelemetryStore((state) => state.toggleStreaming);
  const appendRecord = useTelemetryStore((state) => state.appendRecord);

  useEffect(() => {
    if (!isStreaming) return;

    let counter = 10000;
    const interval = setInterval(() => {
      counter += 1;
      appendRecord(generateMockTransaction(counter, Date.now()));
    }, 800);

    return () => clearInterval(interval);
  }, [isStreaming, appendRecord]);

  const cards = [
    {
      label: 'Total Volume (USD)',
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(metrics.volumeTotalUsd),
      subtext: `${metrics.totalProcessed.toLocaleString()} transactions`,
      icon: DollarSign,
      color: 'text-emerald-500',
    },
    {
      label: 'Settled Rate',
      value: `${metrics.settledRate}%`,
      subtext: 'Settled vs Total',
      icon: CheckCircle2,
      color: 'text-blue-500',
    },
    {
      label: 'Average Latency',
      value: `${metrics.averageLatencyMs} ms`,
      subtext: 'Transit time',
      icon: Clock,
      color: 'text-amber-500',
    },
    {
      label: 'Risk Alerts',
      value: metrics.flaggedRiskCount.toString(),
      subtext: 'Flagged / Blocked',
      icon: AlertTriangle,
      color: metrics.flaggedRiskCount > 0 ? 'text-rose-500' : 'text-zinc-400',
    },
    {
      label: 'Network Throughput',
      value: `${metrics.throughputPerSecond}/s`,
      subtext: 'Transactions per second',
      icon: Activity,
      color: 'text-indigo-500',
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
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex flex-col justify-between rounded-lg border border-zinc-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span className="text-xs font-medium">{card.label}</span>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div className="mt-2">
                <div className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {card.value}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{card.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}