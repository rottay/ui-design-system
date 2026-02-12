'use client';

/**
 * useKanban<T> - Composition Hook
 *
 * Manages KanbanBoard state: column items, drag operations, item movement.
 */

import { useState, useCallback } from 'react';
import type { KanbanColumnDef } from '../types';

export interface UseKanbanOptions<T> {
  initialColumns: KanbanColumnDef<T>[];
  itemKey: (item: T) => string;
  onItemMoved?: (itemId: string, fromColumn: string, toColumn: string, position: number) => void;
}

export interface UseKanbanReturn<T> {
  columns: KanbanColumnDef<T>[];
  moveItem: (itemId: string, fromColumn: string, toColumn: string, position: number) => void;
  addItem: (columnId: string, item: T) => void;
  removeItem: (columnId: string, itemId: string) => void;
  updateItem: (columnId: string, itemId: string, updater: (item: T) => T) => void;
  setColumns: (columns: KanbanColumnDef<T>[]) => void;
  getItem: (itemId: string) => T | undefined;
  getColumnItems: (columnId: string) => T[];
}

export function useKanban<T>(options: UseKanbanOptions<T>): UseKanbanReturn<T> {
  const { initialColumns, itemKey, onItemMoved } = options;
  const [columns, setColumns] = useState<KanbanColumnDef<T>[]>(initialColumns);

  const moveItem = useCallback((itemId: string, fromColumn: string, toColumn: string, position: number) => {
    setColumns((prev) => {
      const next = prev.map((col) => ({ ...col, items: [...col.items] }));
      const fromCol = next.find((c) => c.id === fromColumn);
      const toCol = next.find((c) => c.id === toColumn);
      if (!fromCol || !toCol) return prev;

      const itemIndex = fromCol.items.findIndex((item) => itemKey(item) === itemId);
      if (itemIndex === -1) return prev;

      const [item] = fromCol.items.splice(itemIndex, 1);
      toCol.items.splice(position, 0, item);

      return next;
    });
    onItemMoved?.(itemId, fromColumn, toColumn, position);
  }, [itemKey, onItemMoved]);

  const addItem = useCallback((columnId: string, item: T) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, items: [...col.items, item] } : col
      )
    );
  }, []);

  const removeItem = useCallback((columnId: string, itemId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, items: col.items.filter((item) => itemKey(item) !== itemId) }
          : col
      )
    );
  }, [itemKey]);

  const updateItem = useCallback((columnId: string, itemId: string, updater: (item: T) => T) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              items: col.items.map((item) =>
                itemKey(item) === itemId ? updater(item) : item
              ),
            }
          : col
      )
    );
  }, [itemKey]);

  const getItem = useCallback((itemId: string): T | undefined => {
    for (const col of columns) {
      const item = col.items.find((i) => itemKey(i) === itemId);
      if (item) return item;
    }
    return undefined;
  }, [columns, itemKey]);

  const getColumnItems = useCallback((columnId: string): T[] => {
    return columns.find((c) => c.id === columnId)?.items ?? [];
  }, [columns]);

  return {
    columns,
    moveItem,
    addItem,
    removeItem,
    updateItem,
    setColumns,
    getItem,
    getColumnItems,
  };
}
