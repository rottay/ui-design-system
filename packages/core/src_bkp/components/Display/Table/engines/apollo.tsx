/**
 * Apollo Table Engine
 *
 * Native HTML + Tailwind CSS table implementation.
 * Implements unified TableProps interface.
 */

'use client';

import type { TableProps, TableColumn } from '../../../../types/components/table';
import { cn } from '../../../../utils/cn';

/**
 * Apollo Table - Native HTML + Tailwind implementation with unified TableProps
 */
function ApolloTable<T extends Record<string, any>>({
  data = [],
  columns = [],
  className,
  loading,
  rowKey = 'id',
  bordered = false,
  size = 'medium',
  onRowClick,
  hoverable = true,
  emptyText = 'No data',
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

  const sizeStyles = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const cellPadding = {
    small: 'px-3 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4',
  };

  const tableClasses = cn(
    'w-full',
    bordered && 'border border-gray-200',
    sizeStyles[size],
    className
  );

  if (loading) {
    return (
      <div className="w-full p-8 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={tableClasses}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column: TableColumn<T>) => (
              <th
                key={column.key ?? String(column.dataIndex)}
                className={cn(
                  cellPadding[size],
                  'font-medium text-gray-700 text-left',
                  bordered && 'border-b border-gray-200',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.headerClassName
                )}
                style={{ width: column.width }}
              >
                {column.renderHeader ? column.renderHeader() : column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={cn(cellPadding[size], 'text-center text-gray-400')}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((record, index) => (
              <tr
                key={getRowKey(record, index)}
                className={cn(
                  hoverable && 'hover:bg-gray-50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(record, index)}
              >
                {columns.map((column: TableColumn<T>) => {
                  const value = getValue(record, column.dataIndex);
                  return (
                    <td
                      key={column.key ?? String(column.dataIndex)}
                      className={cn(
                        cellPadding[size],
                        bordered && 'border-b border-gray-200',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.className
                      )}
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

ApolloTable.displayName = 'ApolloTable';

export default ApolloTable;
