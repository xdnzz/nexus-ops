import { create } from 'zustand';
import {
  CellPosition,
  GridDensity,
  TelemetryFilterCriteria,
  TelemetryMetrics,
  TransactionRecord,
  TransactionStatus,
} from '@/types/telemetry';
import {
  calculateTelemetryMetrics,
  filterTelemetryRecords,
  generateMockDataset,
} from '@/lib/mock-telemetry';

export const INITIAL_FILTERS: TelemetryFilterCriteria = {
  searchQuery: '',
  status: 'all',
  currency: 'all',
  minAmount: null,
  maxAmount: null,
  minRiskScore: 0,
};

interface TelemetryState {
  records: TransactionRecord[];
  filters: TelemetryFilterCriteria;
  density: GridDensity;
  selectedCell: CellPosition | null;
  selectedRecordId: string | null;
  isStreaming: boolean;

  setRecords: (records: TransactionRecord[]) => void;
  appendRecord: (record: TransactionRecord) => void;
  setFilters: (filters: Partial<TelemetryFilterCriteria>) => void;
  resetFilters: () => void;
  setDensity: (density: GridDensity) => void;
  setSelectedCell: (cell: CellPosition | null) => void;
  setSelectedRecordId: (id: string | null) => void;
  updateRecordStatus: (id: string, status: TransactionStatus) => void;
  toggleStreaming: () => void;

  getFilteredRecords: () => TransactionRecord[];
  getMetrics: () => TelemetryMetrics;
}

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  records: generateMockDataset(1000),
  filters: INITIAL_FILTERS,
  density: 'standard',
  selectedCell: null,
  selectedRecordId: null,
  isStreaming: false,

  setRecords: (records) => set({ records }),

  appendRecord: (record) =>
    set((state) => ({
      records: [record, ...state.records.slice(0, 4999)],
    })),

  setFilters: (updated) =>
    set((state) => ({
      filters: { ...state.filters, ...updated },
    })),

  resetFilters: () => set({ filters: INITIAL_FILTERS }),

  setDensity: (density) => set({ density }),

  setSelectedCell: (selectedCell) => set({ selectedCell }),

  setSelectedRecordId: (selectedRecordId) => set({ selectedRecordId }),

  updateRecordStatus: (id, status) =>
    set((state) => ({
      records: state.records.map((rec) =>
        rec.id === id ? { ...rec, status } : rec
      ),
    })),

  toggleStreaming: () => set((state) => ({ isStreaming: !state.isStreaming })),

  getFilteredRecords: () => {
    const { records, filters } = get();
    return filterTelemetryRecords(records, filters);
  },

  getMetrics: () => {
    const filtered = get().getFilteredRecords();
    return calculateTelemetryMetrics(filtered);
  },
}));