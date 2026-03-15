'use client';

/**
 * DataTable - Classic Engine (Ant Design)
 */

import React, { useMemo, useState } from 'react';
import { Table, Checkbox, Space, Button, Empty, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DataTablePatternProps } from '../../types';
import { resolveAccessor, resolveRowKey } from '../../types';

export default function ClassicDataTable<T extends Record<string, unknown>>(
  props: DataTablePatternProps<T>
) {
  const {
    data,
    columns,
    rowKey,
    toolbar,
    actions,
    bulkActions,
    emptyState,
    expandedRow,
    header,
    footer,
    selectable,
    selectedKeys: controlledSelectedKeys,
    onSelectionChange,
    onRowClick,
    sorting,
    onSortChange,
    pagination,
    loading,
    striped,
    bordered,
    compact,
    stickyHeader,
    maxHeight,
    hoverable = true,
    className,
    style,
  } = props;

  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;

  /**
   * Ant Design deprecated the `(record, index)` rowKey signature. We precompute
   * stable keys once per data array so the table can consume a single-argument
   * lookup and still preserve index-based fallback behavior when callers do not
   * provide an explicit row key.
   */
  const rowKeyLookup = useMemo(() => {
    const lookup = new Map<T, string>();
    data.forEach((record, index) => {
      lookup.set(record, resolveRowKey(record, rowKey, index));
    });
    return lookup;
  }, [data, rowKey]);

  const antColumns: ColumnsType<T> = useMemo(() => {
    const cols: ColumnsType<T> = columns
      .filter((col) => col.visible !== false)
      .map((col) => ({
        key: col.key,
        title: col.header,
        dataIndex: col.accessorKey ?? col.key,
        width: col.width,
        align: col.align,
        fixed: col.pin === 'left' ? ('left' as const) : col.pin === 'right' ? ('right' as const) : undefined,
        sorter: col.sortable ? true : undefined,
        sortOrder: sorting?.key === col.key
          ? sorting.direction === 'asc' ? 'ascend' : 'descend'
          : undefined,
        render: col.render
          ? (_: unknown, record: T, index: number) => col.render!(resolveAccessor(col, record), record, index)
          : undefined,
      }));

    if (actions) {
      cols.push({
        key: '__actions',
        title: '',
        width: 'auto',
        align: 'right',
        fixed: 'right',
        render: (_: unknown, record: T, index: number) => actions(record, index),
      });
    }

    return cols;
  }, [columns, actions, sorting]);

  const handleSelectionChange = (keys: React.Key[], rows: T[]) => {
    const strKeys = keys.map(String);
    if (!controlledSelectedKeys) setInternalSelectedKeys(strKeys);
    onSelectionChange?.(strKeys, rows);
  };

  const handleTableChange = (_pagination: unknown, _filters: unknown, sorter: any) => {
    if (sorter?.columnKey && onSortChange) {
      onSortChange({
        key: String(sorter.columnKey),
        direction: sorter.order === 'ascend' ? 'asc' : 'desc',
      });
    }
  };

  const getRowKey = (record: T): string => {
    return rowKeyLookup.get(record) ?? '';
  };

  const paginationConfig = pagination === false
    ? false
    : pagination
      ? {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          pageSizeOptions: pagination.pageSizeOptions?.map(String),
          showSizeChanger: true,
          onChange: pagination.onChange,
        }
      : { pageSize: 20, showSizeChanger: true };

  return (
    <div className={`ds-pattern-data-table ds-engine-classic ${className ?? ''}`} style={style}>
      {header}
      {(toolbar || (bulkActions && selectedKeys.length > 0)) && (
        <div className="ds-pattern-data-table__toolbar" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>{toolbar}</div>
          {bulkActions && selectedKeys.length > 0 && (
            <Space>
              <span style={{ color: 'var(--ds-color-neutral-500)', fontSize: 'var(--ds-font-size-sm)' }}>
                {selectedKeys.length} selected
              </span>
              {bulkActions.map((action) => (
                <Button
                  key={action.key}
                  danger={action.variant === 'danger'}
                  type={action.variant === 'primary' ? 'primary' : 'default'}
                  disabled={action.disabled}
                  onClick={() => {
                    const selectedRows = data.filter((row) => selectedKeys.includes(getRowKey(row)));
                    action.onExecute(selectedRows);
                  }}
                  icon={action.icon}
                  size="small"
                >
                  {action.label}
                </Button>
              ))}
            </Space>
          )}
        </div>
      )}
      <Table<T>
        columns={antColumns}
        dataSource={data}
        rowKey={getRowKey}
        loading={loading}
        bordered={bordered}
        size={compact ? 'small' : 'middle'}
        sticky={stickyHeader}
        scroll={maxHeight ? { y: maxHeight } : undefined}
        pagination={paginationConfig}
        onChange={handleTableChange}
        locale={{
          emptyText: emptyState ?? <Empty description="No data" />,
        }}
        rowSelection={selectable ? {
          type: 'checkbox',
          selectedRowKeys: selectedKeys,
          onChange: handleSelectionChange,
        } : undefined}
        expandable={expandedRow ? {
          expandedRowRender: (record: T) => expandedRow(record),
        } : undefined}
        onRow={(record, index) => ({
          onClick: onRowClick ? () => onRowClick(record, index ?? 0) : undefined,
          style: {
            cursor: onRowClick ? 'pointer' : undefined,
            background: striped && ((index ?? 0) % 2 === 1) ? 'var(--ds-color-neutral-50)' : undefined,
          },
        })}
        className={hoverable ? 'ds-table-hoverable' : undefined}
      />
      {footer}
    </div>
  );
}
