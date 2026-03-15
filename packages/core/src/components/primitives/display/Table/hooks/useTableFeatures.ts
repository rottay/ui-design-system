'use client';

/**
 * @fileoverview Shared Table Features Hook - Rottay Design System
 * @description Provides all advanced table features (sorting, filtering, pagination,
 * virtual scrolling, column resize, expandable rows, sticky, summary) as a single
 * composable hook consumed by Modern and Rustic engines.
 *
 * @module Table/hooks/useTableFeatures
 * @category Display
 * @package @rottay/design-system
 */
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { Key, RefObject } from 'react';
import type { TableProps, ColumnType, SortOrder, EditingCell } from '../Table.types';

// ---------------------------------------------------------------------------
// Key helpers
// ---------------------------------------------------------------------------
export type TableKey = string | number;

export function normalizeTableKey(value: unknown, fallback: number): TableKey {
  if (typeof value === 'string' || typeof value === 'number') return value;
  return String(value ?? fallback);
}

// ---------------------------------------------------------------------------
// Flatten nested column groups into leaf columns
// ---------------------------------------------------------------------------
export function flattenColumns<T>(columns: ColumnType<T>[]): ColumnType<T>[] {
  const result: ColumnType<T>[] = [];
  for (const col of columns) {
    if (col.children && col.children.length > 0) {
      result.push(...flattenColumns(col.children));
    } else {
      result.push(col);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Compute the max header depth for nested column groups
// ---------------------------------------------------------------------------
export function getHeaderDepth<T>(columns: ColumnType<T>[]): number {
  let max = 1;
  for (const col of columns) {
    if (col.children && col.children.length > 0) {
      max = Math.max(max, 1 + getHeaderDepth(col.children));
    }
  }
  return max;
}

// ---------------------------------------------------------------------------
// Build header rows for nested column groups
// Each entry: { column, colSpan, rowSpan }
// ---------------------------------------------------------------------------
export interface HeaderCell<T> {
  column: ColumnType<T>;
  colSpan: number;
  rowSpan: number;
}

function getLeafCount<T>(col: ColumnType<T>): number {
  if (!col.children || col.children.length === 0) return 1;
  return col.children.reduce((sum, c) => sum + getLeafCount(c), 0);
}

export function buildHeaderRows<T>(columns: ColumnType<T>[], totalDepth: number): HeaderCell<T>[][] {
  const rows: HeaderCell<T>[][] = Array.from({ length: totalDepth }, () => []);

  function walk(cols: ColumnType<T>[], depth: number) {
    for (const col of cols) {
      if (col.hidden) continue;
      if (col.children && col.children.length > 0) {
        const visibleChildren = col.children.filter((c) => !c.hidden);
        rows[depth].push({
          column: col,
          colSpan: visibleChildren.reduce((s, c) => s + getLeafCount(c), 0),
          rowSpan: 1,
        });
        walk(visibleChildren, depth + 1);
      } else {
        rows[depth].push({
          column: col,
          colSpan: 1,
          rowSpan: totalDepth - depth,
        });
      }
    }
  }

  walk(columns, 0);
  return rows;
}

// ---------------------------------------------------------------------------
// Column field key helper
// ---------------------------------------------------------------------------
export function columnFieldKey<T>(col: ColumnType<T>): string | undefined {
  return Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex;
}

// ---------------------------------------------------------------------------
// Value accessor
// ---------------------------------------------------------------------------
export function getNestedValue<T>(record: T, dataIndex?: string | string[]): unknown {
  if (!dataIndex) return undefined;
  if (Array.isArray(dataIndex)) {
    return dataIndex.reduce<unknown>((obj, key) => (obj as Record<string, unknown>)?.[key], record as unknown);
  }
  return (record as Record<string, unknown>)[dataIndex];
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export interface UseTableFeaturesOptions<T> {
  props: TableProps<T>;
}

export interface UseTableFeaturesReturn<T> {
  // Data pipeline
  processedData: T[];
  displayData: T[];

  // Leaf columns (flattened from nested groups)
  leafColumns: ColumnType<T>[];

  // Header rows for nested column groups
  headerRows: HeaderCell<T>[][];

  // Sorting
  sortState: { field?: string; order?: SortOrder };
  handleSort: (column: ColumnType<T>) => void;

  // Column filters
  columnFilters: Record<string, string>;
  handleColumnFilter: (field: string, value: string) => void;

  // Pagination
  currentPage: number;
  pageSize: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
  paginationRange: string;

  // Row selection
  selectedRowKeys: TableKey[];
  handleSelectAll: (checked: boolean) => void;
  handleSelectRow: (record: T, index: number, checked: boolean) => void;
  isAllSelected: boolean;

  // Expandable rows
  expandedRowKeys: Set<TableKey>;
  handleToggleExpand: (record: T, index: number) => void;
  isRowExpandable: (record: T) => boolean;

  // Virtual scrolling
  virtualEnabled: boolean;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  virtualSlice: { start: number; end: number; offsetTop: number; totalHeight: number };

  // Column resize
  columnWidths: Record<string, number>;
  handleResizeStart: (field: string, startX: number) => void;
  resizingColumn: string | null;

  // Sticky config
  stickyConfig: { enabled: boolean; offsetHeader: number };

  // Summary
  hasSummary: boolean;

  // Cell editing
  editingCell: EditingCell | null;
  isCellEditing: (rowKey: TableKey, columnKey: string) => boolean;
  isCellEditable: (column: ColumnType<T>, record: T, index: number) => boolean;
  handleCellClick: (record: T, index: number, column: ColumnType<T>) => void;
  handleCellSave: (record: T, index: number, column: ColumnType<T>, value: unknown) => void;
  handleCellCancel: () => void;
  handleCellKeyNav: (e: React.KeyboardEvent, record: T, index: number, column: ColumnType<T>, colIndex: number) => void;

  // Helpers
  getRowKey: (record: T, index: number) => TableKey;
  getValue: (record: T, dataIndex?: string | string[]) => unknown;
  visibleColumns: ColumnType<T>[];
  totalColSpan: number;
}

const ROW_HEIGHT_ESTIMATE = 48;
const VIRTUAL_BUFFER = 5;

export function useTableFeatures<T extends object>(
  options: UseTableFeaturesOptions<T>
): UseTableFeaturesReturn<T> {
  const { props } = options;
  const {
    dataSource = [],
    columns = [],
    rowKey = 'key',
    pagination = {},
    rowSelection,
    expandable,
    scroll,
    virtual = false,
    sticky = false,
    summary,
    onChange,
    onCellEdit,
    editingCell: controlledEditingCell,
  } = props;

  // ---- Row key helper ----
  const getRowKey = useCallback(
    (record: T, index: number): TableKey => {
      if (typeof rowKey === 'function') return normalizeTableKey(rowKey(record), index);
      return normalizeTableKey((record as Record<string, unknown>)[rowKey], index);
    },
    [rowKey]
  );

  const getValue = useCallback(
    (record: T, dataIndex?: string | string[]): unknown => getNestedValue(record, dataIndex),
    []
  );

  // ---- Nested column helpers ----
  const visibleColumns = useMemo(() => columns.filter((c) => !c.hidden), [columns]);
  const leafColumns = useMemo(() => flattenColumns(visibleColumns), [visibleColumns]);
  const headerDepth = useMemo(() => getHeaderDepth(visibleColumns), [visibleColumns]);
  const headerRows = useMemo(() => buildHeaderRows(visibleColumns, headerDepth), [visibleColumns, headerDepth]);

  const totalColSpan = useMemo(() => {
    let count = leafColumns.length;
    if (rowSelection) count += 1;
    if (expandable?.expandedRowRender && expandable.showExpandColumn !== false) count += 1;
    return count;
  }, [leafColumns.length, rowSelection, expandable]);

  // ---- Sorting ----
  const [sortState, setSortState] = useState<{ field?: string; order?: SortOrder }>({});

  const handleSort = useCallback(
    (column: ColumnType<T>) => {
      if (!column.sorter) return;
      const field = columnFieldKey(column);
      setSortState((prev) => {
        let next: { field?: string; order?: SortOrder };
        if (prev.field !== field) {
          next = { field, order: 'ascend' };
        } else if (prev.order === 'ascend') {
          next = { field, order: 'descend' };
        } else {
          next = {};
        }
        // Fire onChange callback
        if (onChange) {
          const sorterInfo = next.field
            ? { column, order: next.order, field: next.field, columnKey: column.key }
            : { column: undefined, order: undefined, field: undefined, columnKey: undefined };
          onChange(
            pagination === false ? {} as any : pagination as any,
            {},
            sorterInfo as any,
            { currentDataSource: dataSource, action: 'sort' }
          );
        }
        return next;
      });
    },
    [onChange, pagination, dataSource]
  );

  const sortedData = useMemo(() => {
    if (!sortState.field || !sortState.order) return dataSource;
    const column = leafColumns.find((col) => columnFieldKey(col) === sortState.field);
    if (!column) return dataSource;

    if (typeof column.sorter === 'function') {
      return [...dataSource].sort((a, b) => {
        const result = (column.sorter as (a: T, b: T) => number)(a, b);
        return sortState.order === 'descend' ? -result : result;
      });
    }

    // Boolean sorter: default string comparison
    if (column.sorter === true) {
      return [...dataSource].sort((a, b) => {
        const aVal = String(getNestedValue(a, column.dataIndex) ?? '');
        const bVal = String(getNestedValue(b, column.dataIndex) ?? '');
        const cmp = aVal.localeCompare(bVal);
        return sortState.order === 'descend' ? -cmp : cmp;
      });
    }

    return dataSource;
  }, [dataSource, leafColumns, sortState]);

  // ---- Column filters ----
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const handleColumnFilter = useCallback((field: string, value: string) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      if (value) {
        next[field] = value;
      } else {
        delete next[field];
      }
      return next;
    });
  }, []);

  const filteredData = useMemo(() => {
    const activeFilters = Object.entries(columnFilters).filter(([, v]) => v.length > 0);
    if (activeFilters.length === 0) return sortedData;

    return sortedData.filter((record) =>
      activeFilters.every(([field, filterValue]) => {
        const cellValue = String(
          getNestedValue(record, field.includes('.') ? field.split('.') : field) ?? ''
        ).toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      })
    );
  }, [sortedData, columnFilters]);

  // processedData = after sorting + filtering, before pagination
  const processedData = filteredData;

  // ---- Pagination ----
  const paginationEnabled = pagination !== false;
  const configPageSize =
    paginationEnabled && typeof pagination === 'object' ? pagination.pageSize || 10 : 10;
  const [currentPage, setCurrentPageState] = useState(
    paginationEnabled && typeof pagination === 'object' && pagination.current ? pagination.current : 1
  );
  const [pageSize] = useState(configPageSize);

  const totalItems = processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to page 1 when filters/sorting change resulting data length
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPageState(1);
    }
  }, [totalPages, currentPage]);

  const setCurrentPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, totalPages));
      setCurrentPageState(clamped);
      if (paginationEnabled && typeof pagination === 'object' && pagination.onChange) {
        pagination.onChange(clamped, pageSize);
      }
    },
    [totalPages, paginationEnabled, pagination, pageSize]
  );

  const paginatedData = useMemo(() => {
    if (!paginationEnabled) return processedData;
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize, paginationEnabled]);

  const paginationRange = `${totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}-${Math.min(
    currentPage * pageSize,
    totalItems
  )} of ${totalItems}`;

  // ---- Row selection ----
  const [selectedRowKeys, setSelectedRowKeys] = useState<TableKey[]>(
    (rowSelection?.defaultSelectedRowKeys || rowSelection?.selectedRowKeys || []).map((key, i) =>
      normalizeTableKey(key, i)
    )
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const allKeys = checked ? paginatedData.map((record, i) => getRowKey(record, i)) : [];
      setSelectedRowKeys(allKeys);
      rowSelection?.onChange?.(allKeys, checked ? paginatedData : [], {
        type: checked ? 'all' : 'none',
      });
    },
    [paginatedData, rowSelection, getRowKey]
  );

  const handleSelectRow = useCallback(
    (record: T, index: number, checked: boolean) => {
      const key = getRowKey(record, index);
      setSelectedRowKeys((prev) => {
        const next = checked ? [...prev, key] : prev.filter((k) => k !== key);
        const selectedRows = paginatedData.filter((r, i) => next.includes(getRowKey(r, i)));
        rowSelection?.onChange?.(next, selectedRows, { type: 'single' });
        return next;
      });
    },
    [paginatedData, rowSelection, getRowKey]
  );

  const isAllSelected = paginatedData.length > 0 && selectedRowKeys.length === paginatedData.length;

  // ---- Expandable rows ----
  const [expandedKeys, setExpandedKeys] = useState<Set<TableKey>>(() => {
    if (expandable?.defaultExpandAllRows) {
      return new Set(dataSource.map((r, i) => getRowKey(r, i)));
    }
    if (expandable?.defaultExpandedRowKeys) {
      return new Set(expandable.defaultExpandedRowKeys.map((k, i) => normalizeTableKey(k, i)));
    }
    return new Set<TableKey>();
  });

  // Sync with controlled expandedRowKeys
  useEffect(() => {
    if (expandable?.expandedRowKeys) {
      setExpandedKeys(new Set(expandable.expandedRowKeys.map((k, i) => normalizeTableKey(k, i))));
    }
  }, [expandable?.expandedRowKeys]);

  const handleToggleExpand = useCallback(
    (record: T, index: number) => {
      const key = getRowKey(record, index);
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        const expanded = !next.has(key);
        if (expanded) {
          next.add(key);
        } else {
          next.delete(key);
        }
        expandable?.onExpand?.(expanded, record);
        expandable?.onExpandedRowsChange?.(Array.from(next) as Key[]);
        return next;
      });
    },
    [getRowKey, expandable]
  );

  const isRowExpandable = useCallback(
    (record: T): boolean => {
      if (!expandable?.expandedRowRender) return false;
      if (expandable.rowExpandable) return expandable.rowExpandable(record);
      return true;
    },
    [expandable]
  );

  // ---- Virtual scrolling ----
  const virtualEnabled = virtual && !!scroll?.y;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    if (!virtualEnabled) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const onScroll = () => setScrollTop(container.scrollTop);
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [virtualEnabled]);

  const virtualSlice = useMemo(() => {
    if (!virtualEnabled) {
      return { start: 0, end: paginatedData.length, offsetTop: 0, totalHeight: 0 };
    }
    const viewportHeight = typeof scroll?.y === 'number' ? scroll.y : 400;
    const totalRows = paginatedData.length;
    const totalHeight = totalRows * ROW_HEIGHT_ESTIMATE;
    const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT_ESTIMATE) - VIRTUAL_BUFFER);
    const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT_ESTIMATE) + VIRTUAL_BUFFER * 2;
    const endIdx = Math.min(totalRows, startIdx + visibleCount);
    const offsetTop = startIdx * ROW_HEIGHT_ESTIMATE;
    return { start: startIdx, end: endIdx, offsetTop, totalHeight };
  }, [virtualEnabled, scrollTop, paginatedData.length, scroll?.y]);

  const displayData = useMemo(() => {
    if (virtualEnabled) {
      return paginatedData.slice(virtualSlice.start, virtualSlice.end);
    }
    return paginatedData;
  }, [paginatedData, virtualEnabled, virtualSlice.start, virtualSlice.end]);

  // ---- Column resize ----
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {};
    for (const col of leafColumns) {
      const key = columnFieldKey(col) || String(col.key);
      if (typeof col.width === 'number') {
        widths[key] = col.width;
      }
    }
    return widths;
  });

  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeStartRef = useRef<{ field: string; startX: number; startWidth: number } | null>(null);

  const handleResizeStart = useCallback(
    (field: string, startX: number) => {
      const currentWidth = columnWidths[field] || 100;
      resizeStartRef.current = { field, startX, startWidth: currentWidth };
      setResizingColumn(field);
    },
    [columnWidths]
  );

  useEffect(() => {
    if (!resizingColumn) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;
      const { field, startX, startWidth } = resizeStartRef.current;
      const minWidth = leafColumns.find((c) => columnFieldKey(c) === field)?.minWidth || 50;
      const delta = e.clientX - startX;
      const newWidth = Math.max(minWidth, startWidth + delta);
      setColumnWidths((prev) => ({ ...prev, [field]: newWidth }));
    };

    const handleMouseUp = () => {
      resizeStartRef.current = null;
      setResizingColumn(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn, leafColumns]);

  // ---- Sticky ----
  const stickyConfig = useMemo(() => {
    if (sticky === true) return { enabled: true, offsetHeader: 0 };
    if (typeof sticky === 'object') return { enabled: true, offsetHeader: sticky.offsetHeader || 0 };
    return { enabled: false, offsetHeader: 0 };
  }, [sticky]);

  // ---- Summary ----
  const hasSummary = typeof summary === 'function';

  // ---- Cell editing ----
  const isControlledEditing = controlledEditingCell !== undefined;
  const [internalEditingCell, setInternalEditingCell] = useState<EditingCell | null>(null);
  const editingCell = isControlledEditing ? (controlledEditingCell ?? null) : internalEditingCell;

  const setEditingCell = useCallback(
    (cell: EditingCell | null) => {
      if (!isControlledEditing) {
        setInternalEditingCell(cell);
      }
    },
    [isControlledEditing]
  );

  const isCellEditing = useCallback(
    (rKey: TableKey, colKey: string): boolean => {
      if (!editingCell) return false;
      return editingCell.rowKey === String(rKey) && editingCell.columnKey === colKey;
    },
    [editingCell]
  );

  const isCellEditable = useCallback(
    (column: ColumnType<T>, record: T, index: number): boolean => {
      if (!column.editable) return false;
      if (typeof column.editable === 'function') return column.editable(record, index);
      return true;
    },
    []
  );

  const handleCellClick = useCallback(
    (record: T, index: number, column: ColumnType<T>) => {
      if (!isCellEditable(column, record, index)) return;
      if (!onCellEdit) return; // no handler means editing is not wired up
      const rKey = String(getRowKey(record, index));
      const colKey = columnFieldKey(column) || String(column.key) || '';
      // Don't re-enter edit if already editing this cell
      if (editingCell && editingCell.rowKey === rKey && editingCell.columnKey === colKey) return;
      setEditingCell({ rowKey: rKey, columnKey: colKey });
    },
    [isCellEditable, onCellEdit, getRowKey, editingCell, setEditingCell]
  );

  const handleCellSave = useCallback(
    (record: T, index: number, column: ColumnType<T>, value: unknown) => {
      const rKey = String(getRowKey(record, index));
      const colKey = columnFieldKey(column) || String(column.key) || '';
      onCellEdit?.(rKey, colKey, value, record);
      setEditingCell(null);
    },
    [getRowKey, onCellEdit, setEditingCell]
  );

  const handleCellCancel = useCallback(() => {
    setEditingCell(null);
  }, [setEditingCell]);

  /**
   * Keyboard navigation for inline editing:
   * - Enter: save and move down to next row (same column)
   * - Tab: save and move right to next editable cell
   * - Shift+Tab: save and move left to previous editable cell
   * - Escape: cancel editing
   */
  const handleCellKeyNav = useCallback(
    (
      e: React.KeyboardEvent,
      record: T,
      index: number,
      column: ColumnType<T>,
      colIndex: number
    ) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setEditingCell(null);
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        // Move to the same column in the next row
        const nextRowIdx = index + 1;
        if (nextRowIdx < displayData.length) {
          const nextRecord = displayData[nextRowIdx];
          if (isCellEditable(column, nextRecord, nextRowIdx)) {
            const rKey = String(getRowKey(nextRecord, nextRowIdx));
            const colKey = columnFieldKey(column) || String(column.key) || '';
            setEditingCell({ rowKey: rKey, columnKey: colKey });
            return;
          }
        }
        setEditingCell(null);
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        const direction = e.shiftKey ? -1 : 1;
        // Search for the next editable cell
        let nextColIdx = colIndex + direction;

        // First, try remaining columns in the same row
        while (nextColIdx >= 0 && nextColIdx < leafColumns.length) {
          const nextCol = leafColumns[nextColIdx];
          if (isCellEditable(nextCol, record, index)) {
            const rKey = String(getRowKey(record, index));
            const colKey = columnFieldKey(nextCol) || String(nextCol.key) || '';
            setEditingCell({ rowKey: rKey, columnKey: colKey });
            return;
          }
          nextColIdx += direction;
        }

        // If no editable cell found in this row, try next/prev row
        const nextRowIdx = index + direction;
        if (nextRowIdx >= 0 && nextRowIdx < displayData.length) {
          const nextRecord = displayData[nextRowIdx];
          const startCol = direction === 1 ? 0 : leafColumns.length - 1;
          let ci = startCol;
          while (ci >= 0 && ci < leafColumns.length) {
            const nextCol = leafColumns[ci];
            if (isCellEditable(nextCol, nextRecord, nextRowIdx)) {
              const rKey = String(getRowKey(nextRecord, nextRowIdx));
              const colKey = columnFieldKey(nextCol) || String(nextCol.key) || '';
              setEditingCell({ rowKey: rKey, columnKey: colKey });
              return;
            }
            ci += direction;
          }
        }

        // No editable cell found, exit
        setEditingCell(null);
      }
    },
    [displayData, leafColumns, getRowKey, isCellEditable, setEditingCell]
  );

  return {
    processedData,
    displayData,
    leafColumns,
    headerRows,
    sortState,
    handleSort,
    columnFilters,
    handleColumnFilter,
    currentPage,
    pageSize,
    totalItems,
    setCurrentPage,
    paginationRange,
    selectedRowKeys,
    handleSelectAll,
    handleSelectRow,
    isAllSelected,
    expandedRowKeys: expandedKeys,
    handleToggleExpand,
    isRowExpandable,
    virtualEnabled,
    scrollContainerRef,
    virtualSlice,
    columnWidths,
    handleResizeStart,
    resizingColumn,
    stickyConfig,
    hasSummary,
    editingCell,
    isCellEditing,
    isCellEditable,
    handleCellClick,
    handleCellSave,
    handleCellCancel,
    handleCellKeyNav,
    getRowKey,
    getValue,
    visibleColumns,
    totalColSpan,
  };
}
