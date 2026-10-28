import { describe, expect, it } from 'vitest';
import { auditTrail, heuristicTone, payloadPreview, riskHeuristics } from '@/lib/inspector';
import { generateMockTransaction } from '@/lib/mock-telemetry';
import { TransactionRecord } from '@/types/telemetry';

const EPOCH = Date.UTC(2026, 9, 27, 18, 0, 0);

function record(status: TransactionRecord['status']): TransactionRecord {
  return { ...generateMockTransaction(0, EPOCH), status, riskScore: 15, latencyMs: 40 };
}

describe('inspector', () => {
  it('derives five heuristics from the risk score and latency', () => {
    expect(riskHeuristics(record('settled'))).toEqual([
      { label: 'Velocity', value: 85 },
      { label: 'Counterparty', value: 17 },
      { label: 'Geo jump', value: 49 },
      { label: 'Amount outlier', value: 81 },
      { label: 'Sanctions', value: 13 },
    ]);
  });

  it('paints heuristic bars from the value thresholds', () => {
    expect(heuristicTone(49)).toBe('settled');
    expect(heuristicTone(50)).toBe('pending');
    expect(heuristicTone(79)).toBe('pending');
    expect(heuristicTone(80)).toBe('flagged');
  });

  it('builds an audit trail offset from the transaction time', () => {
    const settled = auditTrail(record('settled'));
    expect(settled.map((event) => event.time)).toEqual([
      '17:59:51.100',
      '17:59:53.880',
      '17:59:55.000',
      '17:59:57.440',
    ]);
    expect(settled.map((event) => event.message)).toEqual([
      'Accepted by gateway',
      'Risk score 15',
      'Cleared by rules',
      'Released to ledger',
    ]);

    expect(auditTrail(record('blocked')).map((event) => event.message)).toContain('Blocked by policy');
    expect(auditTrail(record('blocked')).map((event) => event.message)).toContain('Held · awaiting release');
    expect(auditTrail(record('flagged')).map((event) => event.message)).toContain('Flagged for review');
    expect(auditTrail(record('pending')).map((event) => event.message)).toEqual([
      'Accepted by gateway',
      'Risk score 15',
      'Queued for settlement',
      'Awaiting confirmation',
    ]);
  });

  it('previews a compact payload for the selected record', () => {
    const sample = record('settled');
    sample.method = 'instant_pix';

    expect(payloadPreview(sample)).toBe(`{ "id": "${sample.id}", "ccy": "USD",
  "amount": ${sample.amount.toFixed(2)},
  "method": "INSTANT_PIX" }`);
  });
});
