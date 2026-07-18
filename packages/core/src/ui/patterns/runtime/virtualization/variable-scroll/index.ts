'use client';

/**
 * @fileoverview Variable-height virtual scroll hook. Extends the fixed-height
 * model with an estimate + measured-size cache: every rendered row reports its
 * real height through a `measureElement` ref, a shared ResizeObserver keeps the
 * cache current as content reflows, and cumulative offsets are recomputed so
 * later rows shift by the measured correction. Rows that have never rendered
 * fall back to `estimateSize`. Zero external dependencies.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseMeasuredScrollOptions {
  /** Total number of items in the dataset. */
  count: number;
  /**
   * Estimated row size in pixels for rows not yet measured. A function receives
   * the row index; a number applies to every row. Memoize a function form
   * (useCallback) so offsets are not recomputed every render.
   */
  estimateSize: number | ((index: number) => number);
  /** Rows to render outside the visible area on each side. @default 4 */
  overscan?: number;
}

export interface MeasuredVirtualItem {
  /** Row index into the dataset. */
  index: number;
  /** Pixel offset of the row's top edge from the list start. */
  start: number;
  /** Resolved row size (measured when available, otherwise estimated). */
  size: number;
  /** Ref callback to attach to the rendered row so it can be measured. */
  measureRef: (element: HTMLElement | null) => void;
}

export interface UseMeasuredScrollReturn {
  /** Ref to attach to the scroll container element. */
  scrollRef: React.RefObject<HTMLDivElement>;
  /** Total scrollable size in pixels (for the spacer element). */
  totalSize: number;
  /** The rows to render, with their resolved offsets and measure refs. */
  virtualItems: MeasuredVirtualItem[];
  /** Scroll event handler to attach to the container. */
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  /** Programmatically scroll so the given row aligns to the container top. */
  scrollToIndex: (index: number) => void;
}

// ---------------------------------------------------------------------------
// Helpers (pure)
// ---------------------------------------------------------------------------

/**
 * Cumulative top offsets for every row, length `count + 1` (offsets[count] is
 * the total size). Uses the measured size when present, else the estimate.
 */
function buildOffsets(
  count: number,
  measured: Map<number, number>,
  estimate: (index: number) => number,
): number[] {
  const offsets = new Array<number>(count + 1);
  offsets[0] = 0;
  for (let i = 0; i < count; i += 1) {
    const size = measured.get(i) ?? estimate(i);
    offsets[i + 1] = offsets[i] + size;
  }
  return offsets;
}

