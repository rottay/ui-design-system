'use client';

/**
 * useDataTable<T> - Composition Hook
 *
 * Manages DataTable state: sorting, pagination, selection, filtering.
 * Returns props ready to spread onto PatternDataTable.
 */

import { useState, useMemo, useCallback } from 'react';
import type { SortConfig, PaginationConfig, ColumnDef } from '../types';
import type { DataTablePatternProps } from '../data-table/types';

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

  const [sorting, setSorting] = useState<SortConfig | null>(initialSort);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Client-side sort
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

  // Client-side pagination
  const processedData = useMemo(() => {
    if (!clientSidePagination) return sortedData;
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize, clientSidePagination]);

  const totalCount = data.length;

  const selectedRows = useMemo(() => {
    if (selectedKeys.length === 0) return [];
    return data.filter((row, i) => {
      const key = rowKey
        ? typeof rowKey === 'function' ? rowKey(row) : String(row[rowKey as string])
        : String(i);
      return selectedKeys.includes(key);
    });
  }, [data, selectedKeys, rowKey]);

  const handleSelectionChange = useCallback((keys: string[], rows: T[]) => {
    setSelectedKeys(keys);
  }, []);

  const handleSortChange = useCallback((sort: SortConfig) => {
    setSorting(sort);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPage(1);
    }
  }, [pageSize]);

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
