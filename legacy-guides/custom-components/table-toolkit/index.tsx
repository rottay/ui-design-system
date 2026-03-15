/**
 * Table Toolkit - Composable Sub-Components for Table UIs
 *
 * Unlike other custom components, this is NOT a single preset-based component.
 * Each sub-component is independently usable and composable.
 */

// Types
export type {
  TableToolbarProps,
  StatusFilterPillsProps,
  FilterPill,
  TablePaginationProps,
  TableEmptyStateProps,
  TableLoadingOverlayProps,
  BulkSelectToggleProps,
  ConfirmActionModalProps,
  FilterSelectProps,
  FilterSelectOption,
  SortDirection,
  UseTableFiltersOptions,
  UseTableFiltersReturn,
  UseTableSortOptions,
  UseTableSortReturn,
  UseBulkSelectionOptions,
  UseBulkSelectionReturn,
} from './core';

export { TABLE_TOOLKIT_DEFAULTS } from './core';

// Components
export { TableToolbar } from './components/toolbar';
export { StatusFilterPills } from './components/status-filter-pills';
export { TablePagination } from './components/pagination';
export { TableEmptyState } from './components/empty-state';
export { TableLoadingOverlay } from './components/loading-overlay';
export { BulkSelectToggle } from './components/bulk-select-toggle';
export { ConfirmActionModal } from './components/confirm-modal';
export { FilterSelect } from './components/filter-select';

// Hooks
export { useTableFilters } from './hooks/use-table-filters';
export { useTableSort } from './hooks/use-table-sort';
export { useBulkSelection } from './hooks/use-bulk-selection';
