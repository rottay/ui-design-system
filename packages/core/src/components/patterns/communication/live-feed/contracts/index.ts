/**
 * @fileoverview Type definitions for the LiveFeed pattern component.
 * Defines the {@link FeedItem} base shape (with `isNew` pulse animation flag
 * and an open index signature for domain data) and {@link LiveFeedProps}
 * controlling auto-refresh interval, new-items banner, load-more pagination,
 * maximum display count, and per-item rendering.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../../../../foundation/contracts/runtime/components/patterns/core';
import type { FeedItem } from '@/foundation/contracts/runtime/components/patterns/communication';

export type { FeedItem } from '@/foundation/contracts/runtime/components/patterns/communication';

/**
 * Base shape for a single item in the live feed.
 *
 * Uses an index signature (`[key: string]: unknown`) so consumers can attach
 * arbitrary domain-specific fields without extending the interface. The `key`
 * field is required for React reconciliation, and `isNew` triggers a visual
 * pulse animation to draw attention to recently arrived items.
 */
/**
 * Props for the LiveFeed pattern component.
 *
 * Renders a scrollable, auto-refreshing feed of items with support for
 * "N new items" banners, infinite scroll / load-more pagination, and
 * configurable maximum display count.
 *
 * @typeParam T - Concrete feed item type extending {@link FeedItem}.
 *
 * @example
 * ```tsx
 * interface NotificationItem extends FeedItem {
 *   message: string;
 *   severity: 'info' | 'warning' | 'error';
 * }
 *
 * <LiveFeed<NotificationItem>
 *   items={notifications}
 *   renderItem={(item) => <NotificationCard notification={item} />}
 *   autoRefresh={5000}
 *   newItemsCount={3}
 *   onShowNewItems={() => loadNewNotifications()}
 *   onLoadMore={() => fetchNextPage()}
 *   hasMore={hasNextPage}
 *   maxItems={50}
 *   maxHeight={600}
 *   emptyState={<Text>No notifications yet.</Text>}
 * />
 * ```
 */
export interface LiveFeedProps<T extends FeedItem = FeedItem> extends PatternBaseProps {
  /** Feed items to display, ordered newest-first. */
  items: T[];

  /**
   * Render function for each feed item. Receives the item and its
   * index within the visible list.
   */
  renderItem: (item: T, index: number) => ReactNode;

  /** Callback invoked to refresh the feed data (e.g., re-fetch from API). */
  onRefresh?: () => void;

  /**
   * Auto-refresh polling interval in milliseconds.
   * Set to `0` or omit to disable auto-refresh.
   */
  autoRefresh?: number;

  /** Content displayed when the `items` array is empty. */
  emptyState?: ReactNode;

  /**
   * Number of new items that have arrived but are not yet shown.
   * When greater than zero, a "Show N new items" banner is rendered.
   */
  newItemsCount?: number;

  /**
   * Callback fired when the user clicks the "show new items" banner.
   * Typically merges buffered items into the visible list.
   */
  onShowNewItems?: () => void;

  /**
   * Callback fired when the user scrolls to the bottom or clicks
   * a "load more" trigger. Used for paginated / infinite scroll feeds.
   */
  onLoadMore?: () => void;

  /** Whether additional older items are available to load. */
  hasMore?: boolean;

  /**
   * Maximum number of items to keep in the visible list.
   * Older items beyond this count are removed to prevent memory growth.
   */
  maxItems?: number;

  /**
   * Maximum height of the feed container. Accepts a number (pixels) or
   * a CSS string (e.g., `'80vh'`). The feed scrolls internally when
   * content exceeds this height.
   */
  maxHeight?: number | string;

  /** Extra content rendered in the header area above the feed list. */
  header?: ReactNode;
}
