/**
 * @fileoverview Type definitions for the ColumnSettingsDropdown pattern.
 * Defines ColumnSettingItem, ColumnSettingsProps, and related types for
 * building a panel that manages table column visibility, ordering, and
 * pinning with search, checkboxes, drag handles, and pin toggles.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../types';

/** Column definition for the settings panel. */
export interface ColumnSettingItem {
  /** Unique column key */
  key: string;
  /** Column header content */
  header: ReactNode;
}

/** Props for the ColumnSettingsDropdown pattern component. */
export interface ColumnSettingsProps extends PatternBaseProps {
  /** All available columns */
  allColumns: ColumnSettingItem[];
  /** Keys of currently visible columns */
  visibleColumns: string[];
  /** Keys of columns that cannot be hidden */
  lockedColumns: string[];
  /** Ordered list of column keys */
  columnOrder: string[];
  /** Columns pinned to left and right edges */
  pinnedColumns: { left: string[]; right: string[] };
  /** Toggle column visibility */
  onToggleVisibility: (key: string) => void;
  /** Reorder columns */
  onReorder: (order: string[]) => void;
  /** Toggle column pinning */
  onTogglePin: (key: string, side: 'left' | 'right' | null) => void;
  /** Reset all column settings to default */
  onReset: () => void;
}
