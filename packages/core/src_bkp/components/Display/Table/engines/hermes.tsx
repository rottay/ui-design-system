/**
 * Hermes Table Engine
 *
 * DaisyUI table implementation with unified TableProps.
 */

'use client';

import type { TableProps, TableColumn } from '../../../../types/components/table';

/**
 * Hermes Table - DaisyUI implementation with unified TableProps
 */
function HermesTable<T extends Record<string, any>>({
  data = [],
  columns = [],
  className = '',
  loading,
  rowKey = 'id',
  bordered,
  striped,
  size,
  onRowClick,
  hoverable = true,
  emptyText = 'No data',
  compact,
}: TableProps<T>) {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return String(rowKey(record, index));
    }
    return String(record[rowKey] ?? index);
  };

  const getValue = (record: T, dataIndex?: string | string[]) => {
    if (!dataIndex) return undefined;
    const path = Array.isArray(dataIndex) ? dataIndex : dataIndex.split('.');
    return path.reduce((obj: any, key) => obj?.[key], record);
  };

  // Map unified size to DaisyUI classes
  const sizeClass = {
    small: 'table-xs',
    medium: '',
    large: 'table-lg',
  }[size ?? 'medium'];

  const tableClasses = [
    'table',
    sizeClass,
    striped && 'table-zebra',
    (compact || size === 'small') && 'table-compact',
    hoverable && 'table-pin-rows',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${bordered ? 'border border-base-300 rounded-lg' : ''}`}>
      <table className={tableClasses}>
        <thead>
          <tr>
            {columns.map((column: TableColumn<T>) => (
              <th
                key={column.key ?? String(column.dataIndex)}
                className={column.headerClassName}
                style={{ width: column.width }}
              >
                {column.renderHeader ? column.renderHeader() : column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-gray-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((record, index) => (
              <tr
                key={getRowKey(record, index)}
                className={hoverable ? 'hover cursor-pointer' : ''}
                onClick={() => onRowClick?.(record, index)}
              >
                {columns.map((column: TableColumn<T>) => {
                  const value = getValue(record, column.dataIndex);
                  return (
                    <td
                      key={column.key ?? String(column.dataIndex)}
                      className={column.className}
                      style={{ textAlign: column.align }}
                    >
                      {column.render
                        ? column.render(value, record, index)
                        : String(value ?? '')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

HermesTable.displayName = 'HermesTable';

export default HermesTable;
