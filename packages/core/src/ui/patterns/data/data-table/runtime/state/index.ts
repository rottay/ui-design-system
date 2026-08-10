'use client';

/**
 * @fileoverview useDataTable composition hook -- manages DataTable state
 * (sorting, pagination, selection) and returns props ready to spread
 * onto PatternDataTable. Supports both client-side and server-side modes.
 *
 * Use this hook when you need to control a DataTable from outside the component,
 * e.g. coordinating selection with a toolbar, or switching between client-side
 * and server-side data processing without changing the component tree.
 *
 * @example
 * ```tsx
 * const { tableProps, selectedRows } = useDataTable({
 *   data: users,
 *   columns: [column<User>('name'), column<User>('email')],
 *   pageSize: 25,
 * });
 * return <PatternDataTable {...tableProps} />;
 * ```
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ColumnDef,
  PaginationConfig,
  SortConfig,
} from '@/foundation/contracts/runtime/components/patterns/core';
import type { DataTablePatternProps } from '../../contracts';

export interface UseDataTableOptions<T> {
  data: T[];
  columns: ColumnDef<T>[];
  initialSort?: SortConfig;
  pageSize?: number;
  initialPage?: number;
  rowKey?: keyof T | ((row: T) => string);
  clientSideSorting?: boolean;
  clientSidePagination?: boolean;
}

export interface UseDataTableReturn<T> {
  /** Spread onto PatternDataTable */
  tableProps: Pick<
    DataTablePatternProps<T>,
    'data' | 'columns' | 'rowKey' | 'sorting' | 'onSortChange' | 'pagination' |
    'selectable' | 'selectedKeys' | 'onSelectionChange'
  >;
  /** Current sort state */
  sorting: SortConfig | null;
  setSorting: (sort: SortConfig | null) => void;
  /** Pagination state */
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  /** Selection state */
  selectedKeys: string[];
  selectedRows: T[];
  setSelectedKeys: (keys: string[]) => void;
  clearSelection: () => void;
  /** Processed data (sorted + paginated if client-side) */
  processedData: T[];
  /** Total count */
  totalCount: number;
}

/**
 * Manages sorting, pagination, and row selection state for a DataTable pattern.
 *
 * When `clientSideSorting` / `clientSidePagination` are true (the default),
 * the hook derives sorted and paginated slices from `data` via `useMemo`.
 * Set them to false for server-side mode, where the caller is responsible
 * for providing the correct page of pre-sorted data.
 *
 * @param options - Configuration including data source, columns, and initial state.
 * @returns An object containing `tableProps` (spread onto PatternDataTable),
 *          plus individual state accessors and setters for external coordination.
 *
 * @example
 * ```tsx
 * const { tableProps, selectedRows, clearSelection } = useDataTable({
 *   data: invoices,
 *   columns: invoiceColumns,
 *   pageSize: 50,
 *   rowKey: 'id',
 * });
 * ```
 */
