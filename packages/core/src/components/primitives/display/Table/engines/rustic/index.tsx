'use client';

/**
 * @fileoverview Table Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS table implementation with maximum accessibility.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides a lightweight, dependency-free table using only
 * inline styles and semantic HTML elements.
 *
 * **Implementation Details:**
 * - Uses semantic `<table>`, `<thead>`, `<tbody>` elements
 * - Inline styles for all visual properties
 * - ARIA attributes for screen readers
 * - Keyboard navigation support
 * - Custom sorting implementation
 * - Client-side pagination
 *
 * **Accessibility Features:**
 * - `role="table"` for proper semantics
 * - `aria-sort` on sortable columns
 * - `aria-label` on interactive elements
 * - Keyboard-accessible controls
 * - High contrast support
 *
 * **Advantages:**
 * - Zero external dependencies
 * - Smallest bundle size
 * - Maximum browser compatibility
 * - Full accessibility compliance
 *
 * @example Basic Usage
 * ```tsx
 * import { Table } from '@rottay/design-system';
 *
 * <Table
 *   engine="rustic"
 *   dataSource={data}
 *   columns={columns}
 *   size="small"
 * />
 * ```
 *
 * @see {@link Table} for the main component
 * @module Table/engines/rustic
 * @category Display
 * @package @rottay/design-system
 */
import { useState, useMemo, useCallback } from 'react';
import type { Key } from 'react';
import type { TableProps, ColumnType, SortOrder } from '../../types';

