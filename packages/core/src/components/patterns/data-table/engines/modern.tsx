'use client';

/**
 * @fileoverview Modern (Hermes) engine for the DataTable pattern, built with
 * native HTML `<table>` elements styled via DaisyUI and Tailwind CSS utility
 * classes. Unlike the Classic engine this implementation manages row expansion,
 * selection checkboxes, and pagination controls directly rather than delegating
 * to a library -- giving full control over markup and animation classes.
 *
 * @example
 * <ModernDataTable
 *   data={orders}
 *   columns={[{ key: 'total', header: 'Total', accessorKey: 'total', sortable: true }]}
 *   rowKey="orderId"
 *   selectable
 *   striped
 *   expandedRow={(row) => <OrderDetails order={row} />}
 *   pagination={{ current: 1, pageSize: 25, total: 200, onChange: setPage }}
 * />
 */

import React, { useMemo, useState, useCallback } from 'react';
import type { DataTablePatternProps } from '../DataTable.types';
import { resolveAccessor, resolveRowKey } from '../DataTable.types';

/**
 * DaisyUI/Tailwind-backed data table that renders native HTML table elements
 * with utility classes. Manages selection, expand/collapse, sorting, and
 * pagination internally -- no third-party table library required.
 *
 * @param props - Engine-agnostic table configuration; see {@link DataTablePatternProps}.
 * @returns A data table rendered with DaisyUI-styled native HTML elements.
 */
export default function ModernDataTable<T extends Record<string, unknown>>(
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

  // Uncontrolled selection fallback -- lets the table work standalone without
  // the consumer needing to lift selection state.
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);
  // Expanded rows tracked as a Set for O(1) has/add/delete during toggle.
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;

  const getRowKey = useCallback((row: T, index: number) => resolveRowKey(row, rowKey, index), [rowKey]);

  // Pre-filter once so the render loop and colSpan calculations always agree.
  const visibleColumns = useMemo(() => columns.filter((c) => c.visible !== false), [columns]);

  // Toggle individual row selection. We re-derive the full selected rows array
  // from keys rather than caching it, because data can change between renders.
  const toggleSelection = (key: string, row: T) => {
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

  // Build the DaisyUI table class list conditionally. `filter(Boolean)` strips
  // falsy entries produced by disabled visual toggles so we get a clean string.
  const tableClasses = [
    'table',
    'w-full',
    striped && 'table-zebra',
    compact && 'table-compact table-xs',
    bordered && 'border border-base-300',
    hoverable && '[&_tr:hover]:bg-base-200/50',
  ].filter(Boolean).join(' ');

  return (
    <div className={`ds-pattern-data-table ds-engine-modern ${className ?? ''}`} style={style}>
      {header}

      {(toolbar || (bulkActions && selectedKeys.length > 0)) && (
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex-1">{toolbar}</div>
          {bulkActions && selectedKeys.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-base-content/60">{selectedKeys.length} selected</span>
              {bulkActions.map((action) => (
                <button
                  key={action.key}
                  className={`btn btn-sm ${action.variant === 'danger' ? 'btn-error' : action.variant === 'primary' ? 'btn-primary' : 'btn-ghost'}`}
                  disabled={action.disabled}
                  onClick={() => {
                    const selectedRows = data.filter((row, i) => selectedKeys.includes(getRowKey(row, i)));
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
          <table className={tableClasses}>
            {/* Sticky header uses z-10 to sit above scrolling rows and a
                solid background so text doesn't bleed through. */}
            <thead className={stickyHeader ? 'sticky top-0 z-10 bg-base-100' : ''}>
              <tr>
                {/* Select-all checkbox: checked state is derived from length
                    comparison rather than a separate boolean to stay in sync
                    when data changes externally (e.g. server-side filter). */}
                {selectable && (
                  <th className="w-12">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedKeys.length === data.length && data.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                )}
                {expandedRow && <th className="w-10" />}
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width, minWidth: col.minWidth, maxWidth: col.maxWidth, textAlign: col.align }}
                    className={col.sortable ? 'cursor-pointer select-none hover:bg-base-200/50 transition-colors' : ''}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && sorting?.key === col.key && (
                        <span className="text-xs">{sorting.direction === 'asc' ? '\u2191' : '\u2193'}</span>
                      )}
                    </span>
                  </th>
                ))}
                {actions && <th className="w-auto text-right" />}
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
                      className={`${onRowClick ? 'cursor-pointer' : ''} ${selectedKeys.includes(key) ? 'bg-primary/5' : ''}`}
                      onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                    >
                      {/* stopPropagation prevents the checkbox click from also triggering onRowClick */}
                      {selectable && (
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={selectedKeys.includes(key)}
                            onChange={() => toggleSelection(key, row)}
                          />
                        </td>
                      )}
                      {expandedRow && (
                        <td>
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
                      {visibleColumns.map((col) => (
                        <td key={col.key} style={{ textAlign: col.align }}>
                          {col.render
                            ? col.render(resolveAccessor(col, row), row, index)
                            : String(resolveAccessor(col, row) ?? '')}
                        </td>
                      ))}
                      {actions && (
                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                          {actions(row, index)}
                        </td>
                      )}
                    </tr>
                    {/* colSpan must account for every possible column (selection, expand,
                        data columns, actions) to span the full table width. */}
                    {expandedRow && isExpanded && (
                      <tr>
                        <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (actions ? 1 : 0) + 1}>
                          <div className="p-4 bg-base-200/30 rounded-lg">
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
            {((pagination.current - 1) * pagination.pageSize) + 1}-{Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total}
          </span>
          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={pagination.current <= 1}
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
            >
              Previous
            </button>
            <button
              className="join-item btn btn-sm"
              disabled={pagination.current * pagination.pageSize >= pagination.total}
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
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
