import { describe, expect, it } from 'vitest';
import {
  calculateTelemetryMetrics,
  filterTelemetryRecords,
  generateMockDataset,
  generateMockTransaction,
} from '@/lib/mock-telemetry';
import { INITIAL_FILTERS } from '@/store/telemetry-store';

describe('mock telemetry', () => {
  it('builds a deterministic transaction from its index', () => {
    const first = generateMockTransaction(0, Date.UTC(2026, 9, 27, 18, 0, 0));

    expect(first).toMatchObject({
      id: 'tx_000001',
      timestamp: Date.UTC(2026, 9, 27, 18, 0, 0),
      originAccount: 'acc_orig_0000',
      destinationAccount: 'acc_dest_0000',
      amount: 10.13,
      currency: 'USD',
      method: 'ach',
      status: 'settled',
      riskScore: 1,
      latencyMs: 20,
      region: 'us-east',
    });
    expect(generateMockTransaction(10, 1_700_000_000_000).timestamp).toBe(1_700_000_000_000 - 12_000);
  });

  it('repeats the same dataset and cycles status independently of currency', () => {
    expect(generateMockDataset(8)).toEqual(generateMockDataset(8));

    const dataset = generateMockDataset(16);
    expect(dataset.map((record) => record.currency).slice(0, 4)).toEqual(['USD', 'EUR', 'BRL', 'GBP']);
    expect(dataset.filter((record) => record.status === 'settled')).toHaveLength(4);
    expect(dataset.filter((record) => record.status === 'pending')).toHaveLength(4);
    expect(dataset.filter((record) => record.status === 'flagged')).toHaveLength(4);
    expect(dataset.filter((record) => record.status === 'blocked')).toHaveLength(4);
    expect(dataset[4]).toMatchObject({ currency: 'USD', status: 'pending' });
    expect(dataset[8]).toMatchObject({ currency: 'USD', status: 'flagged' });
    expect(dataset[12]).toMatchObject({ currency: 'USD', status: 'blocked' });
  });

  it('treats a blank search and null amount bounds as unrestricted', () => {
    const records = generateMockDataset(4);
    const results = filterTelemetryRecords(records, {
      ...INITIAL_FILTERS,
      currency: 'all',
      searchQuery: '   ',
      minAmount: null,
      maxAmount: null,
    });

    expect(results).toHaveLength(4);
  });

  it('drops rows outside an open amount bound and an unmatched query', () => {
    const records = generateMockDataset(4);

    expect(
      filterTelemetryRecords(records, { ...INITIAL_FILTERS, currency: 'all', minAmount: 1_000_000 }),
    ).toHaveLength(0);
    expect(
      filterTelemetryRecords(records, { ...INITIAL_FILTERS, currency: 'all', searchQuery: 'missing' }),
    ).toHaveLength(0);
  });

  it('reports throughput as the count divided by the time window', () => {
    const metrics = calculateTelemetryMetrics(generateMockDataset(3), 1);
    expect(metrics.throughputPerSecond).toBe(3);
    expect(metrics.totalProcessed).toBe(3);
  });
});
