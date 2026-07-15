/**
 * @fileoverview Universal Extension System - Rottay Design System
 * @description Reserved, type-only compatibility surface for a universal
 * extension protocol that was designed but never connected to production
 * component rendering.
 *
 * @remarks
 * The extension system is organized into 16 independently optional categories:
 *
 * 1. **SlotExtensions** - Content injection at named locations
 * 2. **ColumnExtensions** - Table/grid column customization
 * 3. **ActionExtensions** - Buttons, menus, row/bulk interactions
 * 4. **FilterExtensions** - Search, filtering, faceted navigation
 * 5. **RenderExtensions** - Replace, wrap, or augment rendered sections
 * 6. **SelectionExtensions** - Row/item selection behavior
 * 7. **SortExtensions** - Sorting configuration
 * 8. **PaginationExtensions** - Pagination, infinite scroll, virtual scroll
 * 9. **MotionExtensions** - Animations and transitions
 * 10. **LayoutExtensions** - Density, responsive, sizing
 * 11. **DataExtensions** - Data transforms, grouping, aggregation
 * 12. **DragAndDropExtensions** - Reorder, cross-group drag
 * 13. **ExportExtensions** - Export to CSV/JSON/PDF/clipboard
 * 14. **KeyboardExtensions** - Shortcuts and focus management
 * 15. **LifecycleExtensions** - Before/after hooks for data and view events
 * 16. **AccessibilityExtensions** - ARIA, a11y, i18n overrides
 *
 * No production preset reads `ComponentExtensions`, no runtime resolver creates
 * `ExtensionHelpers`, and passing `EngineAwareProps.extensions` has no effect.
 * DS-IMP-021 owns deprecation/removal after the deferred external-import census;
 * use component-owned props, compounds and slots that have executable evidence.
 *
 * @see {@link ComponentExtensions} - Top-level extension container
 * @see {@link ExtensionHelpers} - Helper API for preset authors
 * @module Contracts/Extensions
 * @category Types
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { DesignTokens } from '../tokens';

/* =========================================================================
 * 1. SlotExtensions - Content injection at named locations
 * ========================================================================= */

/** Context passed to slot render functions */
export interface SlotContext<T = any> {
  /** Current design tokens (for styling injected content) */
  tokens: DesignTokens;
  /** Current dataset visible after filtering/sorting */
  data: T[];
  /** Currently selected item keys */
  selectedKeys: string[];
  /** Active filter values */
  filterValues: Record<string, unknown>;
  /** Active search query */
  searchQuery: string;
  /** Current sort state */
  sort: { key: string; direction: 'asc' | 'desc' } | null;
  /** Current page (1-indexed) */
  page: number;
  /** Current page size */
  pageSize: number;
  /** Total item count (before pagination) */
  totalItems: number;
}

/** Slot content: static ReactNode or render function receiving context */
export type SlotContent<T = any> = ReactNode | ((context: SlotContext<T>) => ReactNode);

/** Map of named slots to their content */
export type SlotMap<T = any> = Record<string, SlotContent<T>>;

/*
 * Standard slot name conventions (presets adopt whichever apply):
 * - header, header:start, header:end
 * - toolbar, toolbar:start, toolbar:end
 * - footer, footer:start, footer:end
 * - empty - Custom empty state
 * - loading - Custom loading state
 * - row:before, row:after - Per-row injection
 * - sidebar, panel, detail
 * - title, subtitle, breadcrumb
 */

/* =========================================================================
 * 2. ColumnExtensions - Table/grid column customization
 * ========================================================================= */

/** A column added by the app */
export interface ExtraColumn<T = any> {
  /** Unique column key */
  key: string;
  /** Column header label */
  label: string;
  /** Column width (number = px, string = CSS value) */
  width?: number | string;
  /** Minimum width */
  minWidth?: number;
  /** Maximum width */
  maxWidth?: number;
  /** Enable sorting on this column */
  sortable?: boolean;
  /** Custom sort comparator */
  sortFn?: (a: T, b: T) => number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Cell renderer */
  render: (row: T, index: number) => ReactNode;
  /** Header renderer (overrides label) */
  renderHeader?: () => ReactNode;
  /** Footer/summary renderer */
  renderFooter?: (data: T[]) => ReactNode;
  /** Insert before this column key. Default: append at end */
  insertBefore?: string;
  /** Insert after this column key */
  insertAfter?: string;
  /** Pin column to left or right edge */
  pin?: 'left' | 'right';
  /** Whether column is resizable */
  resizable?: boolean;
  /** Whether column is visible (for column toggle UI) */
  visible?: boolean;
  /** Group header (for grouped columns) */
  group?: string;
  /** Tooltip on header */
  tooltip?: string;
  /** Enable copy-to-clipboard on cell click */
  copyable?: boolean;
  /** Enable inline cell editing */
  editable?: boolean;
  /** Cell edit handler */
  onEdit?: (row: T, newValue: unknown) => void;
}

