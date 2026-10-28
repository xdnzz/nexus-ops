import { generateMockDataset } from '@/lib/mock-telemetry';
import { INITIAL_FILTERS, useTelemetryStore } from '@/store/telemetry-store';

export function resetTelemetryStore(count = 20) {
  useTelemetryStore.setState({
    records: generateMockDataset(count),
    filters: INITIAL_FILTERS,
    density: 'standard',
    selectedCell: null,
    selectedRecordId: null,
    isStreaming: false,
  });
}
