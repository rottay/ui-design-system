'use client';

/**
 * @fileoverview Modern (Hermes) engine for the DataTable pattern, built with
 * native HTML `<table>` elements styled via DaisyUI and Tailwind CSS utility
 * classes. Unlike the Classic engine this implementation manages row expansion,
 * selection checkboxes, and pagination controls directly rather than delegating
 * to a library -- giving full control over markup and animation classes.
 *
 * Supports column visibility, resizing, reordering (HTML5 drag & drop),
 * pinning (sticky positioning), and density modes.
 *
 * @example
 * <ModernDataTable
 *   data={orders}
 *   columns={[{ key: 'total', header: 'Total', accessorKey: 'total', sortable: true }]}
 *   rowKey="orderId"
 *   selectable
 *   striped
 *   resizable
 *   reorderable
 *   density="comfortable"
 *   expandedRow={(row) => <OrderDetails order={row} />}
 *   pagination={{ current: 1, pageSize: 25, total: 200, onChange: setPage }}
 * />
 */

import React, { useMemo, useState, useCallback, useRef } from 'react';
import type { DataTablePatternProps } from '../DataTable.types';
import { resolveAccessor, resolveRowKey } from '../DataTable.types';

/** Density -> cell padding mapping */
const DENSITY_PADDING_MAP = {
  compact: '6px 8px',
  comfortable: '12px',
  spacious: '16px 14px',
} as const;

/**
 * DaisyUI/Tailwind-backed data table that renders native HTML table elements
 * with utility classes. Manages selection, expand/collapse, sorting, pagination,
 * column visibility, resizing, reordering, pinning, and density internally --
 * no third-party table library required.
 *
 * @param props - Engine-agnostic table configuration; see {@link DataTablePatternProps}.
 * @returns A data table rendered with DaisyUI-styled native HTML elements.
 */
