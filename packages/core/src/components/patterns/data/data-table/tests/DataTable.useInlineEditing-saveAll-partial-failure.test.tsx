/** A partial batch failure must retain only edits that were not persisted. */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useInlineEditing } from '../runtime/inline-editing';

interface Row {
  id: string;
  name: string;
}

const rows: Row[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
  { id: 'c', name: 'Charlie' },
];

describe('useInlineEditing — saveAll partial failure', () => {
  it('does not re-submit cells that already saved when a later cell in the same batch fails', async () => {
    const onSave = vi.fn(async (row: Row, columnKey: string) => {
      if (row.id === 'c') throw new Error(`save failed for ${columnKey}`);
    });

    const { result } = renderHook(() =>
      useInlineEditing<Row>({ data: rows, columns: [], rowKey: 'id', onSave, batchMode: true }),
    );

    // Queue three edits; batch mode defers persistence until saveAll.
    await act(async () => {
      await result.current.editingProps.onCellEdit?.(rows[0], 'name', 'Alpha!', 'Alpha');
      await result.current.editingProps.onCellEdit?.(rows[1], 'name', 'Beta!', 'Beta');
      await result.current.editingProps.onCellEdit?.(rows[2], 'name', 'Charlie!', 'Charlie');
    });
    expect(result.current.pendingEdits).toHaveProperty('a');
    expect(result.current.pendingEdits).toHaveProperty('b');
    expect(result.current.pendingEdits).toHaveProperty('c');

    await act(async () => {
      await result.current.saveAll();
    });

    expect(result.current.saveError).not.toBeNull();
    // Rows a and b already succeeded -- they must be gone from pendingEdits,
    // regardless of iteration order over the pendingEdits object.
    expect(result.current.pendingEdits).not.toHaveProperty('a');
    expect(result.current.pendingEdits).not.toHaveProperty('b');
    // Row c genuinely failed and must remain so the user can retry it.
    expect(result.current.pendingEdits).toHaveProperty('c');

    const callsForA = onSave.mock.calls.filter(([row]) => row.id === 'a').length;
    const callsForB = onSave.mock.calls.filter(([row]) => row.id === 'b').length;
    expect(callsForA).toBe(1);
    expect(callsForB).toBe(1);

    // Retrying must only re-submit the row that actually failed.
    onSave.mockClear();
    onSave.mockImplementation(async () => {});
    await act(async () => {
      await result.current.saveAll();
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0]).toEqual(rows[2]);
    expect(result.current.pendingEdits).toEqual({});
  });

  it('retains failed columns on the same row and later rows without retrying a persisted sibling', async () => {
    const first = { id: 'a', name: 'Alpha', note: 'first' };
    const second = { id: 'b', name: 'Beta', note: 'second' };
    const failure = new Error('note rejected');
    const onSave = vi.fn(async (_row: typeof first, columnKey: string, _newValue: unknown, _oldValue: unknown) => {
      if (columnKey === 'note') throw failure;
    });
    const { result } = renderHook(() =>
      useInlineEditing({ data: [first, second], columns: [], rowKey: 'id', onSave, batchMode: true }),
    );

    await act(async () => {
      await result.current.editingProps.onCellEdit?.(first, 'name', 'Alpha!', 'Alpha');
      await result.current.editingProps.onCellEdit?.(first, 'note', 'first!', 'first');
      await result.current.editingProps.onCellEdit?.(second, 'name', 'Beta!', 'Beta');
    });
    await act(async () => { await result.current.saveAll(); });

    expect(result.current.pendingEdits).toEqual({ a: { note: 'first!' }, b: { name: 'Beta!' } });
    expect(result.current.hasPendingEdits).toBe(true);
    expect(result.current.saveError).toBe(failure);
    expect(result.current.isSaving).toBe(false);
    expect(onSave.mock.calls).toEqual([
      [first, 'name', 'Alpha!', 'Alpha'],
      [first, 'note', 'first!', 'first'],
    ]);

    onSave.mockClear();
    onSave.mockImplementation(async () => {});
    await act(async () => { await result.current.saveAll(); });
    expect(onSave.mock.calls).toEqual([
      [first, 'note', 'first!', 'first'],
      [second, 'name', 'Beta!', 'Beta'],
    ]);
    expect(result.current.pendingEdits).toEqual({});
    expect(result.current.hasPendingEdits).toBe(false);
    expect(result.current.saveError).toBeNull();
  });

  it.each(['__proto__', 'constructor', 'toString'])('retains and retries own special column edits under the functional row key %s', async (id) => {
    const row = { id, name: 'Special', ['__proto__']: 'original proto', constructor: 'original constructor' };
    const failure = new Error('special column rejected');
    const onSave = vi.fn(async (_row: typeof row, columnKey: string, _newValue: unknown, _oldValue: unknown) => {
      if (columnKey === 'constructor') throw failure;
    });
    const { result } = renderHook(() =>
      useInlineEditing({ data: [row], columns: [], rowKey: (item) => item.id, onSave, batchMode: true }),
    );

    await act(async () => {
      await result.current.editingProps.onCellEdit?.(row, '__proto__', 'next proto', 'original proto');
      await result.current.editingProps.onCellEdit?.(row, 'constructor', 'next constructor', 'original constructor');
    });
    expect(Object.keys(result.current.pendingEdits)).toEqual([id]);
    expect(Object.values(result.current.pendingEdits)).toEqual([
      { ['__proto__']: 'next proto', constructor: 'next constructor' },
    ]);

    await act(async () => { await result.current.saveAll(); });
    expect(onSave.mock.calls).toEqual([
      [row, '__proto__', 'next proto', 'original proto'],
      [row, 'constructor', 'next constructor', 'original constructor'],
    ]);
    expect(Object.keys(result.current.pendingEdits)).toEqual([id]);
    expect(Object.values(result.current.pendingEdits)).toEqual([{ constructor: 'next constructor' }]);
    expect(result.current.saveError).toBe(failure);
    onSave.mockClear();
    onSave.mockImplementation(async () => {});
    await act(async () => { await result.current.saveAll(); });
    expect(onSave).toHaveBeenCalledExactlyOnceWith(row, 'constructor', 'next constructor', 'original constructor');
    expect(result.current.pendingEdits).toEqual({});
    expect(result.current.hasPendingEdits).toBe(false);
    expect(result.current.saveError).toBeNull();
  });

  it('keeps a different column and row queued while an earlier save is in flight', async () => {
    const first = { id: 'a', name: 'Alpha', note: 'first' };
    const second = { id: 'b', name: 'Beta', note: 'second' };
    let finish: (() => void) | undefined;
    const waiting = new Promise<void>((resolve) => { finish = resolve; });
    const onSave = vi.fn((_row: typeof first, _columnKey: string, _newValue: unknown, _oldValue: unknown) => waiting);
    const { result } = renderHook(() =>
      useInlineEditing({ data: [first, second], columns: [], rowKey: 'id', onSave, batchMode: true }),
    );

    await act(async () => { await result.current.editingProps.onCellEdit?.(first, 'name', 'Alpha!', 'Alpha'); });
    let saving: Promise<void> | undefined;
    act(() => { saving = result.current.saveAll(); });
    expect(result.current.isSaving).toBe(true);
    expect(onSave).toHaveBeenCalledExactlyOnceWith(first, 'name', 'Alpha!', 'Alpha');

    await act(async () => {
      await result.current.editingProps.onCellEdit?.(first, 'note', 'first!', 'first');
      await result.current.editingProps.onCellEdit?.(second, 'name', 'Beta!', 'Beta');
    });
    expect(result.current.pendingEdits).toEqual({ a: { name: 'Alpha!', note: 'first!' }, b: { name: 'Beta!' } });
    expect(finish).toBeTypeOf('function');
    await act(async () => { finish?.(); await saving; });

    expect(result.current.pendingEdits).toEqual({ a: { note: 'first!' }, b: { name: 'Beta!' } });
    expect(result.current.isSaving).toBe(false);
    expect(result.current.saveError).toBeNull();
    expect(onSave).toHaveBeenCalledTimes(1);

    await act(async () => { await result.current.saveAll(); });
    expect(onSave.mock.calls).toEqual([
      [first, 'name', 'Alpha!', 'Alpha'],
      [first, 'note', 'first!', 'first'],
      [second, 'name', 'Beta!', 'Beta'],
    ]);
    expect(result.current.pendingEdits).toEqual({});
  });

  it('does not recreate pending state discarded during an in-flight save', async () => {
    let finish: (() => void) | undefined;
    const waiting = new Promise<void>((resolve) => { finish = resolve; });
    const onSave = vi.fn((_row: Row, _columnKey: string, _newValue: unknown, _oldValue: unknown) => waiting);
    const { result } = renderHook(() =>
      useInlineEditing({ data: rows, columns: [], rowKey: 'id', onSave, batchMode: true }),
    );

    await act(async () => { await result.current.editingProps.onCellEdit?.(rows[0], 'name', 'Alpha!', 'Alpha'); });
    let saving: Promise<void> | undefined;
    act(() => { saving = result.current.saveAll(); });
    expect(result.current.isSaving).toBe(true);
    act(() => {
      result.current.startEdit('b', 'name');
      result.current.discardAll();
    });
    const discarded = result.current.pendingEdits;
    expect(discarded).toEqual({});
    expect(result.current.editingCell).toBeNull();
    expect(result.current.hasPendingEdits).toBe(false);
    expect(finish).toBeTypeOf('function');
    await act(async () => { finish?.(); await saving; });

    expect(result.current.pendingEdits).toBe(discarded);
    expect(result.current.pendingEdits).toEqual({});
    expect(result.current.isSaving).toBe(false);
    expect(result.current.saveError).toBeNull();
    await act(async () => { await result.current.saveAll(); });
    expect(onSave).toHaveBeenCalledExactlyOnceWith(rows[0], 'name', 'Alpha!', 'Alpha');
  });

});
