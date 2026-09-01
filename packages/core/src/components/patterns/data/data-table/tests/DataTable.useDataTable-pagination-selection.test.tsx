/** Fallback keys are page-relative, so selected rows must resolve from the rendered page. */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useDataTable } from '../runtime/state';

interface Row extends Record<string, unknown> {
  id: number;
  name: string;
}

function buildRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({ id: i, name: `Row ${i}` }));
}

describe('useDataTable — selection resolution under pagination', () => {
  it('resolves the row actually rendered at a position, not the same position on page 1, when rowKey is omitted', () => {
    const rows = buildRows(40);
    const { result } = renderHook(() =>
      useDataTable<Row>({ data: rows, columns: [{ key: 'name', header: 'Name' }], pageSize: 20 }),
    );

    // Move to page 2 (rows[20..39]) before selecting.
    act(() => result.current.setPage(2));
    expect(result.current.processedData[0]).toBe(rows[20]);

    // Select the first row rendered on page 2. The engine has no stable
    // rowKey, so it emits a page-relative key of "0" for that position.
    act(() => {
      result.current.tableProps.onSelectionChange?.(['0'], [rows[20]]);
    });

    expect(result.current.selectedKeys).toEqual(['0']);
    // Resolve the rendered page position, never the same index in the full dataset.
    expect(result.current.selectedRows).toEqual([rows[20]]);
    expect(result.current.selectedRows).not.toContainEqual(rows[0]);

    act(() => result.current.setPage(1));
    expect(result.current.selectedKeys).toEqual([]);
    expect(result.current.selectedRows).toEqual([]);
  });

  it('resolves correctly and persists across page changes when a stable rowKey is provided', () => {
    const rows = buildRows(40);
    const { result } = renderHook(() =>
      useDataTable<Row>({ data: rows, columns: [{ key: 'name', header: 'Name' }], pageSize: 20, rowKey: 'id' }),
    );

    // Select row id=25 while page 2 is showing.
    act(() => result.current.setPage(2));
    act(() => {
      result.current.tableProps.onSelectionChange?.(['25'], [rows[25]]);
    });

    // Navigating back to page 1 must not lose or corrupt the selection --
    // a stable rowKey is unaffected by which page is currently rendered.
    act(() => result.current.setPage(1));
    expect(result.current.selectedKeys).toEqual(['25']);
    expect(result.current.selectedRows).toEqual([rows[25]]);
  });

  it('clears positional selection when the rows behind it change', () => {
    const rows = buildRows(20);
    const { result, rerender } = renderHook(
      ({ data }: { data: Row[] }) =>
        useDataTable<Row>({ data, columns: [{ key: 'name', header: 'Name' }] }),
      { initialProps: { data: rows } },
    );

    act(() => {
      result.current.tableProps.onSelectionChange?.(['0'], [rows[0]]);
    });
    expect(result.current.selectedKeys).toEqual(['0']);

    rerender({ data: rows.slice(1) });
    expect(result.current.selectedKeys).toEqual([]);
    expect(result.current.selectedRows).toEqual([]);
  });

  // A parent that passes `data={[...]}` inline hands over a fresh array on every
  // render. Clearing on array identity would delete the user's selection between
  // one render and the next, so an unchanged row sequence must survive.
  it('keeps positional selection when only the array identity changes', () => {
    const rows = buildRows(20);
    const { result, rerender } = renderHook(
      ({ data }: { data: Row[] }) =>
        useDataTable<Row>({ data, columns: [{ key: 'name', header: 'Name' }] }),
      { initialProps: { data: rows } },
    );

    act(() => {
      result.current.tableProps.onSelectionChange?.(['0'], [rows[0]]);
    });

    rerender({ data: [...rows] });
    expect(result.current.selectedKeys).toEqual(['0']);
    expect(result.current.selectedRows).toEqual([rows[0]]);
  });
});
