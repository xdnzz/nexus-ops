import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateTelemetryMetrics,
  filterTelemetryRecords,
  generateMockTransaction,
  generateMockDataset,
} from '@/lib/mock-telemetry';
import { useTelemetryStore, INITIAL_FILTERS } from '@/store/telemetry-store';
import { TelemetryFilterCriteria, TransactionRecord } from '@/types/telemetry';

describe('Telemetry Domain and Aggregation Engine', () => {
  const baseRecords: TransactionRecord[] = [
    {
      ...generateMockTransaction(0),
      id: 'tx_000001',
      originAccount: 'acc_orig_0100',
      destinationAccount: 'acc_dest_0200',
      amount: 1000,
      currency: 'USD',
      status: 'settled',
      riskScore: 15,
      latencyMs: 40,
    },
    {
      ...generateMockTransaction(1),
      id: 'tx_000002',
      originAccount: 'acc_orig_0300',
      destinationAccount: 'acc_dest_0400',
      amount: 2000,
      currency: 'EUR',
      status: 'flagged',
      riskScore: 82,
      latencyMs: 160,
    },
    {
      ...generateMockTransaction(2),
      id: 'tx_000003',
      originAccount: 'acc_orig_0500',
      destinationAccount: 'acc_dest_0600',
      amount: 500,
      currency: 'BRL',
      status: 'blocked',
      riskScore: 95,
      latencyMs: 100,
    },
  ];

  it('generates consistent mock transaction schemas', () => {
    const tx = generateMockTransaction(10, 1700000000000);

    expect(tx.id).toBe('tx_000011');
    expect(tx.timestamp).toBeDefined();
    expect(tx.originAccount).toContain('acc_orig_');
    expect(tx.destinationAccount).toContain('acc_dest_');
    expect(tx.amount).toBeGreaterThan(0);
    expect(tx.latencyMs).toBeGreaterThanOrEqual(20);
    expect(tx.riskScore).toBeGreaterThanOrEqual(1);
    expect(tx.riskScore).toBeLessThanOrEqual(100);
  });

  it('generates populated datasets', () => {
    const dataset = generateMockDataset(50);
    expect(dataset).toHaveLength(50);
  });

  it('calculates metrics for an empty record list', () => {
    const metrics = calculateTelemetryMetrics([]);

    expect(metrics.totalProcessed).toBe(0);
    expect(metrics.volumeTotalUsd).toBe(0);
    expect(metrics.settledRate).toBe(0);
    expect(metrics.averageLatencyMs).toBe(0);
    expect(metrics.flaggedRiskCount).toBe(0);
    expect(metrics.throughputPerSecond).toBe(0);
  });

  it('aggregates metrics with FX conversions and percentages', () => {
    const metrics = calculateTelemetryMetrics(baseRecords, 60);

    expect(metrics.totalProcessed).toBe(3);
    expect(metrics.settledRate).toBe(33.3);
    expect(metrics.averageLatencyMs).toBe(100);
    expect(metrics.flaggedRiskCount).toBe(2);
    expect(metrics.throughputPerSecond).toBe(0.05);
    expect(metrics.volumeTotalUsd).toBeCloseTo(1000 + 2000 * 1.08 + 500 * 0.18, 1);
  });

  it('filters records by exact status', () => {
    const criteria: TelemetryFilterCriteria = {
      ...INITIAL_FILTERS,
      status: 'settled',
    };

    const results = filterTelemetryRecords(baseRecords, criteria);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('tx_000001');
  });

  it('filters records by currency code', () => {
    const criteria: TelemetryFilterCriteria = {
      ...INITIAL_FILTERS,
      currency: 'EUR',
    };

    const results = filterTelemetryRecords(baseRecords, criteria);
    expect(results).toHaveLength(1);
    expect(results[0].currency).toBe('EUR');
  });

  it('filters records by minimum risk score', () => {
    const criteria: TelemetryFilterCriteria = {
      ...INITIAL_FILTERS,
      currency: 'all',
      minRiskScore: 80,
    };

    const results = filterTelemetryRecords(baseRecords, criteria);
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.riskScore >= 80)).toBe(true);
  });

  it('filters records by amount boundaries', () => {
    const criteria: TelemetryFilterCriteria = {
      ...INITIAL_FILTERS,
      minAmount: 600,
      maxAmount: 1500,
    };

    const results = filterTelemetryRecords(baseRecords, criteria);
    expect(results).toHaveLength(1);
    expect(results[0].amount).toBe(1000);
  });

  it('matches textual search across ID, origin and destination accounts', () => {
    const searchById: TelemetryFilterCriteria = {
      ...INITIAL_FILTERS,
      currency: 'all',
      searchQuery: '000002',
    };
    expect(filterTelemetryRecords(baseRecords, searchById)).toHaveLength(1);

    const searchByOrig: TelemetryFilterCriteria = {
      ...INITIAL_FILTERS,
      searchQuery: 'orig_0100',
    };
    expect(filterTelemetryRecords(baseRecords, searchByOrig)).toHaveLength(1);

    const searchByDest: TelemetryFilterCriteria = {
      ...INITIAL_FILTERS,
      currency: 'all',
      searchQuery: 'dest_0600',
    };
    expect(filterTelemetryRecords(baseRecords, searchByDest)).toHaveLength(1);
  });
});

