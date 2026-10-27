import { TransactionRecord } from '@/types/telemetry';

export function exportTransactionsToCsv(
  records: TransactionRecord[],
  filename = 'nexus-ops-telemetry.csv'
): void {
  const headers = [
    'id',
    'timestamp',
    'originAccount',
    'destinationAccount',
    'amount',
    'currency',
    'method',
    'status',
    'riskScore',
    'latencyMs',
    'region',
  ];

  const rows = records.map((r) => [
    r.id,
    r.timestamp,
    r.originAccount,
    r.destinationAccount,
    r.amount,
    r.currency,
    r.method,
    r.status,
    r.riskScore,
    r.latencyMs,
    r.region,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTransactionsToJson(
  records: TransactionRecord[],
  filename = 'nexus-ops-telemetry.json'
): void {
  const jsonContent = JSON.stringify(records, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}