/** Column extension configuration */
export interface ColumnExtensions<T = any> {
  /** Columns to add (positioned via insertBefore/insertAfter or appended) */
  extra?: ExtraColumn<T>[];
  /** Column keys to hide from display */
  hidden?: string[];
  /** Full column order (keys in desired sequence; omitted keys keep original position) */
  order?: string[];
  /** Override cell render for existing default columns */
  overrides?: Record<string, (value: unknown, row: T, index: number) => ReactNode>;
  /** Override header render for existing default columns */
  headerOverrides?: Record<string, () => ReactNode>;
  /** Override footer/summary render for existing default columns */
  footerOverrides?: Record<string, (data: T[]) => ReactNode>;
  /** Pin specific existing columns */
  pinned?: Record<string, 'left' | 'right'>;
  /** Enable column resizing globally */
  resizable?: boolean;
  /** Enable column reordering via drag */
  reorderable?: boolean;
  /** Minimum column width (global default) */
  defaultMinWidth?: number;
  /** Show column visibility toggle control */
  showColumnToggle?: boolean;
  /** Column groups (key -> group name) */
  groups?: Record<string, string>;
  /** Frozen columns count from left */
  frozenLeft?: number;
  /** Frozen columns count from right */
  frozenRight?: number;
}

/* =========================================================================
 * 3. ActionExtensions - Buttons, menus, interactions
 * ========================================================================= */

/** A single action definition */
export interface ActionDefinition<T = any> {
  /** Unique action key */
  key: string;
  /** Display label */
  label: string;
  /** Icon (ReactNode, typically from lucide-react) */
  icon?: ReactNode;
  /** Visual variant */
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  /** Tooltip text */
  tooltip?: string;
  /** Whether to show only as icon (no label) */
  iconOnly?: boolean;
  /** Show only when condition is met */
  visible?: (item: T) => boolean;
  /** Disable when condition is met */
  disabled?: (item: T) => boolean;
  /** Click handler */
  onClick: (item: T, event?: React.MouseEvent) => void | Promise<void>;
  /** Keyboard shortcut (e.g., "ctrl+d", "del") */
  shortcut?: string;
  /** Show confirmation dialog before executing */
  confirm?: string | { title: string; description: string; confirmLabel?: string; cancelLabel?: string };
  /** Position hint within its container */
  position?: 'start' | 'end';
  /** Loading state */
  loading?: boolean;
  /** Divider before this action in menus */
  dividerBefore?: boolean;
  /** Nested sub-actions (dropdown menu) */
  children?: ActionDefinition<T>[];
}

/** Bulk action definition (operates on multiple items) */
export interface BulkActionDefinition<T = any> {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'danger';
  /** Minimum items required to enable */
  minItems?: number;
  /** Maximum items allowed */
  maxItems?: number;
  confirm?: string;
  onExecute: (selectedItems: T[], selectedKeys: string[]) => void | Promise<void>;
  disabled?: boolean;
}

/** Action extension configuration */
export interface ActionExtensions<T = any> {
  /** Per-row actions (shown on hover, in actions column, or context menu) */
  row?: ActionDefinition<T>[];
  /** Toolbar-level actions (global buttons above the data) */
  toolbar?: ActionDefinition<T>[];
  /** Bulk actions (shown when items are selected) */
  bulk?: BulkActionDefinition<T>[];
  /** Context menu actions (right-click) */
  contextMenu?: ActionDefinition<T>[];
  /** Floating action button */
  fab?: { icon: ReactNode; label: string; onClick: () => void; position?: 'bottom-right' | 'bottom-left' };
  /** Double-click row action */
  onDoubleClick?: (item: T) => void;
  /** Row action display mode */
  rowActionDisplay?: 'inline' | 'dropdown' | 'both';
  /** Maximum visible inline actions before "more" dropdown */
  maxInlineActions?: number;
}

