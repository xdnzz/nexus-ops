import { GridColumnId, GridDensity } from '@/types/telemetry';

export type GridColumn = {
  id: GridColumnId;
  label: string;
  width: string;
  align?: 'right' | 'left';
};

export const GRID_COLUMNS: GridColumn[] = [
  { id: 'id', label: 'Transaction ID', width: 'w-36' },
  { id: 'timestamp', label: 'Timestamp', width: 'w-40' },
  { id: 'origin', label: 'Origin Account', width: 'w-36' },
  { id: 'destination', label: 'Destination Account', width: 'w-36' },
  { id: 'amount', label: 'Amount', width: 'w-32', align: 'right' },
  { id: 'method', label: 'Method', width: 'w-28' },
  { id: 'status', label: 'Status', width: 'w-28' },
  { id: 'riskScore', label: 'Risk', width: 'w-24', align: 'right' },
  { id: 'latency', label: 'Latency', width: 'w-24', align: 'right' },
];

export const ROW_HEIGHTS: Record<GridDensity, number> = {
  compact: 32,
  standard: 42,
  comfortable: 52,
};
