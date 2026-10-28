import { GridColumnId, GridDensity } from '@/types/telemetry';

export type GridColumn = {
  id: GridColumnId;
  label: string;
  width: number;
  align?: 'right';
};

export const GRID_COLUMNS: GridColumn[] = [
  { id: 'id', label: 'ID', width: 120 },
  { id: 'timestamp', label: 'Timestamp', width: 140 },
  { id: 'origin', label: 'Origin', width: 180 },
  { id: 'destination', label: 'Destination', width: 180 },
  { id: 'amount', label: 'Amount', width: 140, align: 'right' },
  { id: 'method', label: 'Method', width: 100 },
  { id: 'status', label: 'Status', width: 110 },
  { id: 'riskScore', label: 'Risk', width: 100, align: 'right' },
  { id: 'latency', label: 'Latency', width: 90, align: 'right' },
];

export function columnStyle(width: number) {
  return { flex: `${width} 0 ${width}px` };
}

export const ROW_HEIGHTS: Record<GridDensity, number> = {
  compact: 32,
  standard: 40,
  comfortable: 52,
};
