'use client';

/**
 * @fileoverview Classic (Titan) engine for the DataTable pattern, built on top
 * of Ant Design's `<Table>` component. Maps the design-system-agnostic
 * `DataTablePatternProps` into Ant Design's column/row/selection/pagination
 * contracts, handling controlled-vs-uncontrolled selection, sort direction
 * mapping, column visibility/resize/reorder/pin, density modes, and
 * bulk-action toolbars entirely within this adapter layer.
 */

import React, { useMemo, useState, useCallback, useRef } from 'react';
import { Table, Space, Button, Empty } from 'antd';
import { GripVertical } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import type { DataTablePatternProps } from '../../contracts';
import { resolveAccessor, resolveRowKey } from '../../runtime/row-resolution';

/** Density → Ant Table size mapping */
const DENSITY_SIZE_MAP = {
  compact: 'small' as const,
  comfortable: 'middle' as const,
  spacious: 'large' as const,
};

/**
 * Ant Design-backed data table that adapts `DataTablePatternProps` into
 * `antd/Table` configuration. Supports selection, sorting, expandable rows,
 * bulk actions, pagination, sticky headers, column visibility/resize/reorder/pin,
 * and density modes out of the box.
 */
export default function ClassicDataTable<T extends object>(
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
    // Column visibility
    columnVisibility,
    visibleColumns,
    lockedColumns,
    // Column resizing
    resizable,
    columnWidths,
    onColumnResize,
    // Column reordering
    reorderable,
    columnOrder,
    onColumnReorder,
    // Column pinning
    pinnedColumns,
    // Density
    density = 'comfortable',
  } = props;

  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;

  // --- Column resize state ---
  const resizeRef = useRef<{
    key: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  // --- Column reorder state ---
  const [dragSourceKey, setDragSourceKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  const rowKeyLookup = useMemo(() => {
    const lookup = new Map<T, string>();
    data.forEach((record, index) => {
      lookup.set(record, resolveRowKey(record, rowKey, index));
    });
    return lookup;
  }, [data, rowKey]);

  // --- Process columns: visibility -> order -> pin -> widths ---
  const processedColumns = useMemo(() => {
    let cols = [...columns];

    // 1. Column visibility filtering
    if (columnVisibility && visibleColumns) {
      const lockedSet = new Set(lockedColumns ?? []);
      const visibleSet = new Set(visibleColumns);
      cols = cols.filter(
        (col) => lockedSet.has(col.key) || visibleSet.has(col.key)
      );
    }

    // 2. Column reordering
    if (reorderable && columnOrder && columnOrder.length > 0) {
      const orderMap = new Map(columnOrder.map((key, i) => [key, i]));
      cols.sort((a, b) => {
        const ai = orderMap.get(a.key) ?? Infinity;
        const bi = orderMap.get(b.key) ?? Infinity;
        return ai - bi;
      });
    }

    return cols;
  }, [columns, columnVisibility, visibleColumns, lockedColumns, reorderable, columnOrder]);

  // --- Resize handlers ---
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, key: string, currentWidth: number) => {
      e.preventDefault();
      e.stopPropagation();
      resizeRef.current = { key, startX: e.clientX, startWidth: currentWidth };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizeRef.current) return;
        const diff = moveEvent.clientX - resizeRef.current.startX;
        const newWidth = Math.max(50, resizeRef.current.startWidth + diff);
        onColumnResize?.(resizeRef.current.key, newWidth);
      };

      const handleMouseUp = () => {
        resizeRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [onColumnResize]
  );

  // --- Column reorder handlers (mouse-event based for cross-browser reliability) ---
  const reorderRef = useRef<{ sourceKey: string } | null>(null);

  const handleReorderStart = useCallback(
    (e: React.MouseEvent, key: string) => {
      if (!reorderable || !onColumnReorder) return;
      e.preventDefault();
      e.stopPropagation();
      reorderRef.current = { sourceKey: key };
      setDragSourceKey(key);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!reorderRef.current) return;
        // Find which Ant th the mouse is over by scanning all th with data-col-key
        const table = (moveEvent.target as HTMLElement)?.closest('.ds-pattern-data-table');
        if (!table) return;
        const ths = table.querySelectorAll<HTMLElement>('[data-col-key]');
        for (const th of ths) {
          const rect = th.getBoundingClientRect();
          if (moveEvent.clientX >= rect.left && moveEvent.clientX <= rect.right) {
            const colKey = th.dataset.colKey;
            if (colKey && colKey !== reorderRef.current.sourceKey) {
              setDragOverKey(colKey);
            }
            break;
          }
        }
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        if (!reorderRef.current) {
          setDragSourceKey(null);
          setDragOverKey(null);
          return;
        }

        // Find drop target
        const table = (upEvent.target as HTMLElement)?.closest('.ds-pattern-data-table');
        let targetKey: string | null = null;
        if (table) {
          const ths = table.querySelectorAll<HTMLElement>('[data-col-key]');
          for (const th of ths) {
            const rect = th.getBoundingClientRect();
            if (upEvent.clientX >= rect.left && upEvent.clientX <= rect.right) {
              targetKey = th.dataset.colKey ?? null;
              break;
            }
          }
        }

        const sourceKey = reorderRef.current.sourceKey;
        reorderRef.current = null;
        setDragSourceKey(null);
        setDragOverKey(null);

        if (!targetKey || targetKey === sourceKey) return;

        const currentOrder = columnOrder && columnOrder.length > 0
          ? columnOrder
          : processedColumns.map((c) => c.key);
        const newOrder = [...currentOrder];
        const sourceIdx = newOrder.indexOf(sourceKey);
        const targetIdx = newOrder.indexOf(targetKey);
        if (sourceIdx === -1 || targetIdx === -1) return;

        newOrder.splice(sourceIdx, 1);
        newOrder.splice(targetIdx, 0, sourceKey);
        onColumnReorder(newOrder);
      };

      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [reorderable, onColumnReorder, columnOrder, processedColumns]
  );

  const handleHeaderDragStart = useCallback(
    (e: React.DragEvent, key: string) => {
      if (!reorderable || !onColumnReorder) {
        e.preventDefault();
        return;
      }

      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-column-resize-handle="true"]')) {
        e.preventDefault();
        return;
      }

      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', key);
      setDragSourceKey(key);
    },
    [reorderable, onColumnReorder],
  );

  const handleHeaderDragOver = useCallback(
    (e: React.DragEvent, key: string) => {
      if (!dragSourceKey || dragSourceKey === key) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverKey(key);
    },
    [dragSourceKey],
  );

  const handleHeaderDrop = useCallback(
    (e: React.DragEvent, targetKey: string) => {
      e.preventDefault();
      const sourceKey = e.dataTransfer.getData('text/plain') || dragSourceKey;
      setDragSourceKey(null);
      setDragOverKey(null);

      if (!sourceKey || sourceKey === targetKey || !onColumnReorder) return;

      const currentOrder = columnOrder && columnOrder.length > 0
        ? columnOrder
        : processedColumns.map((c) => c.key);
      const newOrder = [...currentOrder];
      const sourceIdx = newOrder.indexOf(sourceKey);
      const targetIdx = newOrder.indexOf(targetKey);
      if (sourceIdx === -1 || targetIdx === -1) return;

      newOrder.splice(sourceIdx, 1);
      newOrder.splice(targetIdx, 0, sourceKey);
      onColumnReorder(newOrder);
    },
    [columnOrder, dragSourceKey, onColumnReorder, processedColumns],
  );

  const handleHeaderDragEnd = useCallback(() => {
    setDragSourceKey(null);
    setDragOverKey(null);
  }, []);

  // --- Build Ant columns ---
  // Classic (antd) never stamps `data-col-priority` and never collapses columns
  // via `@container` -- this engine delegates responsive column behavior to
  // antd's own table contract. A declared divergence from `ColumnDef.priority`
  // (foundation/types.ts), which only the modern and rustic engines consume.
  const antColumns: ColumnsType<T> = useMemo(() => {
    const cols: ColumnsType<T> = processedColumns
      .filter((col) => col.visible !== false)
      .map((col) => {
        // Resolve pin: controlled pinnedColumns > column def
        let fixed: 'left' | 'right' | undefined;
        if (pinnedColumns) {
          if (pinnedColumns.left.includes(col.key)) fixed = 'left';
          else if (pinnedColumns.right.includes(col.key)) fixed = 'right';
        } else {
          fixed = col.pin === 'left' ? 'left' : col.pin === 'right' ? 'right' : undefined;
        }

        // Resolve width: controlled columnWidths > column def
        const width = columnWidths?.[col.key] ?? col.width;

        const antCol: any = {
          key: col.key,
          title: col.header,
          dataIndex: col.accessorKey ?? col.key,
          width,
          align: col.align,
          fixed,
          sorter: col.sortable ? true : undefined,
          sortOrder:
            sorting?.key === col.key
              ? sorting.direction === 'asc'
                ? 'ascend'
                : 'descend'
              : undefined,
          render: col.render
            ? (_: unknown, record: T, index: number) =>
                col.render!(resolveAccessor(col, record), record, index)
            : undefined,
          ellipsis: true,
        };

        // Wrap title for reorder + resize
        if (reorderable || resizable) {
          const headerContent = (
            <span
              data-col-key={col.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                position: 'relative',
                userSelect: 'none',
                opacity: dragSourceKey === col.key ? 0.45 : 1,
                backgroundColor: dragOverKey === col.key && dragSourceKey && dragSourceKey !== col.key
                  ? 'color-mix(in srgb, var(--ds-color-primary, #1677ff) 10%, transparent)'
                  : undefined,
                transition: 'opacity 0.2s ease, background-color 0.2s ease',
                borderRadius: 4,
                padding: '0 2px',
                margin: '0 -2px',
                cursor: reorderable && onColumnReorder ? 'grab' : undefined,
              }}
              draggable={reorderable && !!onColumnReorder}
              title={reorderable && onColumnReorder ? `Drag header to move ${typeof col.header === 'string' ? col.header : col.key}` : undefined}
              onDragStart={reorderable && onColumnReorder ? (e) => handleHeaderDragStart(e, col.key) : undefined}
              onDragOver={reorderable && onColumnReorder ? (e) => handleHeaderDragOver(e, col.key) : undefined}
              onDrop={reorderable && onColumnReorder ? (e) => handleHeaderDrop(e, col.key) : undefined}
              onDragEnd={reorderable && onColumnReorder ? handleHeaderDragEnd : undefined}
            >
              {reorderable && onColumnReorder && (
                <span
                  onMouseDown={(e) => handleReorderStart(e, col.key)}
                  title={`Drag to move ${typeof col.header === 'string' ? col.header : col.key}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 18,
                    height: 18,
                    cursor: dragSourceKey ? 'grabbing' : 'grab',
                    opacity: dragSourceKey === col.key ? 0.95 : 0.72,
                    fontSize: 11,
                    lineHeight: 1,
                    flexShrink: 0,
                    marginRight: 4,
                    padding: 0,
                    borderRadius: 5,
                    border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary, #d9d9d9) 76%, transparent)',
                    background: 'color-mix(in srgb, var(--ds-color-bg-primary, #f5f5f5) 34%, transparent)',
                    color: 'var(--ds-color-text-secondary, #595959)',
                    transition: 'opacity 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
                  }}
                  aria-label={`Drag to reorder column ${typeof col.header === 'string' ? col.header : col.key}`}
                  role="button"
                >
                  <GripVertical size={13} strokeWidth={2.2} aria-hidden />
                </span>
              )}
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {col.header}
              </span>
              {dragOverKey === col.key && dragSourceKey !== col.key && (
                <span
                  style={{
                    position: 'absolute',
                    left: -2,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background: 'var(--ds-color-primary, #1677ff)',
                    borderRadius: 1,
                  }}
                />
              )}
            </span>
          );
          antCol.title = headerContent;
        }

        // Resize handle
        if (resizable && onColumnResize) {
          antCol.onHeaderCell = () => ({
            style: { position: 'relative' as const },
          });
          const originalTitle = antCol.title;
          antCol.title = (
            <span style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <span style={{ flex: 1, overflow: 'hidden' }}>{originalTitle}</span>
              <span
                data-column-resize-handle="true"
                role="separator"
                aria-label={`Resize column ${typeof col.header === 'string' ? col.header : col.key}`}
                tabIndex={0}
                style={{
                  position: 'absolute',
                  right: -4,
                  top: 0,
                  bottom: 0,
                  width: 8,
                  cursor: 'col-resize',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseDown={(e) =>
                  handleResizeStart(e, col.key, (typeof width === 'number' ? width : 150))
                }
                onKeyDown={(e) => {
                  if (!onColumnResize) return;
                  const currentW = typeof width === 'number' ? width : 150;
                  if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    onColumnResize(col.key, Math.min(currentW + 10, col.maxWidth ?? 1000));
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    onColumnResize(col.key, Math.max(currentW - 10, col.minWidth ?? 50));
                  }
                }}
              >
                <span
                  style={{
                    width: 1,
                    height: '60%',
                    background: 'rgba(0,0,0,0.12)',
                    borderRadius: 1,
                    transition: 'background 150ms ease',
                  }}
                />
              </span>
            </span>
          );
        }

        return antCol;
      });

    if (actions) {
      cols.push({
        key: '__actions',
        title: '',
        width: 120,
        align: 'right',
        fixed: 'right',
        render: (_: unknown, record: T, index: number) => actions(record, index),
      });
    }

    return cols;
  }, [
    processedColumns,
    actions,
    sorting,
    pinnedColumns,
    columnWidths,
    resizable,
    onColumnResize,
    reorderable,
    dragOverKey,
    dragSourceKey,
    handleResizeStart,
    handleReorderStart,
    handleHeaderDragStart,
    handleHeaderDragOver,
    handleHeaderDrop,
    handleHeaderDragEnd,
    onColumnReorder,
  ]);

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

  const paginationConfig =
    pagination === false
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

  // Resolve table size from density (density prop takes precedence over compact boolean)
  const tableSize = density !== 'comfortable'
    ? DENSITY_SIZE_MAP[density]
    : compact
      ? 'small'
      : 'middle';

  const densityClass = `ds-table-density-${density}`;

  return (
    <div
      className={`ds-pattern-data-table ds-engine-classic ${densityClass} ${className ?? ''}`}
      style={{ width: '100%', ...style }}
    >
      {header}
      {(toolbar || (bulkActions && selectedKeys.length > 0)) && (
        <div
          className="ds-pattern-data-table__toolbar"
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>{toolbar}</div>
          {bulkActions && selectedKeys.length > 0 && (
            <Space>
              <span
                style={{
                  color: 'var(--ds-color-neutral-500)',
                  fontSize: 'var(--ds-font-size-sm)',
                }}
              >
                {selectedKeys.length} selected
              </span>
              {bulkActions.map((action) => (
                <Button
                  key={action.key}
                  danger={action.variant === 'danger'}
                  type={action.variant === 'primary' ? 'primary' : 'default'}
                  disabled={action.disabled}
                  onClick={() => {
                    const selectedRows = data.filter((row) =>
                      selectedKeys.includes(getRowKey(row))
                    );
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
        size={tableSize}
        sticky={stickyHeader}
        scroll={(() => {
          const hasPinnedColumns = pinnedColumns && (pinnedColumns.left.length > 0 || pinnedColumns.right.length > 0);
          if (maxHeight) return { y: maxHeight, ...(hasPinnedColumns ? { x: 'max-content' as const } : {}) };
          if (hasPinnedColumns) return { x: 'max-content' as const };
          return undefined;
        })()}
        pagination={paginationConfig}
        onChange={handleTableChange}
        locale={{
          emptyText: emptyState ?? <Empty description="No data" />,
        }}
        rowSelection={
          selectable
            ? {
                type: 'checkbox',
                selectedRowKeys: selectedKeys,
                onChange: handleSelectionChange,
              }
            : undefined
        }
        expandable={
          expandedRow
            ? {
                expandedRowRender: (record: T) => expandedRow(record),
              }
            : undefined
        }
        onRow={(record, index) => ({
          onClick: onRowClick ? () => onRowClick(record, index ?? 0) : undefined,
          style: {
            cursor: onRowClick ? 'pointer' : undefined,
            background:
              striped && (index ?? 0) % 2 === 1
                ? 'var(--ds-color-neutral-50)'
                : undefined,
          },
        })}
        className={hoverable ? 'ds-table-hoverable' : undefined}
      />
      {footer}
    </div>
  );
}
