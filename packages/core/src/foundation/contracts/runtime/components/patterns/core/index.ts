/**
 * @fileoverview Shared types for all Tier 2 pattern components. Defines
 * PatternBaseProps (engine, loading, className, style), ColumnDef, SortConfig,
 * FilterDef, PaginationConfig, BulkAction, StatDef, FieldDef, KanbanColumnDef,
 * and PresetDef -- the foundational contracts consumed across all patterns.
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineName } from '../../../../kernel/engine-identity';

// ---------------------------------------------------------------------------
// Inline Cell Editing
// ---------------------------------------------------------------------------

/**
 * Configuration for inline cell editing on a specific column.
 *
 * When a column's `editable` property is set to an `EditableConfig` object
 * (rather than a plain `true`), the table uses this configuration to determine
 * the editor widget, validation, and save behavior.
 *
 * @typeParam T - The shape of a single data row.
 *
 * @example
 * ```tsx
 * const columns: ColumnDef<User>[] = [
 *   {
 *     key: 'name',
 *     header: 'Name',
 *     accessorKey: 'name',
 *     editable: {
 *       type: 'text',
 *       validate: (value) => (!value ? 'Name is required' : null),
 *       placeholder: 'Enter name...',
 *     },
 *   },
 *   {
 *     key: 'role',
 *     header: 'Role',
 *     accessorKey: 'role',
 *     editable: {
 *       type: 'select',
 *       options: [
 *         { label: 'Admin', value: 'admin' },
 *         { label: 'Member', value: 'member' },
 *       ],
 *     },
 *   },
 * ];
 * ```
 */
export interface EditableConfig<T = unknown> {
  /** Editor widget type. When omitted with `editable: true`, defaults to 'text'. */
  type?: 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'custom';
  /** Options for the 'select' editor type. */
  options?: Array<{ label: string; value: string | number }>;
  /**
   * Custom editor renderer for the 'custom' type.
   * Receives the current value, the full row, and save/cancel callbacks.
   */
  render?: (
    value: unknown,
    row: T,
    save: (newValue: unknown) => void,
    cancel: () => void,
  ) => ReactNode;
  /**
   * Validation function called before a cell value is saved.
   * Returns an error message string when validation fails, or null when valid.
   */
  validate?: (value: unknown, row: T) => string | null;
  /** Called when a cell value is saved. Supports async operations. */
  onSave?: (row: T, columnKey: string, newValue: unknown, oldValue: unknown) => void | Promise<void>;
  /** Whether this column can be edited conditionally per row. */
  canEdit?: (row: T) => boolean;
  /** Placeholder text shown in the editor input. */
  placeholder?: string;
  /** Minimum value constraint for 'number' type editors. */
  min?: number;
  /** Maximum value constraint for 'number' type editors. */
  max?: number;
}

/**
 * Base props shared by every Tier 2 pattern component.
 *
 * @example
 * ```tsx
 * import type { PatternBaseProps } from '@rottay/design-system';
 *
 * interface MyPatternProps extends PatternBaseProps {
 *   items: Item[];
 * }
 * ```
 */
export interface PatternBaseProps {
  /** Rendering engine override (Titan, Hermes, or Apollo). Falls back to the provider default. */
  engine?: EngineName;
  /** Additional CSS class name applied to the pattern root element. */
  className?: string;
  /** Inline styles applied to the pattern root element. */
  style?: CSSProperties;
  /** When true, the pattern displays a loading skeleton instead of content. */
  loading?: boolean;
}

/**
 * Responsive visibility mode for a column at a given device class.
 *
 * - `visible` - Column renders normally (table column or card field).
 * - `hidden`  - Column is completely hidden at this breakpoint.
 * - `summary` - Column data appears in the mobile card summary area (detail rows below the title).
 * - `primary` - Column becomes the card title / primary content on mobile card layouts.
 */
export type ResponsiveColumnMode = 'visible' | 'hidden' | 'summary' | 'primary';

/**
 * Per-device-class responsive configuration for a column.
 * When omitted, all breakpoints default to `'visible'`.
 */
export interface ColumnResponsiveConfig {
  /** Behavior on phone viewports (0-639px). @default 'visible' */
  phone?: ResponsiveColumnMode;
  /** Behavior on tablet viewports (640-1023px). @default 'visible' */
  tablet?: ResponsiveColumnMode;
  /** Behavior on desktop viewports (1024px+). @default 'visible' */
  desktop?: ResponsiveColumnMode;
}

/**
 * Generic column definition for data-driven patterns.
 */
