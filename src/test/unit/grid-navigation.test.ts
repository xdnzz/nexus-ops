import { KeyboardEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { handleGridKeyDown } from '@/lib/grid-navigation';
import { CellPosition, TransactionRecord } from '@/types/telemetry';

function record(id: string): TransactionRecord {
  return {
    id,
    timestamp: 0,
    originAccount: 'acc_orig_0000',
    destinationAccount: 'acc_dest_0000',
    amount: 10,
    currency: 'USD',
    method: 'ach',
    status: 'settled',
    riskScore: 1,
    latencyMs: 20,
    region: 'us-east',
  };
}

function press(key: string) {
  return { key, preventDefault: vi.fn() } as unknown as KeyboardEvent<HTMLDivElement> & {
    preventDefault: ReturnType<typeof vi.fn>;
  };
}

function navigate(key: string, selectedCell: CellPosition | null, records = [record('a'), record('b'), record('c')]) {
  const setSelectedCell = vi.fn();
  const setSelectedRecordId = vi.fn();
  const scrollToRow = vi.fn();
  const event = press(key);

  handleGridKeyDown(event, {
    records,
    columnCount: 9,
    selectedCell,
    setSelectedCell,
    setSelectedRecordId,
    scrollToRow,
  });

  return { event, setSelectedCell, setSelectedRecordId, scrollToRow };
}

describe('grid navigation', () => {
  it('lands on the first cell when an arrow is pressed with nothing selected', () => {
    const { event, setSelectedCell } = navigate('ArrowDown', null);

    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(setSelectedCell).toHaveBeenCalledWith({ rowIndex: 0, columnIndex: 0 });
  });

  it('ignores Enter until a cell is selected', () => {
    const { setSelectedCell, setSelectedRecordId } = navigate('Enter', null);

    expect(setSelectedCell).not.toHaveBeenCalled();
    expect(setSelectedRecordId).not.toHaveBeenCalled();
  });

  it('moves inside the grid and stops at the edges', () => {
    expect(navigate('ArrowDown', { rowIndex: 0, columnIndex: 2 }).setSelectedCell).toHaveBeenCalledWith({
      rowIndex: 1,
      columnIndex: 2,
    });
    expect(navigate('ArrowDown', { rowIndex: 2, columnIndex: 2 }).setSelectedCell).not.toHaveBeenCalled();
    expect(navigate('ArrowUp', { rowIndex: 2, columnIndex: 2 }).scrollToRow).toHaveBeenCalledWith(1);
    expect(navigate('ArrowUp', { rowIndex: 0, columnIndex: 2 }).setSelectedCell).not.toHaveBeenCalled();
    expect(navigate('ArrowRight', { rowIndex: 1, columnIndex: 8 }).setSelectedCell).not.toHaveBeenCalled();
    expect(navigate('ArrowLeft', { rowIndex: 1, columnIndex: 0 }).setSelectedCell).not.toHaveBeenCalled();
    expect(navigate('ArrowLeft', { rowIndex: 1, columnIndex: 3 }).setSelectedCell).toHaveBeenCalledWith({
      rowIndex: 1,
      columnIndex: 2,
    });
  });

  it('opens the focused record on Enter and clears the cell on Escape', () => {
    const opened = navigate('Enter', { rowIndex: 1, columnIndex: 4 });
    expect(opened.setSelectedRecordId).toHaveBeenCalledWith('b');

    const cleared = navigate('Escape', { rowIndex: 1, columnIndex: 4 });
    expect(cleared.setSelectedCell).toHaveBeenCalledWith(null);
  });

  it('does nothing when the ledger is empty', () => {
    const { setSelectedCell } = navigate('ArrowDown', null, []);
    expect(setSelectedCell).not.toHaveBeenCalled();
  });
});
