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
});