export interface ColumnDef<T> {
  /** Unique key for the column */
  key: string;
  /** Column header */
  header: ReactNode;
  /** Accessor function or key path */
  accessorKey?: keyof T & string;
  accessorFn?: (row: T) => unknown;
  /** Cell renderer */
  render?: (value: unknown, row: T, index: number) => ReactNode;
  /** Column width */
  width?: number | string;
  /** Min/max width */
  minWidth?: number;
  maxWidth?: number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Sortable */
  sortable?: boolean;
  /** Filterable */
  filterable?: boolean;
  /** Whether column is visible */
  visible?: boolean;
  /** Pin column */
  pin?: 'left' | 'right';
  /** Optional category key used by collection column menus. */
  group?: string;
  /**
   * Enable inline cell editing. When `true`, uses a default text editor.
   * When an `EditableConfig` object, provides full control over editor type,
   * validation, and save behavior.
   */
  editable?: boolean | EditableConfig<T>;
  /**
   * Responsive column behavior per device class.
   *
   * Controls whether the column is shown, hidden, or treated as a card
   * title/summary field at each breakpoint. When omitted, all breakpoints
   * default to `'visible'` (backward-compatible).
   *
   * @example
   * ```tsx
   * {
   *   key: 'email',
   *   header: 'Email',
   *   accessorKey: 'email',
   *   responsive: { phone: 'hidden', tablet: 'visible', desktop: 'visible' },
   * }
   * ```
   */
  responsive?: ColumnResponsiveConfig;
  /**
   * Declares this column as low-priority for the table's CONTAINER-width
   * adaptive layout (spec §10) -- distinct from `responsive`, which reacts to
   * the viewport, not the table's own box. When the table's named `ds-table`
   * container drops below the documented collapse width, every cell stamped
   * `data-col-priority="low"` (header and body, modern/rustic engines only)
   * is set to `display: none` -- the column is HIDDEN, not scrolled, and its
   * data becomes unreachable until the container widens again.
   *
   * CONSUMER-assigned opt-in only: never defaulted or inferred from column
   * order, width, or any other heuristic -- a data-hiding effect must be an
   * explicit choice. Orthogonal to `pin` (a pinned column never collapses,
   * regardless of `priority`) and to `mobileCardBreakpoint` (a separate,
   * viewport-gated switch that replaces the whole table with a card layout).
   * Classic (antd) does not consume this field.
   */
  priority?: 'low';
}

/**
 * Active sort state for sortable patterns (DataTable, DataList, etc.).
 */
export interface SortConfig {
  /** Column key that is currently sorted. Must match a `ColumnDef.key`. */
  key: string;
  /** Sort direction: ascending or descending. */
  direction: 'asc' | 'desc';
}

/**
 * Declarative filter definition for filterable patterns (DataTable, DataList).
 * The `type` determines which filter control is rendered in the filter bar.
 */
export interface FilterDef {
  /** Unique identifier for this filter, typically matching a data field name. */
  key: string;
  /** Human-readable label shown in the filter bar. */
  label: string;
  /** Control type that determines the rendered filter widget. */
  type: 'text' | 'select' | 'multi-select' | 'date' | 'date-range' | 'number' | 'number-range' | 'boolean';
  /** Available choices for select and multi-select filter types. */
  options?: Array<{
    label: string;
    value: string;
    disabled?: boolean;
    /** Optional icon rendered in custom select menus. */
    icon?: ReactNode;
    /** Optional supporting copy rendered under the option label. */
    description?: ReactNode;
    /** Optional visual tone for richer filter option rendering. */
    tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  }>;
  /** Placeholder text shown when the filter has no value. */
  placeholder?: string;
  /** Initial filter value applied before user interaction. */
  defaultValue?: unknown;
}

/**
 * Pagination state and callbacks for paginated patterns.
 */
export interface PaginationConfig {
  /** Current active page number (1-indexed). */
  current: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** Total number of items across all pages. */
  total: number;
  /** Presentation mode for pagination. Incremental shows 1-N and loads the next page from a sentinel. */
  loadMode?: 'paged' | 'incremental';
  /** Selectable page-size options shown in the page-size dropdown. */
  pageSizeOptions?: number[];
  /** Callback fired when the user changes page or page size. */
  onChange: (page: number, pageSize: number) => void;
}

/**
 * Definition for a bulk action that operates on multiple selected items.
 * Rendered as a toolbar button when rows are selected in a DataTable or DataList.
 */
export interface BulkAction<T = unknown> {
  /** Unique identifier for the action. */
  key: string;
  /** Button label shown in the bulk-action toolbar. */
  label: string;
  /** Optional icon rendered before the label. */
  icon?: ReactNode;
  /** Visual variant controlling the button's color scheme. */
  variant?: 'default' | 'danger' | 'primary';
  /** Handler called with all currently selected items when the action is triggered. */
  onExecute: (selectedItems: T[]) => void | Promise<void>;
  /** When set, a confirmation dialog with this message is shown before executing. */
  confirm?: string;
  /** When true, the action button is rendered in a disabled state. */
  disabled?: boolean;
}

