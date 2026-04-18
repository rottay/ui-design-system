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
} from '../../../patterns/foundation/types';
import type { SavedView } from '../../../patterns/data/saved-views/SavedViews.types';
import type { CalendarEvent } from '../../../patterns/visualization/calendar-view/CalendarView.types';

// ---------------------------------------------------------------------------
// Canonical view modes
// ---------------------------------------------------------------------------

/**
 * Canonical render modes for collection workspaces.
 *
 * - table:    PatternDataTable rows
 * - cards:    Responsive card grid (auto columns, custom card renderer)
 * - grid:     Fixed-column CSS grid with PatternGridView
 * - kanban:   PatternKanbanBoard columns grouped by a field
 * - gallery:  Image/media-focused grid with PatternGalleryView
 * - calendar: PatternCalendarView with date-field mapping
 */
export type CollectionViewMode =
  | 'table'
  | 'cards'
  | 'grid'
  | 'kanban'
  | 'gallery'
  | 'calendar';

/**
 * Kanban-specific configuration when viewMode === 'kanban'.
 * Tells the workspace which data field drives column grouping and
 * how to render cards inside kanban columns.
 */
export interface CollectionKanbanConfig<T = unknown> {
  /** Field name whose distinct values become kanban columns. */
  groupByField: keyof T & string;
  /** Static column definitions (overrides auto-detection from groupByField). */
  columns?: Array<{
    id: string;
    title: string;
    color?: string;
    limit?: number;
  }>;
  /** Custom card renderer for kanban cards. Falls back to renderCard. */
  renderCard?: (item: T, columnId: string) => ReactNode;
  /** Custom column header renderer. */
  renderColumnHeader?: (columnId: string, title: string, count: number) => ReactNode;
  /** Called when a card is dragged between columns. */
  onCardMove?: (
    itemId: string,
    fromColumn: string,
    toColumn: string,
    position: number,
  ) => void;
  /** Called when "add item" is clicked inside a column. */
  onAddItem?: (columnId: string) => void;
  /** Add item button label. */
  addItemLabel?: string;
  /** Column gap in px or CSS value. */
  columnGap?: number | string;
  /** Minimum column width in px or CSS value. */
  columnMinWidth?: number | string;
}

/**
 * Calendar-specific configuration when viewMode === 'calendar'.
 * Tells the workspace which data fields map to calendar event dates.
 */
export interface CollectionCalendarConfig<T = unknown> {
  /** Field name on T that holds the start date (Date or ISO string). */
  startField: keyof T & string;
  /** Field name on T that holds the end date. Optional for point events. */
  endField?: keyof T & string;
  /** Field name on T that holds the event title. Falls back to first text column. */
  titleField?: keyof T & string;
  /** Field name on T for color. Optional. */
  colorField?: keyof T & string;
  /** Whether events without endField are treated as all-day. */
  defaultAllDay?: boolean;
  /** Custom event chip renderer. */
  renderEvent?: (item: T, event: CalendarEvent<T>) => ReactNode;
  /** Called when a date cell is clicked. */
  onDateClick?: (date: Date) => void;
  /** Default calendar sub-view. */
  defaultView?: 'month' | 'week' | 'day';
}

/**
 * Grid-specific configuration when viewMode === 'grid'.
 */
export interface CollectionGridConfig {
  /** Number of columns: 1-6 or 'auto' for auto-fill. */
  columns?: number | 'auto';
  /** Minimum card width for auto-fill mode. */
  minCardWidth?: number | string;
  /** Gap between grid items. */
  gap?: number | string;
  /** Aspect ratio for grid cells (e.g. '1/1', '16/9', 'auto'). */
  aspectRatio?: string;
}

/**
 * Gallery-specific configuration when viewMode === 'gallery'.
 */
export interface CollectionGalleryConfig<T = unknown> {
  /** Field name on T that holds the image/media URL. */
  imageField: keyof T & string;
  /** Field name on T for the caption/title. */
  captionField?: keyof T & string;
  /** Number of columns or 'auto'. */
  columns?: number | 'auto';
  /** Minimum thumbnail width. */
  minThumbnailWidth?: number | string;
  /** Gap between gallery items. */
  gap?: number | string;
  /** Aspect ratio for thumbnails. */
  aspectRatio?: string;
  /** Custom gallery item renderer. */
  renderItem?: (item: T, index: number) => ReactNode;
  /** Called when a gallery item is clicked. */
  onItemClick?: (item: T, index: number) => void;
  /** Show/hide captions. */
  showCaptions?: boolean;
}

/**
 * Cards-specific configuration when viewMode === 'cards'.
 * Formalizes what today is an ad-hoc mobileCard render prop.
 */
export interface CollectionCardsConfig<T = unknown> {
  /** Card renderer. Today this is the mobileCard prop. */
  renderCard: (item: T, index: number) => ReactNode;
  /** Number of columns or 'auto'. */
  columns?: number | 'auto';
  /** Minimum card width for auto-fill. */
  minCardWidth?: number | string;
  /** Gap between cards. */
  gap?: number | string;
}

/**
 * Per-view-mode configuration map.
 * Apps provide only the modes they want to enable.
 */
export interface CollectionViewModeConfigs<T = unknown> {
  cards?: CollectionCardsConfig<T>;
  grid?: CollectionGridConfig;
  kanban?: CollectionKanbanConfig<T>;
  gallery?: CollectionGalleryConfig<T>;
  calendar?: CollectionCalendarConfig<T>;
}

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

