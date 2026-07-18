'use client';

/**
 * @fileoverview Shared list-virtualization runtime.
 *
 * Fixed-height windowing (`useVirtualScroll`), variable-height measured
 * windowing (`useMeasuredScroll`), and IntersectionObserver load-more
 * (`useInfiniteScroll`). These live in the patterns runtime support layer
 * because they are consumed across sibling pattern owners (data-table,
 * virtual-list, live-feed); the hierarchy requires those product-group owners to
 * depend DOWNWARD on a shared support layer rather than sideways on each other.
 */

export { useVirtualScroll } from './virtual-scroll';
export type { UseVirtualScrollOptions, UseVirtualScrollReturn } from './virtual-scroll';

export { useMeasuredScroll } from './variable-scroll';
export type {
  UseMeasuredScrollOptions,
  UseMeasuredScrollReturn,
  MeasuredVirtualItem,
} from './variable-scroll';

export { useInfiniteScroll } from './infinite-scroll';
export type { UseInfiniteScrollOptions, UseInfiniteScrollReturn } from './infinite-scroll';
