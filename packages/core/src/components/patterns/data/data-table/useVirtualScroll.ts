'use client';

/**
 * @fileoverview Zero-dependency virtual scroll hook for fixed-height rows.
 * Calculates the visible window of rows based on scroll position, total item
 * count, and container dimensions. Only the visible rows (plus an overscan
 * buffer) are rendered, keeping DOM node count constant regardless of dataset
 * size.
 *
 * @remarks
 * This implementation intentionally supports fixed row heights only. Variable
 * row heights would require a measurement pass and row-height cache, which adds
 * complexity. Fixed heights cover the vast majority of data-table use cases and
 * keep the hook lightweight with zero external dependencies.
 */

import { useCallback, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseVirtualScrollOptions {
  /** Total number of items in the dataset. */
  totalItems: number;
  /** Height of each row in pixels. @default 48 */
  rowHeight?: number;
  /** Height of the scrollable container in pixels. */
  containerHeight: number;
  /** Number of rows to render outside the visible area (buffer). @default 5 */
  overscan?: number;
}

export interface UseVirtualScrollReturn {
  /** Index of the first rendered row (inclusive). */
  startIndex: number;
  /** Index of the last rendered row (exclusive). */
  endIndex: number;
  /** Total scrollable height in pixels (for the spacer element). */
  totalHeight: number;
  /** Pixel offset from the top for the first rendered row. */
  offsetTop: number;
  /** Ref to attach to the scroll container element. */
  scrollRef: React.RefObject<HTMLDivElement>;
  /** Programmatically scroll to a specific row index. */
  scrollToRow: (index: number) => void;
  /** Scroll event handler to attach to the container. */
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Tracks scroll position and computes the visible row range for a fixed-height
 * virtual scroll container. The consumer slices their data array using
 * `startIndex` / `endIndex` and positions the visible rows using `offsetTop`.
 *
 * @example
 * ```tsx
 * const { startIndex, endIndex, totalHeight, offsetTop, scrollRef, onScroll } =
 *   useVirtualScroll({ totalItems: data.length, containerHeight: 600, rowHeight: 48 });
 *
 * const visibleData = data.slice(startIndex, endIndex);
 * ```
 */
export function useVirtualScroll(options: UseVirtualScrollOptions): UseVirtualScrollReturn {
  const {
    totalItems,
    rowHeight = 48,
    containerHeight,
    overscan = 5,
  } = options;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // -------------------------------------------------------------------------
  // Derived calculations
  // -------------------------------------------------------------------------

  const totalHeight = totalItems * rowHeight;

  // First visible row (before overscan)
  const rawStartIndex = Math.floor(scrollTop / rowHeight);
  // Apply overscan buffer, clamped to valid range
  const startIndex = Math.max(0, rawStartIndex - overscan);

  // Number of rows that fit in the visible container
  const visibleCount = Math.ceil(containerHeight / rowHeight);
  // Last visible row (after overscan), clamped to total items
  const endIndex = Math.min(totalItems, rawStartIndex + visibleCount + overscan);

  // Pixel offset for the first rendered row
  const offsetTop = startIndex * rowHeight;

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
  }, []);

  const scrollToRow = useCallback(
    (index: number) => {
      if (!scrollRef.current) return;
      const clampedIndex = Math.max(0, Math.min(index, totalItems - 1));
      scrollRef.current.scrollTop = clampedIndex * rowHeight;
    },
    [totalItems, rowHeight],
  );

  return {
    startIndex,
    endIndex,
    totalHeight,
    offsetTop,
    scrollRef: scrollRef as React.RefObject<HTMLDivElement>,
    scrollToRow,
    onScroll,
  };
}
