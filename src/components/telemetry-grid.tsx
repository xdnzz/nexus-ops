'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { columnStyle, GRID_COLUMNS, ROW_HEIGHTS } from '@/components/grid-columns';
import { GridRow } from '@/components/grid-row';
import { useFilteredRecords } from '@/hooks/use-filtered-telemetry';
import { handleGridKeyDown } from '@/lib/grid-navigation';
import { useTelemetryStore } from '@/store/telemetry-store';

export function TelemetryGrid() {
  const records = useFilteredRecords();
  const density = useTelemetryStore((state) => state.density);
  const selectedCell = useTelemetryStore((state) => state.selectedCell);
  const setSelectedCell = useTelemetryStore((state) => state.setSelectedCell);
  const setSelectedRecordId = useTelemetryStore((state) => state.setSelectedRecordId);
  const selectedRecordId = useTelemetryStore((state) => state.selectedRecordId);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowHeight = ROW_HEIGHTS[density];
  const tableWidth = GRID_COLUMNS.reduce((total, column) => total + column.width, 0);

  const rowVirtualizer = useVirtualizer({
    count: records.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 12,
  });

  return (
    <div
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
      className="flex min-h-0 min-w-0 flex-1 flex-col focus:outline-none"
    >
      <div ref={parentRef} className="ledger-scroll min-h-0 flex-1 overflow-auto bg-surface">
        <div className="w-full" style={{ minWidth: tableWidth }}>
          <div className="sticky top-0 z-10 flex bg-surface">
            {GRID_COLUMNS.map((column) => (
              <div
                key={column.id}
                style={columnStyle(column.width)}
                className="flex h-10 min-w-0 items-center gap-1.5 bg-surface pr-1.5 pl-2"
              >
                <span
                  className={`min-w-0 flex-1 font-sans text-[12px] font-medium leading-4 ${
                    column.id === 'timestamp' ? 'text-fg' : 'text-fg-subtle'
                  } ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {column.label}
                </span>
                <img src={column.id === 'timestamp' ? '/figma/sort-asc.svg' : '/figma/sort-none.svg'} alt="" />
                <span className="h-4 w-px bg-line-subtle" />
              </div>
            ))}
          </div>

          {records.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-fg-muted">
              No transactions found matching the active filters.
            </div>
          ) : (
            <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const record = records[virtualRow.index];
                const selected = record.id === selectedRecordId;
                return (
                  <GridRow
                    key={record.id}
                    record={record}
                    size={virtualRow.size}
                    start={virtualRow.start}
                    selected={selected}
                    zebra={virtualRow.index % 2 === 1}
                    selectedColumn={
                      selectedCell?.rowIndex === virtualRow.index ? selectedCell.columnIndex : null
                    }
                    onSelectCell={(columnIndex) => {
                      setSelectedCell({ rowIndex: virtualRow.index, columnIndex });
                      setSelectedRecordId(record.id);
                    }}
                    onOpen={() => setSelectedRecordId(record.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