/** Column visibility/order/pin/resize settings (delegates to PatternColumnSettings). */
export interface WorkspaceActionSettingItem {
  key: string;
  label: string;
  locked?: boolean;
}

/** Column visibility/order/pin/resize settings (delegates to PatternColumnSettings). */
export interface WorkspaceColumnSettingsConfig {
  enabled: boolean;
  visibleColumns?: string[];
  columnOrder?: string[];
  pinnedColumns?: { left?: string[]; right?: string[] };
  lockedColumns?: string[];
  /** Optional row-action visibility controls shown in the same customization panel. */
  actionItems?: WorkspaceActionSettingItem[];
  /** Controlled list of row action keys currently visible in the table. */
  visibleActionKeys?: string[];
  /** Controlled column widths keyed by column key. */
  columnWidths?: Record<string, number>;
  /** Batched columns update flow for menu-driven apply actions. */
  onColumnsChange?: (cols: string[], order: string[]) => void;
  onVisibleColumnsChange?: (cols: string[]) => void;
  onColumnOrderChange?: (order: string[]) => void;
  onPinnedColumnsChange?: (pinned: { left?: string[]; right?: string[] }) => void;
  onVisibleActionKeysChange?: (keys: string[]) => void;
  /** Called when a column is resized by dragging. */
  onColumnResize?: (key: string, width: number) => void;
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

/** View mode switching (table/cards/grid/kanban/gallery/calendar). */
export interface WorkspaceViewModeConfig {
  enabled: boolean;
  modes: CollectionViewMode[];
  value?: CollectionViewMode;
  onChange?: (mode: CollectionViewMode) => void;
}

/** Scope switcher configuration. */
export interface WorkspaceScopesConfig {
  enabled: boolean;
  scopes: Array<{
    key: string;
    label: string;
    count?: number;
    filter?: Record<string, unknown>;
  }>;
  activeScope?: string;
  onScopeChange?: (scopeKey: string) => void;
}

/** Unified controls configuration for all workspace toolbar features. */
export interface WorkspaceControlsConfig {
  search?: WorkspaceSearchConfig;
  scopes?: WorkspaceScopesConfig;
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
  /** Optional opt-in selection mode toggle for premium workspaces. */
  onModeChange?: (enabled: boolean) => void;
  toggleLabel?: string;
}

/** Preview rail (side panel for focused or selected item). */
export interface WorkspacePreviewRailConfig<T> {
  enabled: boolean;
  width?: string;
  render?: (item: T) => ReactNode;
  /** Declarative mobile navigation when pane is hidden. */
  mobileNavigation?: {
    /** Enable mobile auto-routing. Default: false. */
    enabled: boolean;
    /** URL builder from item. When pane='hidden', clicking a row navigates here instead of opening panel. */
    href?: (item: T) => string;
    /** Custom click handler for mobile. Alternative to href. */
    onClick?: (item: T) => void;
  };
}

/** Row focus configuration (distinct from selection). */
export interface WorkspaceFocusConfig {
  enabled?: boolean;
  /** Key of the currently focused row. */
  focusedKey?: string | null;
  /** Called when focus changes (row click). */
  onFocusChange?: (key: string | null) => void;
}

/** Smart selection set button definition. */
export interface SmartSelectionSet {
  key: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

/** Behavioral capabilities for collection workspaces. */
export interface CollectionBehaviorConfig<T> {
  selection?: WorkspaceSelectionConfig<T>;
  bulkActions?: BulkAction<T>[];
  /** Smart selection sets (Select visible, Select matched, Top 10, Clear). */
  smartSelection?: SmartSelectionSet[];
  sorting?: SortConfig | null;
  onSortChange?: (sort: SortConfig) => void;
  pagination?: PaginationConfig | false;
  previewRail?: WorkspacePreviewRailConfig<T>;
  /** Row focus for preview rail (distinct from checkbox selection). */
  focus?: WorkspaceFocusConfig;
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
export interface WorkspaceShellPresentationConfig {
  /** Visual shell variant applied around premium workspaces. */
  variant?: 'default' | 'ai-field';
  /** Overall atmospheric character for the shell. */
  mood?: 'calm' | 'active' | 'focus';
  /** Spatial field pattern used by the shell background. */
  fieldPattern?: 'ambient' | 'orbital' | 'hybrid';
  /** Intensity of the ambient field and overlays. */
  intensity?: 'low' | 'medium' | 'high';
  /** How strongly sections blend into a single continuous surface. */
  continuity?: 'segmented' | 'seamless';
  /** Whether focused rows can subtly influence the atmospheric field. */
  focusReaction?: boolean;
  /** Whether preview rails receive extra visual emphasis within the shell. */
  previewEmphasis?: boolean;
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
  /** Enable column resize handles. */
  resizable?: boolean;
  /**
   * Enable premium interaction polish: stronger hover/selection backgrounds,
   * left accent on hover, button lift, backdrop blur, smooth cell transitions.
   * @default false
   */
  enhancedInteractions?: boolean;
  /** Premium shell treatment that unifies header, search, controls, and table. */
  shell?: WorkspaceShellPresentationConfig;
}

// ---------------------------------------------------------------------------
// Active filters (dismissible chip bar)
// ---------------------------------------------------------------------------

import type { ActiveFilter } from '../../../structures/workspace/active-filters-bar';

/** Active filter chip bar configuration. */
export interface WorkspaceActiveFiltersConfig {
  filters: ActiveFilter[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
  onAddFilter?: () => void;
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
  /** Per-mode render configuration. Table mode needs no config (uses columns). */
  viewModes?: CollectionViewModeConfigs<T>;
}
