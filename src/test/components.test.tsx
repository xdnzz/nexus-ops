import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MetricsHeader } from '@/components/metrics-header';
import { TelemetryFilters } from '@/components/telemetry-filters';
import { useTelemetryStore, INITIAL_FILTERS } from '@/store/telemetry-store';
import { generateMockDataset } from '@/lib/mock-telemetry';

describe('UI Component Integration', () => {
  beforeEach(() => {
    useTelemetryStore.setState({
      records: generateMockDataset(20),
      filters: INITIAL_FILTERS,
      density: 'standard',
      selectedCell: null,
      selectedRecordId: null,
      isStreaming: false,
    });
  });

  it('renders the console brand and ledger metrics', () => {
    render(<MetricsHeader />);

    expect(screen.getByText('NEXUS // OPS')).toBeDefined();
    expect(screen.getAllByText('Total processed').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /TX\/S/i })).toBeDefined();
  });

  it('toggles live streaming from the header pill', () => {
    render(<MetricsHeader />);

    fireEvent.click(screen.getByRole('button', { name: /TX\/S/i }));

    expect(useTelemetryStore.getState().isStreaming).toBe(true);
    expect(screen.getByText(/LIVE STREAMING/i)).toBeDefined();
  });

  it('updates search filter when typing into search input', () => {
    render(<TelemetryFilters />);

    const input = screen.getByPlaceholderText(/Search hash, account, amount/i);
    fireEvent.change(input, { target: { value: 'tx_000001' } });

    expect(useTelemetryStore.getState().filters.searchQuery).toBe('tx_000001');
  });

  it('updates store density when a density button is clicked', () => {
    render(<TelemetryFilters />);

    fireEvent.click(screen.getByRole('button', { name: 'Compact' }));

    expect(useTelemetryStore.getState().density).toBe('compact');
  });

  it('clears the status filter from the All pill', () => {
    render(<TelemetryFilters />);

    fireEvent.click(screen.getByRole('button', { name: 'Flagged' }));
    expect(useTelemetryStore.getState().filters.status).toBe('flagged');

    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(useTelemetryStore.getState().filters.status).toBe('all');
  });
});
