/**
 * @fileoverview Shared collection/workspace contract.
 *
 * All collection-oriented surfaces (list, search, kanban, audit,
 * scheduler, report) compose from this contract instead of
 * defining their own versions of search/filter/sort/pagination.
 *
 * @see implementation-plan/05-COLLECTION-WORKSPACE-SPINE.md
 */

import type { ReactNode } from 'react';
import type {
  BulkAction,
  ColumnDef,
  FilterDef,
  PaginationConfig,
  SortConfig,
} from '../../patterns/types';
import type { SavedView } from '../../patterns/saved-views/SavedViews.types';

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

/** Full-text search configuration. */
export interface WorkspaceSearchConfig {
  enabled: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  debounceMs?: number;
}

/** Saved views configuration (delegates to PatternSavedViewsBar). */
export interface WorkspaceSavedViewsConfig {
  enabled: boolean;
  views?: SavedView[];
  activeViewId?: string;
  onViewSelect?: (viewId: string) => void;
  onViewSave?: (view: SavedView) => void;
  onViewDelete?: (viewId: string) => void;
  onViewRename?: (viewId: string, name: string) => void;
  onViewCreate?: (view: Omit<SavedView, 'id'>) => void;
  onViewReorder?: (viewIds: string[]) => void;
  allowCreate?: boolean;
  allowDelete?: boolean;
  allowRename?: boolean;
  maxViews?: number;
}

/** Column visibility/order/pin settings (delegates to PatternColumnSettings). */
export interface WorkspaceColumnSettingsConfig {
  enabled: boolean;
  visibleColumns?: string[];
  columnOrder?: string[];
  pinnedColumns?: { left?: string[]; right?: string[] };
  lockedColumns?: string[];
  onVisibleColumnsChange?: (cols: string[]) => void;
  onColumnOrderChange?: (order: string[]) => void;
  onPinnedColumnsChange?: (pinned: { left?: string[]; right?: string[] }) => void;
  onReset?: () => void;
}

/** Density control. */
export interface WorkspaceDensityConfig {
  enabled: boolean;
  value?: 'compact' | 'comfortable' | 'spacious';
  onChange?: (density: 'compact' | 'comfortable' | 'spacious') => void;
}

/** Export actions. */
export interface WorkspaceExportConfig {
  enabled: boolean;
  formats?: ('csv' | 'xlsx' | 'pdf' | 'json')[];
  onExport?: (format: string) => void;
}

/** View mode switching (table/cards/board/gallery/calendar). */
export interface WorkspaceViewModeConfig {
  enabled: boolean;
  modes: string[];
  value?: string;
  onChange?: (mode: string) => void;
}

/** Unified controls configuration for all workspace toolbar features. */
export interface WorkspaceControlsConfig {
  search?: WorkspaceSearchConfig;
  filters?: FilterDef[];
  filterValues?: Record<string, unknown>;
  onFilterChange?: (values: Record<string, unknown>) => void;
  savedViews?: WorkspaceSavedViewsConfig;
  columnSettings?: WorkspaceColumnSettingsConfig;
  density?: WorkspaceDensityConfig;
  export?: WorkspaceExportConfig;
  viewMode?: WorkspaceViewModeConfig;
}

// ---------------------------------------------------------------------------
// Behavior
// ---------------------------------------------------------------------------

/** Selection configuration. */
export interface WorkspaceSelectionConfig<T> {
  enabled: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[], items: T[]) => void;
}

/** Preview rail (side panel for selected item). */
export interface WorkspacePreviewRailConfig<T> {
  enabled: boolean;
  width?: string;
  render?: (item: T) => ReactNode;
}

/** Behavioral capabilities for collection workspaces. */
export interface CollectionBehaviorConfig<T> {
  selection?: WorkspaceSelectionConfig<T>;
  bulkActions?: BulkAction<T>[];
  sorting?: SortConfig | null;
  onSortChange?: (sort: SortConfig) => void;
  pagination?: PaginationConfig | false;
  previewRail?: WorkspacePreviewRailConfig<T>;
  onRowClick?: (item: T, index: number) => void;
  onRowDoubleClick?: (item: T, index: number) => void;
  expandedRow?: (item: T) => ReactNode;
}

// ---------------------------------------------------------------------------
// Presentation
// ---------------------------------------------------------------------------

/** Responsive behavior configuration. */
export interface WorkspaceResponsiveConfig {
  stackOnMobile?: boolean;
  mobileBreakpoint?: number;
  mobileView?: string;
}

/** Visual presentation configuration. */
export interface CollectionPresentationConfig {
  responsive?: WorkspaceResponsiveConfig;
  layout?: 'full' | 'constrained';
  maxWidth?: string;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
}

// ---------------------------------------------------------------------------
// Full workspace config
// ---------------------------------------------------------------------------

/**
 * The full collection workspace configuration.
 *
 * This is the shared contract that all collection-oriented surfaces
 * should compose from. Specific surfaces extend it with their own
 * concerns (e.g., KanbanSurface adds drag-drop column config).
 */
export interface CollectionWorkspaceConfig<T> {
  controls?: WorkspaceControlsConfig;
  behavior?: CollectionBehaviorConfig<T>;
  presentation?: CollectionPresentationConfig;
  data: T[];
  columns?: ColumnDef<T>[];
  rowKey?: keyof T | ((row: T) => string);
  loading?: boolean;
  error?: ReactNode;
  emptyState?: ReactNode;
}