/**
 * Definition for a single statistic card rendered by the StatsGrid pattern.
 * Supports trend indicators, sparkline charts, and click-through navigation.
 */
export interface StatDef {
  /** Unique identifier for the stat card. */
  key: string;
  /** Human-readable label displayed above the value. */
  label: string;
  /** Primary displayed value (numeric or pre-formatted string). */
  value: number | string;
  /** Previous-period value used to compute the trend indicator. */
  previousValue?: number;
  /** Percentage change from the previous period (e.g. 12.5 for +12.5%). */
  change?: number;
  /** Direction of the change, controlling the trend arrow and color. */
  changeType?: 'increase' | 'decrease' | 'neutral';
  /** Text prepended to the value (e.g. "$" or currency symbol). */
  prefix?: string;
  /** Text appended to the value (e.g. "%" or unit). */
  suffix?: string;
  /** Icon rendered alongside the stat label. */
  icon?: ReactNode;
  /** URL to navigate to when the stat card is clicked. */
  href?: string;
  /** Data points for an inline sparkline chart rendered beneath the value. */
  sparklineData?: number[];
  /** Accent color override for the stat card (CSS color value). */
  color?: string;
  /** Supplementary description displayed below the primary value. */
  description?: string;
}

/**
 * Declarative field definition consumed by the FormBuilder pattern.
 * Each `FieldDef` describes a single form control, its validation rules,
 * visibility conditions, and optional custom renderer.
 *
 * @example
 * ```tsx
 * const fields: FieldDef[] = [
 *   { name: 'email', type: 'email', label: 'Email', required: true },
 *   { name: 'role', type: 'select', label: 'Role', options: [
 *     { label: 'Admin', value: 'admin' },
 *     { label: 'Member', value: 'member' },
 *   ]},
 * ];
 * ```
 */
export interface FieldDef {
  /** Form field name, used as the key in the form values object. */
  name: string;
  /** Human-readable label rendered above the control. */
  label?: string;
  /** Control type that determines which input widget is rendered. */
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'multi-select' |
        'checkbox' | 'radio' | 'switch' | 'date' | 'time' | 'datetime' | 'file' | 'color' |
        'slider' | 'rating' | 'custom';
  /** Placeholder text shown inside the input when empty. */
  placeholder?: string;
  /** Help text rendered below the control. */
  description?: string;
  /** Whether the field must have a value before the form can be submitted. */
  required?: boolean;
  /** Whether the control is rendered in a disabled (non-interactive) state. */
  disabled?: boolean;
  /** Static boolean or predicate function controlling field visibility based on other form values. */
  hidden?: boolean | ((values: Record<string, unknown>) => boolean);
  /** Available choices for select, multi-select, radio, and checkbox types. */
  options?: { label: string; value: string; disabled?: boolean }[];
  /** Built-in validation constraints applied before form submission. */
  validation?: {
    /** Minimum numeric value. */
    min?: number;
    /** Maximum numeric value. */
    max?: number;
    /** Minimum string length. */
    minLength?: number;
    /** Maximum string length. */
    maxLength?: number;
    /** Regex pattern the value must match. */
    pattern?: string;
    /** Custom error message shown when validation fails. */
    message?: string;
  };
  /** Initial value for the field before user interaction. */
  defaultValue?: unknown;
  /** Number of grid columns this field spans in a multi-column form layout. */
  colSpan?: number;
  /** Custom render function that replaces the default control for 'custom' type fields. */
  render?: (field: FieldDef, value: unknown, onChange: (value: unknown) => void) => ReactNode;
}

/**
 * Column definition for the KanbanBoard pattern. Each column represents
 * a stage or category containing draggable items of type `T`.
 */
export interface KanbanColumnDef<T> {
  /** Unique column identifier used for drag-and-drop targeting. */
  id: string;
  /** Column header title. */
  title: string;
  /** Array of items currently in this column. */
  items: T[];
  /** Accent color for the column header bar (CSS color value). */
  color?: string;
  /** Icon rendered next to the column title. */
  icon?: ReactNode;
  /** Work-in-progress limit. When exceeded, the column header shows a warning. */
  limit?: number;
  /** Whether the column body is collapsed (only the header is visible). */
  collapsed?: boolean;
}

/**
 * Named preset that bundles a partial set of props for a pattern component.
 * Presets enable "recipe" variants where consumers pick a preset name
 * instead of configuring every prop individually.
 */
export interface PresetDef<P> {
  /** Unique preset name used to reference this configuration. */
  name: string;
  /** Optional human-readable description of what this preset configures. */
  description?: string;
  /** Partial prop overrides applied when this preset is selected. */
  props: Partial<P>;
}
