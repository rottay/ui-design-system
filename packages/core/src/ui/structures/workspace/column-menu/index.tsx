'use client';

/**
 * @fileoverview ColumnMenu — structures-tier floating column visibility
 * and ordering panel with a draft + apply UX flow.
 *
 * @description
 * Engine-free panel that ships with its own trigger button, portal, and
 * positioning logic. Pairs with workspace/list pages where users want to
 * stage column visibility and ordering changes locally and apply them in
 * one batched callback (rather than the live-update model used by the
 * existing ColumnSettingsDropdown pattern).
 *
 * Key differences from ColumnSettingsDropdown:
 *   - Owns the trigger button + portal (drop-in for command bars)
 *   - Draft state with "Apply columns" CTA, not live updates
 *   - Visible drag handle plus up/down arrows for reordering
 *   - Listens to a custom DOM event for external open requests
 *
 * The family stays domain-agnostic: it works with any column shape that
 * has `key: string` and `title: string`. Generic over `T` so consumers can
 * pass their full table column definitions without losing type safety.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ArrowDownIcon as ArrowDown,
  ArrowUpIcon as ArrowUp,
  ChevronDownIcon as ChevronDown,
  ChevronRightIcon as ChevronRight,
  GripVerticalIcon as GripVertical,
  PinOffIcon as PinOff,
  RotateCcwIcon as RotateCcw,
} from '../../../../graphics/icons';

import { Box, Checkbox, Flex, Text } from '../../../primitives';
import { Portal } from '../../../primitives/runtime/overlay/portal';
import { PortalScope, usePortalScope } from '../../../primitives/runtime/overlay/portal-scope';

function readColumnRecordValue(value: unknown, key: PropertyKey): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
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
  return (
    <Box
      data-part="count-pill"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 26,
        height: 22,
        padding: '0 8px',
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {label}
    </Box>
  );
}

function ColumnsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="4.5" height="12" rx="1" stroke="currentColor" strokeWidth="1.33" />
      <rect x="9.5" y="2" width="4.5" height="12" rx="1" stroke="currentColor" strokeWidth="1.33" />
    </svg>
  );
}

/** Small pin-left icon (pin rotated to point left). */
function PinLeftIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const DEFAULT_TOGGLE_EVENT = 'entity-table-workspace:toggle-columns-menu';

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
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0, width: 432 });
  const [draftVisible, setDraftVisible] = useState<string[]>(visibleColumns);
  const [draftOrder, setDraftOrder] = useState<string[]>(
    columnOrder && columnOrder.length > 0 ? columnOrder : columns.map((column) => column.key),
  );
  const [draftVisibleActions, setDraftVisibleActions] = useState<string[]>(
    visibleActions ?? actions?.map((action) => action.key) ?? [],
  );
  const [draftPinned, setDraftPinned] = useState<{ left: string[]; right: string[] }>(
    pinnedColumns ?? { left: [], right: [] },
  );
  const [draftWidths, setDraftWidths] = useState<Record<string, number>>(columnWidths ?? {});
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [editingWidthKey, setEditingWidthKey] = useState<string | null>(null);
  const [draggedColumnKey, setDraggedColumnKey] = useState<string | null>(null);
  const [dragOverColumnKey, setDragOverColumnKey] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  // The panel leaves the trigger's DOM ancestry when it portals, so the
  // tenant/locale scope has to be re-stamped around it. `usePortalScope`
  // needs the anchor as state (a ref would not re-render when it lands), so
  // the trigger publishes to both.
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const setTriggerRef = useCallback((node: HTMLButtonElement | null) => {
    triggerRef.current = node;
    setAnchorEl(node);
  }, []);
  const portalScope = usePortalScope(anchorEl);

  const orderedColumns = useMemo(() => {
    const known = new Map(columns.map((column) => [column.key, column] as const));
    const ordered = draftOrder
      .map((key) => known.get(key))
      .filter((column): column is T => Boolean(column));

    const missing = columns.filter((column) => !draftOrder.includes(column.key));
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

    const sections: Array<{ groupKey: string; label: string; columns: T[] }> = [];
    const assignedKeys = new Set<string>();

    // Ungrouped columns first.
    const ungrouped = orderedColumns.filter((col) => {
      for (const s of groupColumnSet.values()) {
        if (s.has(col.key)) return false;
      }
      return true;
    });
    if (ungrouped.length > 0) {
      sections.push({ groupKey: '_ungrouped', label: '', columns: ungrouped });
      for (const c of ungrouped) assignedKeys.add(c.key);
    }

    // Then each group in the provided order.
    for (const g of groups) {
      const members = orderedColumns.filter((col) => groupColumnSet.get(g.key)?.has(col.key) && !assignedKeys.has(col.key));
      if (members.length > 0) {
        sections.push({ groupKey: g.key, label: g.label, columns: members });
        for (const c of members) assignedKeys.add(c.key);
      }
    }

    return sections;
  }, [groups, orderedColumns]);

  const handleOpen = useCallback(() => {
    setDraftVisible([...visibleColumns]);
    setDraftOrder(columnOrder && columnOrder.length > 0 ? [...columnOrder] : columns.map((column) => column.key));
    setDraftVisibleActions(visibleActions ? [...visibleActions] : actions?.map((action) => action.key) ?? []);
    setDraftPinned(pinnedColumns ? { left: [...pinnedColumns.left], right: [...pinnedColumns.right] } : { left: [], right: [] });
    setDraftWidths(columnWidths ? { ...columnWidths } : {});
    setIsOpen(true);
  }, [actions, columnOrder, columns, columnWidths, pinnedColumns, visibleActions, visibleColumns]);

  const handleToggleColumn = useCallback((key: string) => {
    setDraftVisible((previous) => {
      if (previous.includes(key)) {
        if (previous.length === 1) return previous;
        return previous.filter((current) => current !== key);
      }

      return [...previous, key];
    });
  }, []);

  const handleMove = useCallback((key: string, direction: -1 | 1) => {
    setDraftOrder((previous) => {
      const knownColumnKeys = columns.map((column) => column.key);
      const knownColumnKeySet = new Set(knownColumnKeys);
      const completeOrder = [
        ...previous.filter((columnKey) => knownColumnKeySet.has(columnKey)),
        ...knownColumnKeys.filter((columnKey) => !previous.includes(columnKey)),
      ];
      const index = completeOrder.indexOf(key);
      return moveItem(completeOrder, index, index + direction);
    });
  }, [columns]);

  const moveDraftColumn = useCallback((sourceKey: string, targetKey: string) => {
    if (sourceKey === targetKey) return;

    setDraftOrder((previous) => {
      const knownColumnKeys = columns.map((column) => column.key);
      const knownColumnKeySet = new Set(knownColumnKeys);
      const completeOrder = [
        ...previous.filter((columnKey) => knownColumnKeySet.has(columnKey)),
        ...knownColumnKeys.filter((columnKey) => !previous.includes(columnKey)),
      ];
      const sourceIndex = completeOrder.indexOf(sourceKey);
      const targetIndex = completeOrder.indexOf(targetKey);

      return moveItem(completeOrder, sourceIndex, targetIndex);
    });
  }, [columns]);

  const handleColumnDragStart = useCallback((event: React.DragEvent<HTMLElement>, key: string) => {
    setDraggedColumnKey(key);
    setDragOverColumnKey(null);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', key);
  }, []);

  const handleColumnDragOver = useCallback((event: React.DragEvent<HTMLElement>, key: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (draggedColumnKey && draggedColumnKey !== key) {
      setDragOverColumnKey(key);
    }
  }, [draggedColumnKey]);

  const handleColumnDrop = useCallback((event: React.DragEvent<HTMLElement>, key: string) => {
    event.preventDefault();
    const sourceKey = event.dataTransfer.getData('text/plain') || draggedColumnKey;
    if (sourceKey) {
      moveDraftColumn(sourceKey, key);
    }
    setDraggedColumnKey(null);
    setDragOverColumnKey(null);
  }, [draggedColumnKey, moveDraftColumn]);

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

  const handleTogglePin = useCallback((key: string, side: 'left' | 'right') => {
    setDraftPinned((prev) => {
      const currentSide = side === 'left' ? prev.left : prev.right;
      const oppositeSide = side === 'left' ? prev.right : prev.left;
      const isAlreadyPinned = currentSide.includes(key);
      if (isAlreadyPinned) {
        const nextCurrentSide = currentSide.filter((currentKey) => currentKey !== key);
        return side === 'left'
          ? { left: nextCurrentSide, right: prev.right }
          : { left: prev.left, right: nextCurrentSide };
      }
      // Remove from other side if present, then add to this side.
      const nextCurrentSide = [...currentSide, key];
      const nextOppositeSide = oppositeSide.filter((currentKey) => currentKey !== key);
      return side === 'left'
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
  }, [columnWidths, draftOrder, draftPinned, draftVisible, draftVisibleActions, draftWidths, onColumnResize, onColumnsChange, onPinChange, onVisibleActionsChange]);

  const handleReset = useCallback(() => {
    onReset();
    setIsOpen(false);
  }, [onReset]);

  const visibleCount = draftVisible.length;
  const hiddenCount = Math.max(columns.length - visibleCount, 0);
  const visibleActionsCount = draftVisibleActions.length;
  const totalActionCount = actions?.length ?? 0;

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || typeof window === 'undefined') return;

    const rect = trigger.getBoundingClientRect();
    const width = 432;
    const gutter = 16;
    const left = Math.min(
      Math.max(gutter, rect.right - width),
      window.innerWidth - width - gutter,
    );

    setPanelPosition({
      top: rect.bottom + 8,
      left,
      width,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updatePanelPosition();

    const handleViewportChange = () => updatePanelPosition();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen, updatePanelPosition]);

  useEffect(() => {
    const handleToggle = () => {
      if (isOpen) {
        setIsOpen(false);
      } else {
        handleOpen();
      }
    };

    window.addEventListener(externalToggleEventName, handleToggle as EventListener);
    return () => {
      window.removeEventListener(externalToggleEventName, handleToggle as EventListener);
    };
  }, [externalToggleEventName, handleOpen, isOpen]);

  return (
    <Box style={{ position: 'relative', zIndex: isOpen ? 60 : 1 }}>
      <Box
        as="button"
        data-part="trigger"
        data-open={isOpen}
        data-compact={compact}
        className="ds-structure ds-column-menu"
        ref={setTriggerRef}
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        title={`Columns: ${visibleCount} visible${hiddenCount > 0 ? `, ${hiddenCount} hidden` : ''}`}
        aria-label={`Columns: ${visibleCount} visible${hiddenCount > 0 ? `, ${hiddenCount} hidden` : ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: compact ? 32 : 42,
          minWidth: compact ? 32 : 42,
          height: compact ? 32 : 42,
          minHeight: compact ? 32 : 42,
          padding: 0,
          cursor: 'pointer',
          transition: 'border-color 0.16s ease, background 0.16s ease, color 0.16s ease',
        }}
      >
        <Flex align="center" justify="center" style={{ minWidth: 0 }}>
          <Box
            data-part="trigger-icon"
            data-open={isOpen}
            data-compact={compact}
            style={{
              width: compact ? 22 : 28,
              height: compact ? 22 : 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ColumnsIcon />
          </Box>
        </Flex>
      </Box>

      {/* Panel + backdrop go through the shared overlay substrate: the target
          resolves as explicit container > active top-layer host > shared
          `#rottay-portal-root`, so the menu stays visible when the workspace
          is itself inside a `showModal()` dialog. `PortalScope` carries the
          tenant/theme/direction lineage across the portal boundary. */}
      {isOpen && (
        <Portal>
          <PortalScope snapshot={portalScope}>
          <Box data-part="backdrop" onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1990 }} />

          <Box
            data-part="panel"
            data-open={isOpen}
            className="ds-structure ds-column-menu-panel"
            style={{
              position: 'fixed',
              top: panelPosition.top,
              left: panelPosition.left,
              width: panelPosition.width,
              zIndex: 2000,
              overflow: 'hidden',
            }}
          >
            <Box
              data-part="header"
              style={{
                padding: '18px 20px 16px',
              }}
            >
              <Flex align="start" justify="between" gap={12}>
                <Box style={{ minWidth: 0 }}>
                  <Text
                    size="sm"
                    weight="medium"
                    style={{ display: 'block', fontSize: 14, letterSpacing: '-0.01em' }}
                  >
                    Table columns
                  </Text>
                  <Text
                    data-part="description"
                    size="xs"
                    style={{
                      display: 'block',
                      marginTop: 4,
                      fontSize: 12,
                      lineHeight: 1.45,
                    }}
                  >
                    Configure the table surface before applying.
                  </Text>
                </Box>
                <Flex align="center" gap={6}>
                  <CountPill label={`${visibleCount}/${columns.length}`} />
                  <Box
                    as="button"
                    data-part="reset"
                    onClick={handleReset}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      minHeight: 30,
                      padding: '0 12px',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <RotateCcw style={{ width: 12, height: 12 }} />
                    Reset
                  </Box>
                </Flex>
              </Flex>
            </Box>

            <Box
              data-part="body"
              style={{
                padding: 14,
                maxHeight: 430,
                overflowY: 'auto',
              }}
            >
              <Flex direction="column" gap={8}>
                {(() => {
                  const renderColumnRow = (column: T, index: number, listLength: number) => {
                    const isVisible = draftVisible.includes(column.key);
                    const isPinnedLeft = draftPinned.left.includes(column.key);
                    const isPinnedRight = draftPinned.right.includes(column.key);
                    const isPinned = isPinnedLeft || isPinnedRight;
                    const currentWidth = readColumnRecordValue(draftWidths, column.key) as number | undefined;
                    const isEditingWidth = editingWidthKey === column.key;
                    const isDragging = draggedColumnKey === column.key;
                    const isDragTarget = dragOverColumnKey === column.key && draggedColumnKey !== column.key;

                    return (
                      <Box
                        key={column.key}
                        data-part="row"
                        data-drag-target={isDragTarget}
                        data-visible={isVisible}
                        data-dragging={isDragging}
                        onDragOver={(event: React.DragEvent<HTMLElement>) => handleColumnDragOver(event, column.key)}
                        onDrop={(event: React.DragEvent<HTMLElement>) => handleColumnDrop(event, column.key)}
                        style={{
                          overflow: 'hidden',
                          opacity: isDragging ? 0.58 : 1,
                          transition: 'border-color 0.16s ease, background 0.16s ease, opacity 0.16s ease',
                        }}
                      >
                        <Flex align="center" justify="between" gap={10} style={{ padding: '13px 15px' }}>
                          <Flex align="center" gap={12} style={{ minWidth: 0, flex: 1 }}>
                            <Box
                              as="button"
                              data-part="drag-handle"
                              data-drag-target={isDragTarget}
                              data-dragging={isDragging}
                              draggable
                              aria-label={`Drag to move ${column.title}`}
                              title={`Drag to move ${column.title}`}
                              onDragStart={(event: React.DragEvent<HTMLElement>) => handleColumnDragStart(event, column.key)}
                              onDragEnd={handleColumnDragEnd}
                              onClick={(event: React.MouseEvent<HTMLElement>) => event.preventDefault()}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 28,
                                padding: 0,
                                cursor: isDragging ? 'grabbing' : 'grab',
                                flexShrink: 0,
                              }}
                            >
                              <GripVertical style={{ width: 15, height: 15 }} />
                            </Box>
                            <Checkbox
                              checked={isVisible}
                              size="sm"
                              onChange={() => handleToggleColumn(column.key)}
                            />
                            <Box style={{ minWidth: 0, flex: 1 }}>
                              <Flex align="center" gap={6}>
                                <Text
                                  data-part="title"
                                  data-visible={isVisible}
                                  size="sm"
                                  style={{
                                    display: 'block',
                                    fontWeight: 600,
                                  }}
                                >
                                  {column.title}
                                </Text>
                                {isPinned && (
                                  <Text
                                    data-part="pin-badge"
                                    data-pinned={true}
                                    size="xs"
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 600,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.04em',
                                    }}
                                  >
                                    {isPinnedLeft ? 'L' : 'R'}
                                  </Text>
                                )}
                              </Flex>
                              <Flex align="center" gap={6} style={{ marginTop: 4 }}>
                                <Text
                                  data-part="description"
                                  data-visible={isVisible}
                                  size="xs"
                                  style={{
                                    display: 'block',
                                    fontSize: 12,
                                  }}
                                >
                                  {isVisible ? 'Visible in the table' : 'Hidden from the current view'}
                                </Text>
                                {/* Width badge (only when columnWidths prop is provided) */}
                                {onColumnResize && currentWidth != null && !isEditingWidth && (
                                  <Box
                                    as="button"
                                    data-part="width-badge"
                                    onClick={() => setEditingWidthKey(column.key)}
                                    title={`Width: ${currentWidth}px (click to edit)`}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 3,
                                      height: 18,
                                      padding: '0 6px',
                                      cursor: 'pointer',
                                      fontSize: 10,
                                      fontWeight: 600,
                                      fontVariantNumeric: 'tabular-nums',
                                    }}
                                  >
                                    {currentWidth}px
                                  </Box>
                                )}
                                {/* Inline width editor */}
                                {onColumnResize && isEditingWidth && (
                                  <input
                                    type="number"
                                    data-part="width-input"
                                    defaultValue={currentWidth ?? 150}
                                    min={40}
                                    max={2000}
                                    autoFocus
                                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                      const v = parseInt(e.target.value, 10);
                                      if (!isNaN(v)) handleWidthChange(column.key, v);
                                      setEditingWidthKey(null);
                                    }}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                      if (e.key === 'Enter') {
                                        const v = parseInt((e.target as HTMLInputElement).value, 10);
                                        if (!isNaN(v)) handleWidthChange(column.key, v);
                                        setEditingWidthKey(null);
                                      } else if (e.key === 'Escape') {
                                        setEditingWidthKey(null);
                                      }
                                    }}
                                    style={{
                                      width: 56,
                                      height: 22,
                                      padding: '0 4px',
                                      fontSize: 11,
                                      fontWeight: 600,
                                      fontVariantNumeric: 'tabular-nums',
                                      textAlign: 'center',
                                    }}
                                  />
                                )}
                              </Flex>
                            </Box>
                          </Flex>

                          <Flex align="center" gap={4}>
                            {/* Pin left/right toggles (only when onPinChange provided) */}
                            {onPinChange && (
                              <>
                                <IconButton
                                  label={isPinnedLeft ? `Unpin ${column.title} from left` : `Pin ${column.title} to left`}
                                  onClick={() => handleTogglePin(column.key, 'left')}
                                >
                                  {isPinnedLeft ? (
                                    <PinOff style={{ width: 13, height: 13 }} />
                                  ) : (
                                    <PinLeftIcon />
                                  )}
                                </IconButton>
                                <IconButton
                                  label={isPinnedRight ? `Unpin ${column.title} from right` : `Pin ${column.title} to right`}
                                  onClick={() => handleTogglePin(column.key, 'right')}
                                >
                                  {isPinnedRight ? (
                                    <PinOff style={{ width: 13, height: 13 }} />
                                  ) : (
                                    <PinRightIcon />
                                  )}
                                </IconButton>
                              </>
                            )}
                            <IconButton
                              label={`Move ${column.title} up`}
                              disabled={index === 0}
                              onClick={() => handleMove(column.key, -1)}
                            >
                              <ArrowUp style={{ width: 14, height: 14 }} />
                            </IconButton>
                            <IconButton
                              label={`Move ${column.title} down`}
                              disabled={index === listLength - 1}
                              onClick={() => handleMove(column.key, 1)}
                            >
                              <ArrowDown style={{ width: 14, height: 14 }} />
                            </IconButton>
                          </Flex>
                        </Flex>
                      </Box>
                    );
                  };

                  // If groups are provided, render under collapsible group headers.
                  if (groupedColumnSections) {
                    return groupedColumnSections.map((section) => {
                      if (section.groupKey === '_ungrouped') {
                        return section.columns.map((col, idx) =>
                          renderColumnRow(col, idx, section.columns.length),
                        );
                      }

                      const isCollapsed = collapsedGroups.has(section.groupKey);

                      return (
                        <Box key={section.groupKey}>
                          <Box
                            as="button"
                            data-part="group-toggle"
                            onClick={() => handleToggleGroup(section.groupKey)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              width: '100%',
                              padding: '8px 6px 6px',
                              cursor: 'pointer',
                            }}
                          >
                            {isCollapsed ? (
                              <ChevronRight style={{ width: 14, height: 14, flexShrink: 0 }} />
                            ) : (
                              <ChevronDown style={{ width: 14, height: 14, flexShrink: 0 }} />
                            )}
                            <Text
                              data-part="group-toggle-label"
                              size="xs"
                              weight="medium"
                              style={{
                                fontSize: 11,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                              }}
                            >
                              {section.label}
                            </Text>
                            <CountPill label={String(section.columns.length)} />
                          </Box>
                          {!isCollapsed && (
                            <Flex direction="column" gap={6} style={{ paddingLeft: 4 }}>
                              {section.columns.map((col, idx) =>
                                renderColumnRow(col, idx, section.columns.length),
                              )}
                            </Flex>
                          )}
                        </Box>
                      );
                    });
                  }

                  // Default: flat column list (unchanged behaviour).
                  return orderedColumns.map((column, index) =>
                    renderColumnRow(column, index, orderedColumns.length),
                  );
                })()}

                {actions && actions.length > 0 && (
                  <Box
                    data-part="action-section"
                    style={{
                      marginTop: 8,
                      paddingTop: 14,
                    }}
                  >
                    <Flex align="center" justify="between" gap={12} style={{ marginBottom: 10 }}>
                      <Box style={{ minWidth: 0 }}>
                        <Text
                          data-part="action-section-label"
                          size="xs"
                          weight="medium"
                          style={{
                            display: 'block',
                            fontSize: 11,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Row actions
                        </Text>
                        <Text
                          data-part="description"
                          size="xs"
                          style={{
                            display: 'block',
                            marginTop: 4,
                            fontSize: 12,
                          }}
                        >
                          Choose which quick actions stay visible in the table.
                        </Text>
                      </Box>
                      <CountPill label={`${visibleActionsCount}/${totalActionCount}`} />
                    </Flex>

                    <Flex direction="column" gap={8}>
                      {actions.map((action) => {
                        const isVisible = draftVisibleActions.includes(action.key);

                        return (
                          <Box
                            key={action.key}
                            data-part="action-row"
                            data-visible={isVisible}
                            style={{
                              overflow: 'hidden',
                            }}
                          >
                            <Flex align="center" justify="between" gap={10} style={{ padding: '13px 15px' }}>
                              <Flex align="center" gap={12} style={{ minWidth: 0, flex: 1 }}>
                                <Checkbox
                                  checked={isVisible}
                                  size="sm"
                                  disabled={action.locked}
                                  onChange={() => handleToggleAction(action.key, action.locked)}
                                />
                                <Box style={{ minWidth: 0 }}>
                                  <Text
                                    data-part="title"
                                    data-visible={isVisible}
                                    size="sm"
                                    style={{
                                      display: 'block',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {action.title}
                                  </Text>
                                  <Text
                                    data-part="description"
                                    data-visible={isVisible}
                                    size="xs"
                                    style={{
                                      display: 'block',
                                      marginTop: 4,
                                      fontSize: 12,
                                    }}
                                  >
                                    {action.locked
                                      ? 'Always visible in the table'
                                      : isVisible
                                        ? 'Visible in the actions column'
                                        : 'Hidden from the actions column'}
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

            <Flex
              align="center"
              justify="between"
              gap={12}
              data-part="footer"
              style={{
                padding: 12,
              }}
            >
              <Text data-part="footer-hint" size="xs" style={{ fontSize: 12 }}>
                Column widths are also adjustable directly from the table header.
              </Text>
              <Box
                as="button"
                data-part="apply"
                onClick={handleApply}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 40,
                  padding: '0 16px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Apply columns
              </Box>
            </Flex>
          </Box>
          </PortalScope>
        </Portal>
      )}
    </Box>
  );
}

function IconButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      as="button"
      data-part="icon-button"
      data-disabled={!!disabled}
      aria-label={label}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {children}
    </Box>
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
