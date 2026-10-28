import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '@/app/page';
import { resetTelemetryStore } from '@/test/reset-store';
import { useTelemetryStore } from '@/store/telemetry-store';

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getTotalSize: () => 0,
    getVirtualItems: () => [],
    scrollToIndex: () => {},
  }),
}));

describe('live ingestion', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    resetTelemetryStore(4);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('prepends a generated transaction every 800ms while streaming is on', async () => {
    render(<Home />);

    await act(async () => {
      useTelemetryStore.getState().toggleStreaming();
    });
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    expect(useTelemetryStore.getState().records[0].id).toBe('tx_010002');
    expect(useTelemetryStore.getState().records[1].id).toBe('tx_000001');

    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(useTelemetryStore.getState().records[0].id).toBe('tx_010003');

    await act(async () => {
      useTelemetryStore.getState().toggleStreaming();
    });
    await act(async () => {
      vi.advanceTimersByTime(2400);
    });
    expect(useTelemetryStore.getState().records[0].id).toBe('tx_010003');
  });

  it('stays still while streaming is off', async () => {
    render(<Home />);

    await act(async () => {
      vi.advanceTimersByTime(2400);
    });

    expect(useTelemetryStore.getState().records[0].id).toBe('tx_000001');
    expect(useTelemetryStore.getState().records).toHaveLength(4);
  });
});
