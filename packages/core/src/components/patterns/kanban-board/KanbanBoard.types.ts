/**
 * @fileoverview Type definitions for the KanbanBoard pattern component.
 * Defines `KanbanBoardProps<T>` -- the generic props interface that controls
 * column layout, card rendering, drag-and-drop item movement between columns,
 * column headers, WIP limits, and add-item callbacks. Column data structure
 * is provided by `KanbanColumnDef<T>` from the shared pattern types.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps, KanbanColumnDef } from '../types';

/**
 * Props for the KanbanBoard pattern component.
 *
 * The KanbanBoard renders a horizontal set of columns where each column
 * contains a vertical list of draggable cards. It is fully controlled: the
 * parent owns the column/item data and handles all mutations via callbacks.
 * The board only manages drag-and-drop interactions and visual layout.
 *
 * @typeParam T - The shape of a single kanban item/card. Card rendering and
 *   click handlers are typed against this.
 *
 * @example
 * ```tsx
 * <PatternKanbanBoard<Task>
 *   columns={[
 *     { id: 'todo', title: 'To Do', items: todoTasks, color: 'var(--ds-color-info)' },
 *     { id: 'in-progress', title: 'In Progress', items: inProgressTasks, limit: 5 },
 *     { id: 'done', title: 'Done', items: doneTasks, color: 'var(--ds-color-success)' },
 *   ]}
 *   renderCard={(task, columnId) => <TaskCard task={task} />}
 *   itemKey={(task) => task.id}
 *   onItemMove={(itemId, from, to, pos) => moveTask(itemId, from, to, pos)}
 *   onItemClick={(task) => openTaskDetail(task)}
 *   onAddItem={(columnId) => openNewTaskDialog(columnId)}
 *   addItemLabel="+ Add task"
 *   columnMinWidth={280}
 * />
 * ```
 */
export interface KanbanBoardProps<T> extends PatternBaseProps {
  /**
   * Column definitions including their items. Each column has an `id`, `title`,
   * and `items` array. Columns render left-to-right in array order.
   * See `KanbanColumnDef<T>` for color, icon, WIP limit, and collapse options.
   */
  columns: KanbanColumnDef<T>[];

  /**
   * Card renderer called for each item in every column. The returned
   * ReactNode becomes the draggable card element.
   *
   * @param item     - The data object for this card.
   * @param columnId - The ID of the column containing this card.
   */
  renderCard: (item: T, columnId: string) => ReactNode;

  /**
   * Optional custom column header renderer. When omitted, the board renders
   * a default header with the column title and item count.
   *
   * @param column    - The full column definition.
   * @param itemCount - Number of items currently in this column.
   */
  renderColumnHeader?: (column: KanbanColumnDef<T>, itemCount: number) => ReactNode;

  /**
   * Toolbar slot rendered above the board. Typically contains search, filters,
   * or view toggles.
   */
  toolbar?: ReactNode;

  /**
   * Called when an item is dragged from one column to another (or reordered
   * within the same column). The parent must update the column data to reflect
   * the move.
   *
   * @param itemId     - The unique key of the moved item (from `itemKey`).
   * @param fromColumn - The source column ID.
   * @param toColumn   - The destination column ID (may equal `fromColumn` for reorder).
   * @param position   - Zero-based insertion index in the destination column.
   */
  onItemMove: (itemId: string, fromColumn: string, toColumn: string, position: number) => void;

  /**
   * Called when a card is clicked (not dragged). Typically opens a detail
   * panel or modal.
   *
   * @param item     - The clicked item data.
   * @param columnId - The column containing the clicked item.
   */
  onItemClick?: (item: T, columnId: string) => void;

  /**
   * Content shown inside empty columns (those with zero items). Defaults to
   * a subtle "No items" placeholder.
   */
  emptyColumn?: ReactNode;

  /**
   * Function that extracts a unique string key from an item. Used for React
   * reconciliation and as the `itemId` argument in `onItemMove`. Must return
   * a stable, unique value for each item across all columns.
   *
   * @param item - The kanban item.
   * @returns A unique string identifier.
   */
  itemKey: (item: T) => string;

  /**
   * Horizontal gap between columns. Accepts a number (pixels) or CSS string
   * (e.g. `"1rem"`).
   * @default 16
   */
  columnGap?: number | string;

  /**
   * Minimum width of each column. Columns will not shrink below this value.
   * Accepts a number (pixels) or CSS string.
   * @default 280
   */
  columnMinWidth?: number | string;

  /**
   * Called when the "add item" button at the bottom of a column is clicked.
   * When omitted, no add button is rendered.
   *
   * @param columnId - The ID of the column where the user wants to add an item.
   */
  onAddItem?: (columnId: string) => void;

  /**
   * Label for the "add item" button shown at the bottom of each column.
   * Only visible when `onAddItem` is provided.
   * @default "Add item"
   */
  addItemLabel?: string;
}
