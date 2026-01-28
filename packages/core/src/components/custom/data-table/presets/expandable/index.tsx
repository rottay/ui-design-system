'use client';

/**
 * DataTable - Expandable Preset
 * Full-featured table with expandable rows, sorting, filtering, search, selection and pagination
 */

import { useState, useMemo, useCallback, type ReactNode, type ChangeEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { DataTableProps } from '../../core';

export interface FilterOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface RowAction<T = Record<string, unknown>> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (record: T, index: number) => void;
  hidden?: (record: T) => boolean;
  danger?: boolean;
}

export interface BulkAction<T = Record<string, unknown>> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (selectedRecords: T[]) => void;
  danger?: boolean;
}

export interface ExpandableDataTableProps<T = Record<string, unknown>> extends DataTableProps<T> {
  /** Render function for expanded row content */
  expandedRowRender?: (record: T, index: number) => ReactNode;
  /** Filter options for toolbar */
  filters?: FilterOption[];
  /** Current filter value */
  filterValue?: string;
  /** Filter change handler */
  onFilterChange?: (value: string) => void;
  /** Filter label shown before buttons */
  filterLabel?: string;
  /** Items per page options */
  pageSizeOptions?: number[];
  /** Row actions */
  rowActions?: RowAction<T>[];
  /** Bulk actions for selected rows */
  bulkActions?: BulkAction<T>[];
  /** Enable row selection */
  selectable?: boolean;
  /** Selected row keys (controlled) */
  selectedRowKeys?: string[];
  /** Selection change handler */
  onSelectionChange?: (keys: string[], records: T[]) => void;
  /** Searchable fields for internal filtering */
  searchableFields?: (keyof T)[];
  /** Default expanded rows */
  defaultExpandedKeys?: string[];
  /** Show row numbers */
  showRowNumbers?: boolean;
  /** Custom empty state */
  emptyState?: ReactNode;
  /** Table title */
  title?: ReactNode;
  /** Extra content in toolbar */
  toolbarExtra?: ReactNode;
  /** Dense mode - less padding */
  dense?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Max height for scrollable table */
  maxHeight?: string | number;
}

