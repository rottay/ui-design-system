'use client';

/**
 * @fileoverview useKanban composition hook -- manages KanbanBoard state
 * including column items, drag-and-drop movement, add/remove/update operations.
 *
 * Provides an immutable-update state model for kanban columns so consumers
 * can freely read `columns` while the hook guarantees that every mutation
 * (move, add, remove, update) produces a fresh array reference for React
 * to detect changes.
 *
 * @example
 * ```tsx
 * const { columns, moveItem, addItem } = useKanban({
 *   initialColumns: boardColumns,
 *   itemKey: (task) => task.id,
 *   onItemMoved: (id, from, to) => api.moveTask(id, from, to),
 * });
 * return <KanbanBoard columns={columns} onDragEnd={moveItem} />;
 * ```
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

/**
 * Manages the column/item state of a kanban board with immutable updates.
 *
 * All mutation callbacks (`moveItem`, `addItem`, `removeItem`, `updateItem`)
 * are stable (wrapped in `useCallback`) so they can be passed to memoized
 * child components without causing unnecessary re-renders.
 *
 * @param options - Board configuration with initial columns and an item identity function.
 * @returns Column state and CRUD operations for board items.
 *
 * @example
 * ```tsx
 * const board = useKanban({ initialColumns, itemKey: (t) => t.id });
 * board.addItem('todo', newTask);
 * board.moveItem(taskId, 'todo', 'done', 0);
 * ```
 */
export function useKanban<T>(options: UseKanbanOptions<T>): UseKanbanReturn<T> {
  const { initialColumns, itemKey, onItemMoved } = options;
  const [columns, setColumns] = useState<KanbanColumnDef<T>[]>(initialColumns);

  // Moves an item between columns (or reorders within the same column).
  // Deep-copies every column's items array so React sees fresh references
  // and re-renders the affected columns.
  const moveItem = useCallback((itemId: string, fromColumn: string, toColumn: string, position: number) => {
    setColumns((prev) => {
      // Shallow-clone each column and its items array to preserve immutability.
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
    // Fire the external callback after state update so the consumer can
    // persist the move to a backend without blocking the UI update.
    onItemMoved?.(itemId, fromColumn, toColumn, position);
  }, [itemKey, onItemMoved]);

  /** Appends an item to the end of the specified column. */
  const addItem = useCallback((columnId: string, item: T) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, items: [...col.items, item] } : col
      )
    );
  }, []);

  /** Removes an item by its key from the specified column. */
  const removeItem = useCallback((columnId: string, itemId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, items: col.items.filter((item) => itemKey(item) !== itemId) }
          : col
      )
    );
  }, [itemKey]);

  /** Applies an updater function to a single item within the specified column. */
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

  // Searches all columns to find an item by key. Reads from the current
  // `columns` state, so it includes any pending moves/adds.
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
