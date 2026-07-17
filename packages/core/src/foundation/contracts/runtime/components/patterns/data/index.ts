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
}

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
}