export default function ModernDataTable<T extends object>(
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
    visibleColumns: visibleColumnKeys,
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

  // ---------------------------------------------------------------------------
  // Internal state
  // ---------------------------------------------------------------------------

  // Uncontrolled selection fallback -- lets the table work standalone without
  // the consumer needing to lift selection state.
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);
  // Expanded rows tracked as a Set for O(1) has/add/delete during toggle.
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
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

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const getRowKey = useCallback(
    (row: T, index: number) => resolveRowKey(row, rowKey, index),
    [rowKey]
  );

  // --- Process columns: visibility filter -> reorder sort ---
  const processedColumns = useMemo(() => {
    let cols = [...columns];

    // 1. Column visibility filtering
    if (columnVisibility && visibleColumnKeys) {
      const lockedSet = new Set(lockedColumns ?? []);
      const visibleSet = new Set(visibleColumnKeys);
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
  }, [columns, columnVisibility, visibleColumnKeys, lockedColumns, reorderable, columnOrder]);

  // Pre-filter once so the render loop and colSpan calculations always agree.
  const visibleColumns = useMemo(
    () => processedColumns.filter((c) => c.visible !== false),
    [processedColumns]
  );

  // ---------------------------------------------------------------------------
  // Resize handlers
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Column drag handlers (HTML5 drag & drop)
  // ---------------------------------------------------------------------------

  const handleDragStart = useCallback((e: React.DragEvent, key: string) => {
    setDragSourceKey(key);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', key);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, key: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverKey(key);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragSourceKey(null);
    setDragOverKey(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetKey: string) => {
      e.preventDefault();
      const sourceKey = e.dataTransfer.getData('text/plain');
      if (!sourceKey || sourceKey === targetKey) {
        setDragSourceKey(null);
        setDragOverKey(null);
        return;
      }

      const currentOrder = columnOrder ?? processedColumns.map((c) => c.key);
      const newOrder = [...currentOrder];
      const sourceIdx = newOrder.indexOf(sourceKey);
      const targetIdx = newOrder.indexOf(targetKey);
      if (sourceIdx === -1 || targetIdx === -1) return;

      newOrder.splice(sourceIdx, 1);
      newOrder.splice(targetIdx, 0, sourceKey);
      onColumnReorder?.(newOrder);
      setDragSourceKey(null);
      setDragOverKey(null);
    },
    [columnOrder, processedColumns, onColumnReorder]
  );

  // ---------------------------------------------------------------------------
  // Pin helpers
  // ---------------------------------------------------------------------------

  /** Resolve the pin side for a column (controlled pinnedColumns > column def) */
  const getPinSide = useCallback(
    (colKey: string, colPin?: 'left' | 'right'): 'left' | 'right' | undefined => {
      if (pinnedColumns) {
        if (pinnedColumns.left.includes(colKey)) return 'left';
        if (pinnedColumns.right.includes(colKey)) return 'right';
        return undefined;
      }
      return colPin;
    },
    [pinnedColumns]
  );

  /** Build sticky style for a pinned cell */
  const getPinnedStyle = useCallback(
    (side: 'left' | 'right' | undefined): React.CSSProperties => {
      if (!side) return {};
      return {
        position: 'sticky',
        [side]: 0,
        zIndex: 2,
        backgroundColor: 'inherit',
      };
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Selection handlers
  // ---------------------------------------------------------------------------

  // Toggle individual row selection. We re-derive the full selected rows array
  // from keys rather than caching it, because data can change between renders.
  const toggleSelection = (key: string, _row: T) => {
    const next = selectedKeys.includes(key)
      ? selectedKeys.filter((k) => k !== key)
      : [...selectedKeys, key];
    if (!controlledSelectedKeys) setInternalSelectedKeys(next);
    const selectedRows = data.filter((r, i) => next.includes(getRowKey(r, i)));
    onSelectionChange?.(next, selectedRows);
  };

  const toggleAll = () => {
    if (selectedKeys.length === data.length) {
      if (!controlledSelectedKeys) setInternalSelectedKeys([]);
      onSelectionChange?.([], []);
    } else {
      const allKeys = data.map((r, i) => getRowKey(r, i));
      if (!controlledSelectedKeys) setInternalSelectedKeys(allKeys);
      onSelectionChange?.(allKeys, [...data]);
    }
  };

  // ---------------------------------------------------------------------------
  // Sort handler
  // ---------------------------------------------------------------------------

  // Cycle sort direction when the same column is clicked again; reset to
  // ascending when switching to a different column. This mirrors spreadsheet UX.
  const handleSort = (key: string) => {
    if (!onSortChange) return;
    if (sorting?.key === key) {
      onSortChange({ key, direction: sorting.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      onSortChange({ key, direction: 'asc' });
    }
  };

  // ---------------------------------------------------------------------------
  // Style / class derivation
  // ---------------------------------------------------------------------------

  const densityPadding = DENSITY_PADDING_MAP[density];

  // Build the DaisyUI table class list conditionally. `filter(Boolean)` strips
  // falsy entries produced by disabled visual toggles so we get a clean string.
  const tableClasses = [
    'table',
    'w-full',
    striped && 'table-zebra',
    (compact || density === 'compact') && 'table-compact table-xs',
    bordered && 'border border-base-300',
    hoverable && '[&_tr:hover]:bg-base-200/50',
  ]
    .filter(Boolean)
    .join(' ');

  // Total column count for colSpan (selection + expand + data + actions)
  const totalColSpan =
    visibleColumns.length +
    (selectable ? 1 : 0) +
    (expandedRow ? 1 : 0) +
    (actions ? 1 : 0);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={`ds-pattern-data-table ds-engine-modern ds-table-density-${density} ${className ?? ''}`}
      style={{ width: '100%', ...style }}
    >
      {header}

      {(toolbar || (bulkActions && selectedKeys.length > 0)) && (
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex-1">{toolbar}</div>
          {bulkActions && selectedKeys.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-base-content/60">
                {selectedKeys.length} selected
              </span>
              {bulkActions.map((action) => (
                <button
                  key={action.key}
                  className={`btn btn-sm ${
                    action.variant === 'danger'
                      ? 'btn-error'
                      : action.variant === 'primary'
                        ? 'btn-primary'
                        : 'btn-ghost'
                  }`}
                  disabled={action.disabled}
                  onClick={() => {
                    const selectedRows = data.filter((row, i) =>
                      selectedKeys.includes(getRowKey(row, i))
                    );
                    action.onExecute(selectedRows);
                  }}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scroll container uses maxHeight when provided so the header can
          stick while the body scrolls, without the outer page scrolling. */}
      <div
        className={`overflow-x-auto ${bordered ? 'rounded-xl border border-base-300' : 'rounded-xl'}`}
        style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
      >
        {/* Three-way content: spinner while loading, empty state when no data,
            or the full table. Keeping them mutually exclusive avoids flicker. */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-base-content/50">
            {emptyState ?? 'No data'}
          </div>
        ) : (
          <table className={tableClasses} style={{ width: '100%', tableLayout: resizable ? 'fixed' : undefined }}>
            {/* Sticky header uses z-10 to sit above scrolling rows and a
                solid background so text doesn't bleed through. */}
            <thead className={stickyHeader ? 'sticky top-0 z-10 bg-base-100' : ''}>
              <tr className="bg-base-200/40">
                {/* Select-all checkbox: checked state is derived from length
                    comparison rather than a separate boolean to stay in sync
                    when data changes externally (e.g. server-side filter). */}
                {selectable && (
                  <th style={{ padding: densityPadding, width: 48 }}>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedKeys.length === data.length && data.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                )}
                {expandedRow && <th style={{ padding: densityPadding, width: 40 }} />}
                {visibleColumns.map((col) => {
                  const pinSide = getPinSide(col.key, col.pin);
                  const pinnedStyle = getPinnedStyle(pinSide);
                  const resolvedWidth = columnWidths?.[col.key] ?? col.width;

                  return (
                    <th
                      key={col.key}
                      style={{
                        width: resolvedWidth,
                        minWidth: col.minWidth,
                        maxWidth: col.maxWidth,
                        textAlign: col.align,
                        padding: densityPadding,
                        position: (pinnedStyle.position as any) ?? 'relative',
                        left: pinnedStyle.left as any,
                        right: pinnedStyle.right as any,
                        zIndex: pinnedStyle.zIndex as any,
                        backgroundColor: pinSide
                          ? 'var(--fallback-b2, oklch(var(--b2)))'
                          : undefined,
                        userSelect: reorderable || resizable ? 'none' : undefined,
                      }}
                      className={
                        col.sortable
                          ? 'cursor-pointer select-none hover:bg-base-200/50 transition-colors'
                          : ''
                      }
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                      // Drag attributes for column reordering
                      draggable={reorderable}
                      onDragStart={
                        reorderable
                          ? (e) => {
                              // Prevent drag from interfering with sort click
                              handleDragStart(e, col.key);
                            }
                          : undefined
                      }
                      onDragOver={
                        reorderable ? (e) => handleDragOver(e, col.key) : undefined
                      }
                      onDrop={
                        reorderable ? (e) => handleDrop(e, col.key) : undefined
                      }
                      onDragEnd={reorderable ? handleDragEnd : undefined}
                    >
                      <span
                        className="inline-flex items-center gap-1"
                        style={{ position: 'relative', width: '100%' }}
                      >
                        {/* Drag grip icon for reorderable columns */}
                        {reorderable && (
                          <span
                            style={{
                              cursor: 'grab',
                              opacity: 0.4,
                              fontSize: 14,
                              lineHeight: 1,
                              flexShrink: 0,
                              marginRight: -2,
                            }}
                            aria-hidden="true"
                          >
                            {'\u2807'}
                          </span>
                        )}
                        <span
                          style={{
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {col.header}
                        </span>
                        {col.sortable && sorting?.key === col.key && (
                          <span className="text-xs">
                            {sorting.direction === 'asc' ? '\u2191' : '\u2193'}
                          </span>
                        )}
                        {/* Drop indicator line */}
                        {dragOverKey === col.key && dragSourceKey !== col.key && (
                          <span
                            style={{
                              position: 'absolute',
                              left: -2,
                              top: 0,
                              bottom: 0,
                              width: 2,
                              background: 'var(--ds-color-primary, oklch(var(--p)))',
                              borderRadius: 1,
                            }}
                          />
                        )}
                      </span>
                      {/* Resize handle */}
                      {resizable && onColumnResize && (
                        <span
                          role="separator"
                          aria-label={`Resize column ${typeof col.header === 'string' ? col.header : col.key}`}
                          tabIndex={0}
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: 8,
                            cursor: 'col-resize',
                            zIndex: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleResizeStart(
                              e,
                              col.key,
                              typeof resolvedWidth === 'number' ? resolvedWidth : 150
                            );
                          }}
                          onKeyDown={(e) => {
                            if (!onColumnResize) return;
                            const currentW =
                              typeof resolvedWidth === 'number' ? resolvedWidth : 150;
                            if (e.key === 'ArrowRight') {
                              e.preventDefault();
                              onColumnResize(
                                col.key,
                                Math.min(currentW + 10, col.maxWidth ?? 1000)
                              );
                            } else if (e.key === 'ArrowLeft') {
                              e.preventDefault();
                              onColumnResize(
                                col.key,
                                Math.max(currentW - 10, col.minWidth ?? 50)
                              );
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
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
                      )}
                    </th>
                  );
                })}
                {/* Actions column header */}
                {actions && (
                  <th
                    style={{
                      width: 120,
                      textAlign: 'right',
                      padding: densityPadding,
                      position: 'sticky',
                      right: 0,
                      zIndex: 2,
                      backgroundColor: 'var(--fallback-b2, oklch(var(--b2)))',
                      borderLeft: '1px solid oklch(var(--bc) / 0.1)',
                    }}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => {
                const key = getRowKey(row, index);
                const isExpanded = expandedKeys.has(key);
                return (
                  <React.Fragment key={key}>
                    {/* Selected rows get a faint primary tint so the user can
                        see their selection without losing row readability. */}
                    <tr
                      className={`${onRowClick ? 'cursor-pointer' : ''} ${
                        selectedKeys.includes(key) ? 'bg-primary/5' : ''
                      }`}
                      onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                      style={
                        striped && index % 2 === 1
                          ? { backgroundColor: 'var(--ds-color-neutral-50, oklch(var(--b2)))' }
                          : undefined
                      }
                    >
                      {/* stopPropagation prevents the checkbox click from also triggering onRowClick */}
                      {selectable && (
                        <td
                          style={{ padding: densityPadding }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={selectedKeys.includes(key)}
                            onChange={() => toggleSelection(key, row)}
                          />
                        </td>
                      )}
                      {expandedRow && (
                        <td style={{ padding: densityPadding }}>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedKeys((prev) => {
                                const next = new Set(prev);
                                next.has(key) ? next.delete(key) : next.add(key);
                                return next;
                              });
                            }}
                          >
                            {isExpanded ? '\u25BC' : '\u25B6'}
                          </button>
                        </td>
                      )}
                      {visibleColumns.map((col) => {
                        const pinSide = getPinSide(col.key, col.pin);
                        const pinnedStyle = getPinnedStyle(pinSide);
                        const resolvedWidth = columnWidths?.[col.key] ?? col.width;

                        return (
                          <td
                            key={col.key}
                            style={{
                              textAlign: col.align,
                              width: resolvedWidth,
                              padding: densityPadding,
                              position: pinnedStyle.position as any,
                              left: pinnedStyle.left as any,
                              right: pinnedStyle.right as any,
                              zIndex: pinnedStyle.zIndex as any,
                              backgroundColor: pinSide
                                ? 'var(--fallback-b1, oklch(var(--b1)))'
                                : undefined,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 0,
                            }}
                          >
                            {col.render
                              ? col.render(resolveAccessor(col, row), row, index)
                              : String(resolveAccessor(col, row) ?? '')}
                          </td>
                        );
                      })}
                      {/* Actions cell */}
                      {actions && (
                        <td
                          style={{
                            textAlign: 'right',
                            width: 120,
                            padding: densityPadding,
                            position: 'sticky',
                            right: 0,
                            zIndex: 2,
                            backgroundColor: 'var(--fallback-b1, oklch(var(--b1)))',
                            borderLeft: '1px solid oklch(var(--bc) / 0.1)',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {actions(row, index)}
                        </td>
                      )}
                    </tr>
                    {/* colSpan must account for every possible column (selection, expand,
                        data columns, actions) to span the full table width. */}
                    {expandedRow && isExpanded && (
                      <tr>
                        <td colSpan={totalColSpan} style={{ padding: 0 }}>
                          <div style={{ width: '100%', padding: '12px 16px' }}>
                            {expandedRow(row)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination strip renders only when a pagination config is provided.
          The range label ("1-25 of 200") is clamped with Math.min so the
          last page doesn't show an end index beyond the total count. */}
      {pagination && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-sm text-base-content/60">
            {(pagination.current - 1) * pagination.pageSize + 1}-
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total}
          </span>
          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={pagination.current <= 1}
              onClick={() =>
                pagination.onChange(pagination.current - 1, pagination.pageSize)
              }
            >
              Previous
            </button>
            <button
              className="join-item btn btn-sm"
              disabled={pagination.current * pagination.pageSize >= pagination.total}
              onClick={() =>
                pagination.onChange(pagination.current + 1, pagination.pageSize)
              }
            >
              Next
            </button>
          </div>
        </div>
      )}

      {footer}
    </div>
  );
}
