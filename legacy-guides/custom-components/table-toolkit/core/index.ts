import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

/**
 * Table Toolkit - Core Types
 *
 * A collection of composable sub-components for building table UIs.
 * Unlike other custom components, this is NOT preset-based.
 * Each sub-component is independently usable.
 */

// ─── Toolbar ───────────────────────────────────────────────────
export interface TableToolbarProps extends EngineAwareProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  isFiltered?: boolean;
  onResetFilters?: () => void;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  filters?: ReactNode;
  actions?: ReactNode;
  leftContent?: ReactNode;
  searchIcon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ─── Status Filter Pills ──────────────────────────────────────
export interface FilterPill {
  value: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

export interface StatusFilterPillsProps extends EngineAwareProps {
  options: FilterPill[];
  value: string | string[];
  onChange: (value: string) => void;
  showCounts?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  style?: CSSProperties;
}

// ─── Table Pagination ─────────────────────────────────────────
export interface TablePaginationProps extends EngineAwareProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
  showTotal?: boolean;
  firstIcon?: ReactNode;
  prevIcon?: ReactNode;
  nextIcon?: ReactNode;
  lastIcon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ─── Table Empty State ────────────────────────────────────────
export interface TableEmptyStateProps extends EngineAwareProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  isFiltered?: boolean;
  filteredDescription?: string;
  onResetFilters?: () => void;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  className?: string;
  style?: CSSProperties;
}

// ─── Table Loading Overlay ────────────────────────────────────
export interface TableLoadingOverlayProps extends EngineAwareProps {
  visible: boolean;
  message?: string;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ─── Bulk Select Toggle ───────────────────────────────────────
export interface BulkSelectToggleProps extends EngineAwareProps {
  active: boolean;
  onToggle: () => void;
  selectedCount?: number;
  selectIcon?: ReactNode;
  doneIcon?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
  style?: CSSProperties;
}

// ─── Confirm Action Modal ─────────────────────────────────────
export interface ConfirmActionModalProps extends EngineAwareProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ─── Filter Select ────────────────────────────────────────────
export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectProps extends EngineAwareProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  placeholder?: string;
  minWidth?: number;
  chevronIcon?: ReactNode;
  checkIcon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ─── Hooks ────────────────────────────────────────────────────
export type SortDirection = 'asc' | 'desc' | null;

export interface UseTableFiltersOptions<T extends Record<string, string>> {
  defaultFilters: T;
  debounceMs?: number;
  debouncedKeys?: (keyof T)[];
  minSearchLength?: number;
}

export interface UseTableFiltersReturn<T extends Record<string, string>> {
  filters: T;
  setFilter: (key: keyof T, value: string) => void;
  setFilters: (updates: Partial<T>) => void;
  resetFilters: () => void;
  isFiltered: boolean;
  getFilter: (key: keyof T) => string;
}

export interface UseTableSortOptions<T extends string> {
  defaultField: T;
  defaultDirection?: SortDirection;
}

export interface UseTableSortReturn<T extends string> {
  sortField: T;
  sortDirection: SortDirection;
  handleSort: (field: T) => void;
  sortData: <R extends Record<string, unknown>>(data: R[], fieldAccessor?: (item: R, field: T) => unknown) => R[];
}

export interface UseBulkSelectionOptions {
  totalCount: number;
  onSelectionChange?: (ids: string[]) => void;
  initialSelectedKeys?: string[];
  initialBulkMode?: boolean;
}

export interface UseBulkSelectionReturn {
  bulkSelectMode: boolean;
  selectedKeys: string[];
  isAllSelected: boolean;
  isSomeSelected: boolean;
  selectedCount: number;
  toggleBulkMode: () => void;
  selectAll: (allIds: string[]) => void;
  deselectAll: () => void;
  toggleItem: (id: string) => void;
  isSelected: (id: string) => boolean;
}

export const TABLE_TOOLKIT_DEFAULTS = {
  paginationPageSizeOptions: [10, 20, 50, 100],
};
