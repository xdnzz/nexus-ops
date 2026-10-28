import { GridCell } from '@/components/grid-cell';
import { columnStyle, GRID_COLUMNS } from '@/components/grid-columns';
import { TransactionRecord } from '@/types/telemetry';

export function GridRow({
  record,
  rowIndex,
  size,
  start,
  selected,
  selectedColumn,
  tabColumn,
  onSelectCell,
  onFocusCell,
  onOpen,
}: {
  record: TransactionRecord;
  rowIndex: number;
  size: number;
  start: number;
  selected: boolean;
  selectedColumn: number | null;
  tabColumn: number;
  onSelectCell: (columnIndex: number) => void;
  onFocusCell: (columnIndex: number) => void;
  onOpen: () => void;
}) {
  const background = selected ? 'bg-muted' : rowIndex % 2 === 1 ? 'bg-subtle' : 'bg-surface';

  return (
    <div
      role="row"
      aria-rowindex={rowIndex + 2}
      aria-selected={selected}
      onDoubleClick={onOpen}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `${size}px`,
        transform: `translateY(${start}px)`,
      }}
      className={`flex items-center border-b border-line ${background}`}
    >
      {GRID_COLUMNS.map((column, columnIndex) => {
        const focused = selectedColumn === columnIndex;
        return (
          <div
            key={column.id}
            role="gridcell"
            tabIndex={focused ? 0 : -1}
            data-row={rowIndex}
            data-col={columnIndex}
            aria-colindex={columnIndex + 1}
            onClick={() => onSelectCell(columnIndex)}
            onFocus={() => onFocusCell(columnIndex)}
            style={columnStyle(column.width)}
            className={`flex h-full min-w-0 items-center overflow-hidden px-2 ${
              column.align === 'right' ? 'justify-end' : 'justify-start'
            } ${focused ? 'shadow-[inset_0_0_0_2px_var(--color-focus)]' : ''}`}
          >
            <GridCell columnId={column.id} record={record} />
          </div>
        );
      })}
    </div>
  );
}
