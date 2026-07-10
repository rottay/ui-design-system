'use client';

/**
 * @fileoverview Rustic (Apollo) engine for the DataTable pattern, rendered
 * entirely with inline styles that reference `--ds-*` CSS custom properties.
 * This engine carries zero external CSS dependencies (no Tailwind, no Ant
 * Design) so it can run in any host environment -- including iframes, email
 * previews, and Remotion renders -- while still respecting the tenant's
 * design-system theme tokens for colors, radii, and typography.
 *
 * Supports column visibility, resizing, reordering, pinning, and density
 * modes -- feature-complete with the Classic (Titan) engine.
 *
 * @example
 * <RusticDataTable
 *   data={transactions}
 *   columns={[{ key: 'amount', header: 'Amount', accessorKey: 'amount', sortable: true }]}
 *   rowKey="txId"
 *   bordered
 *   compact
 *   stickyHeader
 *   pagination={{ current: 1, pageSize: 50, total: 500, onChange: setPage }}
 * />
 */

import React, { useMemo, useState, useCallback, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import type { DataTablePatternProps } from '../DataTable.types';
import { resolveAccessor, resolveRowKey } from '../DataTable.types';

// ---------------------------------------------------------------------------
// Animation constants
// ---------------------------------------------------------------------------
// Shared animation curve and duration for the Rustic (Apollo) engine.
// These map to personality CSS vars so tenant themes can override them globally.
const RUSTIC_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const RUSTIC_DURATION = 'var(--ds-personality-animation-entrance-duration, 300ms)';

// ---------------------------------------------------------------------------
// Density style maps
// ---------------------------------------------------------------------------
// Each density level defines th/td padding and font-size overrides. These are
// merged into the base th/td styles at render time so consumers can switch
// density without any external CSS class changes.
// The two canonical modes resolve cell padding from the density cascade
// (`--ds-density-cell-padding`, emitted per mode by `PatternDataTable`) with
// the design-language §3 literal as the fallback. `spacious` is the legacy
// mode and keeps its original padding.
const DENSITY_STYLES = {
  compact: {
    th: { padding: 'var(--ds-density-cell-padding, 0.5rem 0.75rem)', fontSize: 'var(--ds-font-size-xs)' } as React.CSSProperties,
    td: { padding: 'var(--ds-density-cell-padding, 0.5rem 0.75rem)', fontSize: 'var(--ds-font-size-xs)' } as React.CSSProperties,
  },
  comfortable: {
    th: { padding: 'var(--ds-density-cell-padding, 0.875rem 1rem)', fontSize: 'var(--ds-font-size-xs)' } as React.CSSProperties,
    td: { padding: 'var(--ds-density-cell-padding, 0.875rem 1rem)', fontSize: 'var(--ds-font-size-sm)' } as React.CSSProperties,
  },
  spacious: {
    th: { padding: '1rem 1.25rem', fontSize: 'var(--ds-font-size-sm)' } as React.CSSProperties,
    td: { padding: '1rem 1.25rem', fontSize: 'var(--ds-font-size-base)' } as React.CSSProperties,
  },
};

// ---------------------------------------------------------------------------
// Style dictionary
// ---------------------------------------------------------------------------
// All visual tokens reference `--ds-*` CSS custom properties with sensible
// fallbacks so the table renders correctly even without a theme provider.
const styles = {
  container: {
    width: '100%',
    fontFamily: 'var(--ds-font-family-base)',
    color: 'var(--ds-color-neutral-900)',
    containerType: 'inline-size',
    containerName: 'ds-table',
  } as React.CSSProperties,
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--ds-card-body-padding, 1.25rem)',
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
    textAlign: 'left' as const,
    fontWeight: 'var(--ds-typography-heading-font-weight, 600)' as unknown as number,
    textTransform: 'var(--ds-typography-label-transform, uppercase)' as unknown as React.CSSProperties['textTransform'],
    letterSpacing: 'var(--ds-typography-heading-letter-spacing, 0.05em)',
    color: 'var(--ds-color-neutral-500)',
    borderBottom: '1px solid var(--ds-color-neutral-200)',
    borderRight: '1px solid var(--ds-color-neutral-100)',
    background: 'var(--ds-color-neutral-50)',
    whiteSpace: 'nowrap' as const,
    userSelect: 'none' as const,
    position: 'relative' as const,
  } as React.CSSProperties,
  thLast: {
    borderRight: 'none',
  } as React.CSSProperties,
  td: {
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

/**
 * Vanilla inline-style data table that uses `--ds-*` CSS custom properties
 * for all visual decisions. Ships zero external CSS -- ideal for isolated
 * rendering contexts such as iframes, email templates, or Remotion compositions.
 *
 * Supports column visibility, column resizing (mouse drag + keyboard),
 * column reordering (HTML5 drag & drop), column pinning (sticky left/right),
 * density modes, and a fixed-width actions column -- feature-complete with
 * the Classic (Titan) engine.
 *
 * @param props - Engine-agnostic table configuration; see {@link DataTablePatternProps}.
 * @returns A data table rendered entirely with inline styles and CSS variables.
 */
export default function RusticDataTable<T extends object>(
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

  // Uncontrolled selection fallback -- allows standalone usage without the
  // consumer needing to manage selection state externally.
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);
  // Expanded rows tracked as a Set for O(1) has/add/delete during toggle.
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;

  // --- Column resize ref ---
  const resizeRef = useRef<{
    key: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  // --- Column reorder state ---
  const [dragSourceKey, setDragSourceKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  const getRowKey = useCallback((row: T, index: number) => resolveRowKey(row, rowKey, index), [rowKey]);

  // --- Process columns: visibility filter -> reorder sort ---
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

    // 3. Filter out columns with visible === false
    cols = cols.filter((c) => c.visible !== false);

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

  // --- Column drag handlers ---
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

  // Toggle individual row selection. Re-derives selected rows from keys at
  // call-time so data mutations between renders do not cause stale references.
  const toggleSelection = (key: string) => {
    const next = selectedKeys.includes(key)
      ? selectedKeys.filter((k) => k !== key)
      : [...selectedKeys, key];
    if (!controlledSelectedKeys) setInternalSelectedKeys(next);
    const selectedRows = data.filter((r, i) => next.includes(getRowKey(r, i)));
    onSelectionChange?.(next, selectedRows);
  };

  // Select/deselect all rows. When every row is already selected, clear;
  // otherwise select everything -- matching native spreadsheet behaviour.
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

  // Cycle sort direction on re-click; default to ascending for a new column.
  const handleSort = (key: string) => {
    if (!onSortChange) return;
    onSortChange({
      key,
      direction: sorting?.key === key && sorting.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  // Resolve density: the `density` prop takes precedence; fall back to the
  // legacy `compact` boolean for backwards compatibility.
  const resolvedDensity: 'compact' | 'comfortable' | 'spacious' =
    density !== 'comfortable' ? density : compact ? 'compact' : 'comfortable';
  const densityTh = DENSITY_STYLES[resolvedDensity].th;
  const densityTd = DENSITY_STYLES[resolvedDensity].td;

  // --- Pin helpers ---
  // Resolves a column's pin position: controlled `pinnedColumns` prop takes
  // precedence, then falls back to the column definition's `pin` field.
  const resolvePinSide = useCallback(
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

  // Build pinned style for a th or td. Sticky positioning with appropriate
  // left/right offset and elevated z-index so pinned columns float above
  // the scrollable body.
  const buildPinStyle = useCallback(
    (side: 'left' | 'right' | undefined, isHeader: boolean): React.CSSProperties => {
      if (!side) return {};
      return {
        position: 'sticky',
        [side]: 0,
        zIndex: isHeader ? 12 : 2,
        background: isHeader
          ? 'var(--ds-color-neutral-50)'
          : 'var(--ds-color-surface, #fff)',
      };
    },
    []
  );

  // Pre-calculate total column count for expanded-row colSpan, avoiding
  // inline arithmetic inside the render loop.
  const colCount =
    processedColumns.length +
    (selectable ? 1 : 0) +
    (actions ? 1 : 0) +
    (expandedRow ? 1 : 0);

  // --- Build th style for a given column ---
  const buildThStyle = useCallback(
    (
      col: (typeof processedColumns)[number],
      colIdx: number,
      isLastDataCol: boolean
    ): React.CSSProperties => {
      const pinSide = resolvePinSide(col.key, col.pin);
      const width = columnWidths?.[col.key] ?? col.width;

      return {
        ...styles.th,
        ...densityTh,
        ...(isLastDataCol && !actions ? styles.thLast : {}),
        width,
        textAlign: col.align ?? 'left',
        cursor: col.sortable ? 'pointer' : undefined,
        ...(stickyHeader ? { position: 'sticky', top: 0, zIndex: pinSide ? 12 : 10 } : {}),
        ...buildPinStyle(pinSide, true),
      };
    },
    [densityTh, actions, stickyHeader, columnWidths, resolvePinSide, buildPinStyle]
  );

  // --- Build td style for a given column ---
  const buildTdStyle = useCallback(
    (col: (typeof processedColumns)[number]): React.CSSProperties => {
      const pinSide = resolvePinSide(col.key, col.pin);
      const width = columnWidths?.[col.key] ?? col.width;

      return {
        ...styles.td,
        ...densityTd,
        textAlign: col.align,
        width,
        ...buildPinStyle(pinSide, false),
      };
    },
    [densityTd, columnWidths, resolvePinSide, buildPinStyle]
  );

  // --- Render column header content (with optional drag handle + drag indicator) ---
  const renderThContent = useCallback(
    (col: (typeof processedColumns)[number]) => {
      // When reordering is enabled, wrap the header in a draggable container
      // with a grab-handle icon and a drop-target indicator line.
      if (reorderable && onColumnReorder) {
        return (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              position: 'relative',
              userSelect: 'none',
              cursor: 'grab',
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, col.key)}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDrop={(e) => handleDrop(e, col.key)}
            onDragEnd={handleDragEnd}
          >
            <span
              title={`Drag to move ${typeof col.header === 'string' ? col.header : col.key}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                cursor: 'grab',
                opacity: dragSourceKey === col.key ? 0.95 : 0.72,
                fontSize: 10,
                lineHeight: 1,
                flexShrink: 0,
                borderRadius: 5,
                border: '1px solid var(--ds-color-border-secondary, rgba(148, 163, 184, 0.55))',
                background: 'color-mix(in srgb, var(--ds-surface-inset, #f8fafc) 72%, transparent)',
                color: 'var(--ds-color-text-secondary, #475569)',
              }}
              aria-label={`Drag to reorder column ${typeof col.header === 'string' ? col.header : col.key}`}
              role="button"
            >
              <GripVertical size={13} strokeWidth={2.2} aria-hidden />
            </span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {col.header}
              {col.sortable && sorting?.key === col.key && (
                <span style={{ marginLeft: 4 }}>
                  {sorting.direction === 'asc' ? '\u2191' : '\u2193'}
                </span>
              )}
            </span>
            {dragOverKey === col.key && dragSourceKey !== col.key && (
              <span
                style={{
                  position: 'absolute',
                  left: -2,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: 'var(--ds-color-primary, #1677ff)',
                  borderRadius: 1,
                }}
              />
            )}
          </span>
        );
      }

      // Default: plain header text with sort indicator
      return (
        <>
          {col.header}
          {col.sortable && sorting?.key === col.key && (
            <span style={{ marginLeft: 4 }}>
              {sorting.direction === 'asc' ? '\u2191' : '\u2193'}
            </span>
          )}
        </>
      );
    },
    [
      reorderable,
      sorting,
      dragOverKey,
      dragSourceKey,
      handleDragStart,
      handleDragOver,
      handleDrop,
      handleDragEnd,
    ]
  );

  // --- Render resize handle ---
  const renderResizeHandle = useCallback(
    (col: (typeof processedColumns)[number]) => {
      if (!resizable || !onColumnResize) return null;

      const currentWidth =
        typeof (columnWidths?.[col.key] ?? col.width) === 'number'
          ? (columnWidths?.[col.key] ?? col.width) as number
          : 150;

      return (
        <span
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
          onMouseDown={(e) => handleResizeStart(e, col.key, currentWidth)}
          onKeyDown={(e) => {
            if (!onColumnResize) return;
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              onColumnResize(col.key, Math.min(currentWidth + 10, col.maxWidth ?? 1000));
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              onColumnResize(col.key, Math.max(currentWidth - 10, col.minWidth ?? 50));
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
      );
    },
    [resizable, onColumnResize, columnWidths, handleResizeStart]
  );

  return (
    <div
      className={`ds-pattern-data-table ds-engine-rustic ${className ?? ''}`}
      style={{ ...styles.container, ...style }}
    >
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

      {/* Table wrapper merges maxHeight for scrollable body and conditionally
          removes the border when the `bordered` prop is false. */}
      <div style={{ ...styles.tableWrap, ...(maxHeight ? { maxHeight, overflowY: 'auto' } : {}), ...(bordered ? {} : { border: 'none' }) }}>
        {/* Inline keyframes: Rustic engine cannot depend on global CSS, so animation
            definitions must be co-located here. */}
        <style>{`@keyframes ds-spin { to { transform: rotate(360deg); } } @keyframes ds-bulk-slide-down { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        {/* Loading overlay renders on top of existing data to avoid layout jump;
            when data is empty, a centered spinner replaces the table entirely. */}
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
                  <th
                    style={{
                      ...styles.th,
                      ...densityTh,
                      width: 40,
                      ...(stickyHeader ? { position: 'sticky', top: 0, zIndex: 10 } : {}),
                    }}
                  >
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={selectedKeys.length === data.length && data.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                )}
                {expandedRow && (
                  <th
                    style={{
                      ...styles.th,
                      ...densityTh,
                      width: 36,
                      ...(stickyHeader ? { position: 'sticky', top: 0, zIndex: 10 } : {}),
                    }}
                  />
                )}
                {processedColumns.map((col, colIdx) => {
                  const isLastDataCol = colIdx === processedColumns.length - 1;
                  return (
                    <th
                      key={col.key}
                      data-col-priority={col.priority || undefined}
                      style={buildThStyle(col, colIdx, isLastDataCol)}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      {renderThContent(col)}
                      {renderResizeHandle(col)}
                    </th>
                  );
                })}
                {actions && (
                  <th
                    style={{
                      ...styles.th,
                      ...densityTh,
                      ...styles.thLast,
                      width: 120,
                      textAlign: 'right',
                      ...(stickyHeader ? { position: 'sticky', top: 0, zIndex: 10 } : {}),
                      ...buildPinStyle('right', true),
                    }}
                  />
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => {
                const key = getRowKey(row, index);
                const isExpanded = expandedKeys.has(key);
                return (
                  <React.Fragment key={key}>
                    {/* Row background priority: selected > striped > default.
                        Selection uses primary-50 for a subtle highlight, striping
                        uses neutral-50 for alternating rows. */}
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
                        <td
                          style={{ ...styles.td, ...densityTd }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            style={styles.checkbox}
                            checked={selectedKeys.includes(key)}
                            onChange={() => toggleSelection(key)}
                          />
                        </td>
                      )}
                      {expandedRow && (
                        <td style={{ ...styles.td, ...densityTd }}>
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
                      {processedColumns.map((col) => {
                        const pinSide = resolvePinSide(col.key, col.pin);
                        return (
                          <td
                            key={col.key}
                            data-col-priority={col.priority || undefined}
                            style={{
                              ...buildTdStyle(col),
                              // When pinned, override row background to avoid
                              // transparency showing scrolled content beneath.
                              ...(pinSide && selectedKeys.includes(key)
                                ? { background: 'var(--ds-color-primary-50)' }
                                : {}),
                              ...(pinSide && striped && index % 2 === 1 && !selectedKeys.includes(key)
                                ? { background: 'var(--ds-color-neutral-50)' }
                                : {}),
                            }}
                          >
                            {col.render
                              ? col.render(resolveAccessor(col, row), row, index)
                              : String(resolveAccessor(col, row) ?? '')}
                          </td>
                        );
                      })}
                      {actions && (
                        <td
                          style={{
                            ...styles.td,
                            ...densityTd,
                            width: 120,
                            textAlign: 'right',
                            ...buildPinStyle('right', false),
                            // Preserve row background on pinned actions column
                            ...(selectedKeys.includes(key)
                              ? { background: 'var(--ds-color-primary-50)' }
                              : striped && index % 2 === 1
                                ? { background: 'var(--ds-color-neutral-50)' }
                                : {}),
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
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

      {/* Pagination strip: range label is clamped with Math.min so the last
          page does not show an end index beyond the total record count. */}
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
