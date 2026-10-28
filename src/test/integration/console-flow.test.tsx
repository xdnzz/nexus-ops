import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import Home from '@/app/page';
import { resetTelemetryStore } from '@/test/reset-store';
import { useTelemetryStore } from '@/store/telemetry-store';

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: () => number }) => ({
    getTotalSize: () => count * estimateSize(),
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({
        index,
        key: index,
        start: index * estimateSize(),
        size: estimateSize(),
      })),
    scrollToIndex: () => {},
  }),
}));

function toolbar() {
  return screen.getByPlaceholderText('Search hash, account, amount').parentElement!
    .parentElement as HTMLElement;
}

function clickPill(name: string) {
  fireEvent.click(within(toolbar()).getByRole('button', { name }));
}

async function exportedCsv() {
  let blob: Blob | undefined;
  vi.spyOn(URL, 'createObjectURL').mockImplementation((value) => {
    blob = value as Blob;
    return 'blob:telemetry';
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

  fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));
  return blob ? blob.text() : '';
}

describe('console flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetTelemetryStore();
  });

  it('shows the USD ledger and the first transaction in the inspector', () => {
    render(<Home />);

    expect(screen.getByRole('gridcell', { name: 'tx_000001', exact: true })).toBeDefined();
    expect(screen.queryByRole('gridcell', { name: 'tx_000002', exact: true })).toBeNull();
    expect(within(screen.getByRole('complementary')).getByText('tx_000001')).toBeDefined();
    expect(screen.getAllByText('Total processed').length).toBeGreaterThan(0);
  });

  it('reveals the other currencies when USD is toggled off', () => {
    render(<Home />);

    clickPill('USD');

    expect(screen.getByRole('gridcell', { name: 'tx_000002', exact: true })).toBeDefined();
    expect(useTelemetryStore.getState().filters.currency).toBe('all');
  });

  it('filters the ledger by status and by the search box', () => {
    render(<Home />);

    clickPill('Flagged');
    expect(screen.getByRole('gridcell', { name: 'tx_000009', exact: true })).toBeDefined();
    expect(screen.queryByRole('gridcell', { name: 'tx_000001', exact: true })).toBeNull();

    fireEvent.change(screen.getByPlaceholderText('Search hash, account, amount'), {
      target: { value: 'tx_000005' },
    });
    expect(screen.getAllByText('No transactions found matching the active filters.').length).toBeGreaterThan(0);
  });

  it('opens the clicked transaction in the inspector', () => {
    render(<Home />);

    fireEvent.click(screen.getByRole('gridcell', { name: 'tx_000005', exact: true }));

    expect(useTelemetryStore.getState().selectedRecordId).toBe('tx_000005');
    expect(within(screen.getByRole('complementary')).getByText('tx_000005')).toBeDefined();
    expect(within(screen.getByRole('complementary')).getByText('RISK HEURISTICS')).toBeDefined();
    expect(screen.getByText('Inspector')).toBeDefined();
  });

  it('returns from the mobile inspector to the ledger', () => {
    render(<Home />);

    const card = screen
      .getAllByRole('button', { name: /tx_000005/ })
      .find((element) => element.textContent?.includes('→'));
    expect(card).toBeDefined();
    fireEvent.click(card!);

    expect(screen.getByText('Inspector')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Ledger' }));
    expect(screen.queryByText('Inspector')).toBeNull();
    expect(useTelemetryStore.getState().selectedRecordId).toBeNull();
  });

  it('exports only the rows that pass the active filters', async () => {
    render(<Home />);

    fireEvent.change(screen.getByPlaceholderText('Search hash, account, amount'), {
      target: { value: 'tx_000001' },
    });

    const csv = await exportedCsv();
    expect(csv).toContain('tx_000001');
    expect(csv).not.toContain('tx_000005');
  });

  it('drives search, density, streaming, and reset from the keyboard', () => {
    render(<Home />);

    fireEvent.keyDown(window, { key: '/' });
    expect(document.activeElement).toBe(screen.getByPlaceholderText('Search hash, account, amount'));

    fireEvent.keyDown(window, { key: ' ', code: 'Space' });
    expect(useTelemetryStore.getState().isStreaming).toBe(false);

    (document.activeElement as HTMLElement).blur();
    clickPill('Flagged');
    fireEvent.keyDown(window, { key: 'd' });
    (document.activeElement as HTMLElement).blur();
    fireEvent.keyDown(window, { code: 'Space' });
    fireEvent.keyDown(window, { key: 'r' });
    fireEvent.click(screen.getByRole('gridcell', { name: 'tx_000005', exact: true }));
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(useTelemetryStore.getState().density).toBe('comfortable');
    expect(useTelemetryStore.getState().isStreaming).toBe(true);
    expect(useTelemetryStore.getState().filters).toMatchObject({ status: 'all', searchQuery: '' });
    expect(useTelemetryStore.getState().selectedRecordId).toBeNull();
  });
});
