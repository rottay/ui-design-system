import React from 'react';
import { act, cleanup, fireEvent, renderHook, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PatternDataTable, useInlineEditing } from '..';
import type { ColumnDef, UseInlineEditingOptions, UseInlineEditingReturn } from '..';
import { renderWithEngine } from '@tests/support/engine';

interface Row {
  id: string;
  recordKey: number;
  name: string;
  tier: string;
  note: string;
}

const ALPHA: Row = { id: 'a', recordKey: 101, name: 'Alpha', tier: 'free', note: 'first' };
const BRAVO: Row = { id: 'b', recordKey: 202, name: 'Bravo', tier: 'pro', note: 'second' };
const LOCKED: Row = { id: 'c', recordKey: 303, name: 'Locked', tier: 'free', note: 'read only' };
const ROWS = [ALPHA, BRAVO, LOCKED];
const COLUMNS: ColumnDef<Row>[] = [
  { key: 'id', header: 'Id', accessorKey: 'id' },
  {
    key: 'name', header: 'Name', accessorKey: 'name',
    editable: { type: 'text', canEdit: (row) => row.recordKey !== 303 },
  },
  { key: 'tier', header: 'Tier', accessorKey: 'tier', editable: { type: 'text' } },
  { key: 'note', header: 'Note', accessorKey: 'note' },
];

type Controls = { current: UseInlineEditingReturn<Row> | null };

function mount(options: Partial<UseInlineEditingOptions<Row>> = {}) {
  const controls: Controls = { current: null };
  const onSave = options.onSave ?? vi.fn();
  const rowKey = options.rowKey ?? 'id';
  const columns = options.columns ?? COLUMNS;
  function Composition() {
    const editing = useInlineEditing<Row>({ data: ROWS, columns, rowKey, onSave, ...options });
    controls.current = editing;
    const { editingProps } = editing;
    return <PatternDataTable<Row> engine="modern" data={ROWS} columns={columns} rowKey={rowKey} {...editingProps} />;
  }
  return { ...renderWithEngine(<Composition />, 'modern'), controls, onSave };
}

async function bodyRow(container: HTMLElement, name: string): Promise<HTMLTableRowElement> {
  return waitFor(() => {
    const row = Array.from(container.querySelectorAll<HTMLTableRowElement>('[data-part="body-row"]'))
      .find((candidate) => candidate.textContent?.includes(name));
    expect(row).toBeDefined();
    return row!;
  });
}

function cell(row: HTMLTableRowElement, columnIndex: number): HTMLElement {
  const target = row.querySelector<HTMLElement>(`td[aria-colindex="${columnIndex}"]`);
  expect(target).not.toBeNull();
  return target!;
}

async function editor(container: HTMLElement): Promise<HTMLInputElement> {
  return waitFor(() => {
    const input = container.querySelector<HTMLInputElement>('td[data-editing="true"] .ds-data-table__editor-control input');
    expect(input, 'the documented editingProps spread must open the real cell editor').not.toBeNull();
    expect(document.activeElement).toBe(input);
    return input!;
  });
}

async function closed(container: HTMLElement, controls: Controls): Promise<void> {
  await waitFor(() => {
    expect(container.querySelector('td[data-editing="true"]')).toBeNull();
    expect(controls.current?.editingCell).toBeNull();
  });
}

async function focusRow(user: ReturnType<typeof userEvent.setup>, row: HTMLTableRowElement) {
  for (let presses = 0; presses < 20 && document.activeElement !== row; presses += 1) {
    await user.tab();
  }
  expect(document.activeElement).toBe(row);
}

afterEach(cleanup);