/* =========================================================================
 * 4. FilterExtensions - Search, filtering, faceted navigation
 * ========================================================================= */

/** A filter control definition */
export interface FilterDefinition {
  /** Unique filter key */
  key: string;
  /** Display label */
  label: string;
  /** Filter input type */
  type: 'text' | 'select' | 'multi-select' | 'date' | 'date-range' | 'number-range' |
        'boolean' | 'checkbox-group' | 'radio-group' | 'tag-input' | 'slider' | 'custom';
  /** Options for select/multi-select/checkbox/radio types */
  options?: { label: string; value: string; count?: number; icon?: ReactNode }[];
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  defaultValue?: unknown;
  /** Whether filter is initially collapsed */
  collapsed?: boolean;
  /** Custom render for 'custom' type */
  render?: (value: unknown, onChange: (v: unknown) => void) => ReactNode;
  /** Validation function */
  validate?: (value: unknown) => string | null;
  /** Width hint */
  width?: number | string;
  /** Group filters into sections */
  group?: string;
  /** Show item count next to options */
  showCounts?: boolean;
}

/** Search configuration */
export interface SearchConfig {
  /** Placeholder text */
  placeholder?: string;
  /** Fields to search across (key paths) */
  fields?: string[];
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Minimum characters before searching */
  minChars?: number;
  /** Enable regex search */
  enableRegex?: boolean;
  /** Show recent searches */
  showRecent?: boolean;
  /** Maximum recent searches to store */
  maxRecent?: number;
  /** Custom search function (overrides default field search) */
  searchFn?: (items: any[], query: string) => any[];
  /** Search input position */
  position?: 'toolbar' | 'header' | 'floating';
}

/** Predefined filter combo (quick filter / saved view) */
export interface FilterPreset {
  key: string;
  label: string;
  icon?: ReactNode;
  values: Record<string, unknown>;
  /** Mark as default preset */
  isDefault?: boolean;
}

/** Filter extension configuration */
export interface FilterExtensions {
  /** Additional filter controls */
  extra?: FilterDefinition[];
  /** Override search configuration */
  search?: SearchConfig;
  /** Predefined filter combos (quick filters / saved views) */
  presets?: FilterPreset[];
  /** Custom filter rendering for specific keys */
  renderFilter?: Record<string, (value: unknown, onChange: (v: unknown) => void) => ReactNode>;
  /** Show active filter count badge */
  showActiveCount?: boolean;
  /** Show "Clear all" button */
  showClearAll?: boolean;
  /** Filter panel position */
  panelPosition?: 'inline' | 'sidebar' | 'dropdown' | 'modal';
  /** Persist filter values to URL query params */
  persistToUrl?: boolean;
  /** Persist filter values to localStorage */
  persistToStorage?: boolean | string;
  /** onChange callback for all filter changes */
  onFilterChange?: (filters: Record<string, unknown>) => void;
  /** Default filter values */
  defaults?: Record<string, unknown>;
  /** Enable faceted counts (update option counts based on data) */
  faceted?: boolean;
}

/* =========================================================================
 * 5. RenderExtensions - Replace, wrap, or augment sections
 * ========================================================================= */

/** Render extension configuration */
export interface RenderExtensions<T = any> {
  /** Replace a named section entirely */
  replace?: Record<string, (context: SlotContext<T>) => ReactNode>;
  /** Wrap a named section (receives default render as child) */
  wrap?: Record<string, (defaultRender: ReactNode, context: SlotContext<T>) => ReactNode>;
  /** Custom row/item renderer (replaces default row rendering) */
  renderItem?: (item: T, index: number, defaultRender: ReactNode) => ReactNode;
  /** Custom card renderer for grid/card views */
  renderCard?: (item: T, index: number) => ReactNode;
  /** Custom expanded row/detail content */
  renderExpandedRow?: (item: T) => ReactNode;
  /** Custom mobile card renderer */
  renderMobileCard?: (item: T, index: number) => ReactNode;
  /** Custom tooltip renderer for items */
  renderTooltip?: (item: T) => ReactNode;
  /** Custom badge/tag renderer */
  renderBadge?: (item: T, key: string, value: unknown) => ReactNode;
  /** Custom avatar/icon renderer */
  renderAvatar?: (item: T) => ReactNode;
  /** Item decorations (overlays, indicators) */
  decorations?: (item: T) => { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; content: ReactNode }[];
}

