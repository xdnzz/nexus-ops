import { formatClockTime } from '@/lib/format';
import { TransactionRecord, TransactionStatus } from '@/types/telemetry';

export type Heuristic = {
  label: string;
  value: number;
};

const HEURISTIC_LABELS = ['Velocity', 'Counterparty', 'Geo jump', 'Amount outlier', 'Sanctions'];

export function riskHeuristics(record: TransactionRecord): Heuristic[] {
  return HEURISTIC_LABELS.map((label, index) => {
    const value = (record.riskScore * (index + 3) + record.latencyMs + index * 17) % 100;
    return { label, value };
  });
}

export function heuristicTone(value: number): 'settled' | 'pending' | 'flagged' {
  if (value >= 80) return 'flagged';
  if (value >= 50) return 'pending';
  return 'settled';
}

export function auditTrail(record: TransactionRecord) {
  const events = [
    { offsetMs: 8900, message: 'Accepted by gateway' },
    { offsetMs: 6120, message: `Risk score ${record.riskScore}` },
    { offsetMs: 5000, message: reviewMessage(record.status) },
    { offsetMs: 2560, message: holdMessage(record.status) },
  ];

  return events.map((event) => ({
    time: formatClockTime(record.timestamp - event.offsetMs),
    message: event.message,
  }));
}

function reviewMessage(status: TransactionStatus) {
  if (status === 'blocked') return 'Blocked by policy';
  if (status === 'flagged') return 'Flagged for review';
  if (status === 'pending') return 'Queued for settlement';
  return 'Cleared by rules';
}

function holdMessage(status: TransactionStatus) {
  if (status === 'blocked' || status === 'flagged') return 'Held · awaiting release';
  if (status === 'pending') return 'Awaiting confirmation';
  return 'Released to ledger';
}

export function payloadPreview(record: TransactionRecord) {
  return `{ "id": "${record.id}", "ccy": "${record.currency}",
  "amount": ${record.amount.toFixed(2)},
  "method": "${record.method.toUpperCase()}" }`;
}
