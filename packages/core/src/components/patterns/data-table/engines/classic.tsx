'use client';

/**
 * @fileoverview Classic (Titan) engine for the DataTable pattern, built on top
 * of Ant Design's `<Table>` component. It maps the design-system-agnostic
 * `DataTablePatternProps` into Ant Design's column/row/selection/pagination
 * contracts, handling controlled-vs-uncontrolled selection, sort direction
 * mapping, and bulk-action toolbars entirely within this adapter layer.
 *
 * @example
 * <ClassicDataTable
 *   data={users}
 *   columns={[{ key: 'name', header: 'Name', accessorKey: 'name', sortable: true }]}
 *   rowKey="id"
 *   selectable
 *   pagination={{ current: 1, pageSize: 10, total: 100, onChange: handlePage }}
 *   onRowClick={(row) => router.push(`/users/${row.id}`)}
 * />
 */

import React, { useMemo, useState } from 'react';
import { Table, Checkbox, Space, Button, Empty, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DataTablePatternProps } from '../DataTable.types';
import { resolveAccessor, resolveRowKey } from '../DataTable.types';

/**
 * Ant Design-backed data table that adapts `DataTablePatternProps` into
 * `antd/Table` configuration. Supports selection, sorting, expandable rows,
 * bulk actions, pagination, and sticky headers out of the box.
 *
 * @param props - Engine-agnostic table configuration; see {@link DataTablePatternProps}.
 * @returns A fully-featured data table rendered with Ant Design components.
 */
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

  // Internal selection state acts as fallback when the consumer does not provide
  // controlled selection -- this lets the table work standalone or inside a list surface.
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

  // Transform DS-agnostic column definitions into Ant Design's ColumnsType.
  // Filtering out hidden columns here avoids layout shifts when visibility toggles.
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

    // Actions column is pinned right and has no header label so it stays
    // visually subordinate to data columns in the table header.
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

  // Ant Design passes React.Key[] (string | number); we normalise to string[]
  // so consumers always receive a consistent type regardless of rowKey format.
  const handleSelectionChange = (keys: React.Key[], rows: T[]) => {
    const strKeys = keys.map(String);
    if (!controlledSelectedKeys) setInternalSelectedKeys(strKeys);
    onSelectionChange?.(strKeys, rows);
  };

  // Ant Table fires onChange for pagination, filters, AND sorting in one callback.
  // We only care about sorting here; pagination is handled separately.
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

  // Three-way config: `false` disables pagination entirely, an object maps to
  // Ant's pagination props, and `undefined` falls back to sensible defaults.
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

  // --- Render ---

  return (
    <div className={`ds-pattern-data-table ds-engine-classic ${className ?? ''}`} style={style}>
      {header}
      {/* Toolbar row only mounts when there is toolbar content or active bulk
          actions -- avoids an empty spacer div when neither is needed. */}
      {(toolbar || (bulkActions && selectedKeys.length > 0)) && (
        <div className="ds-pattern-data-table__toolbar" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>{toolbar}</div>
          {bulkActions && selectedKeys.length > 0 && (
            <Space>
              <span style={{ color: 'var(--ds-color-neutral-500)', fontSize: 'var(--ds-font-size-sm)' }}>
                {selectedKeys.length} selected
              </span>
              {/* Each bulk action button resolves the selected rows at click
                  time (not at render time) so stale closures are avoided when
                  the data array changes between renders. */}
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
      {/* Ant Table is the single rendering primitive -- selection, expansion,
          sorting, and pagination are all configured via props rather than
          custom markup, keeping this engine thin. */}
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
        // onRow applies per-row styles for click cursor and zebra striping.
        // Ant Design passes `undefined` for index on virtual rows, so we
        // default to 0 to prevent NaN-based CSS glitches.
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
