import { GridCell } from '@/components/grid-cell';
import { GRID_COLUMNS } from '@/components/grid-columns';
import { TransactionRecord } from '@/types/telemetry';

export function GridRow({
  record,
  size,
  start,
  selectedColumn,
  onSelectCell,
  onOpen,
}: {
  record: TransactionRecord;
  size: number;
  start: number;
  selectedColumn: number | null;
  onSelectCell: (columnIndex: number) => void;
  onOpen: () => void;
}) {
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
      className={`flex items-center border-b border-zinc-100 text-xs transition-colors dark:border-zinc-800/60 ${
        selectedColumn !== null
          ? 'bg-indigo-50/60 dark:bg-indigo-950/20'
          : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40'
      }`}
    >
      {GRID_COLUMNS.map((column, columnIndex) => {
        const isCellSelected = selectedColumn === columnIndex;

        return (
          <div
            key={column.id}
            onClick={() => onSelectCell(columnIndex)}
            className={`shrink-0 cursor-pointer truncate px-3 ${column.width} ${
              column.align === 'right' ? 'text-right' : 'text-left'
            } ${
              isCellSelected
                ? 'bg-indigo-100/50 ring-1 ring-inset ring-indigo-500 dark:bg-indigo-900/40'
                : ''
            }`}
          >
            <GridCell columnId={column.id} record={record} />
          </div>
        );
      })}
    </div>
  );
}