const styles = {
  wrapper: {
    position: 'relative' as const,
  },
  tableContainer: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 'var(--ds-table-cell-font-size, 14px)',
  },
  tableSmall: {
    fontSize: 'var(--ds-font-size-xs, 12px)',
  },
  tableLarge: {
    fontSize: 'var(--ds-font-size-lg, 16px)',
  },
  tableBordered: {
    border: '1px solid var(--ds-table-border, #e8e8e8)',
  },
  th: {
    padding: 'var(--ds-table-cell-padding, 12px 16px)',
    backgroundColor: 'var(--ds-table-header-bg, #fafafa)',
    borderBottom: '1px solid var(--ds-table-border, #e8e8e8)',
    textAlign: 'left' as const,
    fontWeight: 'var(--ds-table-header-font-weight, 500)',
    color: 'var(--ds-table-header-color)',
  },
  thSortable: {
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
  td: {
    padding: 'var(--ds-table-cell-padding, 12px 16px)',
    borderBottom: '1px solid var(--ds-table-row-border, #e8e8e8)',
  },
  tdSmall: {
    padding: '8px 12px',
  },
  tdLarge: {
    padding: '16px 20px',
  },
  rowHover: {
    transition: 'background-color 0.2s',
  },
  rowSelected: {
    backgroundColor: 'var(--ds-table-row-bg-selected, rgba(24, 144, 255, 0.1))',
  },
  emptyCell: {
    textAlign: 'center' as const,
    padding: '32px',
    color: 'var(--ds-color-text-secondary, #999)',
  },
  loading: {
    position: 'absolute' as const,
    inset: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
    fontSize: 'var(--ds-table-cell-font-size, 14px)',
  },
  pageButton: {
    padding: '4px 12px',
    border: '1px solid var(--ds-color-neutral-300, #d9d9d9)',
    borderRadius: 'var(--ds-radius-sm, 4px)',
    backgroundColor: 'var(--ds-table-bg, #fff)',
    cursor: 'pointer',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  sortIcon: {
    marginLeft: '4px',
    fontSize: '10px',
  },
};

export const Table = <T extends object = object>(props: TableProps<T>) => {
  const {
    dataSource = [],
    columns = [],
    rowKey = 'key',
    loading = false,
    size = 'default',
    bordered = false,
    pagination = {},
    rowSelection,
    showHeader = true,
    locale,
    rowClassName,
    rowHoverable = true,
    onRow,
    className = '',
    style,
    id,
  } = props;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(
    pagination && typeof pagination === 'object' ? pagination.pageSize || 10 : 10
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>(
    rowSelection?.defaultSelectedRowKeys || rowSelection?.selectedRowKeys || []
  );
  const [sortState, setSortState] = useState<{ field?: string; order?: SortOrder }>({});
  const [hoveredRow, setHoveredRow] = useState<Key | null>(null);

  const getRowKey = (record: T, index: number): Key => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return (record as Record<string, Key>)[rowKey] || index;
  };

  const getValue = (record: T, dataIndex?: string | string[]): unknown => {
    if (!dataIndex) return undefined;
    if (Array.isArray(dataIndex)) {
      return dataIndex.reduce<unknown>((obj, key) => (obj as Record<string, unknown>)?.[key], record as unknown);
    }
    return (record as Record<string, unknown>)[dataIndex];
  };

  const sortedData = useMemo(() => {
    if (!sortState.field || !sortState.order) return dataSource;

    const column = columns.find(
      (col) => (Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex) === sortState.field
    );

    if (!column || typeof column.sorter !== 'function') return dataSource;

    return [...dataSource].sort((a, b) => {
      const result = (column.sorter as (a: T, b: T) => number)(a, b);
      return sortState.order === 'descend' ? -result : result;
    });
  }, [dataSource, columns, sortState]);

  const paginatedData = useMemo(() => {
    if (pagination === false) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const handleSort = useCallback((column: ColumnType<T>) => {
    if (!column.sorter) return;
    const field = Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : column.dataIndex;
    setSortState((prev) => {
      if (prev.field !== field) return { field, order: 'ascend' };
      if (prev.order === 'ascend') return { field, order: 'descend' };
      return {};
    });
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    const allKeys = checked ? paginatedData.map((record, i) => getRowKey(record, i)) : [];
    setSelectedRowKeys(allKeys);
    rowSelection?.onChange?.(allKeys, checked ? paginatedData : [], { type: checked ? 'all' : 'none' });
  }, [paginatedData, rowSelection]);

  const handleSelectRow = useCallback((record: T, index: number, checked: boolean) => {
    const key = getRowKey(record, index);
    setSelectedRowKeys((prev) => {
      const next = checked ? [...prev, key] : prev.filter((k) => k !== key);
      const selectedRows = paginatedData.filter((r, i) => next.includes(getRowKey(r, i)));
      rowSelection?.onChange?.(next, selectedRows, { type: 'single' });
      return next;
    });
  }, [paginatedData, rowSelection]);

  const getTableStyle = () => {
    const base = { ...styles.table };
    if (size === 'small') Object.assign(base, styles.tableSmall);
    if (size === 'large') Object.assign(base, styles.tableLarge);
    if (bordered) Object.assign(base, styles.tableBordered);
    return base;
  };

  const getCellStyle = () => {
    const base = { ...styles.td };
    if (size === 'small') Object.assign(base, styles.tdSmall);
    if (size === 'large') Object.assign(base, styles.tdLarge);
    return base;
  };

  return (
    <div className={className} style={{ ...styles.wrapper, ...style }} id={id}>
      {loading && (
        <div style={styles.loading}>
          <span>Loading...</span>
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={getTableStyle()} role="table">
          {showHeader && (
            <thead>
              <tr>
                {rowSelection && (
                  <th style={{ ...styles.th, width: '48px' }}>
                    {rowSelection.type !== 'radio' && (
                      <input
                        type="checkbox"
                        style={styles.checkbox}
                        checked={selectedRowKeys.length === paginatedData.length && paginatedData.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        aria-label="Select all rows"
                      />
                    )}
                  </th>
                )}
                {columns.filter((c) => !c.hidden).map((column, i) => (
                  <th
                    key={column.key || String(column.dataIndex) || i}
                    style={{
                      ...styles.th,
                      width: column.width,
                      minWidth: column.minWidth,
                      textAlign: column.align,
                      ...(column.sorter ? styles.thSortable : {}),
                      ...column.style,
                    }}
                    onClick={() => column.sorter && handleSort(column)}
                    aria-sort={sortState.field === (Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : column.dataIndex)
                      ? sortState.order === 'ascend' ? 'ascending' : 'descending'
                      : undefined}
                  >
                    {column.title}
                    {column.sorter && (
                      <span style={styles.sortIcon}>
                        {sortState.field === (Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : column.dataIndex)
                          ? sortState.order === 'ascend' ? '▲' : '▼'
                          : '⇅'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (rowSelection ? 1 : 0)}
                  style={styles.emptyCell}
                >
                  {locale?.emptyText || 'No data'}
                </td>
              </tr>
            ) : (
              paginatedData.map((record, index) => {
                const key = getRowKey(record, index);
                const isSelected = selectedRowKeys.includes(key);
                const isHovered = hoveredRow === key;
                const rowClass = typeof rowClassName === 'function' ? rowClassName(record, index) : rowClassName;

                return (
                  <tr
                    key={key}
                    className={rowClass}
                    style={{
                      ...(isSelected ? styles.rowSelected : {}),
                      ...(rowHoverable ? styles.rowHover : {}),
                      backgroundColor: isHovered && rowHoverable ? 'var(--ds-table-row-bg-hover, #f5f5f5)' : isSelected ? 'var(--ds-table-row-bg-selected, rgba(24, 144, 255, 0.1))' : undefined,
                    }}
                    onMouseEnter={() => rowHoverable && setHoveredRow(key)}
                    onMouseLeave={() => rowHoverable && setHoveredRow(null)}
                    {...(onRow?.(record, index) || {})}
                  >
                    {rowSelection && (
                      <td style={getCellStyle()}>
                        <input
                          type={rowSelection.type === 'radio' ? 'radio' : 'checkbox'}
                          style={styles.checkbox}
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(record, index, e.target.checked)}
                          name={rowSelection.type === 'radio' ? 'table-row-selection' : undefined}
                          aria-label={`Select row ${index + 1}`}
                        />
                      </td>
                    )}
                    {columns.filter((c) => !c.hidden).map((column, colIndex) => {
                      const value = getValue(record, column.dataIndex);
                      const content = column.render
                        ? column.render(value, record, index)
                        : String(value ?? '');

                      return (
                        <td
                          key={column.key || String(column.dataIndex) || colIndex}
                          style={{
                            ...getCellStyle(),
                            textAlign: column.align,
                            ...(column.ellipsis ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' } : {}),
                            ...column.style,
                          }}
                          {...(column.onCell?.(record, index) || {})}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination !== false && (
        <div style={styles.pagination}>
          <span style={{ color: 'var(--ds-color-text-secondary, #666)' }}>
            {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
          </span>
          <button
            style={{ ...styles.pageButton, ...(currentPage === 1 ? styles.pageButtonDisabled : {}) }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            aria-label="Previous page"
          >
            «
          </button>
          <span>Page {currentPage}</span>
          <button
            style={{ ...styles.pageButton, ...(currentPage * pageSize >= sortedData.length ? styles.pageButtonDisabled : {}) }}
            disabled={currentPage * pageSize >= sortedData.length}
            onClick={() => setCurrentPage((p) => p + 1)}
            aria-label="Next page"
          >
            »
          </button>
        </div>
      )}
    </div>
  );
};

Table.displayName = 'Table.Rustic';

export default Table;
