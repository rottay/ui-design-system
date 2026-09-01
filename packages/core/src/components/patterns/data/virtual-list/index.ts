'use client';

/**
 * @fileoverview VirtualList pattern - Rottay Design System.
 * @description PatternVirtualList windows a long list to the visible rows, with
 * variable-height measurement, scroll restoration, and optional infinite-scroll
 * loading. The virtualization runtime hooks it composes (useVirtualScroll,
 * useMeasuredScroll, useInfiniteScroll) live in the shared patterns runtime
 * support layer (`patterns/runtime/virtualization`) because they are consumed
 * across sibling pattern owners; this owner depends on them downward. Zero
 * external dependencies; engine-free.
 */

export { PatternVirtualList } from './presentation/list';
export type { PatternVirtualListProps } from './contracts';
