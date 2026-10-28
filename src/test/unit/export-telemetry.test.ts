import { afterEach, describe, expect, it, vi } from 'vitest';
import { exportTransactionsToCsv, exportTransactionsToJson } from '@/lib/export-telemetry';
import { generateMockTransaction } from '@/lib/mock-telemetry';

afterEach(() => {
  vi.restoreAllMocks();
});

async function captureDownload(action: () => void) {
  let blob: Blob | undefined;
  const link = { download: '', href: '' };

  vi.spyOn(URL, 'createObjectURL').mockImplementation((value) => {
    blob = value as Blob;
    return 'blob:telemetry';
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    link.download = this.download;
    link.href = this.href;
  });

  action();

  return { text: blob ? await blob.text() : '', link };
}

describe('export', () => {
  it('downloads the visible rows as CSV', async () => {
    const record = generateMockTransaction(0, 1_700_000_000_000);
    const saved = await captureDownload(() => exportTransactionsToCsv([record]));

    expect(saved.link.download).toBe('nexus-ops-telemetry.csv');
    expect(saved.link.href).toContain('blob:telemetry');
    expect(saved.text).toBe(
      [
        'id,timestamp,originAccount,destinationAccount,amount,currency,method,status,riskScore,latencyMs,region',
        [
          record.id,
          record.timestamp,
          record.originAccount,
          record.destinationAccount,
          record.amount,
          record.currency,
          record.method,
          record.status,
          record.riskScore,
          record.latencyMs,
          record.region,
        ].join(','),
      ].join('\n'),
    );
  });

  it('downloads the same rows as formatted JSON', async () => {
    const record = generateMockTransaction(1, 1_700_000_000_000);
    const saved = await captureDownload(() => exportTransactionsToJson([record], 'ledger.json'));

    expect(saved.link.download).toBe('ledger.json');
    expect(saved.text).toBe(JSON.stringify([record], null, 2));
  });
});
