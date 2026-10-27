'use client';

import { useEffect } from 'react';
import { generateMockTransaction } from '@/lib/mock-telemetry';
import { useTelemetryStore } from '@/store/telemetry-store';

export function useLiveIngestion() {
  const isStreaming = useTelemetryStore((state) => state.isStreaming);
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
}
