'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { GRID_COLUMNS, ROW_HEIGHTS } from '@/components/grid-columns';
import { GridRow } from '@/components/grid-row';
import { Surface } from '@/components/ui/surface';
import { useFilteredRecords } from '@/hooks/use-filtered-telemetry';
import { handleGridKeyDown } from '@/lib/grid-navigation';
import { useTelemetryStore } from '@/store/telemetry-store';

export function TelemetryGrid() {
  const records = useFilteredRecords();
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

  return (
    <Surface
      tabIndex={0}
      onKeyDown={(event) =>
        handleGridKeyDown(event, {
          records,
          columnCount: GRID_COLUMNS.length,
          selectedCell,
          setSelectedCell,
          setSelectedRecordId,
          scrollToRow: (index) => rowVirtualizer.scrollToIndex(index, { align: 'auto' }),
        })
      }
      className="flex flex-1 flex-col overflow-hidden focus:outline-hidden"
    >
      <div className="flex border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        {GRID_COLUMNS.map((column) => (
          <div
            key={column.id}
            className={`shrink-0 px-3 py-2.5 ${column.width} ${
              column.align === 'right' ? 'text-right' : 'text-left'
            }`}
          >
            {column.label}
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
              const selectedColumn =
                selectedCell?.rowIndex === virtualRow.index ? selectedCell.columnIndex : null;

              return (
                <GridRow
                  key={record.id}
                  record={record}
                  size={virtualRow.size}
                  start={virtualRow.start}
                  selectedColumn={selectedColumn}
                  onSelectCell={(columnIndex) =>
                    setSelectedCell({ rowIndex: virtualRow.index, columnIndex })
                  }
                  onOpen={() => setSelectedRecordId(record.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-[11px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        <div>
          Showing{' '}
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{records.length}</span>{' '}
          records
        </div>
        <div className="text-[10px]">
          Tip: Double-click a row or press Enter to inspect transaction details.
        </div>
      </div>
    </Surface>
  );
}
