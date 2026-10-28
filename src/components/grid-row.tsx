import { GridCell } from '@/components/grid-cell';
import { columnStyle, GRID_COLUMNS } from '@/components/grid-columns';
import { TransactionRecord } from '@/types/telemetry';

export function GridRow({
  record,
  size,
  start,
  selected,
  selectedColumn,
  zebra,
  onSelectCell,
  onOpen,
}: {
  record: TransactionRecord;
  size: number;
  start: number;
  selected: boolean;
  selectedColumn: number | null;
  zebra: boolean;
  onSelectCell: (columnIndex: number) => void;
  onOpen: () => void;
}) {
  const background = selected ? 'bg-muted' : zebra ? 'bg-subtle' : 'bg-surface';

  return (
    <div
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
          <button
            key={column.id}
            type="button"
            onClick={() => onSelectCell(columnIndex)}
            style={columnStyle(column.width)}
            className={`flex h-full min-w-0 items-center overflow-hidden px-2 ${
              column.align === 'right' ? 'justify-end' : 'justify-start'
            } ${focused ? 'shadow-[inset_0_0_0_2px_var(--color-focus)]' : ''}`}
          >
            <GridCell columnId={column.id} record={record} />
          </button>
        );
      })}
    </div>
  );
}
