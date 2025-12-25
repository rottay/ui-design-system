/**
 * Titan Table Engine
 *
 * Adapter that converts unified TableProps to Ant Design Table.
 */

'use client';

import { Table as AntTable } from 'antd';
import type { TablePaginationConfig as AntPaginationConfig } from 'antd/es/table/interface';
import type { TableProps, TableColumn } from '../../../../types/components/table';

/**
 * Titan Table - Ant Design implementation with unified TableProps
 */
function TitanTable<T extends Record<string, any>>({
  data,
  columns,
  className,
  loading,
  rowKey,
  bordered,
  size,
  pagination,
  rowSelection,
  onRowClick,
  rowClassName,
  scroll,
  emptyText,
  onChange,
}: TableProps<T>) {
  // Map unified columns to AntD columns
  const antColumns = columns?.map((col: TableColumn<T>) => ({
    ...col,
    dataIndex: col.dataIndex,
    sorter: col.sorter ?? col.sortable,
    filters: col.filters?.map((f) => ({ text: f.label, value: f.value })),
    onFilter: col.onFilter,
  }));

  // Map unified size to AntD size
  const antSize = size === 'medium' ? 'middle' : size;

  // Map rowKey - wrap function to handle optional index
  const antRowKey = typeof rowKey === 'function'
    ? (record: T, index?: number) => rowKey(record, index ?? 0)
    : rowKey;

  // Map pagination - convert position string to AntD array format
  const antPagination: false | AntPaginationConfig | undefined = pagination === false
    ? false
    : pagination
      ? {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: pagination.onChange,
          pageSizeOptions: pagination.pageSizeOptions,
          showSizeChanger: pagination.showSizeChanger,
          showTotal: typeof pagination.showTotal === 'function' ? pagination.showTotal : undefined,
          disabled: pagination.disabled,
          hideOnSinglePage: pagination.hideOnSinglePage,
          position: pagination.position
            ? [pagination.position === 'both' ? 'topRight' : pagination.position === 'top' ? 'topRight' : 'bottomRight']
            : undefined,
        }
      : undefined;

  // Map rowSelection - adapt onChange signature
  const antRowSelection = rowSelection
    ? {
        ...rowSelection,
        onChange: rowSelection.onChange
          ? (selectedRowKeys: React.Key[], selectedRows: T[]) => {
              rowSelection.onChange?.(selectedRowKeys as (string | number)[], selectedRows);
            }
          : undefined,
      }
    : undefined;

  // Handle row click via onRow
  const onRow = onRowClick
    ? (record: T, index?: number) => ({
        onClick: () => onRowClick(record, index ?? 0),
      })
    : undefined;

  // Map onChange callback - adapt signature (AntD has 4 params, unified has 3)
  const antOnChange = onChange
    ? (
        pag: AntPaginationConfig,
        filters: Record<string, unknown>,
        sorter: unknown
      ) => {
        const mappedPag = {
          current: pag.current,
          pageSize: pag.pageSize,
          total: pag.total,
        };
        // Convert sorter to unified format
        const s = sorter as { field?: string; order?: 'ascend' | 'descend' } | null;
        const mappedSorter = s
          ? { field: s.field, order: s.order }
          : {};
        onChange(mappedPag, filters as Record<string, unknown>, mappedSorter);
      }
    : undefined;

  return (
    <AntTable
      dataSource={data}
      columns={antColumns}
      className={className}
      loading={loading}
      rowKey={antRowKey}
      bordered={bordered}
      size={antSize}
      pagination={antPagination}
      rowSelection={antRowSelection}
      onRow={onRow}
      rowClassName={rowClassName}
      scroll={scroll}
      locale={{ emptyText }}
      onChange={antOnChange}
    />
  );
}

TitanTable.displayName = 'TitanTable';

export default TitanTable;