/* =========================================================================
 * 6. SelectionExtensions - Row/item selection behavior
 * ========================================================================= */

export interface SelectionExtensions<T = any> {
  /** Selection mode */
  mode?: 'single' | 'multiple' | 'none';
  /** Maximum items that can be selected */
  maxItems?: number;
  /** Items that cannot be deselected (always selected) */
  locked?: string[];
  /** Items that cannot be selected */
  disabledKeys?: string[] | ((item: T) => boolean);
  /** Show "select all" control */
  showSelectAll?: boolean;
  /** Select all selects: visible page or all data */
  selectAllScope?: 'page' | 'all';
  /** Checkbox position */
  checkboxPosition?: 'start' | 'end';
  /** Custom selection indicator (instead of checkbox) */
  renderIndicator?: (selected: boolean, item: T) => ReactNode;
  /** Selection change callback */
  onSelectionChange?: (selectedKeys: string[], selectedItems: T[]) => void;
  /** Initial selected keys */
  defaultSelectedKeys?: string[];
  /** Preserve selection across page changes */
  preserveAcrossPages?: boolean;
  /** Show selection count */
  showSelectionCount?: boolean;
  /** Enable range selection with shift+click */
  rangeSelect?: boolean;
}

/* =========================================================================
 * 7. SortExtensions - Sorting behavior
 * ========================================================================= */

export interface SortExtensions {
  /** Default sort column and direction */
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
  /** Enable multi-column sorting */
  multiSort?: boolean;
  /** Maximum columns for multi-sort */
  maxSortColumns?: number;
  /** Custom sort functions per column key */
  comparators?: Record<string, (a: any, b: any) => number>;
  /** Server-side sort mode (disables client sorting) */
  serverSide?: boolean;
  /** Sort change callback */
  onSortChange?: (sort: { key: string; direction: 'asc' | 'desc' }[]) => void;
  /** Unsortable column keys */
  disabledKeys?: string[];
  /** Sort indicator position */
  indicatorPosition?: 'left' | 'right';
  /** Allow removing sort (3-state: asc -> desc -> none) */
  allowUnsort?: boolean;
  /** Natural sort for alphanumeric strings */
  naturalSort?: boolean;
  /** Null/undefined sort position */
  nullPosition?: 'first' | 'last';
}

/* =========================================================================
 * 8. PaginationExtensions - Pagination, infinite scroll, virtual scroll
 * ========================================================================= */

export interface PaginationExtensions {
  /** Page size options */
  pageSizeOptions?: number[];
  /** Default page size */
  defaultPageSize?: number;
  /** Pagination mode */
  mode?: 'pages' | 'infinite-scroll' | 'load-more' | 'virtual' | 'none';
  /** Show page size selector */
  showPageSizeSelector?: boolean;
  /** Show total count */
  showTotal?: boolean | ((total: number, range: [number, number]) => ReactNode);
  /** Show quick jumper (go to page) */
  showQuickJumper?: boolean;
  /** Pagination position */
  position?: 'top' | 'bottom' | 'both';
  /** Pagination alignment */
  align?: 'start' | 'center' | 'end';
  /** Server-side pagination mode */
  serverSide?: boolean;
  /** Total server items (for server-side) */
  serverTotal?: number;
  /** Page change callback */
  onPageChange?: (page: number, pageSize: number) => void;
  /** Infinite scroll threshold (px from bottom) */
  infiniteScrollThreshold?: number;
  /** Load more button label */
  loadMoreLabel?: string;
  /** Virtual scroll item height (required for mode='virtual') */
  virtualItemHeight?: number;
  /** Virtual scroll overscan count */
  virtualOverscan?: number;
}

/* =========================================================================
 * 9. MotionExtensions - Animations and transitions
 * ========================================================================= */

export interface MotionExtensions {
  /** Container entrance animation */
  entrance?: {
    type?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'blur' | 'none';
    duration?: number;
    delay?: number;
    easing?: string;
  };
  /** Per-item stagger animation */
  stagger?: {
    delay?: number;
    direction?: 'forward' | 'reverse' | 'center';
    maxDelay?: number;
  };
  /** Item exit animation */
  exit?: {
    type?: 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'collapse' | 'none';
    duration?: number;
  };
  /** Row/card hover animation */
  hover?: {
    type?: 'lift' | 'glow' | 'scale' | 'highlight' | 'none';
    intensity?: 'subtle' | 'medium' | 'bold';
  };
  /** Skeleton loading animation */
  skeleton?: {
    type?: 'pulse' | 'wave' | 'shimmer' | 'none';
    rows?: number;
  };
  /** Layout shift animation (when items reorder after sort/filter) */
  layoutTransition?: boolean | { duration?: number; easing?: string };
  /** Disable all animations */
  disableAll?: boolean;
  /** Reduce motion (respects prefers-reduced-motion) */
  respectReducedMotion?: boolean;
}

