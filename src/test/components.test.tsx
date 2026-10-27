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

  it('renders metrics header with brand title and key metric labels', () => {
    render(<MetricsHeader />);

    expect(screen.getByText('Nexus Ops')).toBeDefined();
    expect(screen.getByText('Total Volume (USD)')).toBeDefined();
    expect(screen.getByText('Start Live Feed')).toBeDefined();
  });

  it('toggles live feed state and updates button label upon interaction', () => {
    render(<MetricsHeader />);

    const button = screen.getByRole('button', { name: /Start Live Feed/i });
    fireEvent.click(button);

    expect(useTelemetryStore.getState().isStreaming).toBe(true);
    expect(screen.getByText('Live Ingestion Active')).toBeDefined();
  });

  it('updates search filter when typing into search input', () => {
    render(<TelemetryFilters />);

    const input = screen.getByPlaceholderText(/Search by ID/i);
    fireEvent.change(input, { target: { value: 'tx_000001' } });

    expect(useTelemetryStore.getState().filters.searchQuery).toBe('tx_000001');
  });

  it('updates store density when a density button is clicked', () => {
    render(<TelemetryFilters />);

    const compactButton = screen.getByRole('button', { name: 'Compact' });
    fireEvent.click(compactButton);

    expect(useTelemetryStore.getState().density).toBe('compact');
  });

  it('shows reset button when filters are active and clears filters on click', () => {
    render(<TelemetryFilters />);

    const input = screen.getByPlaceholderText(/Search by ID/i);
    fireEvent.change(input, { target: { value: 'custom_search' } });

    const resetButton = screen.getByRole('button', { name: /Reset/i });
    expect(resetButton).toBeDefined();

    fireEvent.click(resetButton);
    expect(useTelemetryStore.getState().filters.searchQuery).toBe('');
  });
});