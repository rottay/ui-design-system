/**
 * KanbanBoard<T> - Pattern Component Types
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps, KanbanColumnDef } from '../types';

export interface KanbanBoardProps<T> extends PatternBaseProps {
  /** Column definitions with items */
  columns: KanbanColumnDef<T>[];
  /** Card renderer */
  renderCard: (item: T, columnId: string) => ReactNode;
  /** Column header renderer */
  renderColumnHeader?: (column: KanbanColumnDef<T>, itemCount: number) => ReactNode;
  /** Toolbar slot */
  toolbar?: ReactNode;
  /** Item move handler */
  onItemMove: (itemId: string, fromColumn: string, toColumn: string, position: number) => void;
  /** Item click handler */
  onItemClick?: (item: T, columnId: string) => void;
  /** Empty column content */
  emptyColumn?: ReactNode;
  /** Item key accessor */
  itemKey: (item: T) => string;
  /** Column gap */
  columnGap?: number | string;
  /** Column min width */
  columnMinWidth?: number | string;
  /** Allow adding items */
  onAddItem?: (columnId: string) => void;
  /** Add item label */
  addItemLabel?: string;
}
