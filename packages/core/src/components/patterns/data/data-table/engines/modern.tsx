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
import { Check, GripVertical, X } from 'lucide-react';
import type { DataTablePatternProps } from '../DataTable.types';
import { resolveAccessor, resolveRowKey } from '../DataTable.types';
import ModernCheckbox from '../../../../primitives/inputs/Checkbox/engines/modern';
import { useVirtualScroll } from '../useVirtualScroll';
import { useGroupedData } from '../useGroupedData';
import type { EditableConfig } from '../../../foundation/types';
import { InlineCellEditor } from '../cell-editors';

/**
 * Resolves the EditableConfig for a column.
 * Returns null if the column is not editable, or a normalized config object.
 */
function resolveEditableConfig<T>(editable: boolean | EditableConfig<T> | undefined): EditableConfig<T> | null {
  if (!editable) return null;
  if (editable === true) return { type: 'text' };
  return editable;
}

/**
 * Density -> cell padding mapping.
 *
 * The two canonical modes resolve from the density cascade
 * (`--ds-density-cell-padding`, emitted per mode by `PatternDataTable`) with
 * the design-language §3 literal as the final fallback. A tenant/brand
 * `--ds-table-padding-*` override still wins ahead of both. `spacious` is the
 * legacy mode and keeps its original value.
 */