/* =========================================================================
 * 10. LayoutExtensions - Density, responsive, sizing
 * ========================================================================= */

export interface LayoutExtensions {
  /** Display density */
  density?: 'compact' | 'default' | 'comfortable' | 'spacious';
  /** Responsive breakpoints (override defaults) */
  breakpoints?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  /** Force a specific layout at all breakpoints */
  forceLayout?: 'table' | 'grid' | 'list' | 'kanban';
  /** Grid columns per breakpoint */
  gridColumns?: { mobile?: number; tablet?: number; desktop?: number };
  /** Maximum container height (enables scrolling) */
  maxHeight?: number | string;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Sticky first column (tables) */
  stickyFirstColumn?: boolean;
  /** Row height */
  rowHeight?: number | 'auto';
  /** Show row borders */
  showBorders?: boolean;
  /** Striped rows */
  striped?: boolean;
  /** Hoverable rows */
  hoverable?: boolean;
  /** Card aspect ratio (for grid views) */
  cardAspectRatio?: number;
  /** Gap between items */
  gap?: number | string;
  /** Content max width */
  maxWidth?: number | string;
  /** Full bleed (no padding) */
  fullBleed?: boolean;
  /** Sidebar width (when using sidebar layout) */
  sidebarWidth?: number | string;
  /** Minimum item width for auto-grid */
  minItemWidth?: number;
}

/* =========================================================================
 * 11. DataExtensions - Transform, group, aggregate
 * ========================================================================= */

export interface DataExtensions<T = any> {
  /** Transform data before rendering (runs after fetch, before filter/sort) */
  transform?: (data: T[]) => T[];
  /** Group rows by a key */
  groupBy?: keyof T | ((item: T) => string);
  /** Custom group header renderer */
  renderGroupHeader?: (groupKey: string, items: T[], isExpanded: boolean) => ReactNode;
  /** Initially collapsed groups */
  collapsedGroups?: string[];
  /** Aggregate functions per column */
  aggregates?: Record<string, 'sum' | 'avg' | 'min' | 'max' | 'count' | ((items: T[]) => ReactNode)>;
  /** Show aggregate row position */
  aggregatePosition?: 'header' | 'footer' | 'both';
  /** Row key accessor */
  rowKey?: keyof T | ((item: T) => string);
  /** Empty state configuration */
  emptyState?: {
    icon?: ReactNode;
    title?: string;
    description?: string;
    action?: { label: string; onClick: () => void };
  };
  /** Loading state override */
  loadingState?: {
    skeleton?: boolean;
    spinner?: boolean;
    overlay?: boolean;
    text?: string;
  };
  /** Error state override */
  errorState?: {
    icon?: ReactNode;
    title?: string;
    description?: string;
    retry?: { label: string; onClick: () => void };
  };
  /** Highlight/mark specific rows */
  rowHighlight?: (item: T) => 'success' | 'warning' | 'error' | 'info' | null;
  /** Row class name */
  rowClassName?: (item: T, index: number) => string;
  /** Row inline style */
  rowStyle?: (item: T, index: number) => CSSProperties;
  /** Refresh interval (ms) - auto-refetch data */
  refreshInterval?: number;
  /** Show refresh indicator */
  showRefreshIndicator?: boolean;
}

/* =========================================================================
 * 12. DragAndDropExtensions - Reorder, drag between
 * ========================================================================= */

