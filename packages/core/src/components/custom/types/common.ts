/**
 * Common domain types shared across verticals.
 * These replace generic string/number types with semantic domain entities.
 */

/** Loading state for async data */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/** Empty state configuration */
export interface EmptyStateConfig {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Pagination state */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

/** Filter state */
export interface FilterState<T extends string = string> {
  key: T;
  value: string | string[];
  label?: string;
}

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Sort state */
export interface SortState<T extends string = string> {
  field: T;
  direction: SortDirection;
}

/** Date range */
export interface DateRange {
  start: Date;
  end: Date;
}

/** Trend indicator */
export interface TrendIndicator {
  direction: 'up' | 'down' | 'flat';
  value: number;
  label?: string;
}

/** Currency amount */
export interface Currency {
  amount: number;
  currency: string;
  formatted?: string;
}

/** Audit fields for entity tracking */
export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

/** Status with severity */
export type StatusSeverity = 'success' | 'warning' | 'error' | 'info' | 'neutral';

/** Generic status badge */
export interface StatusBadge {
  label: string;
  severity: StatusSeverity;
}

/** KPI stat with sparkline support */
export interface KpiStat {
  id: string;
  label: string;
  value: number;
  formattedValue?: string;
  trend: TrendIndicator;
  sparklineData?: number[];
  icon?: string;
}

/** Search state */
export interface SearchState {
  query: string;
  isSearching: boolean;
  resultCount?: number;
}

/** Tab definition */
export interface TabDef {
  key: string;
  label: string;
  icon?: string;
  badge?: number;
  disabled?: boolean;
}

/** Action button definition */
export interface ActionDef {
  key: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  onClick?: () => void;
}

/** View mode */
export type ViewMode = 'grid' | 'list' | 'table' | 'kanban' | 'calendar';
