'use client';

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!selectedCell || !parentRef.current) return;
    const cell = parentRef.current.querySelector<HTMLElement>(
      `[data-row="${selectedCell.rowIndex}"][data-col="${selectedCell.columnIndex}"]`,
    );
    if (cell && document.activeElement !== cell) cell.focus({ preventScroll: true });
  }, [selectedCell]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        ref={parentRef}
        role="grid"
        aria-label="Transaction ledger"
        aria-rowcount={records.length === 0 ? 2 : records.length + 1}
        aria-colcount={GRID_COLUMNS.length}
        onKeyDown={(event) => {
          if (event.key === ' ') event.preventDefault();
          handleGridKeyDown(event, {
            records,
            columnCount: GRID_COLUMNS.length,
            selectedCell,
            setSelectedCell,
            setSelectedRecordId,
            scrollToRow: (index) => rowVirtualizer.scrollToIndex(index, { align: 'auto' }),
          });
        }}
        className="ledger-scroll min-h-0 flex-1 overflow-auto bg-surface"
      >
        <div className="w-full" style={{ minWidth: tableWidth }}>
          <div role="row" aria-rowindex={1} className="sticky top-0 z-10 flex bg-surface">
            {GRID_COLUMNS.map((column, columnIndex) => (
              <div
                key={column.id}
                role="columnheader"
                aria-colindex={columnIndex + 1}
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
                <span aria-hidden="true" className="h-4 w-px bg-line-subtle" />
              </div>
            ))}
          </div>

          {records.length === 0 ? (
            <div role="row" aria-rowindex={2}>
              <div
                role="gridcell"
                tabIndex={0}
                aria-colspan={GRID_COLUMNS.length}
                className="flex h-64 items-center justify-center text-sm text-fg-muted"
              >
                No transactions found matching the active filters.
              </div>
            </div>
          ) : (
            <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const record = records[virtualRow.index];
                const selected = record.id === selectedRecordId;
                const tabColumn = selectedCell
                  ? selectedCell.rowIndex === virtualRow.index
                    ? selectedCell.columnIndex
                    : -1
                  : virtualRow.index === 0
                    ? 0
                    : -1;
                return (
                  <GridRow
                    key={record.id}
                    record={record}
                    rowIndex={virtualRow.index}
                    size={virtualRow.size}
                    start={virtualRow.start}
                    selected={selected}
                    selectedColumn={
                      selectedCell?.rowIndex === virtualRow.index ? selectedCell.columnIndex : null
                    }
                    tabColumn={tabColumn}
                    onSelectCell={(columnIndex) => {
                      setSelectedCell({ rowIndex: virtualRow.index, columnIndex });
                      setSelectedRecordId(record.id);
                    }}
                    onFocusCell={(columnIndex) => {
                      if (
                        selectedCell?.rowIndex === virtualRow.index &&
                        selectedCell.columnIndex === columnIndex
                      ) {
                        return;
                      }
                      setSelectedCell({ rowIndex: virtualRow.index, columnIndex });
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
