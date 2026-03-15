'use client';

/**
 * DataTable - Rustic Engine (Vanilla HTML/CSS)
 */

import React, { useMemo, useState, useCallback } from 'react';
import type { DataTablePatternProps } from '../../types';
import { resolveAccessor, resolveRowKey } from '../../types';

const RUSTIC_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const RUSTIC_DURATION = 'var(--ds-personality-animation-entrance-duration, 300ms)';

const styles = {
  container: {
    fontFamily: 'var(--ds-font-family-base)',
    color: 'var(--ds-color-neutral-900)',
  } as React.CSSProperties,
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--ds-card-body-padding, 1rem)',
    gap: '0.75rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--ds-color-neutral-100)',
  } as React.CSSProperties,
  bulkBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: 'var(--ds-font-size-sm)',
    animation: `ds-bulk-slide-down ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as React.CSSProperties,
  bulkBtn: {
    padding: '0.25rem 0.75rem',
    border: '1px solid var(--ds-color-neutral-300)',
    borderRadius: 'var(--ds-radius-sm)',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 'var(--ds-font-size-sm)',
    transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as React.CSSProperties,
  tableWrap: {
    overflowX: 'auto' as const,
    border: '1px solid var(--ds-color-neutral-200)',
    borderRadius: 'var(--ds-radius-md)',
    position: 'relative' as const,
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 'var(--ds-font-size-sm)',
  } as React.CSSProperties,
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left' as const,
    fontWeight: 'var(--ds-typography-heading-font-weight, 600)' as unknown as number,
    fontSize: 'var(--ds-font-size-xs)',
    textTransform: 'var(--ds-typography-label-transform, uppercase)' as unknown as React.CSSProperties['textTransform'],
    letterSpacing: 'var(--ds-typography-heading-letter-spacing, 0.05em)',
    color: 'var(--ds-color-neutral-500)',
    borderBottom: '1px solid var(--ds-color-neutral-200)',
    borderRight: '1px solid var(--ds-color-neutral-100)',
    background: 'var(--ds-color-neutral-50)',
    whiteSpace: 'nowrap' as const,
    userSelect: 'none' as const,
  } as React.CSSProperties,
  thLast: {
    borderRight: 'none',
  } as React.CSSProperties,
  td: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--ds-color-neutral-100)',
    transition: `background-color ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as React.CSSProperties,
  tdCompact: {
    padding: '0.375rem 0.75rem',
    borderBottom: '1px solid var(--ds-color-neutral-100)',
    transition: `background-color ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as React.CSSProperties,
  empty: {
    padding: '4rem 2rem',
    textAlign: 'center' as const,
    color: 'var(--ds-color-neutral-400)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    fontSize: 'var(--ds-font-size-sm)',
  } as React.CSSProperties,
  loadingOverlay: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--ds-table-loading-overlay-bg, var(--ds-modal-loading-overlay-bg))',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
    zIndex: 5,
    borderRadius: 'var(--ds-radius-md)',
  } as React.CSSProperties,
  loadingSpinner: {
    width: 28,
    height: 28,
    border: '3px solid var(--ds-color-neutral-200)',
    borderTopColor: 'var(--ds-color-primary-500)',
    borderRadius: '50%',
    animation: 'ds-spin 0.6s linear infinite',
  } as React.CSSProperties,
  loadingFallback: {
    padding: '3rem',
    textAlign: 'center' as const,
    color: 'var(--ds-color-neutral-400)',
  } as React.CSSProperties,
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    fontSize: 'var(--ds-font-size-sm)',
    color: 'var(--ds-color-neutral-500)',
  } as React.CSSProperties,
  pageBtn: {
    padding: '0.375rem 0.75rem',
    border: '1px solid var(--ds-color-neutral-300)',
    borderRadius: 'var(--ds-radius-sm)',
    background: 'var(--ds-color-neutral-50)',
    cursor: 'pointer',
    fontSize: 'var(--ds-font-size-sm)',
    transition: `all ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as React.CSSProperties,
  checkbox: {
    width: 16,
    height: 16,
    cursor: 'pointer',
  } as React.CSSProperties,
  expandBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    color: 'var(--ds-color-neutral-500)',
    transition: `color ${RUSTIC_DURATION} ${RUSTIC_EASING}`,
  } as React.CSSProperties,
};

