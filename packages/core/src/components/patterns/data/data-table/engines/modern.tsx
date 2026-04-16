'use client';

/**
 * @fileoverview Modern (Hermes) engine for the DataTable pattern, built with
 * native HTML `<table>` elements styled via DS tokens (--ds-surface-*,
 * --ds-radius-*, --ds-motion-*, --ds-color-*, --ds-elevation-*). Manages row
 * expansion, selection checkboxes, and pagination controls directly rather
 * than delegating to a library -- giving full control over markup and styling.
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

import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import type { DataTablePatternProps } from '../DataTable.types';
import { resolveAccessor, resolveRowKey } from '../DataTable.types';
import { Checkbox } from '../../../../primitives/inputs/Checkbox';

/** Density -> cell padding mapping */
const DENSITY_PADDING_MAP = {
  compact: 'var(--ds-table-padding-compact, 6px 12px)',
  comfortable: 'var(--ds-table-padding-comfortable, 12px 16px)',
  spacious: 'var(--ds-table-padding-spacious, 16px 16px)',
} as const;

const LEADING_DATA_COLUMN_PADDING_MAP = {
  compact: '6px 12px 6px 2px',
  comfortable: '12px 16px 12px 3px',
  spacious: '16px 16px 16px 4px',
} as const;

const SELECTION_CELL_PADDING_MAP = {
  compact: '0 0 0 6px',
  comfortable: '0 0 0 7px',
  spacious: '0 0 0 8px',
} as const;

const ACTION_CELL_PADDING_MAP = {
  compact: '0 8px',
  comfortable: '0 10px',
  spacious: '0 12px',
} as const;