export function useDataTable<T extends Record<string, unknown>>(
  options: UseDataTableOptions<T>
): UseDataTableReturn<T> {
  const {
    data,
    columns,
    initialSort = null,
    pageSize: initialPageSize = 20,
    initialPage = 1,
    rowKey,
    clientSideSorting = true,
    clientSidePagination = true,
  } = options;

  const [sorting, setSortingState] = useState<SortConfig | null>(initialSort);
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const clearUnstableSelection = useCallback(() => {
    if (rowKey === undefined) setSelectedKeys([]);
  }, [rowKey]);

  const setSorting = useCallback((nextSorting: SortConfig | null) => {
    setSortingState(nextSorting);
    clearUnstableSelection();
  }, [clearUnstableSelection]);

  const setPage = useCallback((nextPage: number) => {
    setPageState(nextPage);
    clearUnstableSelection();
  }, [clearUnstableSelection]);

  const setPageSize = useCallback((nextPageSize: number) => {
    setPageSizeState(nextPageSize);
    clearUnstableSelection();
  }, [clearUnstableSelection]);

  /*
   * Positional keys stop meaning anything once the rows behind them move, so a
   * data change has to drop them. It is compared row by row rather than by array
   * identity: a parent that passes `data={[...]}` inline hands over a fresh array
   * on every render, and keying this on identity would wipe the user's selection
   * between one render and the next.
   */
  const previousData = useRef(data);
  useEffect(() => {
    const previous = previousData.current;
    previousData.current = data;
    if (rowKey !== undefined) return;
    const sameRows = previous.length === data.length
      && previous.every((row, index) => row === data[index]);
    if (sameRows) return;
    setSelectedKeys((current) => (current.length === 0 ? current : []));
  }, [data, rowKey]);

  // -- Client-side sort --
  // Memoized to avoid re-sorting on every render. The sort is skipped entirely
  // when the consumer handles sorting server-side (clientSideSorting=false).
  const sortedData = useMemo(() => {
    if (!clientSideSorting || !sorting) return data;
    const col = columns.find((c) => c.key === sorting.key);
    if (!col) return data;
    return [...data].sort((a, b) => {
      const aVal = col.accessorFn ? col.accessorFn(a) : a[col.accessorKey ?? col.key];
      const bVal = col.accessorFn ? col.accessorFn(b) : b[col.accessorKey ?? col.key];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sorting.direction === 'asc' ? cmp : -cmp;
    });
  }, [data, sorting, columns, clientSideSorting]);

  // -- Client-side pagination --
  // Slices the sorted array. Depends on `sortedData` so pagination
  // automatically updates when sort changes.
  const processedData = useMemo(() => {
    if (!clientSidePagination) return sortedData;
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize, clientSidePagination]);

  const totalCount = data.length;

  // Resolve selected row objects from keys. Searches the full `data` array
  // (not processedData) so selections persist across page changes.
  const selectedRows = useMemo(() => {
    if (selectedKeys.length === 0) return [];
    if (rowKey !== undefined) {
      return data.filter((row) => {
        const key = typeof rowKey === 'function' ? rowKey(row) : String(row[rowKey as string]);
        return selectedKeys.includes(key);
      });
    }
    /* Positional keys resolve against the rendered page, then retain source ordering. */
    const selectedOnPage = new Set(
      processedData.filter((_row, i) => selectedKeys.includes(String(i))),
    );
    return data.filter((row) => selectedOnPage.has(row));
  }, [data, processedData, selectedKeys, rowKey]);

  const handleSelectionChange = useCallback((keys: string[], rows: T[]) => {
    setSelectedKeys(keys);
  }, []);

  // Reset to page 1 on sort change so the user sees the top of the
  // newly-sorted data instead of a potentially out-of-range page.
  const handleSortChange = useCallback((sort: SortConfig) => {
    setSorting(sort);
    setPage(1);
  }, [setPage, setSorting]);

  // When the page size changes, reset to page 1 to avoid showing an empty
  // page beyond the new total page count.
  const handlePageChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPage(1);
    }
  }, [pageSize, setPage, setPageSize]);

  const pagination: PaginationConfig | false = clientSidePagination
    ? {
        current: page,
        pageSize,
        total: totalCount,
        pageSizeOptions: [10, 20, 50, 100],
        onChange: handlePageChange,
      }
    : false;

  return {
    tableProps: {
      data: processedData,
      columns,
      rowKey,
      sorting,
      onSortChange: handleSortChange,
      pagination,
      selectable: true,
      selectedKeys,
      onSelectionChange: handleSelectionChange,
    },
    sorting,
    setSorting,
    page,
    pageSize,
    setPage,
    setPageSize,
    selectedKeys,
    selectedRows,
    setSelectedKeys,
    clearSelection: () => setSelectedKeys([]),
    processedData,
    totalCount,
  };
}
