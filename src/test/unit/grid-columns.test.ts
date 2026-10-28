import { describe, expect, it } from 'vitest';
import { columnStyle, GRID_COLUMNS, ROW_HEIGHTS } from '@/components/grid-columns';

describe('grid columns', () => {
  it('keeps the Figma minimum widths and grows each column from that floor', () => {
    expect(GRID_COLUMNS.map((column) => column.width)).toEqual([120, 140, 180, 180, 140, 100, 110, 100, 90]);
    expect(GRID_COLUMNS.reduce((total, column) => total + column.width, 0)).toBe(1160);
    expect(columnStyle(140)).toEqual({ flex: '140 0 140px' });
  });

  it('maps density names to row heights', () => {
    expect(ROW_HEIGHTS).toEqual({ compact: 32, standard: 40, comfortable: 52 });
  });
});
