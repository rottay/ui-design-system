"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Box,
  Button,
  Input,
  ResizeHandle,
  Sheet,
  Stack,
  Text,
  type ResizeHandleIntent,
} from "../../../../../primitives";
import { ActionAddIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-add";
import { ActionCloseIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-close";
import { ActionRefreshIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-refresh";
import { ActionReorderIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-reorder";
import { LayoutColumnsIcon } from "@/graphics/icons/presentation/semantic/generated/roles/layout-columns";
import { LayoutGridIcon } from "@/graphics/icons/presentation/semantic/generated/roles/layout-grid";
import { NavigationSettingsIcon } from "@/graphics/icons/presentation/semantic/generated/roles/navigation-settings";
import { StatusVerifiedIcon } from "@/graphics/icons/presentation/semantic/generated/roles/status-verified";
import type {
  WidgetBoardItem,
  WidgetBoardProps,
  WidgetBoardSize,
} from "../../contracts";

const SIZE_RAMP: readonly WidgetBoardSize[] = ["sm", "md", "lg", "wide"];
const SIZE_SPAN: Record<WidgetBoardSize, number> = {
  sm: 3,
  md: 4,
  lg: 6,
  wide: 12,
};
const MIN_WIDGET_HEIGHT = 180;
const MAX_WIDGET_HEIGHT = 960;
const KEYBOARD_HEIGHT_STEP = 40;
const DRAG_ACTIVATION_DISTANCE = 6;

type WidgetResizeEdge =
  | "inline-start"
  | "inline-end"
  | "block-start"
  | "block-end"
  | "block-start-inline-start"
  | "block-start-inline-end"
  | "block-end-inline-start"
  | "block-end-inline-end";

interface WidgetResizeSession {
  id: string;
  pointerId: number;
  edge: WidgetResizeEdge;
  startX: number;
  startY: number;
  startSpan: number;
  startHeight: number;
  columnWidth: number;
  inlineDirection: 1 | -1;
  previewSize: WidgetBoardSize;
  previewHeight?: number;
}

interface WidgetDragSession {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  activated: boolean;
}

interface WidgetGridPlacement {
  columnStart: number;
  rowStart: number;
}

function resizesInline(edge: WidgetResizeEdge): boolean {
  return edge.includes("inline");
}

function resizesBlock(edge: WidgetResizeEdge): boolean {
  return edge.includes("block");
}

function nearestSize(span: number): WidgetBoardSize {
  return SIZE_RAMP.reduce(
    (nearest, candidate) =>
      Math.abs(SIZE_SPAN[candidate] - span) <
      Math.abs(SIZE_SPAN[nearest] - span)
        ? candidate
        : nearest,
    SIZE_RAMP[0]
  );
}

function normalize(items: WidgetBoardItem[]): WidgetBoardItem[] {
  const visible = items
    .filter((item) => item.visible)
    .slice()
    .sort((left, right) => left.order - right.order);
  const visibleOrder = new Map(visible.map((item, index) => [item.id, index]));
  return items.map((item) =>
    visibleOrder.has(item.id)
      ? { ...item, order: visibleOrder.get(item.id) as number }
      : item
  );
}

export function WidgetBoardEngine({
  items,
  labels,
  editable = false,
  defaultEditing = false,
  defaultCatalogOpen = false,
  narrow = false,
  onItemsChange,
  onReset,
  emptyState,
  loading = false,
  className,
  style,
}: WidgetBoardProps): React.ReactElement {
  const catalogId = useId();
  const headingId = useId();
  const [layout, setLayout] = useState(items);
  const [editing, setEditing] = useState(editable && defaultEditing);
  const [catalogOpen, setCatalogOpen] = useState(
    editable && defaultEditing && defaultCatalogOpen
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragPointerId, setDragPointerId] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [resizeSession, setResizeSession] =
    useState<WidgetResizeSession | null>(null);
  const [rowSpans, setRowSpans] = useState<Record<string, number>>({});
  const [catalogQuery, setCatalogQuery] = useState("");
  const resizeSessionRef = useRef<WidgetResizeSession | null>(null);
  const dragSessionRef = useRef<WidgetDragSession | null>(null);
  const layoutRef = useRef(items);
  const dragOriginLayoutRef = useRef<WidgetBoardItem[] | null>(null);
  const previousCellRectsRef = useRef(new Map<string, DOMRect>());
  const layoutAnimationsRef = useRef(new Map<string, Animation>());
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    layoutRef.current = items;
    setLayout(items);
  }, [items]);

  const visible = useMemo(
    () =>
      layout
        .filter((item) => item.visible)
        .slice()
        .sort((a, b) => a.order - b.order),
    [layout]
  );
  const hidden = useMemo(
    () => layout.filter((item) => !item.visible),
    [layout]
  );

  /*
   * Catalog search filters the hidden (addable) widgets by name, description
   * and category. Rich ReactNode metadata only participates when it is plain
   * text; the plain-text accessibleTitle always covers the name.
   */
  const normalizedCatalogQuery = catalogQuery.trim().toLocaleLowerCase();
  const filteredHidden = useMemo(() => {
    if (!normalizedCatalogQuery) return hidden;
    const textOf = (node: React.ReactNode): string =>
      typeof node === "string" ? node : "";
    return hidden.filter((item) =>
      [
        item.accessibleTitle,
        textOf(item.title),
        textOf(item.catalog?.description),
        textOf(item.catalog?.category),
      ]
        .join("\n")
        .toLocaleLowerCase()
        .includes(normalizedCatalogQuery)
    );
  }, [hidden, normalizedCatalogQuery]);

  const visibleIds = useMemo(
    () => visible.map((item) => item.id).join("|"),
    [visible]
  );

  const setCellRef = useCallback(
    (id: string, node: HTMLElement | null): void => {
      if (node) cellRefs.current.set(id, node);
      else cellRefs.current.delete(id);
    },
    []
  );

  /*
   * CSS Grid owns width while this observer gives every widget an honest
   * vertical footprint. A one-dimensional row grid cannot pack a short card
   * below another short card beside a tall queue; measured row spans can.
   * The DOM order remains the interaction order and the gap is token-driven.
   */
  useEffect(() => {
    if (narrow || typeof ResizeObserver === "undefined") {
      setRowSpans({});
      return;
    }
    const grid = gridRef.current;
    if (!grid) return;

    const update = (node: HTMLElement): void => {
      const id = node.dataset.widgetId;
      if (!id) return;
      const gridStyle = getComputedStyle(grid);
      const rowHeight = Math.max(
        1,
        Number.parseFloat(gridStyle.gridAutoRows) || 8
      );
      const rowGap = Math.max(0, Number.parseFloat(gridStyle.rowGap) || 0);
      const renderedHeight = node.getBoundingClientRect().height;
      const height =
        node.dataset.height === "fixed"
          ? renderedHeight
          : Math.max(node.scrollHeight, renderedHeight);
      const span = Math.max(
        1,
        Math.ceil((height + rowGap) / (rowHeight + rowGap))
      );
      setRowSpans((current) =>
        current[id] === span ? current : { ...current, [id]: span }
      );
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) update(entry.target as HTMLElement);
    });
    for (const node of cellRefs.current.values()) {
      update(node);
      observer.observe(node);
    }
    return () => observer.disconnect();
  }, [editing, narrow, visibleIds]);

  const compactPlacementOrder = useMemo(() => {
    if (narrow) return visible;
    const remaining = visible.slice();
    const ordered: WidgetBoardItem[] = [];

    while (remaining.length > 0) {
      const first = remaining.shift();
      if (!first) break;
      ordered.push(first);
      const firstSize =
        resizeSession?.id === first.id ? resizeSession.previewSize : first.size;
      let usedColumns = SIZE_SPAN[firstSize] % 12;

      while (usedColumns > 0) {
        const openColumns = 12 - usedColumns;
        const fittingIndex = remaining.findIndex((candidate) => {
          const candidateSize =
            resizeSession?.id === candidate.id
              ? resizeSession.previewSize
              : candidate.size;
          return SIZE_SPAN[candidateSize] <= openColumns;
        });
        if (fittingIndex < 0) break;
        const [fitting] = remaining.splice(fittingIndex, 1);
        if (!fitting) break;
        ordered.push(fitting);
        const fittingSize =
          resizeSession?.id === fitting.id
            ? resizeSession.previewSize
            : fitting.size;
        usedColumns = (usedColumns + SIZE_SPAN[fittingSize]) % 12;
      }
    }

    return ordered;
  }, [narrow, resizeSession, visible]);

  /*
   * CSS Grid's `dense` mode cannot backfill every masonry hole once cards
   * carry explicit measured row spans. Build the same first-fit occupancy map
   * ourselves so a later half-width widget can fill the open half beside an
   * earlier card, even when a full-width widget appears between them in DOM
   * order. DOM order remains unchanged for keyboard and assistive technology.
   */
  const placementById = useMemo(() => {
    if (narrow) return new Map<string, WidgetGridPlacement>();

    const occupied = new Set<string>();
    const placements = new Map<string, WidgetGridPlacement>();

    for (const item of compactPlacementOrder) {
      const effectiveSize =
        resizeSession?.id === item.id ? resizeSession.previewSize : item.size;
      const columnSpan = SIZE_SPAN[effectiveSize];
      const rowSpan = Math.max(1, rowSpans[item.id] ?? 10);
      let rowStart = 1;
      let columnStart = 0;
      let found = false;

      while (!found) {
        for (
          let candidateColumn = 0;
          candidateColumn <= 12 - columnSpan;
          candidateColumn += 1
        ) {
          let available = true;
          for (
            let row = rowStart;
            row < rowStart + rowSpan && available;
            row += 1
          ) {
            for (
              let column = candidateColumn;
              column < candidateColumn + columnSpan;
              column += 1
            ) {
              if (occupied.has(`${row}:${column}`)) {
                available = false;
                break;
              }
            }
          }
          if (available) {
            columnStart = candidateColumn;
            found = true;
            break;
          }
        }
        if (!found) rowStart += 1;
      }

      placements.set(item.id, { columnStart: columnStart + 1, rowStart });
      for (let row = rowStart; row < rowStart + rowSpan; row += 1) {
        for (
          let column = columnStart;
          column < columnStart + columnSpan;
          column += 1
        ) {
          occupied.add(`${row}:${column}`);
        }
      }
    }

    return placements;
  }, [compactPlacementOrder, narrow, resizeSession, rowSpans]);

  /*
   * CSS Grid resolves the final geometry; FLIP supplies the missing spatial
   * continuity. When a dragged or resized widget changes the packing map,
   * neighbouring cards glide into their new slots instead of teleporting.
   * Duration and easing come from theme tokens so restrained and expressive
   * tenants keep their own motion personality.
   */
  useLayoutEffect(() => {
    if (narrow || typeof window === "undefined") return;
    const grid = gridRef.current;
    if (!grid) return;
    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const styles = getComputedStyle(grid);
    const durationToken =
      styles.getPropertyValue("--ds-motion-rearrange").trim() ||
      styles.getPropertyValue("--ds-motion-normal").trim();
    const parsedDuration = Number.parseFloat(durationToken);
    const duration = reducedMotion
      ? 0
      : Number.isFinite(parsedDuration)
      ? durationToken.endsWith("s") && !durationToken.endsWith("ms")
        ? parsedDuration * 1000
        : parsedDuration
      : 200;
    const easing =
      styles.getPropertyValue("--ds-motion-ease-move").trim() ||
      styles.getPropertyValue("--ds-motion-ease-out").trim() ||
      "cubic-bezier(0.16, 1, 0.3, 1)";
    const nextRects = new Map<string, DOMRect>();

    for (const [id, node] of cellRefs.current) {
      const nextRect = node.getBoundingClientRect();
      nextRects.set(id, nextRect);
      const previousRect = previousCellRectsRef.current.get(id);
      const activeResize = resizeSessionRef.current?.id === id;
      if (!previousRect || activeResize || duration === 0 || !node.animate)
        continue;
      const deltaX = previousRect.left - nextRect.left;
      const deltaY = previousRect.top - nextRect.top;
      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) continue;

      layoutAnimationsRef.current.get(id)?.cancel();
      const animation = node.animate(
        [
          {
            "--ds-widget-board-layout-x": `${deltaX}px`,
            "--ds-widget-board-layout-y": `${deltaY}px`,
          },
          {
            "--ds-widget-board-layout-x": "0px",
            "--ds-widget-board-layout-y": "0px",
          },
        ],
        { duration, easing }
      );
      layoutAnimationsRef.current.set(id, animation);
      animation.addEventListener(
        "finish",
        () => {
          if (layoutAnimationsRef.current.get(id) === animation) {
            animation.cancel();
            layoutAnimationsRef.current.delete(id);
          }
        },
        { once: true }
      );
    }

    previousCellRectsRef.current = nextRects;
  }, [layout, narrow, placementById, resizeSession, rowSpans]);

  useEffect(
    () => () => {
      for (const animation of layoutAnimationsRef.current.values())
        animation.cancel();
      layoutAnimationsRef.current.clear();
    },
    []
  );

  const commit = (next: WidgetBoardItem[]): void => {
    const normalized = normalize(next);
    layoutRef.current = normalized;
    setLayout(normalized);
    onItemsChange?.(normalized);
  };

  const reorderedLayout = (
    source: WidgetBoardItem[],
    from: number,
    to: number
  ): WidgetBoardItem[] => {
    const sourceVisible = source
      .filter((item) => item.visible)
      .slice()
      .sort((a, b) => a.order - b.order);
    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      from >= sourceVisible.length ||
      to >= sourceVisible.length
    )
      return source;
    const reordered = sourceVisible.slice();
    const [moved] = reordered.splice(from, 1);
    if (!moved) return source;
    reordered.splice(to, 0, moved);
    const orderById = new Map(reordered.map((item, index) => [item.id, index]));
    return normalize(
      source.map((item) =>
        orderById.has(item.id)
          ? { ...item, order: orderById.get(item.id) as number }
          : item
      )
    );
  };

  const reorder = (from: number, to: number): void => {
    commit(reorderedLayout(layoutRef.current, from, to));
  };

  const previewReorder = (from: number, to: number): void => {
    const next = reorderedLayout(layoutRef.current, from, to);
    if (next === layoutRef.current) return;
    layoutRef.current = next;
    setLayout(next);
    setOverIndex(to);
  };

  const visibleLayout = (): WidgetBoardItem[] =>
    layoutRef.current
      .filter((item) => item.visible)
      .slice()
      .sort((left, right) => left.order - right.order);

  const targetIndexAtPoint = (
    clientX: number,
    clientY: number
  ): number | null => {
    const candidates = visibleLayout();
    let closest: { index: number; distance: number } | null = null;

    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index];
      if (!candidate) continue;
      const rect = cellRefs.current.get(candidate.id)?.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) continue;
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      )
        return index;

      const horizontalDistance = Math.max(
        rect.left - clientX,
        0,
        clientX - rect.right
      );
      const verticalDistance = Math.max(
        rect.top - clientY,
        0,
        clientY - rect.bottom
      );
      const distance = Math.hypot(horizontalDistance, verticalDistance);
      if (!closest || distance < closest.distance)
        closest = { index, distance };
    }

    const gridRect = gridRef.current?.getBoundingClientRect();
    if (
      !gridRect ||
      clientX < gridRect.left - 24 ||
      clientX > gridRect.right + 24 ||
      clientY < gridRect.top - 24 ||
      clientY > gridRect.bottom + 24
    )
      return null;
    return closest?.index ?? null;
  };

  const previewMoveAt = (
    pointerId: number,
    clientX: number,
    clientY: number
  ): void => {
    const current = dragSessionRef.current;
    if (!current || current.pointerId !== pointerId) return;

    if (!current.activated) {
      const travelled = Math.hypot(
        clientX - current.startX,
        clientY - current.startY
      );
      if (travelled < DRAG_ACTIVATION_DISTANCE) return;
      current.activated = true;
      setDraggingId(current.id);
    }

    const currentVisible = visibleLayout();
    const from = currentVisible.findIndex((item) => item.id === current.id);
    const to = targetIndexAtPoint(clientX, clientY);
    if (from < 0 || to === null || from === to) return;
    previewReorder(from, to);
  };

  const finishMoveForPointer = (
    pointerId: number,
    commitMove: boolean
  ): void => {
    const current = dragSessionRef.current;
    if (!current || current.pointerId !== pointerId) return;

    if (commitMove && current.activated) onItemsChange?.(layoutRef.current);
    else if (dragOriginLayoutRef.current) {
      layoutRef.current = dragOriginLayoutRef.current;
      setLayout(dragOriginLayoutRef.current);
    }

    dragSessionRef.current = null;
    dragOriginLayoutRef.current = null;
    setDragPointerId(null);
    setDraggingId(null);
    setOverIndex(null);
  };

  useEffect(() => {
    if (dragPointerId === null) return;

    const handlePointerMove = (event: PointerEvent): void =>
      previewMoveAt(event.pointerId, event.clientX, event.clientY);
    const handlePointerUp = (event: PointerEvent): void =>
      finishMoveForPointer(event.pointerId, true);
    const handlePointerCancel = (event: PointerEvent): void =>
      finishMoveForPointer(event.pointerId, false);
    const handleKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === "Escape") finishMoveForPointer(dragPointerId, false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dragPointerId]);

  const beginMove = (
    event: ReactPointerEvent<HTMLElement>,
    item: WidgetBoardItem
  ): void => {
    if (!editing || resizeSessionRef.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragOriginLayoutRef.current = layoutRef.current;
    const session: WidgetDragSession = {
      id: item.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      activated: false,
    };
    dragSessionRef.current = session;
    setDragPointerId(event.pointerId);
  };

  const resizeWidthTo = (id: string, size: WidgetBoardSize): void =>
    commit(
      layout.map((item) => {
        if (item.id !== id) return item;
        return { ...item, size };
      })
    );

  const resizeHeightTo = (id: string, height?: number): void =>
    commit(
      layout.map((item) => {
        if (item.id !== id) return item;
        return { ...item, height };
      })
    );

  const resizeByStep = (id: string, direction: -1 | 1): void => {
    const item = layout.find((candidate) => candidate.id === id);
    if (!item) return;
    const current = SIZE_RAMP.indexOf(item.size);
    const next = Math.max(
      0,
      Math.min(SIZE_RAMP.length - 1, current + direction)
    );
    resizeWidthTo(id, SIZE_RAMP[next]);
  };

  const resizeHeightByStep = (id: string, direction: -1 | 1): void => {
    const item = layout.find((candidate) => candidate.id === id);
    if (!item) return;
    const node = cellRefs.current.get(id);
    const currentHeight = Math.max(
      MIN_WIDGET_HEIGHT,
      item.height ?? node?.getBoundingClientRect().height ?? MIN_WIDGET_HEIGHT
    );
    resizeHeightTo(
      id,
      Math.max(
        MIN_WIDGET_HEIGHT,
        Math.min(
          MAX_WIDGET_HEIGHT,
          Math.round(currentHeight + direction * KEYBOARD_HEIGHT_STEP)
        )
      )
    );
  };

  const previewResizeAt = (
    pointerId: number,
    clientX: number,
    clientY: number
  ): void => {
    const current = resizeSessionRef.current;
    if (!current || current.pointerId !== pointerId) return;

    let previewSize = current.previewSize;
    let previewHeight = current.previewHeight;

    if (resizesInline(current.edge)) {
      const edgeDirection = current.edge.includes("inline-end") ? 1 : -1;
      const delta =
        ((clientX - current.startX) * current.inlineDirection * edgeDirection) /
        current.columnWidth;
      const desiredSpan = Math.max(
        3,
        Math.min(12, current.startSpan + Math.round(delta))
      );
      previewSize = nearestSize(desiredSpan);
    }

    if (resizesBlock(current.edge)) {
      const edgeDirection = current.edge.includes("block-end") ? 1 : -1;
      previewHeight = Math.max(
        MIN_WIDGET_HEIGHT,
        Math.min(
          MAX_WIDGET_HEIGHT,
          Math.round(
            current.startHeight + (clientY - current.startY) * edgeDirection
          )
        )
      );
    }

    if (
      previewSize === current.previewSize &&
      previewHeight === current.previewHeight
    )
      return;

    const next = { ...current, previewSize, previewHeight };

    resizeSessionRef.current = next;
    setResizeSession(next);
  };

  const finishResizeForPointer = (
    pointerId: number,
    commitResize: boolean
  ): void => {
    const current = resizeSessionRef.current;
    if (!current || current.pointerId !== pointerId) return;
    if (commitResize)
      commit(
        layout.map((item) =>
          item.id === current.id
            ? {
                ...item,
                size: resizesInline(current.edge)
                  ? current.previewSize
                  : item.size,
                height: resizesBlock(current.edge)
                  ? current.previewHeight
                  : item.height,
              }
            : item
        )
      );
    resizeSessionRef.current = null;
    setResizeSession(null);
  };

  useEffect(() => {
    const pointerId = resizeSession?.pointerId;
    if (pointerId === undefined) return;

    const handlePointerMove = (event: PointerEvent): void =>
      previewResizeAt(event.pointerId, event.clientX, event.clientY);
    const handlePointerUp = (event: PointerEvent): void =>
      finishResizeForPointer(event.pointerId, true);
    const handlePointerCancel = (event: PointerEvent): void =>
      finishResizeForPointer(event.pointerId, false);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [resizeSession?.pointerId]);

  const beginResize = (
    event: ReactPointerEvent<HTMLElement>,
    item: WidgetBoardItem,
    edge: WidgetResizeEdge
  ): void => {
    if (narrow) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const grid = gridRef.current;
    const gridWidth = grid?.getBoundingClientRect().width ?? 0;
    const gridStyles = grid ? getComputedStyle(grid) : null;
    const columnGap = Number.parseFloat(gridStyles?.columnGap ?? "0") || 0;
    const inlineDirection = gridStyles?.direction === "rtl" ? -1 : 1;
    const renderedHeight = Math.max(
      MIN_WIDGET_HEIGHT,
      cellRefs.current.get(item.id)?.getBoundingClientRect().height ??
        MIN_WIDGET_HEIGHT
    );
    const session: WidgetResizeSession = {
      id: item.id,
      pointerId: event.pointerId,
      edge,
      startX: event.clientX,
      startY: event.clientY,
      startSpan: SIZE_SPAN[item.size],
      startHeight: item.height ?? renderedHeight,
      columnWidth: Math.max(1, (gridWidth - columnGap * 11) / 12),
      inlineDirection,
      previewSize: item.size,
      previewHeight: item.height,
    };
    resizeSessionRef.current = session;
    setResizeSession(session);
  };

  const setVisible = (id: string, visibleValue: boolean): void => {
    const maxOrder = visible.reduce(
      (max, item) => Math.max(max, item.order),
      -1
    );
    commit(
      layout.map((item) =>
        item.id === id
          ? {
              ...item,
              visible: visibleValue,
              order: visibleValue ? maxOrder + 1 : item.order,
            }
          : item
      )
    );
  };

  const reset = (): void => {
    const next = onReset?.();
    commit(next ?? items);
  };

  const rootClassName = ["ds-pattern-widget-board", className]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={rootClassName}
      data-part="root"
      aria-labelledby={editable && labels.heading ? headingId : undefined}
      aria-busy={loading ? true : undefined}
      data-editing={editing ? "true" : "false"}
      data-moving={draggingId ? "true" : "false"}
      data-resizing={resizeSession ? "true" : "false"}
      data-resize-axis={
        resizeSession &&
        resizesInline(resizeSession.edge) &&
        resizesBlock(resizeSession.edge)
          ? "both"
          : resizeSession && resizesBlock(resizeSession.edge)
          ? "block"
          : "inline"
      }
      data-loading={loading ? "true" : "false"}
      style={style}
    >
      {editable ? (
        <header className="ds-widget-board__toolbar" data-part="toolbar">
          <div
            className="ds-widget-board__toolbar-heading"
            data-part="toolbar-heading"
          >
            {labels.context || labels.heading ? (
              <span
                className="ds-widget-board__toolbar-icon"
                data-part="toolbar-icon"
              >
                <LayoutGridIcon size={17} decorative />
              </span>
            ) : null}
            <div
              className="ds-widget-board__toolbar-copy"
              data-part="toolbar-copy"
            >
              {labels.context ? (
                <span
                  className="ds-widget-board__toolbar-context"
                  data-part="toolbar-context"
                >
                  {labels.context}
                </span>
              ) : null}
              {labels.heading ? (
                <h2
                  id={headingId}
                  className="ds-widget-board__toolbar-title"
                  data-part="toolbar-title"
                >
                  {labels.heading}
                </h2>
              ) : null}
              <Text size="xs" color="muted">
                {editing ? labels.editHint : labels.readHint}
              </Text>
            </div>
          </div>
          <div
            className="ds-widget-board__toolbar-actions"
            data-part="toolbar-actions"
          >
            {editing ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ActionAddIcon size={14} decorative />}
                  onClick={() => setCatalogOpen((open) => !open)}
                  aria-expanded={catalogOpen}
                  aria-controls={catalogId}
                >
                  {labels.addWidget}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ActionRefreshIcon size={14} decorative />}
                  onClick={reset}
                >
                  {labels.reset}
                </Button>
              </>
            ) : null}
            <Button
              variant={editing ? "primary" : "secondary"}
              size="sm"
              icon={
                editing ? (
                  <StatusVerifiedIcon size={14} decorative />
                ) : (
                  <NavigationSettingsIcon size={14} decorative />
                )
              }
              onClick={() => {
                setEditing((current) => !current);
                setCatalogOpen(false);
              }}
              aria-pressed={editing}
            >
              {editing ? labels.done : labels.customize}
            </Button>
          </div>
        </header>
      ) : null}

      {editing ? (
        <Sheet
          open={catalogOpen}
          onOpenChange={(open) => {
            setCatalogOpen(open);
            if (!open) setCatalogQuery("");
          }}
          side="right"
          title={labels.catalogHeading ?? labels.addWidget}
          id={catalogId}
          showHandle={false}
          surfaceClassName="ds-widget-board__catalog-surface"
          bodyClassName="ds-widget-board__catalog-body"
          aria-label={labels.catalogHeading ?? labels.addWidget}
        >
          <section
            className="ds-widget-board__catalog"
            data-part="catalog"
            aria-label={labels.catalogHeading ?? labels.addWidget}
          >
            {labels.catalogDescription ? (
              <header
                className="ds-widget-board__catalog-header"
                data-part="catalog-header"
              >
                <Text size="sm" color="muted">
                  {labels.catalogDescription}
                </Text>
              </header>
            ) : null}
            {hidden.length === 0 ? (
              <div className="ds-widget-board__catalog-empty">
                <StatusVerifiedIcon size={18} decorative />
                <Text size="sm" color="muted">
                  {labels.emptyCatalog}
                </Text>
              </div>
            ) : (
              <>
                <div
                  className="ds-widget-board__catalog-search"
                  data-part="catalog-search"
                >
                  <Input
                    size="sm"
                    value={catalogQuery}
                    onChange={(value) => setCatalogQuery(value)}
                    placeholder={
                      labels.catalogSearchPlaceholder ?? "Search widgets"
                    }
                    aria-label={
                      labels.catalogSearchPlaceholder ?? "Search widgets"
                    }
                    clearable
                    onClear={() => setCatalogQuery("")}
                  />
                </div>
                {filteredHidden.length === 0 ? (
                  <div
                    className="ds-widget-board__catalog-empty"
                    data-part="catalog-no-results"
                  >
                    <Text size="sm" color="muted">
                      {labels.catalogNoResults ??
                        "No widgets match the search"}
                    </Text>
                  </div>
                ) : (
              <div
                className="ds-widget-board__catalog-grid"
                data-part="catalog-grid"
              >
                {filteredHidden.map((item) => {
                  const catalogIcon = item.catalog?.icon ?? item.header?.icon;
                  const catalogDescription =
                    item.catalog?.description ?? item.header?.supporting;
                  return (
                    <article
                      key={item.id}
                      className="ds-widget-board__catalog-item"
                      data-part="catalog-item"
                    >
                      <div className="ds-widget-board__catalog-item-main">
                        {catalogIcon ? (
                          <span className="ds-widget-board__catalog-icon">
                            {catalogIcon}
                          </span>
                        ) : null}
                        <div className="ds-widget-board__catalog-copy">
                          <div className="ds-widget-board__catalog-kicker">
                            {item.catalog?.category ? (
                              <span>{item.catalog.category}</span>
                            ) : null}
                            {item.catalog?.recommended && labels.recommended ? (
                              <span className="ds-widget-board__catalog-recommended">
                                {labels.recommended}
                              </span>
                            ) : null}
                          </div>
                          <h4 className="ds-widget-board__catalog-item-title">
                            {item.title}
                          </h4>
                          {catalogDescription ? (
                            <div className="ds-widget-board__catalog-description">
                              {catalogDescription}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {item.catalog?.preview ? (
                        <div
                          className="ds-widget-board__catalog-preview"
                          data-part="catalog-preview"
                        >
                          {item.catalog.preview}
                        </div>
                      ) : null}
                      <footer className="ds-widget-board__catalog-footer">
                        {labels.sizeNames?.[item.size] ? (
                          <span className="ds-widget-board__catalog-size">
                            {labels.sizeNames[item.size]}
                          </span>
                        ) : (
                          <span />
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<ActionAddIcon size={14} decorative />}
                          onClick={() => setVisible(item.id, true)}
                          aria-label={`${labels.addWidget}: ${item.accessibleTitle}`}
                        >
                          {labels.addWidget}
                        </Button>
                      </footer>
                    </article>
                  );
                })}
              </div>
                )}
              </>
            )}
          </section>
        </Sheet>
      ) : null}

      {visible.length > 0 ? (
        <div
          className="ds-widget-board__grid"
          data-part="grid"
          data-narrow={narrow ? "true" : "false"}
          ref={gridRef}
        >
          {visible.map((item, index) => {
            const effectiveSize =
              resizeSession?.id === item.id
                ? resizeSession.previewSize
                : item.size;
            const effectiveHeight =
              resizeSession?.id === item.id
                ? resizeSession.previewHeight
                : item.height;
            const placement = placementById.get(item.id);
            const cellStyle: CSSProperties | undefined = narrow
              ? undefined
              : {
                  gridColumn: `${placement?.columnStart ?? 1} / span ${
                    SIZE_SPAN[effectiveSize]
                  }`,
                  gridRow: `${placement?.rowStart ?? 1} / span ${
                    rowSpans[item.id] ?? 10
                  }`,
                  height: effectiveHeight
                    ? `${Math.round(effectiveHeight)}px`
                    : undefined,
                };
            return (
              <article
                key={item.id}
                ref={(node) => setCellRef(item.id, node)}
                className="ds-widget-board__cell"
                data-part="cell"
                data-widget-id={item.id}
                data-size={effectiveSize}
                data-height={effectiveHeight ? "fixed" : "auto"}
                data-index={index}
                data-has-header={item.header ? "true" : "false"}
                data-resizing={resizeSession?.id === item.id ? "true" : "false"}
                data-dragging={draggingId === item.id ? "true" : "false"}
                data-drop-target={
                  overIndex === index && draggingId !== item.id
                    ? "true"
                    : "false"
                }
                draggable={false}
                style={cellStyle}
              >
                {editing ? (
                  /*
                   * The whole control bar is the drag surface, not just the
                   * move control: a widget is grabbed anywhere along its edit
                   * header. The move Button therefore carries the accessible
                   * name and the keyboard reorder contract while the pointer
                   * gesture starts on the bar it bubbles into, and the destructive
                   * control shields itself so pressing it never begins a drag.
                   */
                  <div
                    className="ds-widget-board__cell-controls"
                    onPointerDown={(event) => beginMove(event, item)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<ActionReorderIcon size={15} decorative />}
                      aria-label={`${labels.move}: ${item.accessibleTitle}`}
                      aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"
                      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
                        if (
                          event.key === "ArrowLeft" ||
                          event.key === "ArrowUp"
                        ) {
                          event.preventDefault();
                          reorder(index, Math.max(0, index - 1));
                        }
                        if (
                          event.key === "ArrowRight" ||
                          event.key === "ArrowDown"
                        ) {
                          event.preventDefault();
                          reorder(
                            index,
                            Math.min(visible.length - 1, index + 1)
                          );
                        }
                      }}
                    >
                      {labels.move}
                    </Button>
                    <span className="ds-widget-board__size-readout" aria-hidden>
                      <LayoutColumnsIcon size={14} decorative />
                      <span>{SIZE_SPAN[effectiveSize]} / 12</span>
                      {effectiveHeight ? (
                        <span>· {Math.round(effectiveHeight)} px</span>
                      ) : null}
                    </span>
                    <Button.Icon
                      variant="default"
                      size="sm"
                      icon={<ActionCloseIcon size={15} decorative />}
                      aria-label={`${labels.remove}: ${item.accessibleTitle}`}
                      tooltip={`${labels.remove}: ${item.accessibleTitle}`}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => setVisible(item.id, false)}
                    />
                  </div>
                ) : null}
                {editing && !narrow ? (
                  <>
                    {(
                      [
                        "inline-start",
                        "inline-end",
                        "block-start",
                        "block-end",
                        "block-start-inline-start",
                        "block-start-inline-end",
                        "block-end-inline-start",
                        "block-end-inline-end",
                      ] as const
                    ).map((edge) => {
                      const horizontal = resizesInline(edge);
                      const vertical = resizesBlock(edge);
                      const diagonal = horizontal && vertical;
                      const keyboardEdge =
                        edge === "inline-end" || edge === "block-end";
                      const active =
                        resizeSession?.id === item.id &&
                        resizeSession.edge === edge;
                      const resizeLabel = diagonal
                        ? labels.resize
                        : horizontal
                        ? labels.resizeWidth ?? labels.resize
                        : labels.resizeHeight ?? labels.resize;
                      const widthEdge = horizontal && !vertical;
                      const heightEdge = vertical && !horizontal;
                      return (
                        /*
                         * The inline-end and block-end edges are the two
                         * keyboard-operable separators: one owns width, one
                         * owns height. The remaining six edges and corners are
                         * pointer-only hit areas, which is only honest because
                         * both dimensions already have a keyboard equivalent.
                         */
                        <ResizeHandle
                          key={edge}
                          className="ds-widget-board__resize-handle"
                          operable={keyboardEdge}
                          orientation={widthEdge ? "vertical" : "horizontal"}
                          label={`${resizeLabel}: ${item.accessibleTitle}`}
                          min={widthEdge ? 0 : MIN_WIDGET_HEIGHT}
                          max={
                            widthEdge ? SIZE_RAMP.length - 1 : MAX_WIDGET_HEIGHT
                          }
                          value={
                            widthEdge
                              ? SIZE_RAMP.indexOf(effectiveSize)
                              : Math.round(effectiveHeight ?? MIN_WIDGET_HEIGHT)
                          }
                          valueText={
                            diagonal
                              ? `${
                                  SIZE_SPAN[effectiveSize]
                                } / 12 · ${Math.round(
                                  effectiveHeight ?? MIN_WIDGET_HEIGHT
                                )} px`
                              : horizontal
                              ? labels.sizeNames?.[effectiveSize] ??
                                effectiveSize
                              : effectiveHeight
                              ? `${Math.round(effectiveHeight)} px`
                              : labels.autoHeight ?? resizeLabel
                          }
                          keyShortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Home End"
                          anatomy={{
                            "data-part": "resize-handle",
                            "data-edge": edge,
                            "data-active": active ? "true" : "false",
                          }}
                          onPointerDown={(event) =>
                            beginResize(event, item, edge)
                          }
                          onAdjust={(intent: ResizeHandleIntent) => {
                            if (widthEdge) {
                              if (intent === "decrease")
                                resizeByStep(item.id, -1);
                              else if (intent === "increase")
                                resizeByStep(item.id, 1);
                              else if (intent === "minimize")
                                resizeWidthTo(item.id, SIZE_RAMP[0]);
                              else
                                resizeWidthTo(
                                  item.id,
                                  SIZE_RAMP[SIZE_RAMP.length - 1]
                                );
                            } else if (heightEdge) {
                              if (intent === "decrease")
                                resizeHeightByStep(item.id, -1);
                              else if (intent === "increase")
                                resizeHeightByStep(item.id, 1);
                              else if (intent === "minimize")
                                resizeHeightTo(item.id, undefined);
                              else resizeHeightTo(item.id, MAX_WIDGET_HEIGHT);
                            }
                          }}
                        >
                          <span
                            className="ds-widget-board__resize-rail"
                            aria-hidden
                          />
                          <span
                            className="ds-widget-board__resize-indicator"
                            aria-hidden
                          >
                            {diagonal ? (
                              <LayoutGridIcon size={13} decorative />
                            ) : (
                              <LayoutColumnsIcon size={13} decorative />
                            )}
                            <span>
                              {diagonal
                                ? `${
                                    SIZE_SPAN[effectiveSize]
                                  } / 12 · ${Math.round(
                                    effectiveHeight ?? MIN_WIDGET_HEIGHT
                                  )} px`
                                : horizontal
                                ? `${SIZE_SPAN[effectiveSize]} / 12`
                                : effectiveHeight
                                ? `${Math.round(effectiveHeight)} px`
                                : labels.autoHeight ?? resizeLabel}
                            </span>
                          </span>
                        </ResizeHandle>
                      );
                    })}
                  </>
                ) : null}
                {item.header ? (
                  <header
                    className="ds-widget-board__item-header"
                    data-part="item-header"
                  >
                    <div
                      className="ds-widget-board__item-heading"
                      data-part="item-heading"
                    >
                      {item.header.icon ? (
                        <span
                          className="ds-widget-board__item-icon"
                          data-part="item-icon"
                        >
                          {item.header.icon}
                        </span>
                      ) : null}
                      <div
                        className="ds-widget-board__item-copy"
                        data-part="item-copy"
                      >
                        {item.header.eyebrow ? (
                          <span
                            className="ds-widget-board__item-eyebrow"
                            data-part="item-eyebrow"
                          >
                            {item.header.eyebrow}
                          </span>
                        ) : null}
                        <h3
                          className="ds-widget-board__item-title"
                          data-part="item-title"
                        >
                          {item.title}
                        </h3>
                        {item.header.supporting ? (
                          <div
                            className="ds-widget-board__item-supporting"
                            data-part="item-supporting"
                          >
                            {item.header.supporting}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    {item.header.accessory ? (
                      <div
                        className="ds-widget-board__item-accessory"
                        data-part="item-accessory"
                      >
                        {item.header.accessory}
                      </div>
                    ) : null}
                  </header>
                ) : null}
                <Stack className="ds-widget-board__content">
                  {item.content}
                </Stack>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="ds-widget-board__empty" data-part="empty-state">
          {emptyState}
        </div>
      )}
    </section>
  );
}