describe('useInlineEditing public DataTable composition', () => {
  it('documented spread opens the double-clicked cell in the correct row and column', async () => {
    const user = userEvent.setup();
    const { container, controls } = mount();
    expect(controls.current?.editingProps.editingCell).toBeNull();
    await user.dblClick(cell(await bodyRow(container, 'Bravo'), 3));

    expect((await editor(container)).value).toBe('pro');
    expect(controls.current?.editingCell).toEqual({ rowKey: 'b', columnKey: 'tier' });
    expect(container.querySelectorAll('td[data-editing="true"]')).toHaveLength(1);
  });

  it('documented spread opens the clicked cell when click is configured', async () => {
    const user = userEvent.setup();
    const { container, controls } = mount({ editTrigger: 'click' });
    await user.click(cell(await bodyRow(container, 'Bravo'), 3));

    expect((await editor(container)).value).toBe('pro');
    expect(controls.current?.editingCell).toEqual({ rowKey: 'b', columnKey: 'tier' });
  });

  it('documented spread opens the focused row first editable cell on F2', async () => {
    const user = userEvent.setup();
    const { container, controls } = mount();
    await focusRow(user, await bodyRow(container, 'Alpha'));
    await user.keyboard('{ArrowDown}{F2}');

    expect((await editor(container)).value).toBe('Bravo');
    expect(controls.current?.editingCell).toEqual({ rowKey: 'b', columnKey: 'name' });
  });

  it('commits through onSave with the original row, supplied column and old/new values, then closes', async () => {
    const user = userEvent.setup();
    const { container, controls, onSave } = mount();
    await user.dblClick(cell(await bodyRow(container, 'Bravo'), 3));
    const input = await editor(container);
    await user.clear(input);
    await user.type(input, 'enterprise{Enter}');
    await closed(container, controls);

    expect(onSave).toHaveBeenCalledExactlyOnceWith(BRAVO, 'tier', 'enterprise', 'pro');
    expect(controls.current?.saveError).toBeNull();
  });

  it('cancels a changed draft through Escape without saving and can reopen the original value', async () => {
    const user = userEvent.setup();
    const { container, controls, onSave } = mount();
    const row = await bodyRow(container, 'Bravo');
    await user.dblClick(cell(row, 2));
    const input = await editor(container);
    await user.clear(input);
    await user.type(input, 'Discarded{Escape}');
    await closed(container, controls);
    expect(onSave).not.toHaveBeenCalled();
    expect(controls.current?.pendingEdits).toEqual({});

    await user.dblClick(cell(row, 2));
    expect((await editor(container)).value).toBe('Bravo');
  });

  it('resolves a numeric custom property rowKey for the actual table editor and save', async () => {
    const user = userEvent.setup();
    const { container, controls, onSave } = mount({ rowKey: 'recordKey' });
    await user.dblClick(cell(await bodyRow(container, 'Bravo'), 2));
    const input = await editor(container);
    expect(controls.current?.editingCell).toEqual({ rowKey: '202', columnKey: 'name' });
    await user.clear(input);
    await user.type(input, 'Renamed{Enter}');
    await closed(container, controls);
    expect(onSave).toHaveBeenCalledExactlyOnceWith(BRAVO, 'name', 'Renamed', 'Bravo');
  });

  it('uses the configured functional rowKey and refreshed accessor after rerender', async () => {
    const user = userEvent.setup();
    const controls: Controls = { current: null };
    function Composition({ prefix }: { prefix: string }) {
      const rowKey = (row: Row) => `${prefix}:${row.recordKey}`;
      const { editingProps, ...rest } = useInlineEditing({ data: ROWS, columns: COLUMNS, rowKey, onSave: vi.fn() });
      controls.current = { editingProps, ...rest };
      return <PatternDataTable engine="modern" data={ROWS} columns={COLUMNS} rowKey={rowKey} {...editingProps} />;
    }
    const { container, rerender } = renderWithEngine(<Composition prefix="before" />, 'modern');
    await bodyRow(container, 'Bravo');
    rerender(<Composition prefix="after" />);
    await user.dblClick(cell(await bodyRow(container, 'Bravo'), 3));

    expect((await editor(container)).value).toBe('pro');
    expect(controls.current?.editingCell).toEqual({ rowKey: 'after:202', columnKey: 'tier' });
  });

  it('retains read-only and canEdit eligibility while F2 skips the denied cell', async () => {
    const user = userEvent.setup();
    const { container, controls, onSave } = mount();
    const row = await bodyRow(container, 'Locked');
    await user.dblClick(cell(row, 4));
    await user.dblClick(cell(row, 2));
    await closed(container, controls);
    expect(onSave).not.toHaveBeenCalled();
    act(() => row.focus());
    await user.keyboard('{F2}');

    expect((await editor(container)).value).toBe('free');
    expect(controls.current?.editingCell).toEqual({ rowKey: 'c', columnKey: 'tier' });
  });

  it('does not add a single-click or Enter trigger to default double-click mode', async () => {
    const user = userEvent.setup();
    const { container, controls } = mount();
    const row = await bodyRow(container, 'Alpha');
    await user.click(cell(row, 2));
    act(() => row.focus());
    await user.keyboard('{Enter}');
    await closed(container, controls);
  });

  it('ignores F2 from a nested control and from a row with no editable cells', async () => {
    const user = userEvent.setup();
    const { container, controls } = mount();
    const row = await bodyRow(container, 'Alpha');
    await user.dblClick(cell(row, 2));
    const input = await editor(container);
    fireEvent.keyDown(input, { key: 'F2' });
    expect(controls.current?.editingCell).toEqual({ rowKey: 'a', columnKey: 'name' });
    await user.keyboard('{Escape}');
    await closed(container, controls);
    cleanup();

    const readOnlyColumns = COLUMNS.map(({ editable: _editable, ...column }) => column);
    const readOnly = mount({ columns: readOnlyColumns });
    const readOnlyRow = await bodyRow(readOnly.container, 'Alpha');
    act(() => readOnlyRow.focus());
    expect(fireEvent.keyDown(readOnlyRow, { key: 'F2' })).toBe(true);
    await closed(readOnly.container, readOnly.controls);
  });

  it('keeps edits pending in batch mode, saves them once and discards a later draft', async () => {
    const user = userEvent.setup();
    const { container, controls, onSave } = mount({ batchMode: true, rowKey: (row) => `record:${row.recordKey}` });
    const row = await bodyRow(container, 'Bravo');
    await user.dblClick(cell(row, 3));
    const input = await editor(container);
    await user.clear(input);
    await user.type(input, 'team{Enter}');
    await closed(container, controls);
    expect(onSave).not.toHaveBeenCalled();
    expect(controls.current?.pendingEdits).toEqual({ 'record:202': { tier: 'team' } });
    expect(controls.current?.hasPendingEdits).toBe(true);

    await act(async () => { await controls.current?.saveAll(); });
    expect(onSave).toHaveBeenCalledExactlyOnceWith(BRAVO, 'tier', 'team', 'pro');
    expect(controls.current?.hasPendingEdits).toBe(false);
    await user.dblClick(cell(row, 2));
    await editor(container);
    act(() => controls.current?.discardAll());
    await closed(container, controls);
    expect(controls.current?.pendingEdits).toEqual({});
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('retains hook error state and the controlled cell when immediate save rejects, then retries', async () => {
    const user = userEvent.setup();
    const failure = new Error('Save rejected');
    const onSave = vi.fn().mockRejectedValueOnce(failure).mockResolvedValueOnce(undefined);
    const { container, controls } = mount({ onSave });
    await user.dblClick(cell(await bodyRow(container, 'Bravo'), 2));
    const input = await editor(container);
    await user.clear(input);
    await user.type(input, 'Retry{Enter}');
    await waitFor(() => expect(controls.current?.saveError).toBe(failure));
    expect(controls.current?.editingCell).toEqual({ rowKey: 'b', columnKey: 'name' });
    expect(controls.current?.isSaving).toBe(false);
    expect((await editor(container)).value).toBe('Retry');

    await user.keyboard('{Enter}');
    await closed(container, controls);
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenLastCalledWith(BRAVO, 'name', 'Retry', 'Bravo');
    expect(controls.current?.saveError).toBeNull();
  });
});

describe('useInlineEditing hook controls', () => {
  it('keeps start/cancel controls and the spread cancel handler functional', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useInlineEditing({ data: ROWS, columns: COLUMNS, rowKey: 'id', onSave }));
    act(() => result.current.startEdit('b', 'tier'));
    expect(result.current.editingProps.editingCell).toEqual({ rowKey: 'b', columnKey: 'tier' });
    act(() => result.current.editingProps.onCellEditCancel?.(BRAVO, 'tier'));
    expect(result.current.editingCell).toBeNull();
    act(() => result.current.startEdit('a', 'name'));
    act(() => result.current.cancelEdit());
    expect(result.current.editingCell).toBeNull();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('exposes saving state until the original onSave resolves', async () => {
    let finish: (() => void) | undefined;
    const onSave = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    const { result } = renderHook(() => useInlineEditing({ data: ROWS, columns: COLUMNS, rowKey: 'id', onSave }));
    act(() => result.current.editingProps.onCellEditStart?.(BRAVO, 'tier'));
    let saving: void | Promise<void> | undefined;
    act(() => { saving = result.current.editingProps.onCellEdit?.(BRAVO, 'tier', 'team', 'pro'); });
    expect(result.current.isSaving).toBe(true);
    expect(result.current.editingCell).toEqual({ rowKey: 'b', columnKey: 'tier' });
    await act(async () => { finish?.(); await saving; });
    expect(result.current.isSaving).toBe(false);
    expect(result.current.editingCell).toBeNull();
    expect(onSave).toHaveBeenCalledExactlyOnceWith(BRAVO, 'tier', 'team', 'pro');
  });
});
