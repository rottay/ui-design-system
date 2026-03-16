/**
 * @fileoverview Shared types for all Tier 2 pattern components. Defines
 * PatternBaseProps (engine, loading, className, style), ColumnDef, SortConfig,
 * FilterDef, PaginationConfig, BulkAction, StatDef, FieldDef, KanbanColumnDef,
 * and PresetDef -- the foundational contracts consumed across all patterns.
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineName } from '../../contracts';

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
  /** Enable cell editing */
  editable?: boolean;
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
  type: 'text' | 'select' | 'multi-select' | 'date' | 'date-range' | 'number-range' | 'boolean';
  /** Available choices for select and multi-select filter types. */
  options?: { label: string; value: string }[];
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
