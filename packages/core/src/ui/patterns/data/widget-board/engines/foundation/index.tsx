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
import { useAdaptiveBoardLayout } from "../../runtime/solver/react";

/* Private, not exported: constraint defaults are permissive so an unconstrained item is unchanged. */
const isWidgetMovable = (item: WidgetBoardItem): boolean => item.movable !== false;
const isWidgetRemovable = (item: WidgetBoardItem): boolean => item.removable !== false;
const isWidgetResizable = (
  item: WidgetBoardItem,
  axis: "inline" | "block"
): boolean => {
  const resizable = item.resizable;
  if (resizable === undefined || resizable === true) return true;
  if (resizable === false) return false;
  return resizable[axis] !== false;
};


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

/* `noop` is the pointer resting over its own current slot, which is a legal release position. */
type DragTargetPosture = "accepted" | "refused" | "outside" | "noop";

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

/* Order compared as a SEQUENCE, never a joined string: ids are arbitrary and a delimiter can
   appear inside one, so ["a|b","c"] and ["a","b|c"] would collide under any join. */
function orderSnapshot(items: WidgetBoardItem[]): readonly string[] {
  return items
    .filter((item) => item.visible)
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((item) => item.id);
}

function sameOrder(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
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
  error,
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
  const [catalogQuery, setCatalogQuery] = useState("");
  const resizeSessionRef = useRef<WidgetResizeSession | null>(null);
  const dragSessionRef = useRef<WidgetDragSession | null>(null);
  const layoutRef = useRef(items);
  const itemsRef = useRef(items);
  const dragOriginLayoutRef = useRef<WidgetBoardItem[] | null>(null);
  /* Identity of the items prop the gesture started against, plus the visible order it started
     from: a gesture is only allowed to emit when neither has been invalidated underneath it. */
  const sessionItemsRef = useRef<WidgetBoardItem[] | null>(null);
  const dragOriginOrderRef = useRef<readonly string[] | null>(null);
  /* Posture of the CURRENT pointer target, recomputed on every activated move; a release is
     only legal from `accepted` or `noop`, never from stale history. */
  const targetPostureRef = useRef<DragTargetPosture>("noop");
  const previousCellRectsRef = useRef(new Map<string, DOMRect>());
  const layoutAnimationsRef = useRef(new Map<string, Animation>());
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef(new Map<string, HTMLElement>());

  /* External ownership wins: incoming items cancel any live gesture so no listener can later
     emit props back to the consumer. */
  /* It wins in the LAYOUT phase: a passive effect leaves a window where a pointerup could still
     emit a preview built from the previous items. */
  useLayoutEffect(() => {
    itemsRef.current = items;
    layoutRef.current = items;
    setLayout(items);
    if (dragSessionRef.current) {
      dragSessionRef.current = null;
      dragOriginLayoutRef.current = null;
      dragOriginOrderRef.current = null;
      sessionItemsRef.current = null;
      targetPostureRef.current = "noop";
      setDraggingId(null);
      setDragPointerId(null);
      setOverIndex(null);
    }
    if (resizeSessionRef.current) {
      resizeSessionRef.current = null;
      setResizeSession(null);
    }
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

  const setCellRef = useCallback(
    (id: string, node: HTMLElement | null): void => {
      if (node) cellRefs.current.set(id, node);
      else cellRefs.current.delete(id);
    },
    []
  );

  /*
   * C2b: measurement, tier/posture, epoch invalidation and solving live in
   * the ONE shared adaptive runtime (`../../runtime/solver/react`) —
   * a single ResizeObserver per board container, a real layoutEpoch over
   * direction/locale/density/type-scale/font-readiness, bounded ≤3-pass
   * convergence with hysteresis, and the pure deterministic solver. The
   * legacy inline packing (compactPlacementOrder/placementById) is RETIRED:
   * visual order now always equals DOM/focus order, row residue is
   * redistributed instead of stranding columns, and a collapsed tier
   * resolves its own real capacity.
   */
  const previewItems = useMemo(() => {
    if (!resizeSession) return visible;
    return visible.map((item) =>
      item.id === resizeSession.id
        ? {
            ...item,
            size: resizeSession.previewSize,
            ...(resizeSession.previewHeight !== undefined
              ? { height: resizeSession.previewHeight }
              : {}),
          }
        : item
    );
  }, [visible, resizeSession]);
  const adaptive = useAdaptiveBoardLayout({
    items: previewItems,
    gridRef,
    cellRefs,
    narrow,
  });
  const collapseTier = adaptive.tier;
  const rowSpans = adaptive.rowSpans;
  const adaptiveCellStyles = adaptive.placements;

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
  }, [layout, narrow, adaptiveCellStyles, resizeSession, rowSpans]);

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
    /* A locked item is an order BARRIER: scanning the whole travelled span rejects a locked
       source, a locked target and any barrier crossing in one pass, fail-closed. */
    const low = Math.min(from, to);
    const high = Math.max(from, to);
    for (let index = low; index <= high; index += 1) {
      const candidate = sourceVisible[index];
      if (!candidate || !isWidgetMovable(candidate)) return source;
    }
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
    /* A refused span returns the identical source; committing it would emit an unchanged layout. */
    const next = reorderedLayout(layoutRef.current, from, to);
    if (next === layoutRef.current) return;
    commit(next);
  };

  /* Returns acceptance explicitly rather than leaving the caller to infer it from identity. */
  const previewReorder = (from: number, to: number): boolean => {
    const next = reorderedLayout(layoutRef.current, from, to);
    if (next === layoutRef.current) return false;
    layoutRef.current = next;
    setLayout(next);
    setOverIndex(to);
    return true;
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

    /* Every activated move re-resolves the posture of the target under the pointer RIGHT NOW,
       so no earlier refusal or acceptance can survive to govern the release. */
    const currentVisible = visibleLayout();
    const from = currentVisible.findIndex((item) => item.id === current.id);
    const to = targetIndexAtPoint(clientX, clientY);
    if (from < 0) {
      targetPostureRef.current = "outside";
      return;
    }
    if (to === null) {
      targetPostureRef.current = "outside";
      return;
    }
    if (from === to) {
      targetPostureRef.current = "noop";
      return;
    }
    targetPostureRef.current = previewReorder(from, to) ? "accepted" : "refused";
  };

  const finishMoveForPointer = (
    pointerId: number,
    commitMove: boolean
  ): void => {
    const current = dragSessionRef.current;
    if (!current || current.pointerId !== pointerId) return;

    /* Commit only a real change made by a still-movable item; a barrier no-op emits nothing. */
    /* Real means BY VALUE: the prop must still belong to this gesture, the release must not be
       over a refused target, and the visible order must differ from where the drag started. */
    const live = layoutRef.current.find((item) => item.id === current.id);
    const ownershipIntact = sessionItemsRef.current === itemsRef.current;
    const orderChanged =
      dragOriginOrderRef.current !== null &&
      !sameOrder(orderSnapshot(layoutRef.current), dragOriginOrderRef.current);
    if (
      commitMove &&
      current.activated &&
      ownershipIntact &&
      (targetPostureRef.current === "accepted" ||
        targetPostureRef.current === "noop") &&
      live !== undefined &&
      isWidgetMovable(live) &&
      orderChanged
    )
      onItemsChange?.(layoutRef.current);
    else if (dragOriginLayoutRef.current) {
      layoutRef.current = dragOriginLayoutRef.current;
      setLayout(dragOriginLayoutRef.current);
    }

    dragSessionRef.current = null;
    dragOriginLayoutRef.current = null;
    dragOriginOrderRef.current = null;
    sessionItemsRef.current = null;
    targetPostureRef.current = "noop";
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
    /* Re-resolve from the live layout: a stale closure must not authorise a move. */
    const live = layoutRef.current.find((entry) => entry.id === item.id);
    if (!live || !isWidgetMovable(live)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragOriginLayoutRef.current = layoutRef.current;
    dragOriginOrderRef.current = orderSnapshot(layoutRef.current);
    sessionItemsRef.current = itemsRef.current;
    targetPostureRef.current = "noop";
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

  /* Both step helpers delegate here, so guarding these two closes every keyboard resize path. */
  const resizeWidthTo = (id: string, size: WidgetBoardSize): void => {
    const target = layoutRef.current.find((item) => item.id === id);
    if (!target || !isWidgetResizable(target, "inline")) return;
    if (target.size === size) return;
    commit(
      layoutRef.current.map((item) =>
        item.id === id ? { ...item, size } : item
      )
    );
  };

  const resizeHeightTo = (id: string, height?: number): void => {
    const target = layoutRef.current.find((item) => item.id === id);
    if (!target || !isWidgetResizable(target, "block")) return;
    if (target.height === height) return;
    commit(
      layoutRef.current.map((item) =>
        item.id === id ? { ...item, height } : item
      )
    );
  };

  const resizeByStep = (id: string, direction: -1 | 1): void => {
    const item = layoutRef.current.find((candidate) => candidate.id === id);
    if (!item) return;
    const current = SIZE_RAMP.indexOf(item.size);
    const next = Math.max(
      0,
      Math.min(SIZE_RAMP.length - 1, current + direction)
    );
    resizeWidthTo(id, SIZE_RAMP[next]);
  };

  const resizeHeightByStep = (id: string, direction: -1 | 1): void => {
    const item = layoutRef.current.find((candidate) => candidate.id === id);
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
    /* Re-resolve at commit: a constraint change or removal mid-gesture cancels with no emission. */
    const live = layoutRef.current.find((item) => item.id === current.id);
    const inlineChanges = resizesInline(current.edge);
    const blockChanges = resizesBlock(current.edge);
    const cancel = (): void => {
      resizeSessionRef.current = null;
      setResizeSession(null);
    };
    if (!commitResize || !live) return cancel();
    if (inlineChanges && !isWidgetResizable(live, "inline")) return cancel();
    if (blockChanges && !isWidgetResizable(live, "block")) return cancel();
    const nextSize = inlineChanges ? current.previewSize : live.size;
    const nextHeight = blockChanges ? current.previewHeight : live.height;
    if (nextSize !== live.size || nextHeight !== live.height)
      commit(
        layoutRef.current.map((item) =>
          item.id === current.id
            ? { ...item, size: nextSize, height: nextHeight }
            : item
        )
      );
    cancel();
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
    /* Re-resolve live, then require every axis this edge would change to be permitted. */
    const live = layoutRef.current.find((entry) => entry.id === item.id);
    if (!live) return;
    if (resizesInline(edge) && !isWidgetResizable(live, "inline")) return;
    if (resizesBlock(edge) && !isWidgetResizable(live, "block")) return;
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
      startSpan: SIZE_SPAN[live.size],
      startHeight: live.height ?? renderedHeight,
      columnWidth: Math.max(1, (gridWidth - columnGap * 11) / 12),
      inlineDirection,
      previewSize: live.size,
      previewHeight: live.height,
    };
    resizeSessionRef.current = session;
    setResizeSession(session);
  };

  const setVisible = (id: string, visibleValue: boolean): void => {
    /* Resolve the CURRENT target: a stale id must not commit, and hiding a locked item is refused. */
    const target = layoutRef.current.find((item) => item.id === id);
    if (!target) return;
    if (!visibleValue && !isWidgetRemovable(target)) return;
    if (target.visible === visibleValue) return;
    const maxOrder = layoutRef.current.reduce(
      (max, item) => (item.visible ? Math.max(max, item.order) : max),
      -1
    );
    commit(
      layoutRef.current.map((item) =>
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

  /*
   * Skeleton with the final composition's footprint. Until the first load
   * produces a visible widget the board used to render the EMPTY state, so
   * every initial load flashed "no widgets" and then jumped. Instead, the
   * loading board renders quiet placeholder cells on the SAME 12-track grid:
   * when the items are already known their declared sizes are mirrored (the
   * footprint the solver will reserve, so late widgets never jump), and only
   * a fully unknown board falls back to a representative 3-up composition.
   * Decorative only: the root's aria-busy already announces the state.
   */
  const skeletonSizes = useMemo<readonly WidgetBoardSize[]>(() => {
    if (!loading || visible.length > 0) return [];
    if (items.length > 0) {
      return items
        .slice()
        .sort((a, b) => a.order - b.order)
        .slice(0, 6)
        .map((item) => item.size);
    }
    return ["md", "md", "md"] as const;
  }, [loading, visible.length, items]);

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
          /*
           * Geometry travels the sanctioned style channels, not the shared
           * skin: that skin sits in an earlier cascade layer than the Sheet
           * engine skins, and the rustic Sheet stamps an inline 380px width —
           * only these channels win in every engine without `!important`.
           * The surface's paint (background, border, shadow) stays in CSS
           * (`runtime/engines/modern/skin/widget-board.css`) so tenants can
           * still override it.
           */
          surfaceStyle={{ width: "min(92vw, 680px)" }}
          bodyStyle={{ padding: "var(--ds-spacing-5, 20px)" }}
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

      {error ? (
        <div className="ds-widget-board__error" data-part="error-state">
          {error}
        </div>
      ) : visible.length > 0 ? (
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
            const adaptiveStyle = adaptiveCellStyles[item.id];
            // Both grid lines come from the shared runtime's solver for the
            // REAL tier capacity, stamped inline on every tier so the skin's
            // container-query column rules never contest them. Visual order
            // equals DOM/focus order by construction.
            const cellStyle: CSSProperties | undefined =
              narrow || !adaptiveStyle
                ? undefined
                : {
                    gridColumn: adaptiveStyle.gridColumn,
                    gridRow: adaptiveStyle.gridRow,
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
                    onPointerDown={
                      isWidgetMovable(item)
                        ? (event) => beginMove(event, item)
                        : undefined
                    }
                  >
                    {/* Forbidden controls are not rendered, so they expose no shortcut or focus target. */}
                    {isWidgetMovable(item) ? (
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
                    ) : null}
                    <span className="ds-widget-board__size-readout" aria-hidden>
                      <LayoutColumnsIcon size={14} decorative />
                      <span>{SIZE_SPAN[effectiveSize]} / 12</span>
                      {effectiveHeight ? (
                        <span>· {Math.round(effectiveHeight)} px</span>
                      ) : null}
                    </span>
                    {isWidgetRemovable(item) ? (
                      <Button.Icon
                        variant="default"
                        size="sm"
                        icon={<ActionCloseIcon size={15} decorative />}
                        aria-label={`${labels.remove}: ${item.accessibleTitle}`}
                        tooltip={`${labels.remove}: ${item.accessibleTitle}`}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => setVisible(item.id, false)}
                      />
                    ) : null}
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
                    )
                      /* An edge survives only when every axis it would change is permitted. */
                      .filter(
                        (edge) =>
                          (!resizesInline(edge) ||
                            isWidgetResizable(item, "inline")) &&
                          (!resizesBlock(edge) ||
                            isWidgetResizable(item, "block"))
                      )
                      .map((edge) => {
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
      ) : loading ? (
        <div
          className="ds-widget-board__grid"
          data-part="grid"
          data-narrow={narrow ? "true" : "false"}
          data-skeleton="true"
          aria-hidden
        >
          {skeletonSizes.map((size, index) => (
            <div
              key={`${size}-${index}`}
              className="ds-widget-board__cell ds-widget-board__cell--skeleton"
              data-part="skeleton-cell"
              data-size={size}
            >
              <div
                className="ds-widget-board__skeleton-header"
                data-part="skeleton-header"
              >
                <span
                  className="ds-widget-board__skeleton-icon"
                  data-part="skeleton-icon"
                />
                <span
                  className="ds-widget-board__skeleton-title"
                  data-part="skeleton-title"
                />
              </div>
              <div
                className="ds-widget-board__skeleton-body"
                data-part="skeleton-body"
              >
                <span
                  className="ds-widget-board__skeleton-line"
                  data-part="skeleton-line"
                />
                <span
                  className="ds-widget-board__skeleton-line"
                  data-part="skeleton-line"
                />
                <span
                  className="ds-widget-board__skeleton-line"
                  data-part="skeleton-line"
                  data-width="short"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ds-widget-board__empty" data-part="empty-state">
          {emptyState}
        </div>
      )}
    </section>
  );
}
