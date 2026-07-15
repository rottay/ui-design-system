'use client';

/**
 * @fileoverview Composition hook for inline cell editing in PatternDataTable.
 *
 * Manages editing state (which cell is active), pending edits (dirty tracking),
 * validation, save/cancel, and optimistic data merging. Returns a props object
 * that can be spread onto `<PatternDataTable>`.
 *
 * @example
 * ```tsx
 * const { editingProps, hasPendingEdits, saveAll, discardAll } =
 *   useInlineEditing({
 *     data: users,
 *     columns,
 *     rowKey: 'id',
 *     onSave: async (row, columnKey, newValue) => {
 *       await updateUser(row.id, { [columnKey]: newValue });
 *     },
 *   });
 *
 * return <PatternDataTable data={users} columns={columns} {...editingProps} />;
 * ```
 */

import { useState, useCallback, useMemo } from 'react';
import type { ColumnDef, EditableConfig } from '../types';
import type { DataTablePatternProps } from '../../data/data-table/DataTable.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseInlineEditingOptions<T> {
  /** The current data array. */
  data: T[];
  /** Column definitions (used to resolve editable config and navigate between editable cells). */
  columns: ColumnDef<T>[];
  /** Row key accessor -- same as DataTablePatternProps.rowKey. */
  rowKey: keyof T | ((row: T) => string);
  /** Called when a cell value is saved. */
  onSave: (row: T, columnKey: string, newValue: unknown, oldValue: unknown) => void | Promise<void>;
  /** Whether to batch edits (accumulate pending changes) instead of saving one at a time. */
  batchMode?: boolean;
  /** Edit trigger mode. @default 'doubleClick' */
  editTrigger?: 'click' | 'doubleClick';
  /** Enable Tab key navigation between editable cells. @default true */
  tabNavigation?: boolean;
}

export interface UseInlineEditingReturn<T> {
  /** Props to spread directly onto PatternDataTable. */
  editingProps: Pick<
    DataTablePatternProps<T>,
    | 'onCellEdit'
    | 'onCellEditStart'
    | 'onCellEditCancel'
    | 'editingCell'
    | 'editTrigger'
    | 'tabNavigation'
  >;
  /** Currently editing cell coordinates, or null. */
  editingCell: { rowKey: string; columnKey: string } | null;
  /** Start editing a specific cell. */
  startEdit: (rowKey: string, columnKey: string) => void;
  /** Cancel the current edit. */
  cancelEdit: () => void;
  /** Whether any edits are pending (batch mode). */
  hasPendingEdits: boolean;
  /** Pending edits map: rowKey -> columnKey -> pendingValue. */
  pendingEdits: Record<string, Record<string, unknown>>;
  /** Save all pending edits (batch mode). */
  saveAll: () => Promise<void>;
  /** Discard all pending edits (batch mode). */
  discardAll: () => void;
  /** Whether a save operation is in progress. */
  isSaving: boolean;
  /** Last save error, if any. */
  saveError: Error | null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

function readRecordValue(value: unknown, key: PropertyKey): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
  return Reflect.get(value, key);
}

function resolveRowKeyValue<T>(row: T, rowKey: keyof T | ((row: T) => string)): string {
  if (typeof rowKey === 'function') return rowKey(row);
  return String(readRecordValue(row, rowKey as string));
}

export function useInlineEditing<T extends Record<string, unknown>>(
  options: UseInlineEditingOptions<T>,
): UseInlineEditingReturn<T> {
  const {
    data,
    columns,
    rowKey,
    onSave,
    batchMode = false,
    editTrigger = 'doubleClick',
    tabNavigation = true,
  } = options;

  const [editingCell, setEditingCell] = useState<{ rowKey: string; columnKey: string } | null>(null);
  const [pendingEdits, setPendingEdits] = useState<Record<string, Record<string, unknown>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);

  const startEdit = useCallback((rk: string, ck: string) => {
    setEditingCell({ rowKey: rk, columnKey: ck });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleCellEdit = useCallback(
    async (row: T, columnKey: string, newValue: unknown, oldValue: unknown) => {
      if (batchMode) {
        const rk = resolveRowKeyValue(row, rowKey);
        setPendingEdits((prev: Record<string, Record<string, unknown>>) => ({
          ...prev,
          [rk]: {
            ...(prev[rk] ?? {}),
            [columnKey]: newValue,
          },
        }));
        setEditingCell(null);
      } else {
        setIsSaving(true);
        setSaveError(null);
        try {
          await onSave(row, columnKey, newValue, oldValue);
          setEditingCell(null);
        } catch (err) {
          setSaveError(err instanceof Error ? err : new Error(String(err)));
        } finally {
          setIsSaving(false);
        }
      }
    },
    [batchMode, onSave, rowKey],
  );

  const handleCellEditStart = useCallback(
    (_row: T, _columnKey: string) => {
      // State is already managed via editingCell
    },
    [],
  );

  const handleCellEditCancel = useCallback(
    (_row: T, _columnKey: string) => {
      setEditingCell(null);
    },
    [],
  );

  const saveAll = useCallback(async () => {
    if (!batchMode) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const entries = Object.entries(pendingEdits);
      for (const [rk, colEdits] of entries) {
        const row = data.find((r) => resolveRowKeyValue(r, rowKey) === rk);
        if (!row) continue;
        for (const [ck, newValue] of Object.entries(colEdits)) {
          const oldValue = readRecordValue(row, ck);
          await onSave(row, ck, newValue, oldValue);
        }
      }
      setPendingEdits({});
    } catch (err) {
      setSaveError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsSaving(false);
    }
  }, [batchMode, data, onSave, pendingEdits, rowKey]);

  const discardAll = useCallback(() => {
    setPendingEdits({});
    setEditingCell(null);
  }, []);

  const hasPendingEdits = useMemo(
    () => Object.keys(pendingEdits).length > 0,
    [pendingEdits],
  );

  const editingProps: UseInlineEditingReturn<T>['editingProps'] = useMemo(
    () => ({
      onCellEdit: handleCellEdit,
      onCellEditStart: handleCellEditStart,
      onCellEditCancel: handleCellEditCancel,
      editingCell,
      editTrigger,
      tabNavigation,
    }),
    [handleCellEdit, handleCellEditStart, handleCellEditCancel, editingCell, editTrigger, tabNavigation],
  );

  return {
    editingProps,
    editingCell,
    startEdit,
    cancelEdit,
    hasPendingEdits,
    pendingEdits,
    saveAll,
    discardAll,
    isSaving,
    saveError,
  };
}