const DENSITY_PADDING_MAP = {
  compact: 'var(--ds-table-padding-compact, var(--ds-density-cell-padding, 0.5rem 0.75rem))',
  comfortable: 'var(--ds-table-padding-comfortable, var(--ds-density-cell-padding, 0.875rem 1rem))',
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

type InlineEditorControls = {
  save: () => Promise<boolean>;
  cancel: () => void;
};

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
    // Virtual scrolling
    virtualized = false,
    virtualRowHeight = 48,
    // Inline cell editing
    onCellEdit,
    onCellEditStart,
    onCellEditCancel,
    editingCell: controlledEditingCell,
    editTrigger = 'doubleClick',
    tabNavigation = true,
    // Row grouping
    groupBy,
    aggregations,
    defaultGroupExpanded = true,
    renderGroupHeader,
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

  // --- Row grouping ---
  const { sections, isGrouped } = useGroupedData(data, groupBy, aggregations);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
    if (defaultGroupExpanded) return new Set<string>();
    return new Set(sections.map((s) => s.groupValue));
  });
  const toggleGroup = useCallback((groupValue: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupValue)) {
        next.delete(groupValue);
      } else {
        next.add(groupValue);
      }
      return next;
    });
  }, []);

  // --- Inline editing state (uncontrolled fallback) ---
  const [internalEditingCell, setInternalEditingCell] = useState<{
    rowKey: string;
    columnKey: string;
  } | null>(null);
  const editingCell = controlledEditingCell !== undefined ? controlledEditingCell : internalEditingCell;
  const setEditingCell = useCallback(
    (cell: { rowKey: string; columnKey: string } | null) => {
      if (controlledEditingCell === undefined) {
        setInternalEditingCell(cell);
      }
    },
    [controlledEditingCell],
  );

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
  const pendingEditableRowClickRef = useRef<number | null>(null);
  const inlineEditorControlsRef = useRef<InlineEditorControls | null>(null);
  const activeInlineEditRef = useRef<{
    rowKey: string;
    columnKey: string;
    row: T;
  } | null>(null);
  const [savingCell, setSavingCell] = useState<{
    rowKey: string;
    columnKey: string;
  } | null>(null);

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
  const resolveColumnWidth = useCallback(
    (col: NonNullable<DataTablePatternProps<T>['columns']>[number]) =>
      columnWidths?.[col.key] ?? col.width ?? (resizable ? col.minWidth : undefined),
    [columnWidths, resizable],
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
  // Inline editing helpers
  // ---------------------------------------------------------------------------

  /** Find the next (or previous) editable column key relative to `currentKey`. */
  const findAdjacentEditableCol = useCallback(
    (currentKey: string, direction: 'next' | 'prev', row: T): string | null => {
      const editableCols = visibleColumns.filter((col) => {
        const cfg = resolveEditableConfig(col.editable);
        if (!cfg) return false;
        if (cfg.canEdit && !cfg.canEdit(row)) return false;
        return true;
      });
      if (editableCols.length === 0) return null;
      const currentIdx = editableCols.findIndex((c) => c.key === currentKey);
      if (direction === 'next') {
        const nextIdx = currentIdx + 1;
        return nextIdx < editableCols.length ? editableCols[nextIdx].key : null;
      } else {
        const prevIdx = currentIdx - 1;
        return prevIdx >= 0 ? editableCols[prevIdx].key : null;
      }
    },
    [visibleColumns],
  );

  /** Discard the current inline edit without saving the draft value. */
  const discardActiveInlineEdit = useCallback(() => {
    const controls = inlineEditorControlsRef.current;
    if (controls) {
      controls.cancel();
      return;
    }

    const activeEdit = activeInlineEditRef.current;
    if (activeEdit) {
      onCellEditCancel?.(activeEdit.row, activeEdit.columnKey);
    }

    activeInlineEditRef.current = null;
    inlineEditorControlsRef.current = null;
    setEditingCell(null);
  }, [onCellEditCancel, setEditingCell]);

  /** Enter edit mode for a cell. */
  const enterEditMode = useCallback(
    (rk: string, colKey: string, row: T) => {
      const col = visibleColumns.find((c) => c.key === colKey);
      if (!col) return;
      const cfg = resolveEditableConfig(col.editable);
      if (!cfg) return;
      if (cfg.canEdit && !cfg.canEdit(row)) return;
      if (savingCell) return;
      if (editingCell?.rowKey === rk && editingCell.columnKey === colKey) return;

      if (editingCell) {
        discardActiveInlineEdit();
      }

      activeInlineEditRef.current = { rowKey: rk, columnKey: colKey, row };
      setEditingCell({ rowKey: rk, columnKey: colKey });
      onCellEditStart?.(row, colKey);
    },
    [discardActiveInlineEdit, editingCell, savingCell, visibleColumns, setEditingCell, onCellEditStart],
  );

  /** Handle saving a cell value from the inline editor. */
  const handleCellSave = useCallback(
    async (row: T, rk: string, colKey: string, newValue: unknown, oldValue: unknown) => {
      const col = visibleColumns.find((c) => c.key === colKey);
      const cfg = resolveEditableConfig(col?.editable);

      setSavingCell({ rowKey: rk, columnKey: colKey });
      try {
        // Call column-level onSave if provided
        if (cfg?.onSave) {
          await cfg.onSave(row, colKey, newValue, oldValue);
        }
        // Call table-level onCellEdit
        await onCellEdit?.(row, colKey, newValue, oldValue);
        inlineEditorControlsRef.current = null;
        activeInlineEditRef.current = null;
        setEditingCell(null);
      } finally {
        setSavingCell(null);
      }
    },
    [visibleColumns, onCellEdit, setEditingCell],
  );

  /** Handle cancelling inline editing. */
  const handleCellCancel = useCallback(
    (row: T, colKey: string) => {
      onCellEditCancel?.(row, colKey);
      inlineEditorControlsRef.current = null;
      activeInlineEditRef.current = null;
      setEditingCell(null);
    },
    [onCellEditCancel, setEditingCell],
  );

  // ---------------------------------------------------------------------------
  // Virtual scrolling
  // ---------------------------------------------------------------------------

  // Resolve container height from maxHeight for the virtual scroll hook.
  // Only activate when both `virtualized` and a numeric `maxHeight` are set.
  const resolvedContainerHeight = typeof maxHeight === 'number'
    ? maxHeight
    : typeof maxHeight === 'string' && maxHeight.endsWith('px')
      ? parseInt(maxHeight, 10)
      : 600; // sensible fallback when maxHeight is a CSS value like "60vh"

  const virtualScroll = useVirtualScroll({
    totalItems: data.length,
    rowHeight: virtualRowHeight,
    containerHeight: resolvedContainerHeight,
    overscan: 5,
  });

  // When virtualized, only render the visible slice of data.
  const virtualizedData = virtualized
    ? data.slice(virtualScroll.startIndex, virtualScroll.endIndex)
    : data;

  // Bottom spacer height: total height minus offset of rendered rows minus
  // rendered rows' total height.
  const virtualBottomSpacerHeight = virtualized
    ? virtualScroll.totalHeight
      - virtualScroll.offsetTop
      - (virtualScroll.endIndex - virtualScroll.startIndex) * virtualRowHeight
    : 0;

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

  const clearPendingEditableRowClick = useCallback(() => {
    if (pendingEditableRowClickRef.current) {
      window.clearTimeout(pendingEditableRowClickRef.current);
      pendingEditableRowClickRef.current = null;
    }
  }, []);

  const handleRowClick = useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, row: T, index: number) => {
      if (!onRowClick) return;

      const target = event.target;
      const isElementTarget = target instanceof Element;
      const isEditableCellClick =
        editTrigger === 'doubleClick'
        && isElementTarget
        && Boolean(target.closest('td[data-editable="true"]'));
      const isEditingAwayClick =
        Boolean(editingCell)
        && isElementTarget
        && !target.closest('td[data-editing="true"]');

      if (isEditableCellClick || isEditingAwayClick) {
        clearPendingEditableRowClick();
        pendingEditableRowClickRef.current = window.setTimeout(() => {
          pendingEditableRowClickRef.current = null;
          onRowClick(row, index);
        }, 360);
        return;
      }

      clearPendingEditableRowClick();
      onRowClick(row, index);
    },
    [clearPendingEditableRowClick, editTrigger, editingCell, onRowClick],
  );

  /** A double-click away from the active editor abandons its unsaved draft. */
  const handleEditAbandonDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!editingCell || savingCell) return;
      clearPendingEditableRowClick();
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('td[data-editing="true"]')) return;

      discardActiveInlineEdit();
    },
    [clearPendingEditableRowClick, discardActiveInlineEdit, editingCell, savingCell],
  );

  useEffect(() => clearPendingEditableRowClick, [clearPendingEditableRowClick]);

  useEffect(() => {
    inlineEditorControlsRef.current = null;
  }, [editingCell?.rowKey, editingCell?.columnKey]);

  const renderInlineEditActions = useCallback(
    (isSaving: boolean) => {
      const buttonBaseStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        padding: 0,
        borderRadius: 'var(--ds-radius-sm, 6px)',
        border: '1px solid var(--ds-color-border-subtle)',
        background: 'var(--ds-surface-card)',
        cursor: isSaving ? 'wait' : 'pointer',
        transition: 'background var(--ds-motion-fast) ease, border-color var(--ds-motion-fast) ease, color var(--ds-motion-fast) ease, opacity var(--ds-motion-fast) ease',
      };

      const stopActionEvent = (event: React.SyntheticEvent) => {
        event.preventDefault();
        event.stopPropagation();
      };

      return (
        <span
          aria-label="Inline edit actions"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 6,
            minWidth: 0,
            width: '100%',
          }}
        >
          <button
            type="button"
            aria-label={isSaving ? 'Saving edit' : 'Save edit'}
            title={isSaving ? 'Saving edit' : 'Save edit'}
            disabled={isSaving}
            onPointerDown={stopActionEvent}
            onMouseDown={stopActionEvent}
            onClick={(event) => {
              stopActionEvent(event);
              if (!isSaving) inlineEditorControlsRef.current?.save();
            }}
            style={{
              ...buttonBaseStyle,
              color: 'var(--ds-color-success, #047857)',
              borderColor: 'color-mix(in srgb, var(--ds-color-success, #047857) 34%, var(--ds-color-border-subtle))',
              background: 'color-mix(in srgb, var(--ds-color-success, #047857) 9%, var(--ds-surface-card))',
              opacity: isSaving ? 0.72 : 1,
            }}
          >
            <Check size={15} strokeWidth={2.4} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Cancel edit"
            title="Cancel edit"
            disabled={isSaving}
            onPointerDown={stopActionEvent}
            onMouseDown={stopActionEvent}
            onClick={(event) => {
              stopActionEvent(event);
              if (!isSaving) inlineEditorControlsRef.current?.cancel();
            }}
            style={{
              ...buttonBaseStyle,
              color: 'var(--ds-color-error, #dc2626)',
              borderColor: 'color-mix(in srgb, var(--ds-color-error, #dc2626) 30%, var(--ds-color-border-subtle))',
              background: 'color-mix(in srgb, var(--ds-color-error, #dc2626) 7%, var(--ds-surface-card))',
              opacity: isSaving ? 0.5 : 1,
            }}
          >
            <X size={15} strokeWidth={2.4} aria-hidden />
          </button>
        </span>
      );
    },
    [],
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
      style={{
        width: '100%',
        minWidth: 0,
        contain: 'layout style',
        ...style,
      }}
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
        .ds-engine-modern td[data-editable="true"] {
          cursor: text;
          transition:
            background-color var(--ds-motion-fast) ease,
            box-shadow var(--ds-motion-fast) ease,
            transform var(--ds-motion-fast) ease;
        }
        .ds-engine-modern td[data-editable="true"]:hover::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--ds-color-primary, #3b82f6);
          opacity: 0.4;
          pointer-events: none;
        }
        .ds-engine-modern td[data-editable="true"]:hover {
          background: color-mix(in srgb, var(--ds-color-primary) 4%, transparent);
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 16%, transparent);
        }
        .ds-engine-modern td[data-editing="true"] {
          overflow: visible !important;
          padding: 4px 6px !important;
          background: color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-surface-card)) !important;
          box-shadow:
            inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 30%, transparent),
            0 8px 18px color-mix(in srgb, var(--ds-color-primary) 8%, transparent);
          animation: ds-inline-edit-enter var(--ds-motion-normal) var(--ds-motion-ease-out);
        }
        @keyframes ds-inline-edit-enter {
          from {
            transform: scale(0.985);
            opacity: 0.78;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .ds-engine-modern td[data-cell-dirty="true"]::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--ds-color-warning, #f59e0b);
          pointer-events: none;
        }
      `}</style>
      {header}

      {/* Toolbar slot */}
      {toolbar && <div style={{ marginBottom: 0 }}>{toolbar}</div>}

      {/* Table container: card surface, rounded, bordered. The data-ds-table-*
          attributes are the stable addressing contract for consumers
          (WO-UX-03) — apps must never target the inline-style values. */}
      <div
        data-ds-table-card="true"
        style={{
          background: 'var(--ds-table-bg, var(--ds-surface-card))',
          borderRadius: 'var(--ds-radius-lg)',
          border: '1px solid var(--ds-table-border, var(--ds-color-border-subtle))',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Scroll container */}
        <div
          ref={virtualized ? virtualScroll.scrollRef : undefined}
          onScroll={virtualized ? virtualScroll.onScroll : undefined}
          data-ds-table-scroll="true"
          style={{
            overflowX: 'auto',
            scrollbarGutter: 'stable both-edges',
            overscrollBehavior: 'contain',
            minWidth: 0,
            ...(maxHeight
              ? { maxHeight, overflowY: 'auto' as const }
              : { overflowY: 'hidden' as const }),
          }}
        >
          {/* Loading state: skeleton rows with shimmer animation */}
          {loading ? (
            <div role="status" aria-label="Loading" style={{ width: '100%' }}>
              {/* Skeleton header */}
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: '14px 16px',
                  background: 'var(--ds-table-header-bg, var(--ds-surface-inset, var(--ds-surface-panel)))',
                  borderBottom: '1px solid var(--ds-table-border, var(--ds-color-border-subtle))',
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
                      ? '1px solid var(--ds-table-row-border, var(--ds-color-border-subtle))'
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
                    background: 'var(--ds-table-header-bg, color-mix(in srgb, var(--ds-surface-inset, var(--ds-surface-panel)) 92%, var(--ds-color-text-primary) 8%))',
                    borderBottom: '1px solid var(--ds-table-border, var(--ds-color-border-subtle))',
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
                      <ModernCheckbox
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
                    const resolvedWidth = resolveColumnWidth(col);
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
                          transition: `opacity var(--ds-motion-fast) var(--ds-motion-ease-out), background-color var(--ds-motion-fast) var(--ds-motion-ease-out)`,
                          cursor: reorderable && onColumnReorder ? 'grab' : col.sortable ? 'pointer' : undefined,
                        }}
                        data-col-key={col.key}
                        data-sortable={col.sortable ? 'true' : undefined}
                        draggable={reorderable && !!onColumnReorder}
                        title={reorderable && onColumnReorder ? `Drag header to move ${typeof col.header === 'string' ? col.header : col.key}` : undefined}
                        onDragStart={reorderable && onColumnReorder ? (e) => handleHeaderDragStart(e, col.key) : undefined}
                        onDragOver={reorderable && onColumnReorder ? (e) => handleHeaderDragOver(e, col.key) : undefined}
                        onDrop={reorderable && onColumnReorder ? (e) => handleHeaderDrop(e, col.key) : undefined}
                        onDragEnd={reorderable && onColumnReorder ? handleHeaderDragEnd : undefined}
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
                                border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 76%, transparent)',
                                background: 'color-mix(in srgb, var(--ds-color-bg-primary) 34%, transparent)',
                                color: 'var(--ds-color-text-secondary)',
                                transition: `opacity var(--ds-motion-fast), border-color var(--ds-motion-fast), background-color var(--ds-motion-fast)`,
                              }}
                              aria-label={`Drag to reorder column ${typeof col.header === 'string' ? col.header : col.key}`}
                              role="button"
                            >
                              <GripVertical size={13} strokeWidth={2.2} aria-hidden />
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
                                  transition: 'opacity var(--ds-motion-fast) ease',
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
                                  transition: 'opacity var(--ds-motion-fast) ease',
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
                            data-column-resize-handle="true"
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
                                transition: 'width var(--ds-motion-fast) ease, background var(--ds-motion-fast) ease',
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
                {/* --------------------------------------------------------- */}
                {/* Grouped rendering: group headers + collapsible sections    */}
                {/* --------------------------------------------------------- */}
                {isGrouped && (() => {
                  let globalIndex = 0;

                  return sections.map((section, sectionIndex) => {
                    const isCollapsed = collapsedGroups.has(section.groupValue);
                    const isLastSection = sectionIndex === sections.length - 1;

                    // Build aggregate summary chips for the default header
                    const aggregateChips = Object.entries(section.aggregates).map(
                      ([colKey, value]) => {
                        const col = visibleColumns.find((c) => c.key === colKey);
                        const label = col
                          ? (typeof col.header === 'string' ? col.header : colKey)
                          : colKey;
                        return `${label}: ${String(value ?? '')}`;
                      },
                    );

                    const sectionStartIndex = globalIndex;
                    const sectionRows: React.ReactElement[] = [];

                    // -- Data rows (hidden when collapsed) --
                    if (!isCollapsed) {
                      section.items.forEach((row, localIndex) => {
                        const index = sectionStartIndex + localIndex;
                        const key = getRowKey(row, index);
                        const isRowExpanded = expandedKeys.has(key);
                        const isSelected = selectedKeys.includes(key);
                        const isRowEditing = editingCell?.rowKey === key;
                        const isRowSaving = savingCell?.rowKey === key;
                        const isLastRowInSection = localIndex === section.items.length - 1;
                        const isLastRowOverall = isLastSection && isLastRowInSection;

                        sectionRows.push(
                          <React.Fragment key={key}>
                            <tr
                              data-row-index={index}
                              tabIndex={(activeRowIndex < 0 ? index === 0 : activeRowIndex === index) ? 0 : -1}
                              role="row"
                              onClick={onRowClick ? (event) => handleRowClick(event, row, index) : undefined}
                              onDoubleClick={handleEditAbandonDoubleClick}
                              onKeyDown={(e) => handleRowKeyDown(e, row, index)}
                              onFocus={() => setActiveRowIndex(index)}
                              style={{
                                cursor: onRowClick ? 'pointer' : undefined,
                                backgroundColor: isSelected
                                  ? 'var(--ds-table-row-bg-selected, color-mix(in srgb, var(--ds-color-primary) 9%, transparent))'
                                  : striped && index % 2 === 1
                                    ? 'var(--ds-table-row-bg-striped, color-mix(in srgb, var(--ds-surface-panel, var(--ds-color-text-primary)) 4%, transparent))'
                                    : 'transparent',
                                transition: `background-color var(--ds-motion-fast) var(--ds-motion-ease-out)`,
                                borderBottom: !isLastRowOverall
                                  ? '1px solid var(--ds-table-row-border, var(--ds-color-border-subtle))'
                                  : 'none',
                              }}
                              onMouseEnter={(e) => {
                                if (hoverable && !isSelected) {
                                  (e.currentTarget as HTMLElement).style.backgroundColor =
                                    'var(--ds-table-row-bg-hover, color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent))';
                                }
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = isSelected
                                  ? 'var(--ds-table-row-bg-selected, color-mix(in srgb, var(--ds-color-primary) 9%, transparent))'
                                  : striped && index % 2 === 1
                                    ? 'var(--ds-table-row-bg-striped, color-mix(in srgb, var(--ds-surface-panel, var(--ds-color-text-primary)) 4%, transparent))'
                                    : 'transparent';
                              }}
                            >
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
                                  <ModernCheckbox
                                    size="sm"
                                    checked={isSelected}
                                    onChange={() => toggleSelection(key, row)}
                                  />
                                </td>
                              )}
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
                                      transition: `background var(--ds-motion-fast)`,
                                    }}
                                  >
                                    {isRowExpanded ? '\u25BC' : '\u25B6'}
                                  </button>
                                </td>
                              )}
                              {/* Data cells (grouped path -- with inline editing) */}
                              {visibleColumns.map((col, columnIndex) => {
                                const pinSide = getPinSide(col.key, col.pin);
                                const pinnedStyle = getPinnedStyle(pinSide);
                                const resolvedWidth = resolveColumnWidth(col);
                                const isLeadingDataColumn = columnIndex === 0 && !expandedRow;

                                const editableCfg = resolveEditableConfig(col.editable);
                                const isCellEditable = editableCfg != null
                                  && (!editableCfg.canEdit || editableCfg.canEdit(row));
                                const isCellEditing = editingCell?.rowKey === key
                                  && editingCell?.columnKey === col.key;
                                const cellValue = resolveAccessor(col, row);

                                const grpTriggerProps: Record<string, unknown> = {};
                                if (isCellEditable && !isCellEditing) {
                                  const handler = (e: React.MouseEvent) => {
                                    clearPendingEditableRowClick();
                                    e.preventDefault();
                                    e.stopPropagation();
                                    enterEditMode(key, col.key, row);
                                  };
                                  if (editTrigger === 'click') {
                                    grpTriggerProps.onClick = handler;
                                  } else {
                                    grpTriggerProps.onDoubleClick = handler;
                                  }
                                }

                                return (
                                  <td
                                    key={col.key}
                                    data-editable={isCellEditable ? 'true' : undefined}
                                    data-editing={isCellEditing ? 'true' : undefined}
                                    title={isCellEditable && !isCellEditing
                                      ? editTrigger === 'click'
                                        ? 'Click to edit'
                                        : 'Double-click to edit'
                                      : undefined}
                                    {...grpTriggerProps}
                                    className={col.align === 'right' ? 'ds-nums-tabular' : undefined}
                                    style={{
                                      textAlign: col.align,
                                      width: resolvedWidth,
                                      minWidth: col.minWidth,
                                      maxWidth: col.maxWidth,
                                      padding: isCellEditing
                                        ? '4px 6px'
                                        : isLeadingDataColumn && selectable
                                          ? leadingDataColumnPadding
                                          : densityPadding,
                                      position: (pinnedStyle.position as any)
                                        || (isCellEditable ? 'relative' : undefined),
                                      left: pinnedStyle.left as any,
                                      right: pinnedStyle.right as any,
                                      zIndex: pinnedStyle.zIndex as any,
                                      backgroundColor: pinSide
                                        ? 'var(--ds-surface-card)'
                                        : undefined,
                                      overflow: isCellEditing ? 'visible' : 'hidden',
                                      textOverflow: isCellEditing ? undefined : 'ellipsis',
                                      whiteSpace: isCellEditing ? undefined : 'nowrap',
                                      fontSize: 14,
                                      color: 'var(--ds-table-cell-color, var(--ds-color-text-primary))',
                                    }}
                                  >
                                    {isCellEditing && editableCfg ? (
                                      <InlineCellEditor
                                        value={cellValue}
                                        row={row}
                                        columnKey={col.key}
                                        config={editableCfg}
                                        onSave={(newValue) =>
                                          handleCellSave(row, key, col.key, newValue, cellValue)
                                        }
                                        onCancel={() => handleCellCancel(row, col.key)}
                                        onControlsChange={(controls) => {
                                          if (editingCell?.rowKey === key && editingCell.columnKey === col.key) {
                                            inlineEditorControlsRef.current = controls;
                                          }
                                        }}
                                        onTabNext={
                                          tabNavigation
                                            ? () => {
                                                const nextCol = findAdjacentEditableCol(
                                                  col.key, 'next', row,
                                                );
                                                if (nextCol) {
                                                  enterEditMode(key, nextCol, row);
                                                } else {
                                                  setEditingCell(null);
                                                }
                                              }
                                            : undefined
                                        }
                                        onTabPrev={
                                          tabNavigation
                                            ? () => {
                                                const prevCol = findAdjacentEditableCol(
                                                  col.key, 'prev', row,
                                                );
                                                if (prevCol) {
                                                  enterEditMode(key, prevCol, row);
                                                } else {
                                                  setEditingCell(null);
                                                }
                                              }
                                            : undefined
                                        }
                                      />
                                    ) : col.render
                                      ? col.render(cellValue, row, index)
                                      : String(cellValue ?? '')}
                                  </td>
                                );
                              })}
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
                                  {isRowEditing
                                    ? renderInlineEditActions(isRowSaving)
                                    : actions(row, index)}
                                </td>
                              )}
                            </tr>
                            {expandedRow && isRowExpanded && (
                              <tr>
                                <td
                                  colSpan={totalColSpan}
                                  style={{
                                    padding: 0,
                                    borderBottom: !isLastRowOverall
                                      ? '1px solid var(--ds-table-row-border, var(--ds-color-border-subtle))'
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
                          </React.Fragment>,
                        );
                      });
                    }

                    globalIndex += section.items.length;

                    return (
                      <React.Fragment key={`group-${section.groupValue}`}>
                        {/* Group header row */}
                        <tr
                          role="row"
                          aria-expanded={!isCollapsed}
                          onClick={() => toggleGroup(section.groupValue)}
                          style={{
                            cursor: 'pointer',
                            background: 'var(--ds-table-header-bg, color-mix(in srgb, var(--ds-surface-inset, var(--ds-surface-panel)) 92%, var(--ds-color-text-primary) 8%))',
                            borderBottom: '1px solid var(--ds-table-row-border, var(--ds-color-border-subtle))',
                          }}
                        >
                          <td
                            colSpan={totalColSpan}
                            style={{
                              padding: densityPadding,
                              fontSize: 13,
                              fontWeight: 600,
                              color: 'var(--ds-color-text-primary)',
                            }}
                          >
                            {renderGroupHeader
                              ? renderGroupHeader(section.groupValue, section.items, !isCollapsed)
                              : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 18,
                                      height: 18,
                                      fontSize: 10,
                                      color: 'var(--ds-color-text-secondary)',
                                      transition: 'transform var(--ds-motion-fast) ease',
                                      transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                    }}
                                  >
                                    {'\u25BC'}
                                  </span>
                                  <span>{section.groupValue || '(empty)'}</span>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      height: 20,
                                      minWidth: 20,
                                      padding: '0 6px',
                                      borderRadius: 'var(--ds-radius-full, 9999px)',
                                      background: 'color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)',
                                      fontSize: 11,
                                      fontWeight: 500,
                                      color: 'var(--ds-color-text-secondary)',
                                    }}
                                  >
                                    {section.items.length}
                                  </span>
                                  {aggregateChips.length > 0 && (
                                    <span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        marginLeft: 4,
                                        fontSize: 12,
                                        fontWeight: 400,
                                        color: 'var(--ds-color-text-muted)',
                                      }}
                                    >
                                      {aggregateChips.map((chip, ci) => (
                                        <span key={ci}>
                                          {ci > 0 && (
                                            <span style={{ margin: '0 2px', opacity: 0.4 }}>{'\u00B7'}</span>
                                          )}
                                          {chip}
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                </span>
                              )}
                          </td>
                        </tr>
                        {sectionRows}
                      </React.Fragment>
                    );
                  });
                })()}

                {/* --------------------------------------------------------- */}
                {/* Flat rendering (no groupBy): virtual scroll + inline edit  */}
                {/* --------------------------------------------------------- */}
                {!isGrouped && (
                  <>
                {/* Virtual scroll: top spacer row to push visible content down */}
                {virtualized && virtualScroll.offsetTop > 0 && (
                  <tr aria-hidden="true" style={{ height: virtualScroll.offsetTop, border: 'none' }}>
                    <td colSpan={totalColSpan} style={{ padding: 0, border: 'none' }} />
                  </tr>
                )}
                {virtualizedData.map((row, sliceIndex) => {
                  // When virtualized, the actual data index is offset by startIndex
                  const index = virtualized ? virtualScroll.startIndex + sliceIndex : sliceIndex;
                  const key = getRowKey(row, index);
                  const isExpanded = expandedKeys.has(key);
                  const isSelected = selectedKeys.includes(key);
                  const isRowEditing = editingCell?.rowKey === key;
                  const isRowSaving = savingCell?.rowKey === key;
                  const isLastRow = index === data.length - 1;

                  return (
                    <React.Fragment key={key}>
                      <tr
                        data-row-index={index}
                        tabIndex={(activeRowIndex < 0 ? index === 0 : activeRowIndex === index) ? 0 : -1}
                        role="row"
                        onClick={onRowClick ? (event) => handleRowClick(event, row, index) : undefined}
                        onDoubleClick={handleEditAbandonDoubleClick}
                        onKeyDown={(e) => handleRowKeyDown(e, row, index)}
                        onFocus={() => setActiveRowIndex(index)}
                        style={{
                          cursor: onRowClick ? 'pointer' : undefined,
                          height: virtualized ? virtualRowHeight : undefined,
                          boxSizing: virtualized ? 'border-box' : undefined,
                          backgroundColor: isSelected
                            ? 'var(--ds-table-row-bg-selected, color-mix(in srgb, var(--ds-color-primary) 9%, transparent))'
                            : striped && index % 2 === 1
                              ? 'var(--ds-table-row-bg-striped, color-mix(in srgb, var(--ds-surface-panel, var(--ds-color-text-primary)) 4%, transparent))'
                              : 'transparent',
                          transition: `background-color var(--ds-motion-fast) var(--ds-motion-ease-out)`,
                          borderBottom: !isLastRow
                            ? '1px solid var(--ds-table-row-border, var(--ds-color-border-subtle))'
                            : 'none',
                        }}
                        onMouseEnter={(e) => {
                          if (hoverable && !isSelected) {
                            (e.currentTarget as HTMLElement).style.backgroundColor =
                              'var(--ds-table-row-bg-hover, color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent))';
                          }
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = isSelected
                            ? 'var(--ds-table-row-bg-selected, color-mix(in srgb, var(--ds-color-primary) 9%, transparent))'
                            : striped && index % 2 === 1
                              ? 'var(--ds-table-row-bg-striped, color-mix(in srgb, var(--ds-surface-panel, var(--ds-color-text-primary)) 4%, transparent))'
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
                            <ModernCheckbox
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
                                transition: `background var(--ds-motion-fast)`,
                              }}
                            >
                              {isExpanded ? '\u25BC' : '\u25B6'}
                            </button>
                          </td>
                        )}
                        {/* Data cells (with inline editing support) */}
                        {visibleColumns.map((col, columnIndex) => {
                          const pinSide = getPinSide(col.key, col.pin);
                          const pinnedStyle = getPinnedStyle(pinSide);
                          const resolvedWidth = resolveColumnWidth(col);
                          const isLeadingDataColumn = columnIndex === 0 && !expandedRow;

                          // Inline editing: resolve config and state for this cell
                          const editableCfg = resolveEditableConfig(col.editable);
                          const isCellEditable = editableCfg != null
                            && (!editableCfg.canEdit || editableCfg.canEdit(row));
                          const isCellEditing = editingCell?.rowKey === key
                            && editingCell?.columnKey === col.key;
                          const cellValue = resolveAccessor(col, row);

                          // Build the edit-trigger event handler
                          const triggerProps: Record<string, unknown> = {};
                          if (isCellEditable && !isCellEditing) {
                            const handler = (e: React.MouseEvent) => {
                              clearPendingEditableRowClick();
                              e.preventDefault();
                              e.stopPropagation();
                              enterEditMode(key, col.key, row);
                            };
                            if (editTrigger === 'click') {
                              triggerProps.onClick = handler;
                            } else {
                              triggerProps.onDoubleClick = handler;
                            }
                          }

                          return (
                            <td
                              key={col.key}
                              data-editable={isCellEditable ? 'true' : undefined}
                              data-editing={isCellEditing ? 'true' : undefined}
                              title={isCellEditable && !isCellEditing
                                ? editTrigger === 'click'
                                  ? 'Click to edit'
                                  : 'Double-click to edit'
                                : undefined}
                              {...triggerProps}
                              className={col.align === 'right' ? 'ds-nums-tabular' : undefined}
                              style={{
                                textAlign: col.align,
                                width: resolvedWidth,
                                minWidth: col.minWidth,
                                maxWidth: col.maxWidth,
                                padding: isCellEditing
                                  ? '4px 6px'
                                  : isLeadingDataColumn && selectable
                                    ? leadingDataColumnPadding
                                    : densityPadding,
                                position: (pinnedStyle.position as any)
                                  || (isCellEditable ? 'relative' : undefined),
                                left: pinnedStyle.left as any,
                                right: pinnedStyle.right as any,
                                zIndex: pinnedStyle.zIndex as any,
                                backgroundColor: pinSide
                                  ? 'var(--ds-surface-card)'
                                  : undefined,
                                overflow: isCellEditing ? 'visible' : 'hidden',
                                textOverflow: isCellEditing ? undefined : 'ellipsis',
                                whiteSpace: isCellEditing ? undefined : 'nowrap',
                                fontSize: 14,
                                color: 'var(--ds-table-cell-color, var(--ds-color-text-primary))',
                              }}
                            >
                              {isCellEditing && editableCfg ? (
                                <InlineCellEditor
                                  value={cellValue}
                                  row={row}
                                  columnKey={col.key}
                                  config={editableCfg}
                                  onSave={(newValue) =>
                                    handleCellSave(row, key, col.key, newValue, cellValue)
                                  }
                                  onCancel={() => handleCellCancel(row, col.key)}
                                  onControlsChange={(controls) => {
                                    if (editingCell?.rowKey === key && editingCell.columnKey === col.key) {
                                      inlineEditorControlsRef.current = controls;
                                    }
                                  }}
                                  onTabNext={
                                    tabNavigation
                                      ? () => {
                                          const nextCol = findAdjacentEditableCol(
                                            col.key, 'next', row,
                                          );
                                          if (nextCol) {
                                            enterEditMode(key, nextCol, row);
                                          } else {
                                            setEditingCell(null);
                                          }
                                        }
                                      : undefined
                                  }
                                  onTabPrev={
                                    tabNavigation
                                      ? () => {
                                          const prevCol = findAdjacentEditableCol(
                                            col.key, 'prev', row,
                                          );
                                          if (prevCol) {
                                            enterEditMode(key, prevCol, row);
                                          } else {
                                            setEditingCell(null);
                                          }
                                        }
                                      : undefined
                                  }
                                />
                              ) : col.render
                                ? col.render(cellValue, row, index)
                                : String(cellValue ?? '')}
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
                            {isRowEditing
                              ? renderInlineEditActions(isRowSaving)
                              : actions(row, index)}
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
                                ? '1px solid var(--ds-table-row-border, var(--ds-color-border-subtle))'
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
                {/* Virtual scroll: bottom spacer row to maintain total scroll height */}
                {virtualized && virtualBottomSpacerHeight > 0 && (
                  <tr aria-hidden="true" style={{ height: virtualBottomSpacerHeight, border: 'none' }}>
                    <td colSpan={totalColSpan} style={{ padding: 0, border: 'none' }} />
                  </tr>
                )}
                  </>
                )}
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
            transition: 'background var(--ds-motion-fast) ease, color var(--ds-motion-fast) ease',
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
                  aria-label="Previous page"
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
                        transition: 'background var(--ds-motion-fast) ease, color var(--ds-motion-fast) ease',
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
                  aria-label="Next page"
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
                    transition: `opacity var(--ds-motion-fast)`,
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
