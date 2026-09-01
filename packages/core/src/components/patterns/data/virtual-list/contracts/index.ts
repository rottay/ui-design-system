/**
 * @fileoverview Type definitions for the VirtualList pattern. `PatternVirtualList`
 * renders a windowed list of arbitrary items with optional variable heights and
 * end-reached infinite loading. The parent owns the data and the load-more
 * callback; the pattern only renders the visible window and fires callbacks.
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Props for the VirtualList pattern component.
 *
 * @typeParam T - The shape of a single list item.
 *
 * @example
 * ```tsx
 * <PatternVirtualList<Message>
 *   items={messages}
 *   height={480}
 *   estimateSize={72}
 *   getItemKey={(m) => m.id}
 *   renderItem={(m) => <MessageRow message={m} />}
 *   hasMore={hasNextPage}
 *   onEndReached={fetchNextPage}
 * />
 * ```
 */
export interface PatternVirtualListProps<T> {
  /** Items to render, in visual order. */
  items: readonly T[];

  /**
   * Render function for a single item. Receives the item and its index within
   * `items`.
   */
  renderItem: (item: T, index: number) => ReactNode;

  /**
   * Stable key accessor for React reconciliation. Falls back to the item index
   * when omitted (only safe for append-only or static lists).
   */
  getItemKey?: (item: T, index: number) => string | number;

  /**
   * Estimated row size in pixels for rows not yet measured. A function receives
   * the index for per-row estimates; a number applies to every row. Real
   * heights are measured after render and corrected. @default 48
   */
  estimateSize?: number | ((index: number) => number);

  /** Rows to render outside the visible window on each side. @default 4 */
  overscan?: number;

  /**
   * Fired when the end-of-list sentinel scrolls into view while `hasMore` is
   * true. Wire this to a paginated fetch.
   */
  onEndReached?: () => void;

  /** Whether more items remain to load (gates `onEndReached`). */
  hasMore?: boolean;

  /**
   * Distance in pixels from the bottom edge at which `onEndReached` fires.
   * @default 200
   */
  endReachedThreshold?: number;

  /**
   * Opaque key under which the scroll offset is remembered and restored across
   * unmount/remount (e.g. tab switches). Omit to disable scroll restoration.
   */
  scrollRestorationKey?: string;

  /**
   * Height of the scroll viewport. A concrete bound (number of pixels or a CSS
   * length) is required for the list to scroll. @default '100%'
   */
  height?: number | string;

  /** Content rendered when `items` is empty. */
  emptyState?: ReactNode;

  /** Additional class name applied to the scroll container. */
  className?: string;
  /** Inline styles merged onto the scroll container. */
  style?: CSSProperties;
  /** DOM id for the scroll container. */
  id?: string;
  /** Test id applied to the scroll container. */
  'data-testid'?: string;
  /** Accessible label for the scrollable region. */
  'aria-label'?: string;
}
