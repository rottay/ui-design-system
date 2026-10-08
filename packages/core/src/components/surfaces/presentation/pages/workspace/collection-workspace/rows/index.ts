import { useCallback, useEffect, useMemo } from 'react';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { ColumnDef, EditableConfig, SortConfig } from '../../../../../../../foundation/contracts/runtime/components/patterns/core';
import type { CollectionWorkspaceProps } from '..';
import { readCollectionRecordValue, resolveKey } from '../foundation';

function resolveSortValue<T extends object>(row: T, column: ColumnDef<T>): unknown {
  if (column.accessorFn) return column.accessorFn(row);
  if (column.accessorKey) return readCollectionRecordValue(row, column.accessorKey);
  return readCollectionRecordValue(row, column.key);
}

function compareSortValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return Number(a) - Number(b);
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

function isInlineEditablePrimitive(value: unknown): boolean {
  return value == null || ['string', 'number', 'boolean'].includes(typeof value);
}

function inferInlineEditor<T>(value: unknown): EditableConfig<T> | null {
  if (!isInlineEditablePrimitive(value)) return null;
  if (typeof value === 'number') return { type: 'number' };
  if (typeof value === 'boolean') return { type: 'checkbox' };
  return { type: 'text' };
}

function hasColumnInlineSave<T>(column: ColumnDef<T> | undefined): boolean {
  return Boolean(
    column?.editable
      && typeof column.editable === 'object'
      && typeof column.editable.onSave === 'function',
  );
}

function resolvePersistedInlineColumns<T>(
  columns: ColumnDef<T>[],
  options: {
    enabled: boolean;
    hasTableSave: boolean;
  },
): ColumnDef<T>[] {
  return columns.map((column) => {
    if (!column.editable) return column;
    if (!options.enabled || (!options.hasTableSave && !hasColumnInlineSave(column))) {
      return { ...column, editable: undefined };
    }
    return column;
  });
}

export interface CollectionRowsInput<T extends object> {
  rowKey: CollectionWorkspaceProps<T>['rowKey'];
  behavior: CollectionWorkspaceProps<T>['behavior'];
  data: CollectionWorkspaceProps<T>['data'];
  capabilityColumns: ColumnDef<T>[];
  setInternalSorting: Dispatch<SetStateAction<SortConfig | null>>;
  internalSorting: SortConfig | null;
  hasInlinePersistenceHandler: boolean;
  inlineEditingEnabled: boolean;
  autoEnableInlineEditing: boolean;
  setDraftCellValues: Dispatch<SetStateAction<Record<string, Record<string, unknown>>>>;
  draftCellValues: Record<string, Record<string, unknown>>;
  previousDataRef: RefObject<T[]>;
}

export function useCollectionRows<T extends object>(input: CollectionRowsInput<T>) {
  const {
    rowKey, behavior, data, capabilityColumns, setInternalSorting, internalSorting, hasInlinePersistenceHandler,
    inlineEditingEnabled, autoEnableInlineEditing, setDraftCellValues, draftCellValues, previousDataRef,
  } = input;
  const defaultColumnKeys = useMemo(
    () => capabilityColumns.map((column) => column.key),
    [capabilityColumns],
  );

  const usesExternalSorting = Boolean(behavior?.onSortChange);

  useEffect(() => {
    if (usesExternalSorting) {
      setInternalSorting(behavior?.sorting ?? null);
    }
  }, [behavior?.sorting, usesExternalSorting]);

  const effectiveSorting = usesExternalSorting
    ? behavior?.sorting ?? null
    : internalSorting;

  const effectiveColumns = useMemo<ColumnDef<T>[]>(() => {
    const persistedColumns = resolvePersistedInlineColumns(capabilityColumns, {
      enabled: inlineEditingEnabled,
      hasTableSave: hasInlinePersistenceHandler,
    });

    if (!inlineEditingEnabled || !autoEnableInlineEditing || !hasInlinePersistenceHandler) {
      return persistedColumns;
    }

    return persistedColumns.map((column) => {
      if (column.editable !== undefined || !column.accessorKey) return column;

      const sampleValue = data
        .map((item) => readCollectionRecordValue(item, column.accessorKey as PropertyKey))
        .find(isInlineEditablePrimitive);
      const editor = inferInlineEditor<T>(sampleValue);
      if (!editor) return column;

      return {
        ...column,
        editable: editor,
      };
    });
  }, [autoEnableInlineEditing, capabilityColumns, data, hasInlinePersistenceHandler, inlineEditingEnabled]);

  useEffect(() => {
    if (previousDataRef.current === data) return;
    previousDataRef.current = data;
    setDraftCellValues((current) => (
      Object.keys(current).length > 0 ? {} : current
    ));
  }, [data]);

  const draftedData = useMemo(() => {
    if (Object.keys(draftCellValues).length === 0) return data;

    return data.map((item) => {
      const itemKey = resolveKey(item, rowKey);
      const itemDraft = readCollectionRecordValue(draftCellValues, itemKey) as Partial<T> | undefined;
      if (!itemDraft) return item;

      return {
        ...item,
        ...itemDraft,
      };
    }) as T[];
  }, [data, draftCellValues, rowKey]);

  const handleInlineCellEdit = useCallback(
    async (row: T, columnKey: string, newValue: unknown, oldValue: unknown) => {
      const column = effectiveColumns.find((candidate) => candidate.key === columnKey);
      const hasPersistence = hasInlinePersistenceHandler || hasColumnInlineSave(column);

      if (!hasPersistence) {
        throw new Error('Inline persistence is not configured for this field.');
      }

      await behavior?.cellEditing?.onCellEdit?.(row, columnKey, newValue, oldValue);

      if (!column?.accessorKey) return;

      const itemKey = resolveKey(row, rowKey);
      setDraftCellValues((current) => ({
        ...current,
        [itemKey]: {
          ...((readCollectionRecordValue(current, itemKey) as Record<string, unknown> | undefined) ?? {}),
          [column.accessorKey as string]: newValue,
        },
      }));
    },
    [behavior?.cellEditing, effectiveColumns, hasInlinePersistenceHandler, rowKey],
  );

  const handleSortChange = useCallback(
    (sort: SortConfig) => {
      if (behavior?.onSortChange) {
        behavior.onSortChange(sort);
        return;
      }

      setInternalSorting(sort);
    },
    [behavior?.onSortChange],
  );

  const displayData = useMemo(() => {
    if (usesExternalSorting || !effectiveSorting) return draftedData;

    const sortColumn = effectiveColumns.find((column) => column.key === effectiveSorting.key);
    if (!sortColumn?.sortable) return draftedData;

    return draftedData
      .map((item, index) => ({ item, index }))
      .sort((left, right) => {
        const comparison = compareSortValues(
          resolveSortValue(left.item, sortColumn),
          resolveSortValue(right.item, sortColumn),
        );
        const directedComparison =
          effectiveSorting.direction === 'asc' ? comparison : -comparison;

        return directedComparison || left.index - right.index;
      })
      .map(({ item }) => item);
  }, [draftedData, effectiveColumns, effectiveSorting, usesExternalSorting]);
  return { defaultColumnKeys, effectiveSorting, effectiveColumns, handleInlineCellEdit, handleSortChange, displayData };
}
