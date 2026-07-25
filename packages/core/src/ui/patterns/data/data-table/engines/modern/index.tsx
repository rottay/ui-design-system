"use client";

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

import { densityScopeAttributes } from '@/infrastructure/runtime/foundation/density';
import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  AlertTriangleIcon,
  ArrowUpDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon as Check,
  ChevronDownIcon,
  ChevronRightIcon,
  GripVerticalIcon as GripVertical,
  Table2Icon,
  XIcon as X,
} from "../../../../../../graphics/icons";
import { arrayValueAt } from "@/foundation/kernel/collections";
import type { DataTablePatternProps } from "../../contracts";
import { resolveAccessor, resolveRowKey } from "../../runtime/row-resolution";
import ModernCheckbox from "../../../../../primitives/inputs/Checkbox/engines/modern";
import { Button } from "../../../../../primitives/inputs/Button";
import { Tooltip } from "../../../../../primitives/display/Tooltip";
import { useVirtualScroll } from "../../../../runtime/virtualization/virtual-scroll";
import { useGroupedData } from "../../runtime/grouping";
import type { EditableConfig } from "../../../../../../foundation/contracts/runtime/components/patterns/core";
import { InlineCellEditor } from "./cell-editor";

/**
 * Resolves the EditableConfig for a column.
 * Returns null if the column is not editable, or a normalized config object.
 */
function resolveEditableConfig<T>(
  editable: boolean | EditableConfig<T> | undefined
): EditableConfig<T> | null {
  if (!editable) return null;
  if (editable === true) return { type: "text" };
  return editable;
}

type InlineEditorControls = {
  save: () => Promise<boolean>;
  cancel: () => void;
};

