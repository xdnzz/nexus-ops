import { KeyboardEvent } from 'react';
import { CellPosition, TransactionRecord } from '@/types/telemetry';

const ARROW_KEYS = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];

type GridNavigationOptions = {
  records: TransactionRecord[];
  columnCount: number;
  selectedCell: CellPosition | null;
  setSelectedCell: (cell: CellPosition | null) => void;
  setSelectedRecordId: (id: string | null) => void;
  scrollToRow: (index: number) => void;
};

export function handleGridKeyDown(
  event: KeyboardEvent<HTMLDivElement>,
  {
    records,
    columnCount,
    selectedCell,
    setSelectedCell,
    setSelectedRecordId,
    scrollToRow,
  }: GridNavigationOptions,
) {
  if (!selectedCell && records.length > 0) {
    if (ARROW_KEYS.includes(event.key)) {
      event.preventDefault();
      setSelectedCell({ rowIndex: 0, columnIndex: 0 });
    }
    return;
  }

  if (!selectedCell) return;

  const { rowIndex, columnIndex } = selectedCell;
  const maxRow = records.length - 1;
  const maxCol = columnCount - 1;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (rowIndex < maxRow) {
        const nextRow = rowIndex + 1;
        setSelectedCell({ rowIndex: nextRow, columnIndex });
        scrollToRow(nextRow);
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (rowIndex > 0) {
        const prevRow = rowIndex - 1;
        setSelectedCell({ rowIndex: prevRow, columnIndex });
        scrollToRow(prevRow);
      }
      break;
    case 'ArrowRight':
      event.preventDefault();
      if (columnIndex < maxCol) {
        setSelectedCell({ rowIndex, columnIndex: columnIndex + 1 });
      }
      break;
    case 'ArrowLeft':
      event.preventDefault();
      if (columnIndex > 0) {
        setSelectedCell({ rowIndex, columnIndex: columnIndex - 1 });
      }
      break;
    case 'Enter':
      event.preventDefault();
      if (records[rowIndex]) {
        setSelectedRecordId(records[rowIndex].id);
      }
      break;
    case 'Escape':
      event.preventDefault();
      setSelectedCell(null);
      break;
  }
}