describe('useTelemetryStore State Management', () => {
  beforeEach(() => {
    useTelemetryStore.setState({
      records: generateMockDataset(100),
      filters: INITIAL_FILTERS,
      density: 'standard',
      selectedCell: null,
      selectedRecordId: null,
      isStreaming: false,
    });
  });

  it('updates active filter criteria', () => {
    useTelemetryStore.getState().setFilters({ status: 'blocked', searchQuery: 'acc' });

    const state = useTelemetryStore.getState();
    expect(state.filters.status).toBe('blocked');
    expect(state.filters.searchQuery).toBe('acc');
  });

  it('resets filters back to defaults', () => {
    useTelemetryStore.getState().setFilters({ status: 'flagged', currency: 'GBP', minRiskScore: 50 });
    useTelemetryStore.getState().resetFilters();

    const state = useTelemetryStore.getState();
    expect(state.filters).toEqual(INITIAL_FILTERS);
  });

  it('sets grid density', () => {
    useTelemetryStore.getState().setDensity('compact');
    expect(useTelemetryStore.getState().density).toBe('compact');

    useTelemetryStore.getState().setDensity('comfortable');
    expect(useTelemetryStore.getState().density).toBe('comfortable');
  });

  it('updates selected cell and transaction selection', () => {
    useTelemetryStore.getState().setSelectedCell({ rowIndex: 4, columnIndex: 2 });
    expect(useTelemetryStore.getState().selectedCell).toEqual({ rowIndex: 4, columnIndex: 2 });

    useTelemetryStore.getState().setSelectedRecordId('tx_000099');
    expect(useTelemetryStore.getState().selectedRecordId).toBe('tx_000099');
  });

  it('mutates transaction record status upon operator action', () => {
    const firstRecord = useTelemetryStore.getState().records[0];

    useTelemetryStore.getState().updateRecordStatus(firstRecord.id, 'blocked');

    const updated = useTelemetryStore.getState().records.find((r) => r.id === firstRecord.id);
    expect(updated?.status).toBe('blocked');
  });

  it('toggles ingestion streaming state', () => {
    expect(useTelemetryStore.getState().isStreaming).toBe(false);

    useTelemetryStore.getState().toggleStreaming();
    expect(useTelemetryStore.getState().isStreaming).toBe(true);

    useTelemetryStore.getState().toggleStreaming();
    expect(useTelemetryStore.getState().isStreaming).toBe(false);
  });

  it('appends records to the beginning of the list', () => {
    const newRecord = generateMockTransaction(9999);
    useTelemetryStore.getState().appendRecord(newRecord);

    const records = useTelemetryStore.getState().records;
    expect(records[0].id).toBe(newRecord.id);
  });
});