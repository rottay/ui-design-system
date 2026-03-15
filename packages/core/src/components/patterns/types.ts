/**
 * Pattern Components - Shared Types
 *
 * Base types for all Tier 2 pattern components.
 * Patterns are generic, composable components with engine support.
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineName } from '../../contracts';

/**
 * Base props for all pattern components.
 */
export interface PatternBaseProps {
  engine?: EngineName;
  className?: string;
  style?: CSSProperties;
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
 * Sort configuration.
 */
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter definition for filterable patterns.
 */
export interface FilterDef {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multi-select' | 'date' | 'date-range' | 'number-range' | 'boolean';
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: unknown;
}

/**
 * Pagination configuration.
 */
export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  onChange: (page: number, pageSize: number) => void;
}

/**
 * Bulk action definition.
 */
export interface BulkAction<T = unknown> {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'danger' | 'primary';
  onExecute: (selectedItems: T[]) => void | Promise<void>;
  confirm?: string;
  disabled?: boolean;
}

/**
 * Stat definition for StatsGrid.
 */
export interface StatDef {
  key: string;
  label: string;
  value: number | string;
  previousValue?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
  href?: string;
  sparklineData?: number[];
  color?: string;
  description?: string;
}

/**
 * Field definition for FormBuilder.
 */
export interface FieldDef {
  name: string;
  label?: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'multi-select' |
        'checkbox' | 'radio' | 'switch' | 'date' | 'time' | 'datetime' | 'file' | 'color' |
        'slider' | 'rating' | 'custom';
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean | ((values: Record<string, unknown>) => boolean);
  options?: { label: string; value: string; disabled?: boolean }[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
  defaultValue?: unknown;
  colSpan?: number;
  render?: (field: FieldDef, value: unknown, onChange: (value: unknown) => void) => ReactNode;
}

/**
 * Kanban column definition.
 */
export interface KanbanColumnDef<T> {
  id: string;
  title: string;
  items: T[];
  color?: string;
  icon?: ReactNode;
  limit?: number;
  collapsed?: boolean;
}

/**
 * Preset system for recipe variants.
 */
export interface PresetDef<P> {
  name: string;
  description?: string;
  props: Partial<P>;
}
