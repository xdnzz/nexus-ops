'use client';

import { useEffect } from 'react';
import { useTelemetryStore } from '@/store/telemetry-store';
import { GridDensity } from '@/types/telemetry';

const DENSITY_CYCLE: GridDensity[] = ['compact', 'standard', 'comfortable'];

export function useTelemetryShortcuts(): void {
  const toggleStreaming = useTelemetryStore((state) => state.toggleStreaming);
  const density = useTelemetryStore((state) => state.density);
  const setDensity = useTelemetryStore((state) => state.setDensity);
  const resetFilters = useTelemetryStore((state) => state.resetFilters);
  const setSelectedRecordId = useTelemetryStore((state) => state.setSelectedRecordId);
  const setSelectedCell = useTelemetryStore((state) => state.setSelectedCell);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement;

      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && !isInputFocused) {
        e.preventDefault();
        const searchInput = document.getElementById('telemetry-search-input');
        searchInput?.focus();
        return;
      }

      if (isInputFocused) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleStreaming();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        const currentIndex = DENSITY_CYCLE.indexOf(density);
        const nextDensity = DENSITY_CYCLE[(currentIndex + 1) % DENSITY_CYCLE.length];
        setDensity(nextDensity);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetFilters();
      } else if (e.key === 'Escape') {
        setSelectedRecordId(null);
        setSelectedCell(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    density,
    setDensity,
    toggleStreaming,
    resetFilters,
    setSelectedRecordId,
    setSelectedCell,
  ]);
}