export interface DragAndDropExtensions<T = any> {
  /** Enable row/item reordering */
  reorderable?: boolean;
  /** Reorder direction */
  direction?: 'vertical' | 'horizontal' | 'both';
  /** Callback when items are reordered */
  onReorder?: (fromIndex: number, toIndex: number, item: T) => void;
  /** Callback when item is dropped into a new group/column */
  onDropInto?: (item: T, targetGroup: string, targetIndex: number) => void;
  /** Items that cannot be dragged */
  disabledKeys?: string[];
  /** Custom drag handle renderer */
  renderDragHandle?: () => ReactNode;
  /** Show drag handle only on hover */
  dragHandleOnHover?: boolean;
  /** Drop zone indicator */
  dropIndicator?: 'line' | 'highlight' | 'ghost';
  /** Enable drop from external sources */
  acceptExternal?: boolean;
  /** External drop handler */
  onExternalDrop?: (data: DataTransfer, targetIndex: number) => void;
  /** Drag preview renderer */
  renderDragPreview?: (item: T) => ReactNode;
}

/* =========================================================================
 * 13. ExportExtensions - Export data to various formats
 * ========================================================================= */

export interface ExportExtensions<T = any> {
  /** Enabled export formats */
  formats?: ('csv' | 'json' | 'xlsx' | 'pdf' | 'clipboard')[];
  /** Export file name (without extension) */
  fileName?: string;
  /** Column keys to include in export (default: all visible) */
  includeColumns?: string[];
  /** Column keys to exclude from export */
  excludeColumns?: string[];
  /** Export scope */
  scope?: 'visible' | 'filtered' | 'selected' | 'all';
  /** Custom data transformer before export */
  transform?: (data: T[], format: string) => any[];
  /** Custom column headers for export */
  headers?: Record<string, string>;
  /** CSV delimiter */
  csvDelimiter?: ',' | ';' | '\t';
  /** Include header row */
  includeHeaders?: boolean;
  /** Custom export handler (overrides default) */
  onExport?: (format: string, data: T[]) => void | Promise<void>;
  /** Show export button in toolbar */
  showInToolbar?: boolean;
  /** Export button label */
  buttonLabel?: string;
}

/* =========================================================================
 * 14. KeyboardExtensions - Shortcuts and focus management
 * ========================================================================= */

export interface KeyboardShortcut {
  /** Key combination (e.g., "ctrl+a", "shift+del", "escape") */
  keys: string;
  /** Handler */
  handler: () => void;
  /** Description (for shortcut help panel) */
  description?: string;
  /** Prevent default browser behavior */
  preventDefault?: boolean;
}

export interface KeyboardExtensions {
  /** Enable keyboard navigation between rows/items */
  navigation?: boolean;
  /** Navigation mode */
  navigationMode?: 'row' | 'cell' | 'item';
  /** Enable type-ahead search (focus row starting with typed chars) */
  typeAhead?: boolean;
  /** Custom keyboard shortcuts */
  shortcuts?: KeyboardShortcut[];
  /** Enable select with Space */
  selectOnSpace?: boolean;
  /** Enable activate/open with Enter */
  activateOnEnter?: boolean;
  /** Enable delete selected with Delete/Backspace */
  deleteOnKey?: boolean;
  /** Focus trap within the component */
  focusTrap?: boolean;
  /** Tab behavior */
  tabBehavior?: 'navigate' | 'exit';
  /** Home/End key behavior */
  homeEndBehavior?: 'row' | 'page';
}

/* =========================================================================
 * 15. LifecycleExtensions - Before/after hooks
 * ========================================================================= */

export interface LifecycleExtensions<T = any> {
  /** Called after data is loaded/updated */
  onDataLoad?: (data: T[]) => void;
  /** Called before a filter is applied */
  onBeforeFilter?: (filters: Record<string, unknown>) => Record<string, unknown> | false;
  /** Called after filtering completes */
  onAfterFilter?: (filtered: T[], all: T[]) => void;
  /** Called before sorting */
  onBeforeSort?: (sort: { key: string; direction: 'asc' | 'desc' }) => boolean;
  /** Called after sorting completes */
  onAfterSort?: (sorted: T[]) => void;
  /** Called when an item enters the viewport (virtual scroll) */
  onItemVisible?: (item: T, index: number) => void;
  /** Called when the view mode changes */
  onViewModeChange?: (mode: string) => void;
  /** Called when the component mounts */
  onMount?: () => void;
  /** Called when the component unmounts */
  onUnmount?: () => void;
  /** Called on scroll */
  onScroll?: (event: { scrollTop: number; scrollLeft: number; isAtBottom: boolean }) => void;
  /** Called when row is expanded/collapsed */
  onRowExpand?: (item: T, expanded: boolean) => void;
  /** Called when group is expanded/collapsed */
  onGroupExpand?: (groupKey: string, expanded: boolean) => void;
}