/** First index whose bottom edge is past `scrollTop` (binary search). */
function findStartIndex(offsets: number[], scrollTop: number): number {
  let lo = 0;
  let hi = offsets.length - 2;
  if (hi < 0) return 0;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (offsets[mid + 1] <= scrollTop) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Variable-height virtualization. Slice nothing yourself: render each entry in
 * `virtualItems`, attach `measureRef`, and position the row absolutely at its
 * `start` offset inside a spacer of height `totalSize`.
 *
 * @example
 * ```tsx
 * const { scrollRef, onScroll, totalSize, virtualItems } = useMeasuredScroll({
 *   count: items.length,
 *   estimateSize: 64,
 * });
 * <div ref={scrollRef} onScroll={onScroll} style={{ overflowY: 'auto' }}>
 *   <div style={{ height: totalSize, position: 'relative' }}>
 *     {virtualItems.map((v) => (
 *       <div key={v.index} ref={v.measureRef}
 *         style={{ position: 'absolute', top: v.start, left: 0, right: 0 }}>
 *         {renderItem(items[v.index], v.index)}
 *       </div>
 *     ))}
 *   </div>
 * </div>
 * ```
 */
export function useMeasuredScroll(options: UseMeasuredScrollOptions): UseMeasuredScrollReturn {
  const { count, estimateSize, overscan = 4 } = options;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Measured heights survive re-renders in a ref; a version counter forces the
  // offset recompute only when a measurement actually changes.
  const measuredRef = useRef<Map<number, number>>(new Map());
  const [sizeVersion, setSizeVersion] = useState(0);

  // Latest estimate accessor without forcing effect churn on inline functions.
  const estimate = useCallback(
    (index: number): number =>
      typeof estimateSize === 'function' ? estimateSize(index) : estimateSize,
    [estimateSize],
  );

  const offsets = useMemo(
    () => buildOffsets(count, measuredRef.current, estimate),
    [count, estimate, sizeVersion],
  );
  const totalSize = offsets[count] ?? 0;

  // --- measurement plumbing -------------------------------------------------

  const elementIndexRef = useRef<Map<Element, number>>(new Map());
  const indexElementRef = useRef<Map<number, Element>>(new Map());
  const observerRef = useRef<ResizeObserver | null>(null);

  const recordMeasurement = useCallback((index: number, size: number): void => {
    if (!Number.isFinite(size) || size <= 0) return;
    const prev = measuredRef.current.get(index);
    if (prev !== undefined && Math.abs(prev - size) < 0.5) return;
    measuredRef.current.set(index, size);
    setSizeVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const index = elementIndexRef.current.get(entry.target);
        if (index === undefined) continue;
        const box = entry.borderBoxSize?.[0];
        const size = box ? box.blockSize : entry.contentRect.height;
        recordMeasurement(index, size);
      }
    });
    observerRef.current = observer;
    return () => {
      observer.disconnect();
      observerRef.current = null;
      elementIndexRef.current.clear();
      indexElementRef.current.clear();
    };
  }, [recordMeasurement]);

  const measureRefFor = useCallback(
    (index: number) =>
      (element: HTMLElement | null): void => {
        const previous = indexElementRef.current.get(index);
        if (previous && previous !== element) {
          observerRef.current?.unobserve(previous);
          elementIndexRef.current.delete(previous);
          indexElementRef.current.delete(index);
        }
        if (!element) return;
        indexElementRef.current.set(index, element);
        elementIndexRef.current.set(element, index);
        observerRef.current?.observe(element);
        // Record the initial layout synchronously so the first paint is not a
        // frame behind the observer callback.
        recordMeasurement(index, element.getBoundingClientRect().height);
      },
    [recordMeasurement],
  );

  // --- viewport tracking ----------------------------------------------------

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
    if (target.clientHeight !== viewportHeight) setViewportHeight(target.clientHeight);
  }, [viewportHeight]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;
    setViewportHeight(element.clientHeight);
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => {
      setViewportHeight(element.clientHeight);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // --- visible range --------------------------------------------------------

  const virtualItems = useMemo<MeasuredVirtualItem[]>(() => {
    if (count === 0) return [];
    const height = viewportHeight || 0;
    const startIndex = Math.max(0, findStartIndex(offsets, scrollTop) - overscan);
    const bottom = scrollTop + height;
    let endIndex = startIndex;
    while (endIndex < count - 1 && offsets[endIndex + 1] < bottom) endIndex += 1;
    endIndex = Math.min(count - 1, endIndex + overscan);

    const items: MeasuredVirtualItem[] = [];
    for (let index = startIndex; index <= endIndex; index += 1) {
      items.push({
        index,
        start: offsets[index],
        size: (offsets[index + 1] ?? offsets[index]) - offsets[index],
        measureRef: measureRefFor(index),
      });
    }
    return items;
  }, [count, offsets, scrollTop, viewportHeight, overscan, measureRefFor]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const element = scrollRef.current;
      if (!element) return;
      const clamped = Math.max(0, Math.min(index, count - 1));
      element.scrollTop = offsets[clamped] ?? 0;
    },
    [count, offsets],
  );

  return {
    scrollRef: scrollRef as React.RefObject<HTMLDivElement>,
    totalSize,
    virtualItems,
    onScroll,
    scrollToIndex,
  };
}