export const ExpandableDataTable = createPreset<ExpandableDataTableProps & Record<string, unknown>>({
  name: 'DataTable.Expandable',
  render: ({ primitives, props, tokens }: PresetContext<ExpandableDataTableProps>) => {
    const { Box, Card, Stack, Button, Badge, Spinner, Checkbox } = primitives;
    const {
      columns,
      data,
      rowKey = 'id',
      loading,
      searchPlaceholder = 'Search...',
      onSearch,
      sortState: controlledSort,
      onSortChange,
      pagination,
      emptyText = 'No data',
      striped,
      compact,
      className,
      style,
      expandedRowRender,
      filters = [],
      filterValue: controlledFilterValue,
      onFilterChange,
      filterLabel,
      pageSizeOptions = [10, 25, 50, 100],
      rowActions = [],
      bulkActions = [],
      selectable = false,
      selectedRowKeys: controlledSelectedKeys,
      onSelectionChange,
      searchableFields = [],
      defaultExpandedKeys = [],
      showRowNumbers = false,
      emptyState,
      title,
      toolbarExtra,
      dense = false,
      stickyHeader = false,
      maxHeight,
    } = props;

    // Internal state
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(defaultExpandedKeys));
    const [internalSort, setInternalSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [internalFilter, setInternalFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(pageSizeOptions[0] || 10);
    const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);

    // Controlled vs uncontrolled
    const sortState = controlledSort ?? internalSort;
    const filterValue = controlledFilterValue ?? internalFilter;
    const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;

    // Helpers
    const getRowKey = useCallback((record: Record<string, unknown>, index: number): string => {
      if (typeof rowKey === 'function') return rowKey(record);
      return String(record[rowKey as string] ?? index);
    }, [rowKey]);

    const getValue = useCallback((record: Record<string, unknown>, dataIndex?: string): unknown => {
      if (!dataIndex) return undefined;
      return dataIndex.split('.').reduce((obj: unknown, key) =>
        (obj as Record<string, unknown>)?.[key], record);
    }, []);

    // Handlers
    const handleSort = useCallback((key: string) => {
      const newDirection = sortState?.key === key && sortState.direction === 'asc' ? 'desc' : 'asc';
      if (!controlledSort) setInternalSort({ key, direction: newDirection });
      onSortChange?.(key, newDirection);
    }, [sortState, controlledSort, onSortChange]);

    const handleFilterChange = useCallback((value: string) => {
      if (!controlledFilterValue) setInternalFilter(value);
      onFilterChange?.(value);
      setCurrentPage(1);
    }, [controlledFilterValue, onFilterChange]);

    const toggleExpand = useCallback((key: string) => {
      setExpandedKeys(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    }, []);

    const handleSelectAll = useCallback((checked: boolean) => {
      const newKeys = checked ? data.map((r, i) => getRowKey(r as Record<string, unknown>, i)) : [];
      if (!controlledSelectedKeys) setInternalSelectedKeys(newKeys);
      onSelectionChange?.(newKeys, checked ? data : []);
    }, [data, controlledSelectedKeys, getRowKey, onSelectionChange]);

    const handleSelectRow = useCallback((key: string, checked: boolean) => {
      const newKeys = checked
        ? [...selectedKeys, key]
        : selectedKeys.filter(k => k !== key);
      if (!controlledSelectedKeys) setInternalSelectedKeys(newKeys);
      const selectedRecords = data.filter((r, i) => newKeys.includes(getRowKey(r as Record<string, unknown>, i)));
      onSelectionChange?.(newKeys, selectedRecords);
    }, [selectedKeys, controlledSelectedKeys, data, getRowKey, onSelectionChange]);

    const handleSearch = useCallback((query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
      setCurrentPage(1);
    }, [onSearch]);

    // Internal search filtering
    const searchFilteredData = useMemo(() => {
      if (!searchQuery || searchableFields.length === 0) return data;
      const query = searchQuery.toLowerCase();
      return data.filter(record => {
        return searchableFields.some(field => {
          const value = getValue(record as Record<string, unknown>, field as string);
          return String(value ?? '').toLowerCase().includes(query);
        });
      });
    }, [data, searchQuery, searchableFields, getValue]);

    // Sorting logic
    const sortedData = useMemo(() => {
      if (!sortState) return searchFilteredData;
      return [...searchFilteredData].sort((a, b) => {
        const aVal = getValue(a as Record<string, unknown>, sortState.key);
        const bVal = getValue(b as Record<string, unknown>, sortState.key);

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        // Handle dates
        if (aVal instanceof Date && bVal instanceof Date) {
          return sortState.direction === 'asc'
            ? aVal.getTime() - bVal.getTime()
            : bVal.getTime() - aVal.getTime();
        }

        // Handle numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortState.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortState.direction === 'asc' ? comparison : -comparison;
      });
    }, [searchFilteredData, sortState, getValue]);

    // Pagination
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedData = useMemo(() => {
      if (pagination && typeof pagination === 'object') {
        return sortedData; // External pagination control
      }
      const start = (currentPage - 1) * pageSize;
      return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize, pagination]);

    // Selection
    const allSelected = data.length > 0 && selectedKeys.length === data.length;
    const someSelected = selectedKeys.length > 0 && selectedKeys.length < data.length;
    const selectedRecords = useMemo(() =>
      data.filter((r, i) => selectedKeys.includes(getRowKey(r as Record<string, unknown>, i))),
      [data, selectedKeys, getRowKey]
    );

    // Styling
    const cellPadding = dense
      ? `${tokens.spacing[1]} ${tokens.spacing[2]}`
      : compact
        ? `${tokens.spacing[2]} ${tokens.spacing[3]}`
        : `${tokens.spacing[3]} ${tokens.spacing[4]}`;

    const headerCellStyle = {
      padding: cellPadding,
      fontWeight: 600,
      fontSize: tokens.typography.fontSize.xs,
      color: tokens.colors.neutral[500],
      borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap' as const,
      position: stickyHeader ? 'sticky' as const : undefined,
      top: stickyHeader ? 0 : undefined,
      backgroundColor: tokens.colors.neutral[50],
      zIndex: stickyHeader ? 10 : undefined,
    };

    const bodyCellStyle = {
      padding: cellPadding,
      fontSize: tokens.typography.fontSize.sm,
      borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
      color: tokens.colors.neutral[700],
    };

    // Calculate extra columns
    const extraColsBefore = (selectable ? 1 : 0) + (showRowNumbers ? 1 : 0) + (expandedRowRender ? 1 : 0);
    const extraColsAfter = rowActions.length > 0 ? 1 : 0;
    const totalCols = columns.length + extraColsBefore + extraColsAfter;

    return (
      <Card variant="outlined" padding="none" className={className} style={style}>
        <Stack direction="vertical" spacing="none">
          {/* Toolbar */}
          <Box style={{
            padding: tokens.spacing[4],
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: tokens.spacing[3],
          }}>
            {/* Left: Title, Record count, filters, bulk actions */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' }}>
              {title && (
                <span style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: 600,
                  color: tokens.colors.neutral[900]
                }}>
                  {title}
                </span>
              )}

              <Badge variant="secondary" size="sm">
                {sortedData.length} {sortedData.length === 1 ? 'record' : 'records'}
              </Badge>

              {/* Bulk actions when items selected */}
              {selectedKeys.length > 0 && bulkActions.length > 0 && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Badge variant="primary" size="sm">{selectedKeys.length} selected</Badge>
                  {bulkActions.map((action) => (
                    <Button
                      key={action.key}
                      size="sm"
                      variant={action.danger ? 'error' : 'ghost'}
                      onClick={() => action.onClick(selectedRecords)}
                      style={{ fontSize: tokens.typography.fontSize.xs }}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </Box>
              )}

              {/* Filters */}
              {filters.length > 0 && selectedKeys.length === 0 && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  {filterLabel && (
                    <span style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[500],
                      fontWeight: 500
                    }}>
                      {filterLabel}
                    </span>
                  )}
                  {filters.map((filter) => (
                    <Button
                      key={filter.value}
                      size="sm"
                      variant={filterValue === filter.value ? 'primary' : 'ghost'}
                      onClick={() => handleFilterChange(filter.value)}
                      style={{
                        borderRadius: '16px',
                        padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                      }}
                    >
                      {filter.icon}
                      {filter.label}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>

            {/* Right: Extra content + Search */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              {toolbarExtra}

              <Box style={{ position: 'relative' }}>
                <svg
                  style={{
                    position: 'absolute',
                    left: tokens.spacing[3],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '16px',
                    height: '16px',
                    color: tokens.colors.neutral[400],
                    pointerEvents: 'none',
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{
                    padding: `${tokens.spacing[2]} ${tokens.spacing[3]} ${tokens.spacing[2]} ${tokens.spacing[8]}`,
                    border: `1px solid ${tokens.colors.neutral[300]}`,
                    borderRadius: '8px',
                    fontSize: tokens.typography.fontSize.sm,
                    minWidth: '220px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    backgroundColor: '#ffffff',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = tokens.colors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${tokens.colors.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = tokens.colors.neutral[300];
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Table Container */}
          <Box style={{
            overflow: 'auto',
            maxHeight: maxHeight,
          }}>
            {loading ? (
              <Box style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing[8] }}>
                <Spinner size="lg" />
              </Box>
            ) : paginatedData.length === 0 ? (
              emptyState || (
                <Box style={{
                  padding: tokens.spacing[8],
                  textAlign: 'center',
                  color: tokens.colors.neutral[500]
                }}>
                  <svg
                    style={{
                      width: '48px',
                      height: '48px',
                      margin: '0 auto',
                      marginBottom: tokens.spacing[3],
                      color: tokens.colors.neutral[300],
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p style={{ margin: 0, fontWeight: 500 }}>{emptyText}</p>
                  {searchQuery && (
                    <p style={{ margin: `${tokens.spacing[2]} 0 0`, fontSize: tokens.typography.fontSize.sm }}>
                      Try adjusting your search or filter criteria
                    </p>
                  )}
                </Box>
              )
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                    {/* Selection checkbox */}
                    {selectable && (
                      <th style={{ ...headerCellStyle, width: '40px', textAlign: 'center' }}>
                        <Checkbox
                          checked={allSelected}
                          indeterminate={someSelected}
                          onChange={(checked: boolean) => handleSelectAll(checked)}
                        />
                      </th>
                    )}

                    {/* Row numbers */}
                    {showRowNumbers && (
                      <th style={{ ...headerCellStyle, width: '50px', textAlign: 'center' }}>#</th>
                    )}

                    {/* Expand toggle */}
                    {expandedRowRender && (
                      <th style={{ ...headerCellStyle, width: '40px' }} />
                    )}

                    {/* Data columns */}
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => col.sortable && handleSort(col.key)}
                        style={{
                          ...headerCellStyle,
                          textAlign: col.align || 'left',
                          cursor: col.sortable ? 'pointer' : undefined,
                          userSelect: col.sortable ? 'none' : undefined,
                          width: col.width,
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {col.title}
                          {col.sortable && (
                            <svg
                              style={{
                                width: '14px',
                                height: '14px',
                                opacity: sortState?.key === col.key ? 1 : 0.3,
                                transform: sortState?.key === col.key && sortState.direction === 'desc' ? 'rotate(180deg)' : undefined,
                                transition: 'transform 0.2s, opacity 0.2s',
                              }}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          )}
                        </span>
                      </th>
                    ))}

                    {/* Actions column */}
                    {rowActions.length > 0 && (
                      <th style={{ ...headerCellStyle, width: '100px', textAlign: 'right' }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((record, index) => {
                    const key = getRowKey(record as Record<string, unknown>, index);
                    const isExpanded = expandedKeys.has(key);
                    const isSelected = selectedKeys.includes(key);
                    const globalIndex = (currentPage - 1) * pageSize + index;
                    const visibleActions = rowActions.filter(a => !a.hidden?.(record));

                    return (
                      <>
                        <tr
                          key={key}
                          style={{
                            backgroundColor: isSelected
                              ? `${tokens.colors.primary}08`
                              : striped && index % 2 === 1
                                ? tokens.colors.neutral[50]
                                : undefined,
                            transition: 'background-color 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = tokens.colors.neutral[100];
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isSelected
                              ? `${tokens.colors.primary}08`
                              : striped && index % 2 === 1
                                ? tokens.colors.neutral[50]
                                : '';
                          }}
                        >
                          {/* Selection checkbox */}
                          {selectable && (
                            <td style={{ ...bodyCellStyle, textAlign: 'center' }}>
                              <Checkbox
                                checked={isSelected}
                                onChange={(checked: boolean) => handleSelectRow(key, checked)}
                              />
                            </td>
                          )}

                          {/* Row number */}
                          {showRowNumbers && (
                            <td style={{ ...bodyCellStyle, textAlign: 'center', color: tokens.colors.neutral[400] }}>
                              {globalIndex + 1}
                            </td>
                          )}

                          {/* Expand toggle */}
                          {expandedRowRender && (
                            <td
                              style={{ ...bodyCellStyle, cursor: 'pointer' }}
                              onClick={() => toggleExpand(key)}
                            >
                              <svg
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  color: tokens.colors.neutral[400],
                                  transition: 'transform 0.2s',
                                  transform: isExpanded ? 'rotate(90deg)' : undefined,
                                }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </td>
                          )}

                          {/* Data cells */}
                          {columns.map((col) => {
                            const value = getValue(record as Record<string, unknown>, col.dataIndex as string);
                            return (
                              <td
                                key={col.key}
                                style={{
                                  ...bodyCellStyle,
                                  textAlign: col.align || 'left',
                                }}
                              >
                                {col.render ? col.render(value, record, globalIndex) : String(value ?? '')}
                              </td>
                            );
                          })}

                          {/* Actions */}
                          {rowActions.length > 0 && (
                            <td style={{ ...bodyCellStyle, textAlign: 'right' }}>
                              <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.spacing[1] }}>
                                {visibleActions.map((action) => (
                                  <Button
                                    key={action.key}
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                                      e.stopPropagation();
                                      action.onClick(record, globalIndex);
                                    }}
                                    style={{
                                      padding: tokens.spacing[1],
                                      color: action.danger ? tokens.colors.error : tokens.colors.neutral[500],
                                    }}
                                    title={action.label}
                                  >
                                    {action.icon || action.label}
                                  </Button>
                                ))}
                              </Box>
                            </td>
                          )}
                        </tr>

                        {/* Expanded content */}
                        {expandedRowRender && isExpanded && (
                          <tr key={`${key}-expanded`}>
                            <td
                              colSpan={totalCols}
                              style={{
                                padding: 0,
                                borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
                                backgroundColor: tokens.colors.neutral[50],
                              }}
                            >
                              <Box style={{ padding: tokens.spacing[4] }}>
                                {expandedRowRender(record, globalIndex)}
                              </Box>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Box>

          {/* Pagination */}
          {paginatedData.length > 0 && (
            <Box style={{
              padding: tokens.spacing[4],
              borderTop: `1px solid ${tokens.colors.neutral[200]}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: tokens.spacing[3],
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                  Rows per page:
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  style={{
                    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                    border: `1px solid ${tokens.colors.neutral[300]}`,
                    borderRadius: '4px',
                    fontSize: tokens.typography.fontSize.sm,
                    cursor: 'pointer',
                    backgroundColor: '#ffffff',
                  }}
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  marginLeft: tokens.spacing[2]
                }}>
                  Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
                </span>
              </Box>

              {pagination && typeof pagination === 'object' ? (
                <Box>
                  {/* External pagination control passed as prop */}
                </Box>
              ) : (
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  {/* First page */}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    style={{ padding: tokens.spacing[2] }}
                    title="First page"
                  >
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </Button>

                  {/* Previous page */}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    style={{ padding: tokens.spacing[2] }}
                    title="Previous page"
                  >
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>

                  {/* Page indicator */}
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600],
                    padding: `0 ${tokens.spacing[2]}`,
                  }}>
                    Page {currentPage} of {totalPages || 1}
                  </span>

                  {/* Next page */}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    style={{ padding: tokens.spacing[2] }}
                    title="Next page"
                  >
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>

                  {/* Last page */}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    style={{ padding: tokens.spacing[2] }}
                    title="Last page"
                  >
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </Card>
    );
  },
});
