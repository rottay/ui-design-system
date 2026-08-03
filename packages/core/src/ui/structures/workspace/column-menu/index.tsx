"use client";

/**
 * @fileoverview ColumnMenu — structures-tier floating column visibility
 * and ordering panel with a draft + apply UX flow.
 *
 * @description
 * Engine-free panel that ships with its own trigger button and composes the
 * canonical Popover primitive for portal scope, positioning, dismissal and
 * focus restoration. Pairs with workspace/list pages where users want to
 * stage column visibility and ordering changes locally and apply them in
 * one batched callback (rather than the live-update model used by the
 * existing ColumnSettingsDropdown pattern).
 *
 * Key differences from ColumnSettingsDropdown:
 *   - Owns the trigger button (drop-in for command bars)
 *   - Draft state with "Apply columns" CTA, not live updates
 *   - Visible drag handle plus up/down arrows for reordering
 *   - Listens to a custom DOM event for external open requests
 *
 * The family stays domain-agnostic: it works with any column shape that
 * has `key: string` and `title: string`. Generic over `T` so consumers can
 * pass their full table column definitions without losing type safety.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PinOffIcon as PinOff } from "../../../../graphics/icons";
import { LayoutColumnsIcon } from "@/graphics/icons/presentation/semantic/generated/roles/layout-columns";
import { ActionReorderIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-reorder";
import { ActionUndoIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-undo";
import { NavigationUpIcon } from "@/graphics/icons/presentation/semantic/generated/roles/navigation-up";
import { NavigationDownIcon } from "@/graphics/icons/presentation/semantic/generated/roles/navigation-down";
import { NavigationForwardIcon } from "@/graphics/icons/presentation/semantic/generated/roles/navigation-forward";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  InputNumber,
  Popover,
  Text,
} from "../../../primitives";
import { useOptionalTranslation } from "@/infrastructure/runtime/i18n";

function readColumnRecordValue(value: unknown, key: PropertyKey): unknown {
  if (typeof value !== "object" || value === null) return undefined;
  return Reflect.get(value, key);
}

/** Minimal column shape required by the menu. Compatible with any richer
 *  ColumnDef<T> via structural subtyping. */
export interface ColumnMenuColumn {
  key: string;
  title: string;
  /** Category group label for grouping columns under collapsible headers. */
  group?: string;
}

export interface ColumnMenuActionItem {
  key: string;
  title: string;
  locked?: boolean;
}

export interface ColumnMenuProps<T extends ColumnMenuColumn> {
  columns: T[];
  visibleColumns: string[];
  columnOrder?: string[];
  onColumnsChange: (visibleKeys: string[], orderedKeys: string[]) => void;
  actions?: ColumnMenuActionItem[];
  visibleActions?: string[];
  onVisibleActionsChange?: (visibleActionKeys: string[]) => void;
  onReset: () => void;
  compact?: boolean;
  /**
   * Custom DOM event name the menu listens to in order to open/close from
   * outside (typically a keyboard shortcut handler in the workspace
   * orchestrator). Defaults to
   * `entity-table-workspace:toggle-columns-menu` for backwards-compat with
   * the original app-platform extraction.
   */
  externalToggleEventName?: string;

  // --- Column Pinning ---

  /** Currently pinned columns. */
  pinnedColumns?: { left: string[]; right: string[] };
  /** Called when pin state changes. */
  onPinChange?: (pinned: { left: string[]; right: string[] }) => void;

  // --- Column Width ---

  /** Current column widths (key -> px). */
  columnWidths?: Record<string, number>;
  /** Called when a column width is changed via the menu. */
  onColumnResize?: (key: string, width: number) => void;

  // --- Column Grouping ---

  /**
   * Column groups for category grouping. When provided, columns that have a
   * matching `group` value are rendered under collapsible group headers.
   * The array order determines group display order; ungrouped columns render
   * at the top.
   */
  groups?: Array<{ key: string; label: string; columns: string[] }>;
}

