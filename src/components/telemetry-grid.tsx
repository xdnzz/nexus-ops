'use client';

import { useRef, KeyboardEvent } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTelemetryStore } from '@/store/telemetry-store';
import {
  GridColumnId,
  GridDensity,
  PaymentMethod,
  TransactionRecord,
  TransactionStatus,
} from '@/types/telemetry';

const COLUMNS: { id: GridColumnId; label: string; width: string; align?: 'right' | 'left' }[] = [
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

const ROW_HEIGHTS: Record<GridDensity, number> = {
  compact: 32,
  standard: 42,
  comfortable: 52,
};

export function TelemetryGrid() {
  const records = useTelemetryStore((state) => state.getFilteredRecords());
  const density = useTelemetryStore((state) => state.density);
  const selectedCell = useTelemetryStore((state) => state.selectedCell);
  const setSelectedCell = useTelemetryStore((state) => state.setSelectedCell);
  const setSelectedRecordId = useTelemetryStore((state) => state.setSelectedRecordId);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowHeight = ROW_HEIGHTS[density];

  const rowVirtualizer = useVirtualizer({
    count: records.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 12,
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!selectedCell && records.length > 0) {
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setSelectedCell({ rowIndex: 0, columnIndex: 0 });
      }
      return;
    }

    if (!selectedCell) return;

    const { rowIndex, columnIndex } = selectedCell;
    const maxRow = records.length - 1;
    const maxCol = COLUMNS.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (rowIndex < maxRow) {
          const nextRow = rowIndex + 1;
          setSelectedCell({ rowIndex: nextRow, columnIndex });
          rowVirtualizer.scrollToIndex(nextRow, { align: 'auto' });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (rowIndex > 0) {
          const prevRow = rowIndex - 1;
          setSelectedCell({ rowIndex: prevRow, columnIndex });
          rowVirtualizer.scrollToIndex(prevRow, { align: 'auto' });
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (columnIndex < maxCol) {
          setSelectedCell({ rowIndex, columnIndex: columnIndex + 1 });
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (columnIndex > 0) {
          setSelectedCell({ rowIndex, columnIndex: columnIndex - 1 });
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (records[rowIndex]) {
          setSelectedRecordId(records[rowIndex].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSelectedCell(null);
        break;
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="flex flex-1 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xs focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-900/60"
    >
      <div className="flex border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className={`px-3 py-2.5 shrink-0 ${col.width} ${
              col.align === 'right' ? 'text-right' : 'text-left'
            }`}
          >
            {col.label}
          </div>
        ))}
      </div>

      <div ref={parentRef} className="flex-1 overflow-auto focus:outline-hidden">
        {records.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-sm text-zinc-500">
            No transactions found matching the active filters.
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const record = records[virtualRow.index];
              const isRowSelected = selectedCell?.rowIndex === virtualRow.index;

              return (
                <div
                  key={record.id}
                  onDoubleClick={() => setSelectedRecordId(record.id)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className={`flex items-center border-b border-zinc-100 text-xs transition-colors dark:border-zinc-800/60 ${
                    isRowSelected
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/20'
                      : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  {COLUMNS.map((col, colIdx) => {
                    const isCellSelected =
                      isRowSelected && selectedCell?.columnIndex === colIdx;

                    return (
                      <div
                        key={col.id}
                        onClick={() =>
                          setSelectedCell({
                            rowIndex: virtualRow.index,
                            columnIndex: colIdx,
                          })
                        }
                        className={`truncate px-3 shrink-0 cursor-pointer ${col.width} ${
                          col.align === 'right' ? 'text-right' : 'text-left'
                        } ${
                          isCellSelected
                            ? 'ring-1 ring-inset ring-indigo-500 bg-indigo-100/50 dark:bg-indigo-900/40'
                            : ''
                        }`}
                      >
                        <CellContent columnId={col.id} record={record} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-[11px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        <div>
          Showing <span className="font-semibold text-zinc-800 dark:text-zinc-200">{records.length}</span> records
        </div>
        <div className="text-[10px]">
          Tip: Double-click a row or press Enter to inspect transaction details.
        </div>
      </div>
    </div>
  );
}

function CellContent({ columnId, record }: { columnId: GridColumnId; record: TransactionRecord }) {
  switch (columnId) {
    case 'id':
      return <span className="font-mono text-zinc-600 dark:text-zinc-400">{record.id}</span>;

    case 'timestamp':
      return (
        <span className="text-zinc-500 dark:text-zinc-400">
          {new Date(record.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })}
        </span>
      );

    case 'origin':
      return <span className="font-mono text-zinc-700 dark:text-zinc-300">{record.originAccount}</span>;

    case 'destination':
      return <span className="font-mono text-zinc-700 dark:text-zinc-300">{record.destinationAccount}</span>;

    case 'amount':
      return (
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: record.currency,
          }).format(record.amount)}
        </span>
      );

    case 'method':
      return <MethodBadge method={record.method} />;

    case 'status':
      return <StatusBadge status={record.status} />;

    case 'riskScore': {
      const isHigh = record.riskScore >= 75;
      const isMed = record.riskScore >= 40 && record.riskScore < 75;
      const color = isHigh
        ? 'text-rose-600 dark:text-rose-400 font-semibold'
        : isMed
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-emerald-600 dark:text-emerald-400';
      return <span className={color}>{record.riskScore}/100</span>;
    }

    case 'latency':
      return <span className="text-zinc-500 dark:text-zinc-400">{record.latencyMs}ms</span>;

    default:
      return null;
  }
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const styles: Record<TransactionStatus, string> = {
    settled: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20',
    flagged: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 ring-1 ring-purple-500/20',
    blocked: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-1 ring-rose-500/20',
  };

  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
}

function MethodBadge({ method }: { method: PaymentMethod }) {
  const labels: Record<PaymentMethod, string> = {
    ach: 'ACH',
    wire: 'Wire',
    card: 'Card',
    crypto: 'Crypto',
    instant_pix: 'PIX',
  };

  return (
    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      {labels[method]}
    </span>
  );
}