export default function RusticDataTable<T extends Record<string, unknown>>(
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
    className,
    style,
  } = props;

  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;

  const getRowKey = useCallback((row: T, index: number) => resolveRowKey(row, rowKey, index), [rowKey]);
  const visibleColumns = useMemo(() => columns.filter((c) => c.visible !== false), [columns]);

  const toggleSelection = (key: string) => {
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

  const handleSort = (key: string) => {
    if (!onSortChange) return;
    onSortChange({
      key,
      direction: sorting?.key === key && sorting.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const colCount = visibleColumns.length + (selectable ? 1 : 0) + (actions ? 1 : 0) + (expandedRow ? 1 : 0);

  return (
    <div className={`ds-pattern-data-table ds-engine-rustic ${className ?? ''}`} style={{ ...styles.container, ...style }}>
      {header}

      {(toolbar || (bulkActions && selectedKeys.length > 0)) && (
        <div style={styles.toolbar}>
          <div style={{ flex: 1 }}>{toolbar}</div>
          {bulkActions && selectedKeys.length > 0 && (
            <div style={styles.bulkBar}>
              <span>{selectedKeys.length} selected</span>
              {bulkActions.map((action) => (
                <button
                  key={action.key}
                  style={{
                    ...styles.bulkBtn,
                    ...(action.variant === 'danger' ? { color: 'var(--ds-color-error-600)', borderColor: 'var(--ds-color-error-300)' } : {}),
                    ...(action.variant === 'primary'
                      ? {
                          background: 'var(--ds-color-primary-500)',
                          color: 'var(--ds-color-text-on-primary)',
                          borderColor: 'var(--ds-color-primary-500)',
                        }
                      : {}),
                  }}
                  disabled={action.disabled}
                  onClick={() => {
                    const selectedRows = data.filter((row, i) => selectedKeys.includes(getRowKey(row, i)));
                    action.onExecute(selectedRows);
                  }}
                >
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ ...styles.tableWrap, ...(maxHeight ? { maxHeight, overflowY: 'auto' } : {}), ...(bordered ? {} : { border: 'none' }) }}>
        <style>{`@keyframes ds-spin { to { transform: rotate(360deg); } } @keyframes ds-bulk-slide-down { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        {loading && data.length > 0 && (
          <div style={styles.loadingOverlay} role="status" aria-label="Loading">
            <div style={styles.loadingSpinner} aria-hidden="true" />
          </div>
        )}
        {loading && data.length === 0 ? (
          <div style={styles.loadingFallback} role="status" aria-label="Loading">
            <div style={{ ...styles.loadingSpinner, margin: '0 auto' }} aria-hidden="true" />
          </div>
        ) : data.length === 0 ? (
          <div style={styles.empty}>{emptyState ?? 'No data'}</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {selectable && (
                  <th style={{ ...styles.th, width: 40 }}>
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={selectedKeys.length === data.length && data.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                )}
                {expandedRow && <th style={{ ...styles.th, width: 36 }} />}
                {visibleColumns.map((col, colIdx) => (
                  <th
                    key={col.key}
                    style={{
                      ...styles.th,
                      ...(colIdx === visibleColumns.length - 1 && !actions ? styles.thLast : {}),
                      width: col.width,
                      textAlign: col.align ?? 'left',
                      cursor: col.sortable ? 'pointer' : undefined,
                      ...(stickyHeader ? { position: 'sticky', top: 0, zIndex: 10 } : {}),
                    }}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    {col.header}
                    {col.sortable && sorting?.key === col.key && (
                      <span style={{ marginLeft: 4 }}>{sorting.direction === 'asc' ? '\u2191' : '\u2193'}</span>
                    )}
                  </th>
                ))}
                {actions && <th style={{ ...styles.th, ...styles.thLast, width: 'auto', textAlign: 'right' }} />}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => {
                const key = getRowKey(row, index);
                const isExpanded = expandedKeys.has(key);
                const cellStyle = compact ? styles.tdCompact : styles.td;
                return (
                  <React.Fragment key={key}>
                    <tr
                      style={{
                        cursor: onRowClick ? 'pointer' : undefined,
                        background: selectedKeys.includes(key)
                          ? 'var(--ds-color-primary-50)'
                          : striped && index % 2 === 1
                            ? 'var(--ds-color-neutral-50)'
                            : undefined,
                      }}
                      onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                    >
                      {selectable && (
                        <td style={cellStyle} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            style={styles.checkbox}
                            checked={selectedKeys.includes(key)}
                            onChange={() => toggleSelection(key)}
                          />
                        </td>
                      )}
                      {expandedRow && (
                        <td style={cellStyle}>
                          <button
                            style={styles.expandBtn}
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
                        <td key={col.key} style={{ ...cellStyle, textAlign: col.align }}>
                          {col.render
                            ? col.render(resolveAccessor(col, row), row, index)
                            : String(resolveAccessor(col, row) ?? '')}
                        </td>
                      ))}
                      {actions && (
                        <td style={{ ...cellStyle, textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          {actions(row, index)}
                        </td>
                      )}
                    </tr>
                    {expandedRow && isExpanded && (
                      <tr>
                        <td colSpan={colCount} style={{ padding: '1rem', background: 'var(--ds-color-neutral-50)' }}>
                          {expandedRow(row)}
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

      {pagination && (
        <div style={styles.pagination}>
          <span>
            {((pagination.current - 1) * pagination.pageSize) + 1}-{Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total}
          </span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              style={styles.pageBtn}
              disabled={pagination.current <= 1}
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
            >
              Previous
            </button>
            <button
              style={styles.pageBtn}
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