function CountPill({ label }: { label: string }) {
  return <Box data-part="count-pill">{label}</Box>;
}

/** Small pin-left icon (pin rotated to point left). ROLE GAP: there is no
 *  governed `layout.pin-start`/`layout.pin-end` role yet, so the two pin
 *  glyphs stay local (documented for the iconography lane). */
function PinLeftIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 8h5M10 4l-2 4 2 4M13 4v8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Small pin-right icon (pin rotated to point right). */
function PinRightIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 8H8M6 4l2 4-2 4M3 4v8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const DEFAULT_TOGGLE_EVENT = "entity-table-workspace:toggle-columns-menu";

export function ColumnMenu<T extends ColumnMenuColumn>({
  columns,
  visibleColumns,
  columnOrder,
  onColumnsChange,
  actions,
  visibleActions,
  onVisibleActionsChange,
  onReset,
  compact = false,
  externalToggleEventName = DEFAULT_TOGGLE_EVENT,
  pinnedColumns,
  onPinChange,
  columnWidths,
  onColumnResize,
  groups,
}: ColumnMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftVisible, setDraftVisible] = useState<string[]>(visibleColumns);
  const [draftOrder, setDraftOrder] = useState<string[]>(
    columnOrder && columnOrder.length > 0
      ? columnOrder
      : columns.map((column) => column.key)
  );
  const [draftVisibleActions, setDraftVisibleActions] = useState<string[]>(
    visibleActions ?? actions?.map((action) => action.key) ?? []
  );
  const [draftPinned, setDraftPinned] = useState<{
    left: string[];
    right: string[];
  }>(pinnedColumns ?? { left: [], right: [] });
  const [draftWidths, setDraftWidths] = useState<Record<string, number>>(
    columnWidths ?? {}
  );
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );
  const [editingWidthKey, setEditingWidthKey] = useState<string | null>(null);
  const [draggedColumnKey, setDraggedColumnKey] = useState<string | null>(null);
  const [dragOverColumnKey, setDragOverColumnKey] = useState<string | null>(
    null
  );
  const panelRef = useRef<HTMLElement | null>(null);
  const i18n = useOptionalTranslation("components");
  /**
   * Catalog lookup with an honest English floor: when the provider is absent
   * or echoes the raw key (missing entry), the historical default wins.
   */
  const tOr = useCallback(
    (key: string, fallback: string): string => {
      const resolved = i18n?.t(key);
      if (
        resolved === undefined ||
        resolved === key ||
        resolved === `components.${key}`
      ) {
        return fallback;
      }
      return resolved;
    },
    [i18n]
  );
  const orderedColumns = useMemo(() => {
    const known = new Map(
      columns.map((column) => [column.key, column] as const)
    );
    const ordered = draftOrder
      .map((key) => known.get(key))
      .filter((column): column is T => Boolean(column));

    const missing = columns.filter(
      (column) => !draftOrder.includes(column.key)
    );
    return [...ordered, ...missing];
  }, [columns, draftOrder]);

  /** Build a group-key -> column[] map for grouped rendering.
   *  Ungrouped columns go under the `_ungrouped` sentinel key. */
  const groupedColumnSections = useMemo(() => {
    if (!groups || groups.length === 0) return null;

    const groupColumnSet = new Map<string, Set<string>>();
    for (const g of groups) {
      groupColumnSet.set(g.key, new Set(g.columns));
    }

    const sections: Array<{ groupKey: string; label: string; columns: T[] }> =
      [];
    const assignedKeys = new Set<string>();

    // Ungrouped columns first.
    const ungrouped = orderedColumns.filter((col) => {
      for (const s of groupColumnSet.values()) {
        if (s.has(col.key)) return false;
      }
      return true;
    });
    if (ungrouped.length > 0) {
      sections.push({ groupKey: "_ungrouped", label: "", columns: ungrouped });
      for (const c of ungrouped) assignedKeys.add(c.key);
    }

    // Then each group in the provided order.
    for (const g of groups) {
      const members = orderedColumns.filter(
        (col) =>
          groupColumnSet.get(g.key)?.has(col.key) && !assignedKeys.has(col.key)
      );
      if (members.length > 0) {
        sections.push({ groupKey: g.key, label: g.label, columns: members });
        for (const c of members) assignedKeys.add(c.key);
      }
    }

    return sections;
  }, [groups, orderedColumns]);

  const handleOpen = useCallback(() => {
    setDraftVisible([...visibleColumns]);
    setDraftOrder(
      columnOrder && columnOrder.length > 0
        ? [...columnOrder]
        : columns.map((column) => column.key)
    );
    setDraftVisibleActions(
      visibleActions
        ? [...visibleActions]
        : actions?.map((action) => action.key) ?? []
    );
    setDraftPinned(
      pinnedColumns
        ? { left: [...pinnedColumns.left], right: [...pinnedColumns.right] }
        : { left: [], right: [] }
    );
    setDraftWidths(columnWidths ? { ...columnWidths } : {});
    setIsOpen(true);
  }, [
    actions,
    columnOrder,
    columns,
    columnWidths,
    pinnedColumns,
    visibleActions,
    visibleColumns,
  ]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        handleOpen();
        return;
      }
      setIsOpen(false);
    },
    [handleOpen]
  );

  const handleToggleColumn = useCallback((key: string) => {
    setDraftVisible((previous) => {
      if (previous.includes(key)) {
        if (previous.length === 1) return previous;
        return previous.filter((current) => current !== key);
      }

      return [...previous, key];
    });
  }, []);

  const handleMove = useCallback(
    (key: string, direction: -1 | 1) => {
      setDraftOrder((previous) => {
        const knownColumnKeys = columns.map((column) => column.key);
        const knownColumnKeySet = new Set(knownColumnKeys);
        const completeOrder = [
          ...previous.filter((columnKey) => knownColumnKeySet.has(columnKey)),
          ...knownColumnKeys.filter(
            (columnKey) => !previous.includes(columnKey)
          ),
        ];
        const index = completeOrder.indexOf(key);
        return moveItem(completeOrder, index, index + direction);
      });
    },
    [columns]
  );

  const moveDraftColumn = useCallback(
    (sourceKey: string, targetKey: string) => {
      if (sourceKey === targetKey) return;

      setDraftOrder((previous) => {
        const knownColumnKeys = columns.map((column) => column.key);
        const knownColumnKeySet = new Set(knownColumnKeys);
        const completeOrder = [
          ...previous.filter((columnKey) => knownColumnKeySet.has(columnKey)),
          ...knownColumnKeys.filter(
            (columnKey) => !previous.includes(columnKey)
          ),
        ];
        const sourceIndex = completeOrder.indexOf(sourceKey);
        const targetIndex = completeOrder.indexOf(targetKey);

        return moveItem(completeOrder, sourceIndex, targetIndex);
      });
    },
    [columns]
  );

  const handleColumnDragStart = useCallback(
    (event: React.DragEvent<HTMLElement>, key: string) => {
      setDraggedColumnKey(key);
      setDragOverColumnKey(null);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", key);
    },
    []
  );

  const handleColumnDragOver = useCallback(
    (event: React.DragEvent<HTMLElement>, key: string) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      if (draggedColumnKey && draggedColumnKey !== key) {
        setDragOverColumnKey(key);
      }
    },
    [draggedColumnKey]
  );

  const handleColumnDrop = useCallback(
    (event: React.DragEvent<HTMLElement>, key: string) => {
      event.preventDefault();
      const sourceKey =
        event.dataTransfer.getData("text/plain") || draggedColumnKey;
      if (sourceKey) {
        moveDraftColumn(sourceKey, key);
      }
      setDraggedColumnKey(null);
      setDragOverColumnKey(null);
    },
    [draggedColumnKey, moveDraftColumn]
  );

  const handleColumnDragEnd = useCallback(() => {
    setDraggedColumnKey(null);
    setDragOverColumnKey(null);
  }, []);

  const handleToggleAction = useCallback((key: string, locked?: boolean) => {
    if (locked) return;

    setDraftVisibleActions((previous) => {
      if (previous.includes(key)) {
        return previous.filter((current) => current !== key);
      }

      return [...previous, key];
    });
  }, []);

  const handleTogglePin = useCallback((key: string, side: "left" | "right") => {
    setDraftPinned((prev) => {
      const currentSide = side === "left" ? prev.left : prev.right;
      const oppositeSide = side === "left" ? prev.right : prev.left;
      const isAlreadyPinned = currentSide.includes(key);
      if (isAlreadyPinned) {
        const nextCurrentSide = currentSide.filter(
          (currentKey) => currentKey !== key
        );
        return side === "left"
          ? { left: nextCurrentSide, right: prev.right }
          : { left: prev.left, right: nextCurrentSide };
      }
      // Remove from other side if present, then add to this side.
      const nextCurrentSide = [...currentSide, key];
      const nextOppositeSide = oppositeSide.filter(
        (currentKey) => currentKey !== key
      );
      return side === "left"
        ? { left: nextCurrentSide, right: nextOppositeSide }
        : { left: nextOppositeSide, right: nextCurrentSide };
    });
  }, []);

  const handleWidthChange = useCallback((key: string, width: number) => {
    const clamped = Math.max(40, Math.min(2000, width));
    setDraftWidths((prev) => ({ ...prev, [key]: clamped }));
  }, []);

  const handleToggleGroup = useCallback((groupKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  }, []);

  const handleApply = useCallback(() => {
    onColumnsChange(draftVisible, draftOrder);
    onVisibleActionsChange?.(draftVisibleActions);
    onPinChange?.(draftPinned);
    // Apply individual width changes
    if (onColumnResize) {
      for (const [key, width] of Object.entries(draftWidths)) {
        if (!columnWidths || columnWidths[key] !== width) {
          onColumnResize(key, width);
        }
      }
    }
    setIsOpen(false);
  }, [
    columnWidths,
    draftOrder,
    draftPinned,
    draftVisible,
    draftVisibleActions,
    draftWidths,
    onColumnResize,
    onColumnsChange,
    onPinChange,
    onVisibleActionsChange,
  ]);

  const handleReset = useCallback(() => {
    onReset();
    setIsOpen(false);
  }, [onReset]);

  const visibleCount = draftVisible.length;
  const hiddenCount = Math.max(columns.length - visibleCount, 0);
  const visibleActionsCount = draftVisibleActions.length;
  const totalActionCount = actions?.length ?? 0;

  useEffect(() => {
    const handleToggle = () => {
      if (isOpen) {
        setIsOpen(false);
      } else {
        handleOpen();
      }
    };

    window.addEventListener(
      externalToggleEventName,
      handleToggle as EventListener
    );
    return () => {
      window.removeEventListener(
        externalToggleEventName,
        handleToggle as EventListener
      );
    };
  }, [externalToggleEventName, handleOpen, isOpen]);

  // Move focus into the dialog after the Popover surface has committed.
  // Escape, outside interaction, collision handling, portal scope, z-index
  // and focus restoration belong to the canonical Popover primitive.
  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return undefined;
    const frame = window.requestAnimationFrame(() => panelRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  const triggerLabel = `${tOr(
    "columnMenu.triggerLabel",
    "Columns"
  )}: ${visibleCount} ${tOr("columnMenu.visibleSuffix", "visible")}${
    hiddenCount > 0
      ? `, ${hiddenCount} ${tOr("columnMenu.hiddenSuffix", "hidden")}`
      : ""
  }`;

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={isOpen}
      onOpenChange={handleOpenChange}
      arrow={false}
      closeOnEscape
      closeOnInteractOutside
      destroyTooltipOnHide
      role="dialog"
      aria-label={tOr("columnMenu.panelLabel", "Table columns")}
      recipe="bordered"
      maxWidth="min(var(--ds-column-menu-panel-inline-size, 432px), calc(100vw - 24px))"
      className="ds-structure ds-column-menu"
      overlayClassName="ds-structure ds-column-menu-panel"
      overlayStyle={{
        inlineSize:
          "min(var(--ds-column-menu-panel-inline-size, 432px), calc(100vw - 24px))",
      }}
      content={
        <Box data-part="panel" data-open={isOpen} ref={panelRef} tabIndex={-1}>
          <Box data-part="header">
            <Flex align="start" justify="between" gap={12}>
              <Box data-part="header-copy">
                <Text data-part="header-title" size="sm" weight="medium">
                  {tOr("columnMenu.headerTitle", "Table columns")}
                </Text>
                <Text data-part="description" size="xs">
                  {tOr(
                    "columnMenu.headerDescription",
                    "Configure the table surface before applying."
                  )}
                </Text>
              </Box>
              <Flex align="center" gap={6}>
                <CountPill label={`${visibleCount}/${columns.length}`} />
                <Button
                  variant="ghost"
                  size="sm"
                  data-part="reset"
                  onClick={handleReset}
                  icon={<ActionUndoIcon size={12} decorative />}
                >
                  {tOr("columnMenu.reset", "Reset")}
                </Button>
              </Flex>
            </Flex>
          </Box>

          <Box data-part="scroll-region">
            <Flex direction="column" gap={8}>
              {(() => {
                const renderColumnRow = (
                  column: T,
                  index: number,
                  listLength: number
                ) => {
                  const isVisible = draftVisible.includes(column.key);
                  const isPinnedLeft = draftPinned.left.includes(column.key);
                  const isPinnedRight = draftPinned.right.includes(column.key);
                  const isPinned = isPinnedLeft || isPinnedRight;
                  const currentWidth = readColumnRecordValue(
                    draftWidths,
                    column.key
                  ) as number | undefined;
                  const isEditingWidth = editingWidthKey === column.key;
                  const isDragging = draggedColumnKey === column.key;
                  const isDragTarget =
                    dragOverColumnKey === column.key &&
                    draggedColumnKey !== column.key;

                  return (
                    <Box
                      key={column.key}
                      data-part="row"
                      data-drag-target={isDragTarget}
                      data-visible={isVisible}
                      data-dragging={isDragging}
                      onDragOver={(event: React.DragEvent<HTMLElement>) =>
                        handleColumnDragOver(event, column.key)
                      }
                      onDrop={(event: React.DragEvent<HTMLElement>) =>
                        handleColumnDrop(event, column.key)
                      }
                    >
                      <Flex
                        data-part="row-content"
                        align="center"
                        justify="between"
                        gap={10}
                      >
                        <Flex data-part="row-main" align="center" gap={12}>
                          <Button
                            variant="ghost"
                            size="xs"
                            data-part="drag-handle"
                            data-drag-target={isDragTarget}
                            data-dragging={isDragging}
                            draggable
                            aria-label={`${tOr(
                              "columnMenu.dragToMove",
                              "Drag to move"
                            )} ${column.title}`}
                            title={`${tOr(
                              "columnMenu.dragToMove",
                              "Drag to move"
                            )} ${column.title}`}
                            onDragStart={(
                              event: React.DragEvent<HTMLElement>
                            ) => handleColumnDragStart(event, column.key)}
                            onDragEnd={handleColumnDragEnd}
                            onClick={(event: React.MouseEvent<HTMLElement>) =>
                              event.preventDefault()
                            }
                            icon={<ActionReorderIcon size={15} decorative />}
                          />
                          <Checkbox
                            checked={isVisible}
                            size="sm"
                            onChange={() => handleToggleColumn(column.key)}
                          />
                          <Box data-part="row-copy">
                            <Flex align="center" gap={6}>
                              <Text
                                data-part="title"
                                data-visible={isVisible}
                                size="sm"
                              >
                                {column.title}
                              </Text>
                              {isPinned && (
                                <Text
                                  data-part="pin-badge"
                                  data-pinned={true}
                                  size="xs"
                                  aria-label={
                                    isPinnedLeft
                                      ? tOr(
                                          "columnMenu.pinnedLeft",
                                          "Pinned left"
                                        )
                                      : tOr(
                                          "columnMenu.pinnedRight",
                                          "Pinned right"
                                        )
                                  }
                                >
                                  {/* L/R are physical-side symbols (pinning
                                        is physical, not logical — documented). */}
                                  {isPinnedLeft ? "L" : "R"}
                                </Text>
                              )}
                            </Flex>
                            <Flex data-part="row-meta" align="center" gap={6}>
                              <Text
                                data-part="description"
                                data-visible={isVisible}
                                size="xs"
                              >
                                {isVisible
                                  ? tOr(
                                      "columnMenu.visibleInTable",
                                      "Visible in the table"
                                    )
                                  : tOr(
                                      "columnMenu.hiddenFromView",
                                      "Hidden from the current view"
                                    )}
                              </Text>
                              {/* Width badge (only when columnWidths prop is provided) */}
                              {onColumnResize &&
                                currentWidth != null &&
                                !isEditingWidth && (
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    data-part="width-badge"
                                    onClick={() =>
                                      setEditingWidthKey(column.key)
                                    }
                                    title={`${tOr(
                                      "columnMenu.widthPrefix",
                                      "Width"
                                    )}: ${currentWidth}px (${tOr(
                                      "columnMenu.clickToEdit",
                                      "click to edit"
                                    )})`}
                                  >
                                    {currentWidth}px
                                  </Button>
                                )}
                              {/* Inline width editor — the public InputNumber
                                    primitive (never a disguised native input).
                                    InputNumberProps has no aria/data index or
                                    blur/keydown hooks (registered contract gap,
                                    same as Textarea), so the part hook and the
                                    dismiss gestures ride a named group wrapper. */}
                              {onColumnResize && isEditingWidth && (
                                <span
                                  data-part="width-input"
                                  role="group"
                                  aria-label={`${tOr(
                                    "columnMenu.widthPrefix",
                                    "Width"
                                  )}: ${column.title}`}
                                  onBlur={(
                                    e: React.FocusEvent<HTMLSpanElement>
                                  ) => {
                                    if (
                                      !e.currentTarget.contains(
                                        e.relatedTarget as Node | null
                                      )
                                    ) {
                                      setEditingWidthKey(null);
                                    }
                                  }}
                                  onKeyDown={(
                                    e: React.KeyboardEvent<HTMLSpanElement>
                                  ) => {
                                    if (e.key === "Escape")
                                      setEditingWidthKey(null);
                                  }}
                                >
                                  <InputNumber
                                    size="sm"
                                    controls={false}
                                    autoFocus
                                    min={40}
                                    max={2000}
                                    value={currentWidth ?? 150}
                                    aria-label={`${tOr(
                                      "columnMenu.widthPrefix",
                                      "Width"
                                    )}: ${column.title}`}
                                    onChange={(val) => {
                                      if (val != null)
                                        handleWidthChange(
                                          column.key,
                                          Number(val)
                                        );
                                    }}
                                    onPressEnter={() =>
                                      setEditingWidthKey(null)
                                    }
                                  />
                                </span>
                              )}
                            </Flex>
                          </Box>
                        </Flex>

                        <Flex align="center" gap={4}>
                          {/* Pin left/right toggles (only when onPinChange provided) */}
                          {onPinChange && (
                            <>
                              <IconButton
                                label={
                                  isPinnedLeft
                                    ? `${tOr(
                                        "columnMenu.unpinFromLeft",
                                        "Unpin"
                                      )} ${column.title} ${tOr(
                                        "columnMenu.fromLeftSuffix",
                                        "from left"
                                      )}`
                                    : `${tOr("columnMenu.pinToLeft", "Pin")} ${
                                        column.title
                                      } ${tOr(
                                        "columnMenu.toLeftSuffix",
                                        "to left"
                                      )}`
                                }
                                pressed={isPinnedLeft}
                                onClick={() =>
                                  handleTogglePin(column.key, "left")
                                }
                              >
                                {isPinnedLeft ? (
                                  <PinOff size={13} />
                                ) : (
                                  <PinLeftIcon />
                                )}
                              </IconButton>
                              <IconButton
                                label={
                                  isPinnedRight
                                    ? `${tOr(
                                        "columnMenu.unpinFromRight",
                                        "Unpin"
                                      )} ${column.title} ${tOr(
                                        "columnMenu.fromRightSuffix",
                                        "from right"
                                      )}`
                                    : `${tOr("columnMenu.pinToRight", "Pin")} ${
                                        column.title
                                      } ${tOr(
                                        "columnMenu.toRightSuffix",
                                        "to right"
                                      )}`
                                }
                                pressed={isPinnedRight}
                                onClick={() =>
                                  handleTogglePin(column.key, "right")
                                }
                              >
                                {isPinnedRight ? (
                                  <PinOff size={13} />
                                ) : (
                                  <PinRightIcon />
                                )}
                              </IconButton>
                            </>
                          )}
                          <IconButton
                            label={`${tOr("columnMenu.moveUp", "Move")} ${
                              column.title
                            } ${tOr("columnMenu.upSuffix", "up")}`}
                            disabled={index === 0}
                            onClick={() => handleMove(column.key, -1)}
                          >
                            <NavigationUpIcon size={14} decorative />
                          </IconButton>
                          <IconButton
                            label={`${tOr("columnMenu.moveDown", "Move")} ${
                              column.title
                            } ${tOr("columnMenu.downSuffix", "down")}`}
                            disabled={index === listLength - 1}
                            onClick={() => handleMove(column.key, 1)}
                          >
                            <NavigationDownIcon size={14} decorative />
                          </IconButton>
                        </Flex>
                      </Flex>
                    </Box>
                  );
                };

                // If groups are provided, render under collapsible group headers.
                if (groupedColumnSections) {
                  return groupedColumnSections.map((section) => {
                    if (section.groupKey === "_ungrouped") {
                      return section.columns.map((col, idx) =>
                        renderColumnRow(col, idx, section.columns.length)
                      );
                    }

                    const isCollapsed = collapsedGroups.has(section.groupKey);

                    return (
                      <Box key={section.groupKey}>
                        <Button
                          variant="ghost"
                          size="sm"
                          block
                          data-part="group-toggle"
                          aria-expanded={!isCollapsed}
                          onClick={() => handleToggleGroup(section.groupKey)}
                          icon={
                            isCollapsed ? (
                              <NavigationForwardIcon size={14} decorative />
                            ) : (
                              <NavigationDownIcon size={14} decorative />
                            )
                          }
                        >
                          <Text
                            data-part="group-toggle-label"
                            size="xs"
                            weight="medium"
                          >
                            {section.label}
                          </Text>
                          <CountPill label={String(section.columns.length)} />
                        </Button>
                        {!isCollapsed && (
                          <Flex
                            data-part="group-content"
                            direction="column"
                            gap={6}
                          >
                            {section.columns.map((col, idx) =>
                              renderColumnRow(col, idx, section.columns.length)
                            )}
                          </Flex>
                        )}
                      </Box>
                    );
                  });
                }

                // Default: flat column list (unchanged behaviour).
                return orderedColumns.map((column, index) =>
                  renderColumnRow(column, index, orderedColumns.length)
                );
              })()}

              {actions && actions.length > 0 && (
                <Box data-part="action-section">
                  <Flex
                    data-part="action-section-header"
                    align="center"
                    justify="between"
                    gap={12}
                  >
                    <Box data-part="action-section-copy">
                      <Text
                        data-part="action-section-label"
                        size="xs"
                        weight="medium"
                      >
                        {tOr("columnMenu.rowActionsLabel", "Row actions")}
                      </Text>
                      <Text data-part="description" size="xs">
                        {tOr(
                          "columnMenu.rowActionsDescription",
                          "Choose which quick actions stay visible in the table."
                        )}
                      </Text>
                    </Box>
                    <CountPill
                      label={`${visibleActionsCount}/${totalActionCount}`}
                    />
                  </Flex>

                  <Flex direction="column" gap={8}>
                    {actions.map((action) => {
                      const isVisible = draftVisibleActions.includes(
                        action.key
                      );

                      return (
                        <Box
                          key={action.key}
                          data-part="action-row"
                          data-visible={isVisible}
                        >
                          <Flex
                            data-part="action-row-content"
                            align="center"
                            justify="between"
                            gap={10}
                          >
                            <Flex
                              data-part="action-row-main"
                              align="center"
                              gap={12}
                            >
                              <Checkbox
                                checked={isVisible}
                                size="sm"
                                disabled={action.locked}
                                onChange={() =>
                                  handleToggleAction(action.key, action.locked)
                                }
                              />
                              <Box data-part="action-row-copy">
                                <Text
                                  data-part="title"
                                  data-visible={isVisible}
                                  size="sm"
                                >
                                  {action.title}
                                </Text>
                                <Text
                                  data-part="description"
                                  data-visible={isVisible}
                                  size="xs"
                                >
                                  {action.locked
                                    ? tOr(
                                        "columnMenu.alwaysVisible",
                                        "Always visible in the table"
                                      )
                                    : isVisible
                                    ? tOr(
                                        "columnMenu.visibleInActions",
                                        "Visible in the actions column"
                                      )
                                    : tOr(
                                        "columnMenu.hiddenFromActions",
                                        "Hidden from the actions column"
                                      )}
                                </Text>
                              </Box>
                            </Flex>
                          </Flex>
                        </Box>
                      );
                    })}
                  </Flex>
                </Box>
              )}
            </Flex>
          </Box>

          <Flex align="center" justify="between" gap={12} data-part="footer">
            <Text data-part="footer-hint" size="xs">
              {tOr(
                "columnMenu.footerHint",
                "Column widths are also adjustable directly from the table header."
              )}
            </Text>
            <Button
              variant="primary"
              size="md"
              data-part="apply"
              onClick={handleApply}
            >
              {tOr("columnMenu.apply", "Apply columns")}
            </Button>
          </Flex>
        </Box>
      }
    >
      <Button
        variant="outline"
        size={compact ? "sm" : "md"}
        data-part="control"
        data-compact={compact}
        data-open={isOpen}
        className="ds-column-menu-control"
        icon={<LayoutColumnsIcon size={16} decorative />}
        title={triggerLabel}
        aria-label={triggerLabel}
      />
    </Popover>
  );
}

function IconButton({
  children,
  label,
  disabled,
  pressed,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  /** Toggle semantics for stateful icon buttons (pin side toggles). */
  pressed?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="xs"
      data-part="icon-button"
      data-disabled={!!disabled}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      icon={children}
    />
  );
}

// Compatibility aliases for pre-Checkpoint-D names. Deprecated —
// migrate to the canonical new names above. Scheduled for removal
// in Checkpoint F if no consumers remain.
export { ColumnMenu as WorkspaceColumnsMenu };
export type {
  ColumnMenuProps as WorkspaceColumnsMenuProps,
  ColumnMenuColumn as WorkspaceColumnsMenuColumn,
};
