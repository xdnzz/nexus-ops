export type TransactionStatus = 'settled' | 'pending' | 'flagged' | 'blocked';
export type PaymentMethod = 'ach' | 'wire' | 'card' | 'crypto' | 'instant_pix';
export type CurrencyCode = 'USD' | 'EUR' | 'BRL' | 'GBP';

export interface TransactionRecord {
  id: string;
  timestamp: number;
  originAccount: string;
  destinationAccount: string;
  amount: number;
  currency: CurrencyCode;
  method: PaymentMethod;
  status: TransactionStatus;
  riskScore: number;
  latencyMs: number;
  region: string;
}

export type GridDensity = 'compact' | 'standard' | 'comfortable';

export interface TelemetryFilterCriteria {
  searchQuery: string;
  status: TransactionStatus | 'all';
  currency: CurrencyCode | 'all';
  minAmount: number | null;
  maxAmount: number | null;
  minRiskScore: number;
}

export interface TelemetryMetrics {
  totalProcessed: number;
  volumeTotalUsd: number;
  settledRate: number;
  averageLatencyMs: number;
  flaggedRiskCount: number;
  throughputPerSecond: number;
}

export interface CellPosition {
  rowIndex: number;
  columnIndex: number;
}

export type GridColumnId =
  | 'id'
  | 'timestamp'
  | 'origin'
  | 'destination'
  | 'amount'
  | 'method'
  | 'status'
  | 'riskScore'
  | 'latency';