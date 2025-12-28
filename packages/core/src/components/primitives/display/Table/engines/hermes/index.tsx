'use client';

/**
 * @fileoverview Table Hermes Engine - Rottay Design System
 * @description DaisyUI/Tailwind-based table with responsive design.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses DaisyUI's table classes with Tailwind utilities
 * for lightweight, responsive table rendering.
 *
 * **Implementation Details:**
 * - Uses DaisyUI `table` class for container
 * - Uses `table-xs`, `table-md`, `table-lg` for sizes
 * - Uses `table-zebra` for striped rows
 * - Custom sorting implementation
 * - Client-side pagination
 * - Checkbox/radio row selection
 *
 * **Class Mappings:**
 * - `table` - Base table styling
 * - `table-zebra` - Alternating row colors
 * - `overflow-x-auto` - Horizontal scroll
 * - `join` - Pagination button group
 *
 * **Advantages:**
 * - Lightweight CSS-only styling
 * - Responsive by default
 * - DaisyUI theme integration
 * - Tailwind utility compatibility
 *
 * @example Basic Usage
 * ```tsx
 * import { Table } from '@rottay/design-system';
 *
 * <Table
 *   engine="hermes"
 *   dataSource={data}
 *   columns={columns}
 *   bordered
 * />
 * ```
 *
 * @see {@link Table} for the main component
 * @see {@link https://daisyui.com/components/table/} DaisyUI Table
 * @module Table/engines/hermes
 * @category Display
 * @package @rottay/design-system
 */
import { useState, useMemo, useCallback } from 'react';
import type { Key } from 'react';
import type { TableProps, ColumnType, SortOrder } from '../../types';

const sizeClasses = {
  small: 'table-xs',
  default: 'table-md',
  large: 'table-lg',
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
      rowSelection?.onChange?.(next, selectedRows, { type: checked ? 'single' : 'single' });
      return next;
    });
  }, [paginatedData, rowSelection]);

  const sizeClass = sizeClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];

  return (
    <div className={className} style={style} id={id}>
      {loading && (
        <div className="absolute inset-0 bg-base-100/50 flex items-center justify-center z-10">
          <span className="loading loading-spinner loading-md" />
        </div>
      )}

      <div className={`overflow-x-auto ${loading ? 'opacity-50' : ''}`}>
        <table className={`table ${sizeClass} ${bordered ? 'border border-base-300' : ''} ${rowHoverable ? 'table-zebra' : ''}`}>
          {showHeader && (
            <thead>
              <tr>
                {rowSelection && (
                  <th className="w-12">
                    {rowSelection.type !== 'radio' && (
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={selectedRowKeys.length === paginatedData.length && paginatedData.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    )}
                  </th>
                )}
                {columns.filter((c) => !c.hidden).map((column, i) => (
                  <th
                    key={column.key || String(column.dataIndex) || i}
                    className={`${column.className || ''} ${column.sorter ? 'cursor-pointer select-none' : ''}`}
                    style={{ width: column.width, minWidth: column.minWidth, textAlign: column.align, ...column.style }}
                    onClick={() => column.sorter && handleSort(column)}
                  >
                    <div className="flex items-center gap-1">
                      {column.title}
                      {column.sorter && (
                        <span className="text-xs">
                          {sortState.field === (Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : column.dataIndex)
                            ? sortState.order === 'ascend' ? '▲' : '▼'
                            : '⇅'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowSelection ? 1 : 0)} className="text-center py-8 text-base-content/60">
                  {locale?.emptyText || 'No data'}
                </td>
              </tr>
            ) : (
              paginatedData.map((record, index) => {
                const key = getRowKey(record, index);
                const isSelected = selectedRowKeys.includes(key);
                const rowClass = typeof rowClassName === 'function' ? rowClassName(record, index) : rowClassName;

                return (
                  <tr
                    key={key}
                    className={`${rowClass || ''} ${isSelected ? 'bg-primary/10' : ''} ${rowHoverable ? 'hover' : ''}`}
                    {...(onRow?.(record, index) || {})}
                  >
                    {rowSelection && (
                      <td>
                        <input
                          type={rowSelection.type === 'radio' ? 'radio' : 'checkbox'}
                          className={rowSelection.type === 'radio' ? 'radio radio-sm' : 'checkbox checkbox-sm'}
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(record, index, e.target.checked)}
                          name={rowSelection.type === 'radio' ? 'table-row-selection' : undefined}
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
                          className={`${column.className || ''} ${column.ellipsis ? 'truncate max-w-xs' : ''}`}
                          style={{ textAlign: column.align, ...column.style }}
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
        <div className="flex justify-end items-center gap-2 mt-4">
          <span className="text-sm text-base-content/60">
            {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
          </span>
          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              «
            </button>
            <button className="join-item btn btn-sm">Page {currentPage}</button>
            <button
              className="join-item btn btn-sm"
              disabled={currentPage * pageSize >= sortedData.length}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

Table.displayName = 'Table.Hermes';

export default Table;
