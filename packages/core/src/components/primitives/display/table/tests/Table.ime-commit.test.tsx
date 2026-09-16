import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ColumnType, TableProps } from '../contracts';
import { useTableFeatures } from '../runtime/table-features';

interface Row {
  id: string;
  name: string;
}

const DATA: Row[] = [
  { id: 'a', name: 'uno' },
  { id: 'b', name: 'dos' },
];

const COLUMN: ColumnType<Row> = { key: 'name', title: 'Name', dataIndex: 'name', editable: true };

function setup() {
  const onCellEdit = vi.fn();
  const props = {
    columns: [COLUMN],
    dataSource: DATA,
    rowKey: 'id',
    onCellEdit,
  } as unknown as TableProps<Row>;
  const hook = renderHook(() => useTableFeatures({ props }));
  act(() => {
    hook.result.current.handleCellClick(DATA[0]!, 0, COLUMN);
  });
  return { hook, onCellEdit };
}

/** The shape `resolveSubmitIntent` reads; both browsers' spellings are covered. */
function enter(overrides: Record<string, unknown> = {}) {
  return {
    key: 'Enter',
    shiftKey: false,
    preventDefault: vi.fn(),
    ...overrides,
  } as unknown as React.KeyboardEvent;
}

describe('inline editing refuses an IME commit', () => {
  it('an Enter confirming an IME candidate does not move the edit, and the session survives', () => {
    const { hook } = setup();
    expect(hook.result.current.editingCell).toEqual({ rowKey: 'a', columnKey: 'name' });

    act(() => {
      hook.result.current.handleCellKeyNav(enter({ isComposing: true }), DATA[0]!, 0, COLUMN, 0);
    });

    expect(hook.result.current.editingCell).toEqual({ rowKey: 'a', columnKey: 'name' });
  });

  it('Safari reports the same keystroke as keyCode 229, and it is refused too', () => {
    const { hook } = setup();

    act(() => {
      hook.result.current.handleCellKeyNav(enter({ keyCode: 229 }), DATA[0]!, 0, COLUMN, 0);
    });

    expect(hook.result.current.editingCell).toEqual({ rowKey: 'a', columnKey: 'name' });
  });

  it('a normal Enter advances the edit to the next row exactly once', () => {
    const { hook } = setup();

    act(() => {
      hook.result.current.handleCellKeyNav(enter(), DATA[0]!, 0, COLUMN, 0);
    });

    expect(hook.result.current.editingCell).toEqual({ rowKey: 'b', columnKey: 'name' });
  });

  it('Escape still discards while a composition is NOT in flight', () => {
    const { hook } = setup();

    act(() => {
      hook.result.current.handleCellKeyNav(enter({ key: 'Escape' }), DATA[0]!, 0, COLUMN, 0);
    });

    expect(hook.result.current.editingCell).toBeNull();
  });
});
