import type { ReactNode } from 'react';

/** Persisted view state shared by saved-view patterns and collection surfaces. */
export interface SavedViewConfig {
  filters?: Record<string, any>;
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  columns?: string[];
  groupBy?: string;
  layout?: 'table' | 'board' | 'gallery' | 'calendar';
}

export interface SavedView {
  id: string;
  name: string;
  icon?: ReactNode;
  isDefault?: boolean;
  config: SavedViewConfig;
  /**
   * The view's live configuration has unsaved modifications relative to the
   * persisted snapshot. Engines surface this as the governed unsaved-changes
   * indicator; absent means pristine (the historical default).
   */
  isDirty?: boolean;
}

/**
 * Lifecycle state of a single active filter value, shared by the ListToolbar
 * chips, the ActiveFiltersBar rail and the filter triggers:
 * - `applied` (default): the value drives the collection right now;
 * - `draft`: the value is chosen but not yet applied (an explicit apply step
 *   is pending);
 * - `invalid`: the value no longer resolves (an orphaned option, a stale
 *   saved view) and needs user attention.
 */
export type ActiveFilterState = 'applied' | 'draft' | 'invalid';

export interface DataTableMobileCardInteractionEvent {
  stopPropagation?: () => void;
}

/** Product behavior supplied to a custom mobile-card renderer. */
export interface DataTableMobileCardContext<T> {
  item: T;
  index: number;
  rowKey: string;
  selected: boolean;
  selectable: boolean;
  toggleSelection: (event?: DataTableMobileCardInteractionEvent) => void;
  open: (event?: DataTableMobileCardInteractionEvent) => void;
  actions?: ReactNode;
}

export interface FilterPillConfig {
  key: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
}

export type DensityKey = 'compact' | 'comfortable' | 'spacious';
export type ViewMode = 'list' | 'cards';
export type DetailPanelSidebarPosition = 'left' | 'right';
export type CollectionViewMode =
  | 'table'
  | 'cards'
  | 'grid'
  | 'kanban'
  | 'gallery'
  | 'calendar';

/** Data-only active-filter contract shared by structures and surfaces. */
export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
  displayValue?: string;
  field?: string;
  /**
   * Lifecycle state of this filter value (see {@link ActiveFilterState}).
   * Optional; absent means `applied`, which preserves every existing caller.
   */
  state?: ActiveFilterState;
}