/* =========================================================================
 * 16. AccessibilityExtensions - ARIA, a11y, i18n
 * ========================================================================= */

export interface AccessibilityExtensions {
  /** ARIA label for the component */
  ariaLabel?: string;
  /** ARIA described-by ID */
  ariaDescribedBy?: string;
  /** Component ARIA role override */
  role?: string;
  /** Announce changes via live region */
  announceChanges?: boolean;
  /** Custom announcements */
  announcements?: {
    onFilter?: (count: number) => string;
    onSort?: (column: string, direction: string) => string;
    onSelect?: (count: number) => string;
    onPageChange?: (page: number, total: number) => string;
    onEmpty?: () => string;
    onLoading?: () => string;
  };
  /** High contrast mode */
  highContrast?: boolean;
  /** Larger click targets */
  largeTargets?: boolean;
  /** Show focus indicators */
  showFocusRing?: boolean;
  /** Screen reader only summary */
  summary?: string;
  /** Language override for ARIA labels */
  locale?: string;
  /** i18n labels override */
  labels?: Record<string, string>;
}

/* =========================================================================
 * Resolved Column - Output of ext.columns() merge
 * ========================================================================= */

/** A resolved column after merging defaults with extensions */
export interface ResolvedColumn<T = any> {
  /** Unique column key */
  key: string;
  /** Column header label */
  label: string;
  /** Column width (number = px, string = CSS value) */
  width?: number | string;
  /** Minimum width */
  minWidth?: number;
  /** Maximum width */
  maxWidth?: number;
  /** Enable sorting on this column */
  sortable?: boolean;
  /** Custom sort comparator */
  sortFn?: (a: T, b: T) => number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Pin column to left or right edge */
  pin?: 'left' | 'right';
  /** Whether column is resizable */
  resizable?: boolean;
  /** Whether column is visible */
  visible?: boolean;
  /** Group header */
  group?: string;
  /** Tooltip on header */
  tooltip?: string;
  /** Enable copy-to-clipboard on cell click */
  copyable?: boolean;
  /** Enable inline cell editing */
  editable?: boolean;
  /** Cell edit handler */
  onEdit?: (row: T, newValue: unknown) => void;
  /** Cell renderer (from ExtraColumn or override) */
  render?: (row: T, index: number) => ReactNode;
  /** Header renderer (from ExtraColumn or headerOverride) */
  renderHeader?: () => ReactNode;
  /** Footer/summary renderer */
  renderFooter?: (data: T[]) => ReactNode;
  /** True if this column was added via extensions (not a default) */
  _isExtra?: boolean;
  /** Cell render override (from ColumnExtensions.overrides) */
  _renderOverride?: (value: unknown, row: T, index: number) => ReactNode;
}

/* =========================================================================
 * Unified ComponentExtensions<T>
 * ========================================================================= */

/**
 * Reserved 16-axis extension shape. It has no production resolver or consumer.
 *
 * @deprecated No runtime effect. DS-IMP-021 owns replacement/removal after the
 * deferred external-import census; do not add new consumers.
 */
export interface ComponentExtensions<T = any> {
  /** Named content injection slots */
  slots?: SlotMap<T>;
  /** Table/grid column customization */
  columns?: ColumnExtensions<T>;
  /** Action buttons and menus */
  actions?: ActionExtensions<T>;
  /** Search, filtering, faceted navigation */
  filters?: FilterExtensions;
  /** Replace, wrap, or augment rendered sections */
  rendering?: RenderExtensions<T>;
  /** Row/item selection behavior */
  selection?: SelectionExtensions<T>;
  /** Sorting configuration */
  sorting?: SortExtensions;
  /** Pagination and scrolling */
  pagination?: PaginationExtensions;
  /** Animations and transitions */
  motion?: MotionExtensions;
  /** Density, responsive, sizing */
  layout?: LayoutExtensions;
  /** Data transforms, grouping, aggregation */
  data?: DataExtensions<T>;
  /** Drag and drop reordering */
  dragAndDrop?: DragAndDropExtensions<T>;
  /** Export to CSV/JSON/PDF */
  export?: ExportExtensions<T>;
  /** Keyboard shortcuts and navigation */
  keyboard?: KeyboardExtensions;
  /** Lifecycle hooks */
  lifecycle?: LifecycleExtensions<T>;
  /** Accessibility and i18n */
  accessibility?: AccessibilityExtensions;
}

