import {
  CurrencyCode,
  PaymentMethod,
  TelemetryFilterCriteria,
  TelemetryMetrics,
  TransactionRecord,
  TransactionStatus,
} from '@/types/telemetry';

const FX_RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.28,
  BRL: 0.18,
};

const PAYMENT_METHODS: PaymentMethod[] = ['ach', 'wire', 'card', 'crypto', 'instant_pix'];
const STATUSES: TransactionStatus[] = ['settled', 'pending', 'flagged', 'blocked'];
const CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'BRL', 'GBP'];
const REGIONS = ['us-east', 'us-west', 'eu-central', 'sa-east', 'ap-southeast'];

export function generateMockTransaction(index: number, baseTimestamp = Date.now()): TransactionRecord {
  const method = PAYMENT_METHODS[index % PAYMENT_METHODS.length];
  const currency = CURRENCIES[index % CURRENCIES.length];
  const status = STATUSES[Math.floor(index / CURRENCIES.length) % STATUSES.length];
  const region = REGIONS[index % REGIONS.length];

  const rawAmount = ((index * 97 + 13) % 250000) / 100 + 10;
  const amount = Number(rawAmount.toFixed(2));
  const riskScore = ((index * 31) % 100) + 1;
  const latencyMs = Math.floor(((index * 43) % 450) + 20);

  const pad = (n: number, width: number) => n.toString().padStart(width, '0');

  return {
    id: `tx_${pad(index + 1, 6)}`,
    timestamp: baseTimestamp - index * 1200,
    originAccount: `acc_orig_${pad((index * 13) % 1000, 4)}`,
    destinationAccount: `acc_dest_${pad((index * 17) % 1000, 4)}`,
    amount,
    currency,
    method,
    status,
    riskScore,
    latencyMs,
    region,
  };
}

const MOCK_DATASET_EPOCH = Date.UTC(2026, 9, 27, 18, 0, 0);

export function generateMockDataset(count = 2500): TransactionRecord[] {
  return Array.from({ length: count }, (_, i) => generateMockTransaction(i, MOCK_DATASET_EPOCH));
}

export function calculateTelemetryMetrics(
  records: TransactionRecord[],
  timeWindowSeconds = 60
): TelemetryMetrics {
  const totalProcessed = records.length;

  if (totalProcessed === 0) {
    return {
      totalProcessed: 0,
      volumeTotalUsd: 0,
      settledRate: 0,
      averageLatencyMs: 0,
      flaggedRiskCount: 0,
      throughputPerSecond: 0,
    };
  }

  let totalVolumeUsd = 0;
  let settledCount = 0;
  let totalLatency = 0;
  let flaggedCount = 0;

  for (const record of records) {
    totalVolumeUsd += record.amount * (FX_RATES_TO_USD[record.currency] ?? 1);
    totalLatency += record.latencyMs;

    if (record.status === 'settled') {
      settledCount += 1;
    } else if (record.status === 'flagged' || record.status === 'blocked') {
      flaggedCount += 1;
    }
  }

  return {
    totalProcessed,
    volumeTotalUsd: Number(totalVolumeUsd.toFixed(2)),
    settledRate: Number(((settledCount / totalProcessed) * 100).toFixed(1)),
    averageLatencyMs: Math.round(totalLatency / totalProcessed),
    flaggedRiskCount: flaggedCount,
    throughputPerSecond: Number((totalProcessed / Math.max(timeWindowSeconds, 1)).toFixed(2)),
  };
}

export function filterTelemetryRecords(
  records: TransactionRecord[],
  criteria: TelemetryFilterCriteria
): TransactionRecord[] {
  const query = criteria.searchQuery.trim().toLowerCase();

  return records.filter((rec) => {
    if (criteria.status !== 'all' && rec.status !== criteria.status) {
      return false;
    }

    if (criteria.currency !== 'all' && rec.currency !== criteria.currency) {
      return false;
    }

    if (criteria.minAmount != null && rec.amount < criteria.minAmount) {
      return false;
    }

    if (criteria.maxAmount != null && rec.amount > criteria.maxAmount) {
      return false;
    }

    if (rec.riskScore < criteria.minRiskScore) {
      return false;
    }

    if (query) {
      const matchesId = rec.id.toLowerCase().includes(query);
      const matchesOrig = rec.originAccount.toLowerCase().includes(query);
      const matchesDest = rec.destinationAccount.toLowerCase().includes(query);
      return matchesId || matchesOrig || matchesDest;
    }

    return true;
  });
}
