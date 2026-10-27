'use client';

import { useMemo } from 'react';
import { calculateTelemetryMetrics, filterTelemetryRecords } from '@/lib/mock-telemetry';
import { useTelemetryStore } from '@/store/telemetry-store';

export function useFilteredRecords() {
  const records = useTelemetryStore((state) => state.records);
  const filters = useTelemetryStore((state) => state.filters);

  return useMemo(
    () => filterTelemetryRecords(records, filters),
    [records, filters],
  );
}

export function useTelemetryMetrics() {
  const records = useFilteredRecords();

  return useMemo(() => calculateTelemetryMetrics(records), [records]);
}