/* =========================================================================
 * ExtensionHelpers - reserved resolver shape; no runtime implementation exists
 * ========================================================================= */

/**
 * Type-only sketch of the resolver that was never implemented.
 *
 * @deprecated No runtime implementation creates this interface. DS-IMP-021
 * owns any future small, component-specific replacement.
 */
export interface ExtensionHelpers<T = any> {
  // --- Slots ---
  /** Render a named slot. Returns null if slot not defined and no fallback. */
  slot(name: string, fallback?: ReactNode): ReactNode | null;
  /** Check if a slot is defined */
  hasSlot(name: string): boolean;

  // --- Columns ---
  /** Merge default columns with extension (extra, hidden, order, overrides, pins) */
  columns(defaults: { key: string; label: string; width?: number | string; sortable?: boolean; align?: 'left' | 'center' | 'right'; [k: string]: any }[]): ResolvedColumn<T>[];
  /** Check if columns have been customized */
  hasColumnExtensions: boolean;

  // --- Actions ---
  /** Get row actions (defaults merged with extension) */
  rowActions(defaults?: ActionDefinition<T>[]): ActionDefinition<T>[];
  /** Get toolbar actions */
  toolbarActions(defaults?: ActionDefinition<T>[]): ActionDefinition<T>[];
  /** Get bulk actions */
  bulkActions(defaults?: BulkActionDefinition<T>[]): BulkActionDefinition<T>[];
  /** Get context menu actions */
  contextMenuActions(defaults?: ActionDefinition<T>[]): ActionDefinition<T>[];
  /** Check if actions have been customized */
  hasActionExtensions: boolean;

  // --- Filters ---
  /** Get merged filter definitions */
  filterDefs(defaults?: FilterDefinition[]): FilterDefinition[];
  /** Get search config with overrides */
  searchConfig(defaults?: Partial<SearchConfig>): SearchConfig;
  /** Get filter presets */
  filterPresets(): FilterPreset[];
  /** Check if filters have been customized */
  hasFilterExtensions: boolean;

  // --- Rendering ---
  /** Render a named section with wrap/replace support */
  section(name: string, defaultRender: () => ReactNode): ReactNode;
  /** Get item renderer (returns undefined if no override) */
  itemRenderer(): ((item: T, index: number, defaultRender: ReactNode) => ReactNode) | undefined;
  /** Get card renderer */
  cardRenderer(): ((item: T, index: number) => ReactNode) | undefined;

  // --- Selection ---
  /** Get selection config */
  selectionConfig(): SelectionExtensions<T>;

  // --- Sort ---
  /** Get sort config */
  sortConfig(): SortExtensions;

  // --- Pagination ---
  /** Get pagination config */
  paginationConfig(): PaginationExtensions;

  // --- Motion ---
  /** Get entrance animation config */
  entranceMotion(defaults?: MotionExtensions['entrance']): MotionExtensions['entrance'];
  /** Get item stagger config */
  staggerMotion(defaults?: MotionExtensions['stagger']): MotionExtensions['stagger'];
  /** Check if animations are disabled */
  animationsDisabled: boolean;

  // --- Layout ---
  /** Get layout config */
  layoutConfig(): LayoutExtensions;
  /** Get effective density */
  density(): 'compact' | 'default' | 'comfortable' | 'spacious';

  // --- Data ---
  /** Get data config */
  dataConfig(): DataExtensions<T>;
  /** Get empty state config */
  emptyState(): DataExtensions<T>['emptyState'];
  /** Get row highlight function */
  rowHighlight(): ((item: T) => string | null) | undefined;

  // --- Export ---
  /** Get export config */
  exportConfig(): ExportExtensions<T>;
  /** Check if export is enabled */
  hasExport: boolean;

  // --- Keyboard ---
  /** Get keyboard config */
  keyboardConfig(): KeyboardExtensions;

  // --- DnD ---
  /** Get drag and drop config */
  dragAndDropConfig(): DragAndDropExtensions<T>;

  // --- Lifecycle ---
  /** Get lifecycle hooks */
  lifecycleHooks(): LifecycleExtensions<T>;

  // --- Accessibility ---
  /** Get accessibility config */
  a11yConfig(): AccessibilityExtensions;

  // --- Meta ---
  /** True if any extensions are provided */
  hasExtensions: boolean;
  /** Raw extensions object */
  raw: ComponentExtensions<T>;
}