function resolveColumnLabel(header: React.ReactNode, fallback: string): string {
  return typeof header === "string" || typeof header === "number"
    ? String(header)
    : fallback;
}

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
    error = false,
    errorState,
    messages,
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
    recipe,
    zebraColor,
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
    density: densityProp,
    // Virtual scrolling
    virtualized = false,
    virtualRowHeight = 48,
    // Inline cell editing
    onCellEdit,
    onCellEditStart,
    onCellEditCancel,
    editingCell: controlledEditingCell,
    editTrigger = "doubleClick",
    tabNavigation = true,
    // Row grouping
    groupBy,
    aggregations,
    defaultGroupExpanded = true,
    renderGroupHeader,
  } = props;

  const density = densityProp ?? (compact ? "compact" : "comfortable");
  const resolvedRecipe =
    recipe ?? (bordered ? "grid" : striped ? "zebra" : "minimal");
  const rowsAreStriped = resolvedRecipe === "zebra";

  // ---------------------------------------------------------------------------
  // Internal state
  // ---------------------------------------------------------------------------

  // Uncontrolled selection fallback -- lets the table work standalone without
  // the consumer needing to lift selection state.
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(
    []
  );
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
  const editingCell =
    controlledEditingCell !== undefined
      ? controlledEditingCell
      : internalEditingCell;
  const setEditingCell = useCallback(
    (cell: { rowKey: string; columnKey: string } | null) => {
      if (controlledEditingCell === undefined) {
        setInternalEditingCell(cell);
      }
    },
    [controlledEditingCell]
  );

  // --- Column resize state ---
  const resizeRef = useRef<{
    key: string;
    startX: number;
    startWidth: number;
    direction: "ltr" | "rtl";
  } | null>(null);

  // --- Column reorder state (pointer-event based, not HTML5 drag & drop) ---
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
  const currentRowKeys = useMemo(
    () => data.map((row, index) => getRowKey(row, index)),
    [data, getRowKey]
  );
  const currentSelectedCount = currentRowKeys.filter((key) =>
    selectedKeys.includes(key)
  ).length;
  const allCurrentRowsSelected =
    currentRowKeys.length > 0 && currentSelectedCount === currentRowKeys.length;
  const someCurrentRowsSelected =
    currentSelectedCount > 0 && !allCurrentRowsSelected;

  const resolvedActionsColumnWidth = actionsColumnWidth ?? 120;
  const resolveColumnWidth = useCallback(
    (col: NonNullable<DataTablePatternProps<T>["columns"]>[number]) =>
      columnWidths?.[col.key] ??
      col.width ??
      (resizable ? col.minWidth : undefined),
    [columnWidths, resizable]
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
  }, [
    columns,
    columnVisibility,
    visibleColumnKeys,
    lockedColumns,
    reorderable,
    columnOrder,
  ]);

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
    (currentKey: string, direction: "next" | "prev", row: T): string | null => {
      const editableCols = visibleColumns.filter((col) => {
        const cfg = resolveEditableConfig(col.editable);
        if (!cfg) return false;
        if (cfg.canEdit && !cfg.canEdit(row)) return false;
        return true;
      });
      if (editableCols.length === 0) return null;
      const currentIdx = editableCols.findIndex((c) => c.key === currentKey);
      if (direction === "next") {
        const nextIdx = currentIdx + 1;
        return nextIdx < editableCols.length
          ? arrayValueAt(editableCols, nextIdx)?.key ?? null
          : null;
      } else {
        const prevIdx = currentIdx - 1;
        return prevIdx >= 0
          ? arrayValueAt(editableCols, prevIdx)?.key ?? null
          : null;
      }
    },
    [visibleColumns]
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
      if (editingCell?.rowKey === rk && editingCell.columnKey === colKey)
        return;

      if (editingCell) {
        discardActiveInlineEdit();
      }

      activeInlineEditRef.current = { rowKey: rk, columnKey: colKey, row };
      setEditingCell({ rowKey: rk, columnKey: colKey });
      onCellEditStart?.(row, colKey);
    },
    [
      discardActiveInlineEdit,
      editingCell,
      savingCell,
      visibleColumns,
      setEditingCell,
      onCellEditStart,
    ]
  );

  /** Handle saving a cell value from the inline editor. */
  const handleCellSave = useCallback(
    async (
      row: T,
      rk: string,
      colKey: string,
      newValue: unknown,
      oldValue: unknown
    ) => {
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
    [visibleColumns, onCellEdit, setEditingCell]
  );

  /** Handle cancelling inline editing. */
  const handleCellCancel = useCallback(
    (row: T, colKey: string) => {
      onCellEditCancel?.(row, colKey);
      inlineEditorControlsRef.current = null;
      activeInlineEditRef.current = null;
      setEditingCell(null);
    },
    [onCellEditCancel, setEditingCell]
  );

  // ---------------------------------------------------------------------------
  // Virtual scrolling
  // ---------------------------------------------------------------------------

  // Resolve container height from maxHeight for the virtual scroll hook.
  // Only activate when both `virtualized` and a numeric `maxHeight` are set.
  const resolvedContainerHeight =
    typeof maxHeight === "number"
      ? maxHeight
      : typeof maxHeight === "string" && maxHeight.endsWith("px")
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
    ? virtualScroll.totalHeight -
      virtualScroll.offsetTop -
      (virtualScroll.endIndex - virtualScroll.startIndex) * virtualRowHeight
    : 0;

  // ---------------------------------------------------------------------------
  // Resize handlers
  // ---------------------------------------------------------------------------

  const handleResizeStart = useCallback(
    (
      e: React.PointerEvent,
      key: string,
      currentWidth: number,
      minWidth = 50,
      maxWidth = 1000
    ) => {
      e.preventDefault();
      e.stopPropagation();
      const direction =
        getComputedStyle(e.currentTarget).direction === "rtl" ? "rtl" : "ltr";
      resizeRef.current = {
        key,
        startX: e.clientX,
        startWidth: currentWidth,
        direction,
      };

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!resizeRef.current) return;
        const physicalDelta = moveEvent.clientX - resizeRef.current.startX;
        const diff =
          resizeRef.current.direction === "rtl"
            ? -physicalDelta
            : physicalDelta;
        const newWidth = Math.min(
          maxWidth,
          Math.max(minWidth, resizeRef.current.startWidth + diff)
        );
        onColumnResize?.(resizeRef.current.key, newWidth);
      };

      const finishResize = () => {
        resizeRef.current = null;
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", finishResize);
        document.removeEventListener("pointercancel", finishResize);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", finishResize);
      document.addEventListener("pointercancel", finishResize);
    },
    [onColumnResize]
  );

  // ---------------------------------------------------------------------------
  // Column reorder handlers (pointer-event based for mouse, pen and touch)
  // ---------------------------------------------------------------------------

  const headerRowRef = useRef<HTMLTableRowElement | null>(null);

  const handleReorderStart = useCallback(
    (e: React.PointerEvent, key: string) => {
      if (!reorderable || !onColumnReorder) return;
      e.preventDefault();
      e.stopPropagation();
      reorderRef.current = { sourceKey: key, startX: e.clientX };
      setDragSourceKey(key);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!reorderRef.current || !headerRowRef.current) return;
        // Find which <th> the active pointer is over.
        const ths =
          headerRowRef.current.querySelectorAll<HTMLTableCellElement>(
            "th[data-col-key]"
          );
        for (const th of ths) {
          const rect = th.getBoundingClientRect();
          if (
            moveEvent.clientX >= rect.left &&
            moveEvent.clientX <= rect.right
          ) {
            const colKey = th.dataset.colKey;
            if (colKey && colKey !== reorderRef.current.sourceKey) {
              setDragOverKey(colKey);
            }
            break;
          }
        }
      };

      let finishReorder: (upEvent: PointerEvent) => void;
      let cancelReorder: () => void;

      const cleanupReorder = () => {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", finishReorder);
        document.removeEventListener("pointercancel", cancelReorder);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      finishReorder = (upEvent: PointerEvent) => {
        cleanupReorder();

        if (!reorderRef.current || !headerRowRef.current) {
          setDragSourceKey(null);
          setDragOverKey(null);
          reorderRef.current = null;
          return;
        }

        // Find drop target
        const ths =
          headerRowRef.current.querySelectorAll<HTMLTableCellElement>(
            "th[data-col-key]"
          );
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

        const currentOrder =
          columnOrder && columnOrder.length > 0
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

      cancelReorder = () => {
        cleanupReorder();
        reorderRef.current = null;
        setDragSourceKey(null);
        setDragOverKey(null);
      };

      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", finishReorder);
      document.addEventListener("pointercancel", cancelReorder);
    },
    [reorderable, onColumnReorder, columnOrder, processedColumns]
  );

  const handleReorderKeyDown = useCallback(
    (event: React.KeyboardEvent, key: string) => {
      if (!reorderable || !onColumnReorder) return;
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;

      const currentOrder =
        columnOrder && columnOrder.length > 0
          ? columnOrder
          : processedColumns.map((column) => column.key);
      const sourceIndex = currentOrder.indexOf(key);
      if (sourceIndex < 0) return;
      const isRtl = getComputedStyle(event.currentTarget).direction === "rtl";
      const arrowDelta = event.key === "ArrowLeft" ? -1 : 1;
      const logicalArrowDelta = isRtl ? -arrowDelta : arrowDelta;

      const targetIndex =
        event.key === "Home"
          ? 0
          : event.key === "End"
          ? currentOrder.length - 1
          : Math.min(
              currentOrder.length - 1,
              Math.max(0, sourceIndex + logicalArrowDelta)
            );

      if (targetIndex === sourceIndex) return;
      event.preventDefault();
      event.stopPropagation();
      const nextOrder = [...currentOrder];
      nextOrder.splice(sourceIndex, 1);
      nextOrder.splice(targetIndex, 0, key);
      onColumnReorder(nextOrder);
    },
    [columnOrder, onColumnReorder, processedColumns, reorderable]
  );

  // ---------------------------------------------------------------------------
  // Pin helpers
  // ---------------------------------------------------------------------------

  /** Resolve the pin side for a column (controlled pinnedColumns > column def) */
  const getPinSide = useCallback(
    (
      colKey: string,
      colPin?: "left" | "right"
    ): "left" | "right" | undefined => {
      if (pinnedColumns) {
        if (pinnedColumns.left.includes(colKey)) return "left";
        if (pinnedColumns.right.includes(colKey)) return "right";
        return undefined;
      }
      return colPin;
    },
    [pinnedColumns]
  );

  const getPinnedOffsetStyle = useCallback(
    (
      colKey: string,
      side: "left" | "right" | undefined
    ): React.CSSProperties => {
      if (!side) return {};
      const currentIndex = visibleColumns.findIndex(
        (column) => column.key === colKey
      );
      if (currentIndex < 0) return {};

      const widthTerm = (
        column: (typeof visibleColumns)[number]
      ): string => {
        const width = resolveColumnWidth(column) ?? column.minWidth ?? 150;
        if (typeof width === "number") return `${width}px`;
        return /^(?:\d+(?:\.\d+)?)(?:px|rem|em|ch|vw|%)$/.test(width)
          ? width
          : "150px";
      };

      const siblingColumns =
        side === "left"
          ? visibleColumns.slice(0, currentIndex)
          : visibleColumns.slice(currentIndex + 1);
      const terms = siblingColumns
        .filter((column) => getPinSide(column.key, column.pin) === side)
        .map(widthTerm);

      if (side === "right" && actions) {
        const actionsWidthTerm =
          typeof resolvedActionsColumnWidth === "number"
            ? `${resolvedActionsColumnWidth}px`
            : /^(?:\d+(?:\.\d+)?)(?:px|rem|em|ch|vw|%)$/.test(
                  resolvedActionsColumnWidth
                )
              ? resolvedActionsColumnWidth
              : "120px";
        terms.unshift(actionsWidthTerm);
      }

      const offset = terms.length > 0 ? `calc(${terms.join(" + ")})` : 0;
      return side === "left"
        ? { insetInlineStart: offset }
        : { insetInlineEnd: offset };
    },
    [
      actions,
      getPinSide,
      resolveColumnWidth,
      resolvedActionsColumnWidth,
      visibleColumns,
    ]
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
    if (controlledSelectedKeys === undefined) setInternalSelectedKeys(next);
    const selectedRows = data.filter((r, i) => next.includes(getRowKey(r, i)));
    onSelectionChange?.(next, selectedRows);
  };

  const toggleAll = () => {
    const currentSet = new Set(currentRowKeys);
    const next = allCurrentRowsSelected
      ? selectedKeys.filter((key) => !currentSet.has(key))
      : Array.from(new Set([...selectedKeys, ...currentRowKeys]));
    if (controlledSelectedKeys === undefined) setInternalSelectedKeys(next);
    const selectedRows = data.filter((row, index) =>
      next.includes(getRowKey(row, index))
    );
    onSelectionChange?.(next, selectedRows);
  };

  // ---------------------------------------------------------------------------
  // Sort handler
  // ---------------------------------------------------------------------------

  // Cycle sort direction when the same column is clicked again; reset to
  // ascending when switching to a different column. This mirrors spreadsheet UX.
  const handleSort = (key: string) => {
    if (!onSortChange) return;
    if (sorting?.key === key) {
      onSortChange({
        key,
        direction: sorting.direction === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({ key, direction: "asc" });
    }
  };

  // ---------------------------------------------------------------------------
  // Keyboard navigation: header sort via Enter/Space
  // ---------------------------------------------------------------------------

  const handleHeaderKeyDown = useCallback(
    (e: React.KeyboardEvent, colKey: string) => {
      if (e.key === "Enter" || e.key === " ") {
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
        case "ArrowDown":
          e.preventDefault();
          nextIndex = Math.min(index + 1, data.length - 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          nextIndex = Math.max(index - 1, 0);
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = data.length - 1;
          break;
        case "Enter":
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
        editTrigger === "doubleClick" &&
        isElementTarget &&
        Boolean(target.closest('td[data-editable="true"]'));
      const isEditingAwayClick =
        Boolean(editingCell) &&
        isElementTarget &&
        !target.closest('td[data-editing="true"]');

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
    [clearPendingEditableRowClick, editTrigger, editingCell, onRowClick]
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
    [
      clearPendingEditableRowClick,
      discardActiveInlineEdit,
      editingCell,
      savingCell,
    ]
  );

  useEffect(() => clearPendingEditableRowClick, [clearPendingEditableRowClick]);

  useEffect(() => {
    inlineEditorControlsRef.current = null;
  }, [editingCell?.rowKey, editingCell?.columnKey]);

  const renderInlineEditActions = useCallback(
    (isSaving: boolean) => {
      const stopActionEvent = (event: React.SyntheticEvent) => {
        event.preventDefault();
        event.stopPropagation();
      };

      return (
        <span aria-label="Inline edit actions" data-part="inline-edit-actions">
          <span
            data-part="inline-edit-action"
            data-intent="save"
            data-saving={isSaving ? "true" : "false"}
          >
            <Button
              variant="success"
              size="xs"
              shape="circle"
              aria-label={
                isSaving
                  ? messages?.savingEdit ?? "Saving edit"
                  : messages?.saveEdit ?? "Save edit"
              }
              disabled={isSaving}
              icon={<Check size={15} strokeWidth={2.4} aria-hidden />}
              onPointerDown={stopActionEvent}
              onMouseDown={stopActionEvent}
              onClick={(event) => {
                stopActionEvent(event);
                if (!isSaving) inlineEditorControlsRef.current?.save();
              }}
            />
          </span>
          <span
            data-part="inline-edit-action"
            data-intent="cancel"
            data-saving={isSaving ? "true" : "false"}
          >
            <Button
              variant="danger"
              size="xs"
              shape="circle"
              aria-label={messages?.cancelEdit ?? "Cancel edit"}
              disabled={isSaving}
              icon={<X size={15} strokeWidth={2.4} aria-hidden />}
              onPointerDown={stopActionEvent}
              onMouseDown={stopActionEvent}
              onClick={(event) => {
                stopActionEvent(event);
                if (!isSaving) inlineEditorControlsRef.current?.cancel();
              }}
            />
          </span>
        </span>
      );
    },
    [messages?.cancelEdit, messages?.saveEdit, messages?.savingEdit]
  );

  // Focus the active row element when activeRowIndex changes
  useEffect(() => {
    if (activeRowIndex < 0 || !tbodyRef.current) return;
    const rows =
      tbodyRef.current.querySelectorAll<HTMLTableRowElement>(
        "tr[data-row-index]"
      );
    const targetRow = rows.item(activeRowIndex);
    if (targetRow) {
      targetRow.focus();
    }
  }, [activeRowIndex]);

  // ---------------------------------------------------------------------------
  // Style / class derivation
  // ---------------------------------------------------------------------------

  // Table classes -- we no longer rely on DaisyUI utility classes; styling
  // is applied via token-backed runtime style props for full theme compatibility.
  const tableClasses = "ds-modern-table";
  const rootStyle = {
    ...(zebraColor ? { "--ds-table-row-bg-striped": zebraColor } : {}),
    ...style,
  } as React.CSSProperties;

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
  const skeletonRowCount =
    pagination && pagination.pageSize ? Math.min(pagination.pageSize, 8) : 5;

  return (
    <div
      className={`ds-pattern-data-table ds-engine-modern ds-table-density-${density} ${
        className ?? ""
      }`}
      data-component="data-table"
      {...densityScopeAttributes(density)}
      data-recipe={resolvedRecipe}
      data-bordered={resolvedRecipe === "grid" ? "true" : "false"}
      data-striped={rowsAreStriped ? "true" : "false"}
      data-error={error ? "true" : "false"}
      data-has-actions={actions ? "true" : "false"}
      data-loading={loading ? "true" : "false"}
      data-has-toolbar={toolbar ? "true" : "false"}
      data-has-pagination={pagination ? "true" : "false"}
      data-part="root"
      data-selectable={selectable ? "true" : "false"}
      data-column-dragging={dragSourceKey ? "true" : "false"}
      data-reorderable={reorderable && onColumnReorder ? "true" : "false"}
      data-resizable={resizable && onColumnResize ? "true" : "false"}
      data-sticky-header={stickyHeader ? "true" : "false"}
      data-virtualized={virtualized ? "true" : "false"}
      aria-busy={loading || undefined}
      style={rootStyle}
    >
      {header}

      {/* Toolbar slot */}
      {toolbar && <div data-part="toolbar">{toolbar}</div>}

      {/* Table container: card surface, rounded, bordered. The data-ds-table-*
          attributes are the stable addressing contract for consumers
          (WO-UX-03) — apps must never target the inline-style values. */}
      <div
        data-ds-table-card="true"
        data-part="card"
        data-state={error ? "error" : loading ? "loading" : data.length === 0 ? "empty" : "ready"}
      >
        {/* Scroll container */}
        <div
          ref={virtualized ? virtualScroll.scrollRef : undefined}
          onScroll={virtualized ? virtualScroll.onScroll : undefined}
          data-ds-table-scroll="true"
          data-bounded={maxHeight ? "true" : "false"}
          data-part="scroll"
          data-state={error ? "error" : loading ? "loading" : data.length === 0 ? "empty" : "ready"}
          style={maxHeight ? { maxHeight } : undefined}
        >
          {error ? (
            <div role="alert" data-part="error-state">
              {errorState ?? (
                <>
                  <span data-part="state-icon-tile" aria-hidden="true">
                    <AlertTriangleIcon size={28} strokeWidth={1.5} />
                  </span>
                  <span data-part="state-title">
                    {messages?.errorTitle ?? "Unable to load data"}
                  </span>
                  <span data-part="state-description">
                    {messages?.errorDescription ??
                      "Try again or adjust your filters."}
                  </span>
                </>
              )}
            </div>
          ) : loading ? (
            <div
              role="status"
              aria-label={messages?.loadingLabel ?? "Loading"}
              data-part="skeleton"
            >
              {/* Skeleton header */}
              <div data-part="skeleton-header">
                {visibleColumns.slice(0, 5).map((col, ci) => (
                  <div
                    key={col.key}
                    data-part="skeleton-header-col"
                    data-leading={ci === 0 ? "true" : "false"}
                  />
                ))}
              </div>
              {/* Skeleton rows */}
              {Array.from({ length: skeletonRowCount }).map((_, i) => (
                <div
                  key={i}
                  className="ds-skeleton-row"
                  data-part="skeleton-row"
                  data-divider={i < skeletonRowCount - 1 ? "true" : "false"}
                  style={
                    {
                      "--ds-modern-table-skeleton-index": i,
                    } as React.CSSProperties
                  }
                >
                  {visibleColumns.slice(0, 5).map((col, ci) => (
                    <div
                      key={col.key}
                      data-part="skeleton-cell"
                      data-leading={ci === 0 ? "true" : "false"}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            /* Empty state: centered, muted, generous padding */
            <div data-part="empty-state" role="status">
              {emptyState ?? (
                <>
                  <div data-part="state-icon-tile" aria-hidden="true">
                    <Table2Icon size={28} strokeWidth={1.5} />
                  </div>
                  <span data-part="state-title">
                    {messages?.emptyTitle ?? "No data to display"}
                  </span>
                  <span data-part="state-description">
                    {messages?.emptyDescription ??
                      "Try adjusting your search or filters."}
                  </span>
                </>
              )}
            </div>
          ) : (
            <table
              className={tableClasses}
              role="grid"
              aria-label={messages?.tableLabel ?? "Data table"}
              aria-colcount={totalColSpan}
              aria-rowcount={data.length}
              data-part="table"
              data-resizable={resizable ? "true" : "false"}
            >
              {/* Table header: panel surface, uppercase labels */}
              <thead
                data-part="table-head"
                data-sticky={stickyHeader ? "true" : "false"}
              >
                <tr ref={headerRowRef} data-part="header-row">
                  {/* Select-all checkbox */}
                  {selectable && (
                    <th data-cell-kind="selection" data-part="header-cell">
                      <ModernCheckbox
                        size="sm"
                        aria-label={messages?.selectAll ?? "Select all rows"}
                        checked={allCurrentRowsSelected}
                        indeterminate={someCurrentRowsSelected}
                        onChange={toggleAll}
                      />
                    </th>
                  )}
                  {expandedRow && (
                    <th data-cell-kind="expansion" data-part="header-cell" />
                  )}
                  {visibleColumns.map((col, columnIndex) => {
                    const pinSide = getPinSide(col.key, col.pin);
                    const resolvedWidth = resolveColumnWidth(col);
                    const isLeadingDataColumn =
                      columnIndex === 0 && !expandedRow;
                    const columnLabel = resolveColumnLabel(
                      col.header,
                      col.key
                    );
                    const sortState =
                      sorting?.key === col.key
                        ? sorting.direction
                        : "none";
                    const moveColumnLabel =
                      messages?.moveColumn?.(columnLabel) ??
                      `Drag to reorder column ${columnLabel}`;
                    const resizeColumnLabel =
                      messages?.resizeColumn?.(columnLabel) ??
                      `Resize column ${columnLabel}`;

                    return (
                      <th
                        key={col.key}
                        role="columnheader"
                        aria-sort={
                          col.sortable
                            ? sorting?.key === col.key
                              ? sorting.direction === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                            : undefined
                        }
                        tabIndex={col.sortable ? 0 : undefined}
                        style={{
                          width: resolvedWidth,
                          minWidth: col.minWidth,
                          maxWidth: col.maxWidth,
                          ...getPinnedOffsetStyle(col.key, pinSide),
                        }}
                        data-align={col.align}
                        data-col-key={col.key}
                        data-col-priority={col.priority || undefined}
                        data-column-interactive={
                          col.sortable || reorderable || resizable
                            ? "true"
                            : "false"
                        }
                        data-drag-source={
                          dragSourceKey === col.key ? "true" : "false"
                        }
                        data-leading={
                          isLeadingDataColumn && selectable ? "true" : "false"
                        }
                        data-pin-side={pinSide}
                        data-reorderable={
                          reorderable && onColumnReorder ? "true" : "false"
                        }
                        data-resizable={resizable ? "true" : "false"}
                        data-sortable={col.sortable ? "true" : undefined}
                        data-sort-state={col.sortable ? sortState : undefined}
                        data-part="header-cell"
                        data-pinned={pinSide ? "true" : "false"}
                        data-drag-over={
                          dragOverKey === col.key &&
                          dragSourceKey &&
                          dragSourceKey !== col.key
                            ? "true"
                            : "false"
                        }
                        onClick={
                          col.sortable ? () => handleSort(col.key) : undefined
                        }
                        onKeyDown={
                          col.sortable
                            ? (e) => handleHeaderKeyDown(e, col.key)
                            : undefined
                        }
                      >
                        <div data-part="header-content">
                          {/* Drag grip */}
                          {reorderable && onColumnReorder && (
                            <Tooltip
                              className="ds-data-table__column-tooltip ds-data-table__column-tooltip--reorder"
                              content={moveColumnLabel}
                              placement="top"
                              recipe="inverse"
                              showDelay={280}
                            >
                              <span
                                onPointerDown={(e) =>
                                  handleReorderStart(e, col.key)
                                }
                                data-drag-source={
                                  dragSourceKey === col.key ? "true" : "false"
                                }
                                data-part="drag-grip"
                                aria-label={moveColumnLabel}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) =>
                                  handleReorderKeyDown(event, col.key)
                                }
                                onClick={(event) => event.stopPropagation()}
                              >
                                <GripVertical
                                  size={13}
                                  strokeWidth={2.2}
                                  aria-hidden
                                />
                              </span>
                            </Tooltip>
                          )}
                          <span data-part="header-label">{col.header}</span>
                          {col.sortable && (
                            <span
                              data-active={sortState !== "none" ? "true" : "false"}
                              data-part="sort-icon"
                              data-sort-state={sortState}
                              aria-hidden="true"
                            >
                              {sortState === "none" ? (
                                <ArrowUpDownIcon size={12} strokeWidth={1.8} />
                              ) : (
                                <ChevronDownIcon size={12} strokeWidth={2.1} />
                              )}
                            </span>
                          )}
                          {/* Drop indicator line */}
                          {dragOverKey === col.key &&
                            dragSourceKey !== col.key && (
                              <span data-part="drop-indicator" />
                            )}
                        </div>
                        {/* Column resize handle */}
                        {resizable && onColumnResize && (
                          <Tooltip
                            className="ds-data-table__column-tooltip ds-data-table__column-tooltip--resize"
                            content={resizeColumnLabel}
                            placement="top"
                            recipe="inverse"
                            showDelay={360}
                          >
                            <span
                              className="ds-resize-handle"
                              data-column-resize-handle="true"
                              data-part="resize-handle"
                              role="separator"
                              aria-orientation="vertical"
                              aria-valuemin={col.minWidth ?? 50}
                              aria-valuemax={col.maxWidth ?? 1000}
                              aria-valuenow={
                                typeof resolvedWidth === "number"
                                  ? resolvedWidth
                                  : 150
                              }
                              aria-label={resizeColumnLabel}
                              tabIndex={0}
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                handleResizeStart(
                                  e,
                                  col.key,
                                  typeof resolvedWidth === "number"
                                    ? resolvedWidth
                                    : 150,
                                  col.minWidth ?? 50,
                                  col.maxWidth ?? 1000
                                );
                              }}
                              onKeyDown={(e) => {
                                if (!onColumnResize) return;
                                const currentW =
                                  typeof resolvedWidth === "number"
                                    ? resolvedWidth
                                    : 150;
                                if (
                                  e.key === "ArrowRight" ||
                                  e.key === "ArrowLeft"
                                ) {
                                  e.preventDefault();
                                  const isRtl =
                                    getComputedStyle(e.currentTarget)
                                      .direction === "rtl";
                                  const physicalDelta =
                                    e.key === "ArrowRight" ? 10 : -10;
                                  const logicalDelta = isRtl
                                    ? -physicalDelta
                                    : physicalDelta;
                                  onColumnResize(
                                    col.key,
                                    Math.min(
                                      Math.max(
                                        currentW + logicalDelta,
                                        col.minWidth ?? 50
                                      ),
                                      col.maxWidth ?? 1000
                                    )
                                  );
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span
                                className="ds-resize-handle__bar"
                                data-part="resize-handle-bar"
                              />
                            </span>
                          </Tooltip>
                        )}
                      </th>
                    );
                  })}
                  {/* Actions column header */}
                  {actions && (
                    <th
                      data-cell-kind="actions"
                      data-part="header-cell"
                      data-pin-side="right"
                      data-pinned="true"
                      style={{
                        width: resolvedActionsColumnWidth,
                        minWidth: resolvedActionsColumnWidth,
                      }}
                    >
                      {messages?.actionsColumn ?? "Actions"}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody ref={tbodyRef}>
                {/* --------------------------------------------------------- */}
                {/* Grouped rendering: group headers + collapsible sections    */}
                {/* --------------------------------------------------------- */}
                {isGrouped &&
                  (() => {
                    let globalIndex = 0;

                    return sections.map((section, sectionIndex) => {
                      const isCollapsed = collapsedGroups.has(
                        section.groupValue
                      );
                      const isLastSection =
                        sectionIndex === sections.length - 1;

                      // Build aggregate summary chips for the default header
                      const aggregateChips = Object.entries(
                        section.aggregates
                      ).map(([colKey, value]) => {
                        const col = visibleColumns.find(
                          (c) => c.key === colKey
                        );
                        const label = col
                          ? typeof col.header === "string"
                            ? col.header
                            : colKey
                          : colKey;
                        return `${label}: ${String(value ?? "")}`;
                      });

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
                          const isLastRowInSection =
                            localIndex === section.items.length - 1;
                          const isLastRowOverall =
                            isLastSection && isLastRowInSection;

                          sectionRows.push(
                            <React.Fragment key={key}>
                              <tr
                                data-row-index={index}
                                data-row-key={key}
                                data-clickable={onRowClick ? "true" : "false"}
                                data-part="body-row"
                                data-selected={isSelected ? "true" : "false"}
                                data-striped={
                                  rowsAreStriped && index % 2 === 1
                                    ? "true"
                                    : "false"
                                }
                                data-hoverable={hoverable ? "true" : "false"}
                                data-last={isLastRowOverall ? "true" : "false"}
                                aria-selected={
                                  selectable ? isSelected : undefined
                                }
                                tabIndex={
                                  (
                                    activeRowIndex < 0
                                      ? index === 0
                                      : activeRowIndex === index
                                  )
                                    ? 0
                                    : -1
                                }
                                role="row"
                                onClick={
                                  onRowClick
                                    ? (event) =>
                                        handleRowClick(event, row, index)
                                    : undefined
                                }
                                onDoubleClick={handleEditAbandonDoubleClick}
                                onKeyDown={(e) =>
                                  handleRowKeyDown(e, row, index)
                                }
                                onFocus={() => setActiveRowIndex(index)}
                              >
                                {selectable && (
                                  <td
                                    data-part="selection-cell"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ModernCheckbox
                                      size="sm"
                                      aria-label={
                                        messages?.selectRow?.(key) ??
                                        `Select row ${key}`
                                      }
                                      checked={isSelected}
                                      onChange={() => toggleSelection(key, row)}
                                    />
                                  </td>
                                )}
                                {expandedRow && (
                                  <td data-part="expand-cell">
                                    <span
                                      data-part="expand-button"
                                      data-expanded={
                                        isRowExpanded ? "true" : "false"
                                      }
                                    >
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        shape="circle"
                                        aria-label={
                                          messages?.expandRow?.(
                                            key,
                                            isRowExpanded
                                          ) ??
                                          `${
                                            isRowExpanded
                                              ? "Collapse"
                                              : "Expand"
                                          } row ${key}`
                                        }
                                        icon={
                                          isRowExpanded ? (
                                            <ChevronDownIcon
                                              size={14}
                                              aria-hidden
                                            />
                                          ) : (
                                            <ChevronRightIcon
                                              size={14}
                                              aria-hidden
                                            />
                                          )
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedKeys((prev) => {
                                            const next = new Set(prev);
                                            next.has(key)
                                              ? next.delete(key)
                                              : next.add(key);
                                            return next;
                                          });
                                        }}
                                      />
                                    </span>
                                  </td>
                                )}
                                {/* Data cells (grouped path -- with inline editing) */}
                                {visibleColumns.map((col, columnIndex) => {
                                  const pinSide = getPinSide(col.key, col.pin);
                                  const resolvedWidth = resolveColumnWidth(col);
                                  const isLeadingDataColumn =
                                    columnIndex === 0 && !expandedRow;

                                  const editableCfg = resolveEditableConfig(
                                    col.editable
                                  );
                                  const isCellEditable =
                                    editableCfg != null &&
                                    (!editableCfg.canEdit ||
                                      editableCfg.canEdit(row));
                                  const isCellEditing =
                                    editingCell?.rowKey === key &&
                                    editingCell?.columnKey === col.key;
                                  const cellValue = resolveAccessor(col, row);

                                  const grpTriggerProps: Record<
                                    string,
                                    unknown
                                  > = {};
                                  if (isCellEditable && !isCellEditing) {
                                    const handler = (e: React.MouseEvent) => {
                                      clearPendingEditableRowClick();
                                      e.preventDefault();
                                      e.stopPropagation();
                                      enterEditMode(key, col.key, row);
                                    };
                                    if (editTrigger === "click") {
                                      grpTriggerProps.onClick = handler;
                                    } else {
                                      grpTriggerProps.onDoubleClick = handler;
                                    }
                                  }

                                  return (
                                    <td
                                      key={col.key}
                                      data-align={col.align}
                                      data-col-priority={
                                        col.priority || undefined
                                      }
                                      data-editable={
                                        isCellEditable ? "true" : undefined
                                      }
                                      data-editing={
                                        isCellEditing ? "true" : undefined
                                      }
                                      data-leading={
                                        isLeadingDataColumn && selectable
                                          ? "true"
                                          : "false"
                                      }
                                      data-part="data-cell"
                                      data-pin-side={pinSide}
                                      data-pinned={pinSide ? "true" : "false"}
                                      aria-description={
                                        isCellEditable && !isCellEditing
                                          ? messages?.editCell?.(editTrigger) ??
                                            (editTrigger === "click"
                                              ? "Click to edit"
                                              : "Double-click to edit")
                                          : undefined
                                      }
                                      {...grpTriggerProps}
                                      className={
                                        col.align === "right"
                                          ? "ds-nums-tabular"
                                          : undefined
                                      }
                                      style={{
                                        width: resolvedWidth,
                                        minWidth: col.minWidth,
                                        maxWidth: col.maxWidth,
                                        ...getPinnedOffsetStyle(
                                          col.key,
                                          pinSide
                                        ),
                                      }}
                                    >
                                      {isCellEditing && editableCfg ? (
                                        <InlineCellEditor
                                          value={cellValue}
                                          row={row}
                                          columnKey={col.key}
                                          config={editableCfg}
                                          onSave={(newValue) =>
                                            handleCellSave(
                                              row,
                                              key,
                                              col.key,
                                              newValue,
                                              cellValue
                                            )
                                          }
                                          onCancel={() =>
                                            handleCellCancel(row, col.key)
                                          }
                                          onControlsChange={(controls) => {
                                            if (
                                              editingCell?.rowKey === key &&
                                              editingCell.columnKey === col.key
                                            ) {
                                              inlineEditorControlsRef.current =
                                                controls;
                                            }
                                          }}
                                          onTabNext={
                                            tabNavigation
                                              ? () => {
                                                  const nextCol =
                                                    findAdjacentEditableCol(
                                                      col.key,
                                                      "next",
                                                      row
                                                    );
                                                  if (nextCol) {
                                                    enterEditMode(
                                                      key,
                                                      nextCol,
                                                      row
                                                    );
                                                  } else {
                                                    setEditingCell(null);
                                                  }
                                                }
                                              : undefined
                                          }
                                          onTabPrev={
                                            tabNavigation
                                              ? () => {
                                                  const prevCol =
                                                    findAdjacentEditableCol(
                                                      col.key,
                                                      "prev",
                                                      row
                                                    );
                                                  if (prevCol) {
                                                    enterEditMode(
                                                      key,
                                                      prevCol,
                                                      row
                                                    );
                                                  } else {
                                                    setEditingCell(null);
                                                  }
                                                }
                                              : undefined
                                          }
                                        />
                                      ) : col.render ? (
                                        col.render(cellValue, row, index)
                                      ) : (
                                        String(cellValue ?? "")
                                      )}
                                    </td>
                                  );
                                })}
                                {actions && (
                                  <td
                                    data-part="actions-cell"
                                    style={{
                                      width: resolvedActionsColumnWidth,
                                      minWidth: resolvedActionsColumnWidth,
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div data-part="actions-content">
                                      {isRowEditing
                                        ? renderInlineEditActions(isRowSaving)
                                        : actions(row, index)}
                                    </div>
                                  </td>
                                )}
                              </tr>
                              {expandedRow && isRowExpanded && (
                                <tr>
                                  <td
                                    colSpan={totalColSpan}
                                    data-part="expanded-row"
                                    data-last={
                                      isLastRowOverall ? "true" : "false"
                                    }
                                  >
                                    <div data-part="expanded-row-content">
                                      {expandedRow(row)}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
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
                            tabIndex={0}
                            data-part="group-header-row"
                            data-collapsed={isCollapsed ? "true" : "false"}
                            onClick={() => toggleGroup(section.groupValue)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                toggleGroup(section.groupValue);
                              }
                            }}
                          >
                            <td
                              colSpan={totalColSpan}
                              data-part="group-header-cell"
                            >
                              {renderGroupHeader ? (
                                renderGroupHeader(
                                  section.groupValue,
                                  section.items,
                                  !isCollapsed
                                )
                              ) : (
                                <span data-part="group-header-content">
                                  <span
                                    data-part="group-header-chevron"
                                    data-collapsed={
                                      isCollapsed ? "true" : "false"
                                    }
                                  >
                                    <ChevronDownIcon size={14} aria-hidden />
                                  </span>
                                  <span>
                                    {section.groupValue ||
                                      messages?.emptyGroup ||
                                      "(empty)"}
                                  </span>
                                  <span data-part="group-header-count-pill">
                                    {section.items.length}
                                  </span>
                                  {aggregateChips.length > 0 && (
                                    <span data-part="group-header-aggregate">
                                      {aggregateChips.map((chip, ci) => (
                                        <span key={ci}>
                                          {ci > 0 && (
                                            <span data-part="group-header-aggregate-separator">
                                              {"\u00B7"}
                                            </span>
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
                      <tr
                        aria-hidden="true"
                        data-part="virtual-spacer"
                        style={{ height: virtualScroll.offsetTop }}
                      >
                        <td colSpan={totalColSpan} data-part="virtual-spacer" />
                      </tr>
                    )}
                    {virtualizedData.map((row, sliceIndex) => {
                      // When virtualized, the actual data index is offset by startIndex
                      const index = virtualized
                        ? virtualScroll.startIndex + sliceIndex
                        : sliceIndex;
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
                            data-row-key={key}
                            data-clickable={onRowClick ? "true" : "false"}
                            data-part="body-row"
                            data-selected={isSelected ? "true" : "false"}
                            data-striped={
                              rowsAreStriped && index % 2 === 1
                                ? "true"
                                : "false"
                            }
                            data-hoverable={hoverable ? "true" : "false"}
                            data-last={isLastRow ? "true" : "false"}
                            data-virtualized={virtualized ? "true" : "false"}
                            aria-selected={selectable ? isSelected : undefined}
                            tabIndex={
                              (
                                activeRowIndex < 0
                                  ? index === 0
                                  : activeRowIndex === index
                              )
                                ? 0
                                : -1
                            }
                            role="row"
                            onClick={
                              onRowClick
                                ? (event) => handleRowClick(event, row, index)
                                : undefined
                            }
                            onDoubleClick={handleEditAbandonDoubleClick}
                            onKeyDown={(e) => handleRowKeyDown(e, row, index)}
                            onFocus={() => setActiveRowIndex(index)}
                            style={
                              virtualized
                                ? { height: virtualRowHeight }
                                : undefined
                            }
                          >
                            {/* Selection checkbox */}
                            {selectable && (
                              <td
                                data-part="selection-cell"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ModernCheckbox
                                  size="sm"
                                  aria-label={
                                    messages?.selectRow?.(key) ??
                                    `Select row ${key}`
                                  }
                                  checked={isSelected}
                                  onChange={() => toggleSelection(key, row)}
                                />
                              </td>
                            )}
                            {/* Expand toggle */}
                            {expandedRow && (
                              <td data-part="expand-cell">
                                <span
                                  data-part="expand-button"
                                  data-expanded={isExpanded ? "true" : "false"}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    shape="circle"
                                    aria-label={
                                      messages?.expandRow?.(key, isExpanded) ??
                                      `${
                                        isExpanded ? "Collapse" : "Expand"
                                      } row ${key}`
                                    }
                                    icon={
                                      isExpanded ? (
                                        <ChevronDownIcon
                                          size={14}
                                          aria-hidden
                                        />
                                      ) : (
                                        <ChevronRightIcon
                                          size={14}
                                          aria-hidden
                                        />
                                      )
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedKeys((prev) => {
                                        const next = new Set(prev);
                                        next.has(key)
                                          ? next.delete(key)
                                          : next.add(key);
                                        return next;
                                      });
                                    }}
                                  />
                                </span>
                              </td>
                            )}
                            {/* Data cells (with inline editing support) */}
                            {visibleColumns.map((col, columnIndex) => {
                              const pinSide = getPinSide(col.key, col.pin);
                              const resolvedWidth = resolveColumnWidth(col);
                              const isLeadingDataColumn =
                                columnIndex === 0 && !expandedRow;

                              // Inline editing: resolve config and state for this cell
                              const editableCfg = resolveEditableConfig(
                                col.editable
                              );
                              const isCellEditable =
                                editableCfg != null &&
                                (!editableCfg.canEdit ||
                                  editableCfg.canEdit(row));
                              const isCellEditing =
                                editingCell?.rowKey === key &&
                                editingCell?.columnKey === col.key;
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
                                if (editTrigger === "click") {
                                  triggerProps.onClick = handler;
                                } else {
                                  triggerProps.onDoubleClick = handler;
                                }
                              }

                              return (
                                <td
                                  key={col.key}
                                  data-align={col.align}
                                  data-col-priority={col.priority || undefined}
                                  data-editable={
                                    isCellEditable ? "true" : undefined
                                  }
                                  data-editing={
                                    isCellEditing ? "true" : undefined
                                  }
                                  data-leading={
                                    isLeadingDataColumn && selectable
                                      ? "true"
                                      : "false"
                                  }
                                  data-part="data-cell"
                                  data-pin-side={pinSide}
                                  data-pinned={pinSide ? "true" : "false"}
                                  aria-description={
                                    isCellEditable && !isCellEditing
                                      ? messages?.editCell?.(editTrigger) ??
                                        (editTrigger === "click"
                                          ? "Click to edit"
                                          : "Double-click to edit")
                                      : undefined
                                  }
                                  {...triggerProps}
                                  className={
                                    col.align === "right"
                                      ? "ds-nums-tabular"
                                      : undefined
                                  }
                                  style={{
                                    width: resolvedWidth,
                                    minWidth: col.minWidth,
                                    maxWidth: col.maxWidth,
                                    ...getPinnedOffsetStyle(
                                      col.key,
                                      pinSide
                                    ),
                                  }}
                                >
                                  {isCellEditing && editableCfg ? (
                                    <InlineCellEditor
                                      value={cellValue}
                                      row={row}
                                      columnKey={col.key}
                                      config={editableCfg}
                                      onSave={(newValue) =>
                                        handleCellSave(
                                          row,
                                          key,
                                          col.key,
                                          newValue,
                                          cellValue
                                        )
                                      }
                                      onCancel={() =>
                                        handleCellCancel(row, col.key)
                                      }
                                      onControlsChange={(controls) => {
                                        if (
                                          editingCell?.rowKey === key &&
                                          editingCell.columnKey === col.key
                                        ) {
                                          inlineEditorControlsRef.current =
                                            controls;
                                        }
                                      }}
                                      onTabNext={
                                        tabNavigation
                                          ? () => {
                                              const nextCol =
                                                findAdjacentEditableCol(
                                                  col.key,
                                                  "next",
                                                  row
                                                );
                                              if (nextCol) {
                                                enterEditMode(
                                                  key,
                                                  nextCol,
                                                  row
                                                );
                                              } else {
                                                setEditingCell(null);
                                              }
                                            }
                                          : undefined
                                      }
                                      onTabPrev={
                                        tabNavigation
                                          ? () => {
                                              const prevCol =
                                                findAdjacentEditableCol(
                                                  col.key,
                                                  "prev",
                                                  row
                                                );
                                              if (prevCol) {
                                                enterEditMode(
                                                  key,
                                                  prevCol,
                                                  row
                                                );
                                              } else {
                                                setEditingCell(null);
                                              }
                                            }
                                          : undefined
                                      }
                                    />
                                  ) : col.render ? (
                                    col.render(cellValue, row, index)
                                  ) : (
                                    String(cellValue ?? "")
                                  )}
                                </td>
                              );
                            })}
                            {/* Actions cell */}
                            {actions && (
                              <td
                                data-part="actions-cell"
                                style={{
                                  width: resolvedActionsColumnWidth,
                                  minWidth: resolvedActionsColumnWidth,
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div data-part="actions-content">
                                  {isRowEditing
                                    ? renderInlineEditActions(isRowSaving)
                                    : actions(row, index)}
                                </div>
                              </td>
                            )}
                          </tr>
                          {/* Expanded row content */}
                          {expandedRow && isExpanded && (
                            <tr>
                              <td
                                colSpan={totalColSpan}
                                data-part="expanded-row"
                                data-last={isLastRow ? "true" : "false"}
                              >
                                <div data-part="expanded-row-content">
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
                      <tr
                        aria-hidden="true"
                        data-part="virtual-spacer"
                        style={{ height: virtualBottomSpacerHeight }}
                      >
                        <td colSpan={totalColSpan} data-part="virtual-spacer" />
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination: inside the card, border-top separator */}
        {pagination &&
          (() => {
            const totalPages = Math.max(
              1,
              Math.ceil(pagination.total / pagination.pageSize)
            );
            const isFirstPage = pagination.current <= 1;
            const isLastPage = pagination.current >= totalPages;

            // Build page number array with ellipsis
            const getPageNumbers = (): (number | "ellipsis")[] => {
              if (totalPages <= 7) {
                return Array.from({ length: totalPages }, (_, i) => i + 1);
              }
              const pages: (number | "ellipsis")[] = [1];
              const current = pagination.current;
              if (current > 3) pages.push("ellipsis");
              const start = Math.max(2, current - 1);
              const end = Math.min(totalPages - 1, current + 1);
              for (let i = start; i <= end; i++) pages.push(i);
              if (current < totalPages - 2) pages.push("ellipsis");
              if (totalPages > 1) pages.push(totalPages);
              return pages;
            };

            return (
              <div data-part="pagination-bar">
                <span data-part="pagination-range">
                  {messages?.paginationRange?.(
                    pagination.total === 0
                      ? 0
                      : (pagination.current - 1) * pagination.pageSize + 1,
                    Math.min(
                      pagination.current * pagination.pageSize,
                      pagination.total
                    ),
                    pagination.total
                  ) ??
                    `${
                      pagination.total === 0
                        ? 0
                        : (pagination.current - 1) * pagination.pageSize + 1
                    } \u2013 ${Math.min(
                      pagination.current * pagination.pageSize,
                      pagination.total
                    )} of ${pagination.total.toLocaleString()}`}
                </span>
                <div data-part="pagination-controls">
                  {/* Previous */}
                  <span data-part="pagination-nav-button">
                    <Button
                      disabled={isFirstPage}
                      variant="ghost"
                      size="xs"
                      shape="circle"
                      icon={<ArrowLeftIcon size={14} aria-hidden />}
                      onClick={() =>
                        pagination.onChange(
                          pagination.current - 1,
                          pagination.pageSize
                        )
                      }
                      aria-label={messages?.previousPage ?? "Previous page"}
                    />
                  </span>
                  {/* Page numbers */}
                  {getPageNumbers().map((page, idx) =>
                    page === "ellipsis" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        data-part="pagination-ellipsis"
                      >
                        ...
                      </span>
                    ) : (
                      <span
                        key={page}
                        data-part="pagination-page-button"
                        data-current={
                          page === pagination.current ? "true" : "false"
                        }
                      >
                        <Button
                          variant={
                            page === pagination.current ? "primary" : "ghost"
                          }
                          size="xs"
                          shape="circle"
                          aria-label={messages?.page?.(page) ?? `Page ${page}`}
                          aria-current={
                            page === pagination.current ? "page" : undefined
                          }
                          onClick={() =>
                            pagination.onChange(page, pagination.pageSize)
                          }
                        >
                          {page}
                        </Button>
                      </span>
                    )
                  )}
                  {/* Next */}
                  <span data-part="pagination-nav-button">
                    <Button
                      disabled={isLastPage}
                      variant="ghost"
                      size="xs"
                      shape="circle"
                      icon={<ArrowRightIcon size={14} aria-hidden />}
                      onClick={() =>
                        pagination.onChange(
                          pagination.current + 1,
                          pagination.pageSize
                        )
                      }
                      aria-label={messages?.nextPage ?? "Next page"}
                    />
                  </span>
                </div>
              </div>
            );
          })()}

        {/* Bulk selection bar: sticky at bottom with elevation */}
        {bulkActions && selectedKeys.length > 0 && (
          <div data-part="bulk-bar">
            <span data-part="bulk-bar-count">
              {messages?.selectedCount?.(selectedKeys.length) ??
                `${selectedKeys.length} item${
                  selectedKeys.length !== 1 ? "s" : ""
                } selected`}
            </span>
            <div data-part="bulk-bar-actions">
              {bulkActions.map((action) => (
                <span
                  key={action.key}
                  data-part="bulk-bar-action"
                  data-variant={action.variant ?? "default"}
                >
                  <Button
                    disabled={action.disabled}
                    variant={
                      action.variant === "danger"
                        ? "danger"
                        : action.variant === "primary"
                        ? "primary"
                        : "secondary"
                    }
                    size="sm"
                    icon={action.icon}
                    onClick={() => {
                      const selectedRows = data.filter((row, i) =>
                        selectedKeys.includes(getRowKey(row, i))
                      );
                      action.onExecute(selectedRows);
                    }}
                  >
                    {action.label}
                  </Button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {footer}
    </div>
  );
}