/**
 * DS-token-styled data table that renders native HTML table elements with
 * inline styles referencing design system CSS custom properties. Manages
 * selection, expand/collapse, sorting, pagination, column visibility,
 * resizing, reordering, pinning, and density internally -- no third-party
 * table library required.
 *
 * @param props - Engine-agnostic table configuration; see {@link DataTablePatternProps}.
 * @returns A data table rendered with DS-token-styled native HTML elements.
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
    actionsColumnWidth,
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

  // --- Column reorder state (mouse-event based, not HTML5 drag & drop) ---
  const [dragSourceKey, setDragSourceKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const reorderRef = useRef<{ sourceKey: string; startX: number } | null>(null);

  // --- Keyboard row navigation state ---
  const [activeRowIndex, setActiveRowIndex] = useState<number>(-1);
  const tbodyRef = useRef<HTMLTableSectionElement | null>(null);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const getRowKey = useCallback(
    (row: T, index: number) => resolveRowKey(row, rowKey, index),
    [rowKey]
  );

  const selectionCellPadding = SELECTION_CELL_PADDING_MAP[density] ?? SELECTION_CELL_PADDING_MAP.comfortable;
  const leadingDataColumnPadding = LEADING_DATA_COLUMN_PADDING_MAP[density] ?? LEADING_DATA_COLUMN_PADDING_MAP.comfortable;
  const actionCellPadding = ACTION_CELL_PADDING_MAP[density] ?? ACTION_CELL_PADDING_MAP.comfortable;
  const resolvedSelectionColumnWidth = 22;
  const resolvedActionsColumnWidth = actionsColumnWidth ?? 120;

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
  // Column reorder handlers (mouse-event based for cross-browser reliability)
  // ---------------------------------------------------------------------------

  const headerRowRef = useRef<HTMLTableRowElement | null>(null);

  const handleReorderStart = useCallback(
    (e: React.MouseEvent, key: string) => {
      if (!reorderable || !onColumnReorder) return;
      e.preventDefault();
      e.stopPropagation();
      reorderRef.current = { sourceKey: key, startX: e.clientX };
      setDragSourceKey(key);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!reorderRef.current || !headerRowRef.current) return;
        // Find which <th> the mouse is over
        const ths = headerRowRef.current.querySelectorAll<HTMLTableCellElement>('th[data-col-key]');
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

        if (!reorderRef.current || !headerRowRef.current) {
          setDragSourceKey(null);
          setDragOverKey(null);
          reorderRef.current = null;
          return;
        }

        // Find drop target
        const ths = headerRowRef.current.querySelectorAll<HTMLTableCellElement>('th[data-col-key]');
        let targetKey: string | null = null;
        for (const th of ths) {
          const rect = th.getBoundingClientRect();
          if (upEvent.clientX >= rect.left && upEvent.clientX <= rect.right) {
            targetKey = th.dataset.colKey ?? null;
            break;
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
  // Keyboard navigation: header sort via Enter/Space
  // ---------------------------------------------------------------------------

  const handleHeaderKeyDown = useCallback(
    (e: React.KeyboardEvent, colKey: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSort(colKey);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sorting, onSortChange]
  );

  // ---------------------------------------------------------------------------
  // Keyboard navigation: row arrow keys (roving tabindex)
  // ---------------------------------------------------------------------------

  const handleRowKeyDown = useCallback(
    (e: React.KeyboardEvent, row: T, index: number) => {
      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = Math.min(index + 1, data.length - 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = Math.max(index - 1, 0);
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = data.length - 1;
          break;
        case 'Enter':
          if (onRowClick) {
            e.preventDefault();
            onRowClick(row, index);
          }
          return;
        default:
          return;
      }

      if (nextIndex !== null && nextIndex !== index) {
        setActiveRowIndex(nextIndex);
      }
    },
    [data.length, onRowClick]
  );

  // Focus the active row element when activeRowIndex changes
  useEffect(() => {
    if (activeRowIndex < 0 || !tbodyRef.current) return;
    const rows = tbodyRef.current.querySelectorAll<HTMLTableRowElement>('tr[data-row-index]');
    const targetRow = rows[activeRowIndex];
    if (targetRow) {
      targetRow.focus();
    }
  }, [activeRowIndex]);

  // ---------------------------------------------------------------------------
  // Style / class derivation
  // ---------------------------------------------------------------------------

  const densityPadding = DENSITY_PADDING_MAP[density];

  // Table classes -- we no longer rely on DaisyUI utility classes; all styling
  // is applied via inline styles using DS tokens for full theme compatibility.
  const tableClasses = 'ds-modern-table';

  // Total column count for colSpan (selection + expand + data + actions)
  const totalColSpan =
    visibleColumns.length +
    (selectable ? 1 : 0) +
    (expandedRow ? 1 : 0) +
    (actions ? 1 : 0);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Skeleton row count for loading state
  const skeletonRowCount = pagination && pagination.pageSize ? Math.min(pagination.pageSize, 8) : 5;

  return (
    <div
      className={`ds-pattern-data-table ds-engine-modern ds-table-density-${density} ${className ?? ''}`}
      style={{ width: '100%', ...style }}
    >
      {/* Premium polish styles for resize handles, row hover, keyboard nav, etc. */}
      <style>{`
        .ds-engine-modern .ds-resize-handle:hover .ds-resize-handle__bar,
        .ds-engine-modern .ds-resize-handle:focus-visible .ds-resize-handle__bar {
          width: 3px !important;
          background: var(--ds-color-primary) !important;
        }
        .ds-engine-modern .ds-resize-handle:focus-visible {
          outline: 2px solid var(--ds-color-primary);
          outline-offset: -2px;
          border-radius: 2px;
        }
        .ds-engine-modern th[data-col-key]:hover {
          background-color: color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent);
        }
        .ds-engine-modern th[data-col-key][data-sortable="true"]:focus-visible {
          outline: 2px solid var(--ds-color-primary);
          outline-offset: -2px;
          border-radius: 2px;
        }
        .ds-engine-modern tr[data-row-index]:focus-visible {
          outline: none;
          box-shadow: inset 3px 0 0 0 var(--ds-color-primary);
          background-color: color-mix(in srgb, var(--ds-color-primary) 6%, transparent) !important;
        }
      `}</style>
      {header}

      {/* Toolbar slot */}
      {toolbar && <div style={{ marginBottom: 0 }}>{toolbar}</div>}

      {/* Table container: card surface, rounded, bordered */}
      <div
        style={{
          background: 'var(--ds-surface-card)',
          borderRadius: 'var(--ds-radius-lg)',
          border: '1px solid var(--ds-color-border-subtle)',
          overflow: 'hidden',
        }}
      >
        {/* Scroll container */}
        <div
          style={{
            overflowX: 'auto',
            ...(maxHeight ? { maxHeight, overflowY: 'auto' } : {}),
          }}
        >
          {/* Loading state: skeleton rows with shimmer animation */}
          {loading ? (
            <div style={{ width: '100%' }}>
              {/* Skeleton header */}
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: '14px 16px',
                  background: 'var(--ds-surface-inset, var(--ds-surface-panel))',
                  borderBottom: '1px solid var(--ds-color-border-subtle)',
                }}
              >
                {visibleColumns.slice(0, 5).map((col, ci) => (
                  <div
                    key={col.key}
                    style={{
                      flex: ci === 0 ? 1.5 : 1,
                      height: 10,
                      borderRadius: 'var(--ds-radius-sm, 4px)',
                      background: 'var(--ds-color-border-subtle)',
                      opacity: 0.5,
                    }}
                  />
                ))}
              </div>
              {/* Skeleton rows */}
              {Array.from({ length: skeletonRowCount }).map((_, i) => (
                <div
                  key={i}
                  className="ds-skeleton-row"
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '16px 16px',
                    borderBottom: i < skeletonRowCount - 1
                      ? '1px solid var(--ds-color-border-subtle)'
                      : 'none',
                    animation: 'ds-shimmer 1.8s ease-in-out infinite',
                    animationDelay: `${i * 100}ms`,
                  }}
                >
                  {visibleColumns.slice(0, 5).map((col, ci) => (
                    <div
                      key={col.key}
                      style={{
                        flex: ci === 0 ? 1.5 : 1,
                        height: 14,
                        borderRadius: 'var(--ds-radius-sm, 4px)',
                        background: 'color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent)',
                      }}
                    />
                  ))}
                </div>
              ))}
              {/* Inline keyframes for skeleton shimmer */}
              <style>{`
                @keyframes ds-shimmer {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.35; }
                }
              `}</style>
            </div>
          ) : data.length === 0 ? (
            /* Empty state: centered, muted, generous padding */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 24px',
                color: 'var(--ds-color-text-muted)',
                gap: 12,
              }}
            >
              {emptyState ?? (
                <>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 'var(--ds-radius-lg, 12px)',
                      background: 'color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ opacity: 0.4 }}
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--ds-color-text-secondary)',
                    }}
                  >
                    No data to display
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: 'var(--ds-color-text-muted)',
                      lineHeight: 1.5,
                    }}
                  >
                    Try adjusting your search or filters.
                  </span>
                </>
              )}
            </div>
          ) : (
            <table
              className={tableClasses}
              role="grid"
              aria-label="Data table"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                tableLayout: resizable ? 'fixed' : undefined,
              }}
            >
              {/* Table header: panel surface, uppercase labels */}
              <thead
                style={{
                  position: stickyHeader ? 'sticky' : undefined,
                  top: stickyHeader ? 0 : undefined,
                  zIndex: stickyHeader ? 10 : undefined,
                  boxShadow: stickyHeader
                    ? 'var(--ds-elevation-1)'
                    : undefined,
                }}
              >
                <tr
                  ref={headerRowRef}
                  style={{
                    background: 'color-mix(in srgb, var(--ds-surface-inset, var(--ds-surface-panel)) 92%, var(--ds-color-text-primary) 8%)',
                    borderBottom: '1px solid var(--ds-color-border-subtle)',
                  }}
                >
                  {/* Select-all checkbox */}
                  {selectable && (
                    <th
                      style={{
                        padding: selectionCellPadding,
                        width: resolvedSelectionColumnWidth,
                        minWidth: resolvedSelectionColumnWidth,
                        maxWidth: resolvedSelectionColumnWidth,
                        boxSizing: 'border-box',
                        color: 'var(--ds-table-header-color, var(--ds-color-text-secondary))',
                        fontWeight: 500,
                        fontSize: 12,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase' as const,
                        verticalAlign: 'middle',
                        textAlign: 'left',
                      }}
                    >
                      <Checkbox
                        size="sm"
                        checked={selectedKeys.length === data.length && data.length > 0}
                        indeterminate={selectedKeys.length > 0 && selectedKeys.length < data.length}
                        onChange={toggleAll}
                      />
                    </th>
                  )}
                  {expandedRow && (
                    <th
                      style={{
                        padding: densityPadding,
                        width: 40,
                      }}
                    />
                  )}
                  {visibleColumns.map((col, columnIndex) => {
                    const pinSide = getPinSide(col.key, col.pin);
                    const pinnedStyle = getPinnedStyle(pinSide);
                    const resolvedWidth = columnWidths?.[col.key] ?? col.width;
                    const isLeadingDataColumn = columnIndex === 0 && !expandedRow;

                    return (
                      <th
                        key={col.key}
                        role="columnheader"
                        aria-sort={
                          col.sortable
                            ? sorting?.key === col.key
                              ? sorting.direction === 'asc'
                                ? 'ascending'
                                : 'descending'
                              : 'none'
                            : undefined
                        }
                        tabIndex={col.sortable ? 0 : undefined}
                        style={{
                          width: resolvedWidth,
                          minWidth: col.minWidth,
                          maxWidth: col.maxWidth,
                          textAlign: col.align,
                          padding: isLeadingDataColumn && selectable ? leadingDataColumnPadding : densityPadding,
                          color: 'var(--ds-table-header-color, var(--ds-color-text-secondary))',
                          fontWeight: 500,
                          fontSize: 11,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase' as const,
                          position: (pinnedStyle.position as any) || (resizable ? 'relative' : undefined),
                          left: pinnedStyle.left as any,
                          right: pinnedStyle.right as any,
                          zIndex: pinnedStyle.zIndex as any,
                          backgroundColor: pinSide
                            ? 'var(--ds-surface-inset, var(--ds-surface-panel))'
                            : dragOverKey === col.key && dragSourceKey && dragSourceKey !== col.key
                              ? 'color-mix(in srgb, var(--ds-color-primary) 10%, transparent)'
                              : undefined,
                          userSelect: col.sortable || reorderable || resizable ? 'none' : undefined,
                          opacity: dragSourceKey === col.key ? 0.45 : 1,
                          transition: `opacity var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, ease-out), background-color var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, ease-out)`,
                          cursor: col.sortable ? 'pointer' : undefined,
                        }}
                        data-col-key={col.key}
                        data-sortable={col.sortable ? 'true' : undefined}
                        onClick={col.sortable ? () => handleSort(col.key) : undefined}
                        onKeyDown={col.sortable ? (e) => handleHeaderKeyDown(e, col.key) : undefined}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            position: 'relative',
                            width: '100%',
                          }}
                        >
                          {/* Drag grip */}
                          {reorderable && onColumnReorder && (
                            <span
                              onMouseDown={(e) => handleReorderStart(e, col.key)}
                              style={{
                                cursor: dragSourceKey ? 'grabbing' : 'grab',
                                opacity: dragSourceKey === col.key ? 0.8 : 0.35,
                                fontSize: 11,
                                lineHeight: 1,
                                flexShrink: 0,
                                marginRight: 4,
                                padding: '2px',
                                borderRadius: 3,
                                transition: `opacity var(--ds-motion-fast, 150ms)`,
                              }}
                              aria-label={`Drag to reorder column ${typeof col.header === 'string' ? col.header : col.key}`}
                              role="button"
                            >
                              {'\u2807'}
                            </span>
                          )}
                          <span
                            style={{
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {col.header}
                          </span>
                          {col.sortable && (
                            <span
                              style={{
                                display: 'inline-flex',
                                flexDirection: 'column',
                                gap: 1,
                                marginLeft: 2,
                                flexShrink: 0,
                              }}
                            >
                              <svg
                                width="8"
                                height="5"
                                viewBox="0 0 8 5"
                                fill="none"
                                style={{
                                  opacity: sorting?.key === col.key && sorting.direction === 'asc' ? 1 : 0.25,
                                  transition: 'opacity 150ms ease',
                                }}
                              >
                                <path d="M4 0L7.5 5H0.5L4 0Z" fill="currentColor" />
                              </svg>
                              <svg
                                width="8"
                                height="5"
                                viewBox="0 0 8 5"
                                fill="none"
                                style={{
                                  opacity: sorting?.key === col.key && sorting.direction === 'desc' ? 1 : 0.25,
                                  transition: 'opacity 150ms ease',
                                }}
                              >
                                <path d="M4 5L0.5 0H7.5L4 5Z" fill="currentColor" />
                              </svg>
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
                                width: 3,
                                background: 'var(--ds-color-primary)',
                                borderRadius: 1,
                              }}
                            />
                          )}
                        </span>
                        {/* Column resize handle */}
                        {resizable && onColumnResize && (
                          <span
                            className="ds-resize-handle"
                            role="separator"
                            aria-label={`Resize column ${typeof col.header === 'string' ? col.header : col.key}`}
                            tabIndex={0}
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: 0,
                              bottom: 0,
                              width: 12,
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
                              className="ds-resize-handle__bar"
                              style={{
                                width: 1,
                                height: '50%',
                                borderRadius: 1,
                                background: 'var(--ds-color-border)',
                                transition: 'width 150ms ease, background 150ms ease',
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
                        width: resolvedActionsColumnWidth,
                        minWidth: resolvedActionsColumnWidth,
                        textAlign: 'right',
                        padding: actionCellPadding,
                        position: 'sticky',
                        right: 0,
                        zIndex: 2,
                        backgroundColor: 'var(--ds-surface-inset, var(--ds-surface-panel))',
                        color: 'var(--ds-table-header-color, var(--ds-color-text-secondary))',
                        fontWeight: 500,
                        fontSize: 12,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase' as const,
                      }}
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody ref={tbodyRef}>
                {data.map((row, index) => {
                  const key = getRowKey(row, index);
                  const isExpanded = expandedKeys.has(key);
                  const isSelected = selectedKeys.includes(key);
                  const isLastRow = index === data.length - 1;

                  return (
                    <React.Fragment key={key}>
                      <tr
                        data-row-index={index}
                        tabIndex={(activeRowIndex < 0 ? index === 0 : activeRowIndex === index) ? 0 : -1}
                        role="row"
                        onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                        onKeyDown={(e) => handleRowKeyDown(e, row, index)}
                        onFocus={() => setActiveRowIndex(index)}
                        style={{
                          cursor: onRowClick ? 'pointer' : undefined,
                          backgroundColor: isSelected
                            ? 'color-mix(in srgb, var(--ds-color-primary) 9%, transparent)'
                            : striped && index % 2 === 1
                              ? 'color-mix(in srgb, var(--ds-surface-panel, var(--ds-color-text-primary)) 4%, transparent)'
                              : 'transparent',
                          transition: `background-color var(--ds-motion-fast, 150ms) var(--ds-motion-ease-out, ease-out)`,
                          borderBottom: !isLastRow
                            ? '1px solid var(--ds-color-border-subtle)'
                            : 'none',
                        }}
                        onMouseEnter={(e) => {
                          if (hoverable && !isSelected) {
                            (e.currentTarget as HTMLElement).style.backgroundColor =
                              'color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = isSelected
                            ? 'color-mix(in srgb, var(--ds-color-primary) 9%, transparent)'
                            : striped && index % 2 === 1
                              ? 'color-mix(in srgb, var(--ds-surface-panel, var(--ds-color-text-primary)) 4%, transparent)'
                              : 'transparent';
                        }}
                      >
                        {/* Selection checkbox */}
                        {selectable && (
                          <td
                            style={{
                              padding: selectionCellPadding,
                              width: resolvedSelectionColumnWidth,
                              minWidth: resolvedSelectionColumnWidth,
                              maxWidth: resolvedSelectionColumnWidth,
                              boxSizing: 'border-box',
                              verticalAlign: 'middle',
                              textAlign: 'left',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              size="sm"
                              checked={isSelected}
                              onChange={() => toggleSelection(key, row)}
                            />
                          </td>
                        )}
                        {/* Expand toggle */}
                        {expandedRow && (
                          <td style={{ padding: densityPadding }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedKeys((prev) => {
                                  const next = new Set(prev);
                                  next.has(key) ? next.delete(key) : next.add(key);
                                  return next;
                                });
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                                border: 'none',
                                borderRadius: 'var(--ds-radius-sm, 6px)',
                                background: 'transparent',
                                color: 'var(--ds-color-text-secondary)',
                                cursor: 'pointer',
                                fontSize: 12,
                                transition: `background var(--ds-motion-fast, 150ms)`,
                              }}
                            >
                              {isExpanded ? '\u25BC' : '\u25B6'}
                            </button>
                          </td>
                        )}
                        {/* Data cells */}
                        {visibleColumns.map((col, columnIndex) => {
                          const pinSide = getPinSide(col.key, col.pin);
                          const pinnedStyle = getPinnedStyle(pinSide);
                          const resolvedWidth = columnWidths?.[col.key] ?? col.width;
                          const isLeadingDataColumn = columnIndex === 0 && !expandedRow;

                          return (
                            <td
                              key={col.key}
                              style={{
                                textAlign: col.align,
                                width: resolvedWidth,
                                padding: isLeadingDataColumn && selectable ? leadingDataColumnPadding : densityPadding,
                                position: pinnedStyle.position as any,
                                left: pinnedStyle.left as any,
                                right: pinnedStyle.right as any,
                                zIndex: pinnedStyle.zIndex as any,
                                backgroundColor: pinSide
                                  ? 'var(--ds-surface-card)'
                                  : undefined,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: 0,
                                fontSize: 14,
                                color: 'var(--ds-color-text-primary)',
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
                              width: resolvedActionsColumnWidth,
                              minWidth: resolvedActionsColumnWidth,
                              padding: actionCellPadding,
                              position: 'sticky',
                              right: 0,
                              zIndex: 2,
                              backgroundColor: 'var(--ds-surface-card)',
                              whiteSpace: 'nowrap',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {actions(row, index)}
                          </td>
                        )}
                      </tr>
                      {/* Expanded row content */}
                      {expandedRow && isExpanded && (
                        <tr>
                          <td
                            colSpan={totalColSpan}
                            style={{
                              padding: 0,
                              borderBottom: !isLastRow
                                ? '1px solid var(--ds-color-border-subtle)'
                                : 'none',
                            }}
                          >
                            <div
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'var(--ds-surface-inset)',
                              }}
                            >
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

        {/* Pagination: inside the card, border-top separator */}
        {pagination && (() => {
          const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
          const isFirstPage = pagination.current <= 1;
          const isLastPage = pagination.current >= totalPages;

          // Build page number array with ellipsis
          const getPageNumbers = (): (number | 'ellipsis')[] => {
            if (totalPages <= 7) {
              return Array.from({ length: totalPages }, (_, i) => i + 1);
            }
            const pages: (number | 'ellipsis')[] = [1];
            const current = pagination.current;
            if (current > 3) pages.push('ellipsis');
            const start = Math.max(2, current - 1);
            const end = Math.min(totalPages - 1, current + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (current < totalPages - 2) pages.push('ellipsis');
            if (totalPages > 1) pages.push(totalPages);
            return pages;
          };

          const navBtnStyle = (disabled: boolean): React.CSSProperties => ({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 32,
            padding: '0 10px',
            border: '1px solid var(--ds-color-border-subtle)',
            borderRadius: 'var(--ds-radius-sm, 6px)',
            background: 'transparent',
            color: disabled
              ? 'var(--ds-color-text-muted)'
              : 'var(--ds-color-text-secondary)',
            fontSize: 13,
            fontWeight: 500,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'background 150ms ease, color 150ms ease',
          });

          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                borderTop: '1px solid var(--ds-color-border-subtle)',
                fontSize: 13,
                color: 'var(--ds-color-text-secondary)',
              }}
            >
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {(pagination.current - 1) * pagination.pageSize + 1}
                {' \u2013 '}
                {Math.min(pagination.current * pagination.pageSize, pagination.total)}
                {' of '}
                {pagination.total.toLocaleString()}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Previous */}
                <button
                  disabled={isFirstPage}
                  onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
                  style={navBtnStyle(isFirstPage)}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 12L6 8L10 4" />
                  </svg>
                </button>
                {/* Page numbers */}
                {getPageNumbers().map((page, idx) =>
                  page === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        fontSize: 13,
                        color: 'var(--ds-color-text-muted)',
                        userSelect: 'none',
                      }}
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => pagination.onChange(page, pagination.pageSize)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        border: 'none',
                        borderRadius: 'var(--ds-radius-sm, 6px)',
                        background: page === pagination.current
                          ? 'var(--ds-color-primary)'
                          : 'transparent',
                        color: page === pagination.current
                          ? 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse, #fff))'
                          : 'var(--ds-color-text-secondary)',
                        fontSize: 13,
                        fontWeight: page === pagination.current ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'background 150ms ease, color 150ms ease',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {page}
                    </button>
                  )
                )}
                {/* Next */}
                <button
                  disabled={isLastPage}
                  onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
                  style={navBtnStyle(isLastPage)}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 4L10 8L6 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Bulk selection bar: sticky at bottom with elevation */}
        {bulkActions && selectedKeys.length > 0 && (
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: 'var(--ds-surface-card)',
              borderTop: '1px solid var(--ds-color-border-subtle)',
              boxShadow: 'var(--ds-elevation-2)',
              zIndex: 20,
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--ds-color-text-secondary)',
              }}
            >
              {selectedKeys.length} item{selectedKeys.length !== 1 ? 's' : ''} selected
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {bulkActions.map((action) => (
                <button
                  key={action.key}
                  disabled={action.disabled}
                  onClick={() => {
                    const selectedRows = data.filter((row, i) =>
                      selectedKeys.includes(getRowKey(row, i))
                    );
                    action.onExecute(selectedRows);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 32,
                    padding: '0 12px',
                    borderRadius: 'var(--ds-radius-sm, 6px)',
                    border: action.variant === 'danger'
                      ? '1px solid var(--ds-color-error)'
                      : action.variant === 'primary'
                        ? '1px solid var(--ds-color-primary)'
                        : '1px solid var(--ds-color-border-subtle)',
                    background: action.variant === 'danger'
                      ? 'var(--ds-color-error)'
                      : action.variant === 'primary'
                        ? 'var(--ds-color-primary)'
                        : 'var(--ds-surface-card)',
                    color: action.variant === 'danger' || action.variant === 'primary'
                      ? 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse, #fff))'
                      : 'var(--ds-color-text-primary)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: action.disabled ? 'not-allowed' : 'pointer',
                    opacity: action.disabled ? 0.5 : 1,
                    transition: `opacity var(--ds-motion-fast, 150ms)`,
                  }}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {footer}
    </div>
  );
}
