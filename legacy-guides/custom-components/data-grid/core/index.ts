/**
 * DataGrid - Core Interface
 * Airtable/Excel-style spreadsheet component with sortable columns,
 * colored badges, filterable rows, and numbered rows
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type DataGridPreset = 'basic' | 'enriched';

export type DataGridColumnType = 'text' | 'number' | 'badge' | 'link' | 'date' | 'custom';

export interface BadgeConfig {
  text: string;
  color: 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'purple' | 'gray';
}

export interface DataGridColumn<T = unknown> {
  key: string;
  title: string;
  dataIndex?: keyof T | string;
  type?: DataGridColumnType;
  width?: number | string;
  minWidth?: number;
  sortable?: boolean;
  resizable?: boolean;
  icon?: ReactNode;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, record: T, index: number) => ReactNode;
  badgeColorMap?: Record<string, BadgeConfig['color']>;
}

export interface DataGridProps<T = Record<string, unknown>> extends EngineAwareProps {
  /** Preset to use */
  preset?: DataGridPreset;
  /** Column definitions */
  columns: DataGridColumn<T>[];
  /** Data source */
  data: T[];
  /** Row key field or function */
  rowKey?: keyof T | ((record: T) => string);
  /** Show row numbers on the left */
  showRowNumbers?: boolean;
  /** Enable row selection with checkboxes */
  selectable?: boolean;
  /** Selected row keys (controlled) */
  selectedRowKeys?: string[];
  /** Selection change handler */
  onSelectionChange?: (keys: string[], records: T[]) => void;
  /** Enable column sorting */
  sortable?: boolean;
  /** Current sort state */
  sortState?: { key: string; direction: 'asc' | 'desc' } | null;
  /** Sort change handler */
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
  /** Enable search toolbar */
  searchable?: boolean;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Search handler */
  onSearch?: (query: string) => void;
  /** Filter pills in toolbar */
  filters?: Array<{ key: string; label: string; active?: boolean }>;
  /** Filter click handler */
  onFilterClick?: (key: string) => void;
  /** Total row count (displayed in toolbar) */
  totalRows?: number;
  /** Number of visible columns */
  visibleColumns?: number;
  /** Total number of columns */
  totalColumns?: number;
  /** Current view name */
  viewName?: string;
  /** View change handler */
  onViewChange?: (view: string) => void;
  /** Actions rendered in header toolbar */
  headerActions?: ReactNode;
  /** Row click handler */
  onRowClick?: (record: T, index: number) => void;
  /** Sticky table header */
  stickyHeader?: boolean;
  /** Compact row height */
  compact?: boolean;
  /** Show cell borders */
  bordered?: boolean;
  /** Alternate row striping */
  striped?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Empty state content */
  emptyText?: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Enable column reordering via drag */
  columnReorderable?: boolean;
  /** Column reorder handler */
  onColumnReorder?: (columns: DataGridColumn<T>[]) => void;
}

export const DATA_GRID_DEFAULTS: Partial<DataGridProps> = {
  preset: 'basic',
  showRowNumbers: true,
  selectable: true,
  stickyHeader: true,
  searchPlaceholder: 'Search',
  emptyText: 'No data',
  striped: false,
  bordered: true,
  compact: false,
};

// ============================================================================
// Shared Utilities
// ============================================================================

export function getValue(record: Record<string, unknown>, dataIndex?: string): unknown {
  if (!dataIndex) return undefined;
  return dataIndex.split('.').reduce((obj: unknown, key) =>
    (obj as Record<string, unknown>)?.[key], record);
}

export function compareValues(a: unknown, b: unknown, direction: 'asc' | 'desc'): number {
  const multiplier = direction === 'asc' ? 1 : -1;
  if (a == null && b == null) return 0;
  if (a == null) return 1 * multiplier;
  if (b == null) return -1 * multiplier;
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b) * multiplier;
  if (typeof a === 'number' && typeof b === 'number') return (a - b) * multiplier;
  return String(a).localeCompare(String(b)) * multiplier;
}

export function getBadgeColors(tokens: DesignTokens): Record<string, { bg: string; text: string; border: string }> {
  return {
    green: { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[800], border: tokens.colors.successScale[200] },
    yellow: { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[800], border: tokens.colors.warningScale[200] },
    orange: { bg: tokens.colors.warningScale[200], text: tokens.colors.warningScale[900], border: tokens.colors.warningScale[300] },
    red: { bg: tokens.colors.errorScale[100], text: tokens.colors.errorScale[800], border: tokens.colors.errorScale[200] },
    blue: { bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[800], border: tokens.colors.infoScale[200] },
    purple: { bg: tokens.colors.secondaryScale[100], text: tokens.colors.secondaryScale[800], border: tokens.colors.secondaryScale[200] },
    gray: { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[700], border: tokens.colors.neutral[200] },
  };
}
