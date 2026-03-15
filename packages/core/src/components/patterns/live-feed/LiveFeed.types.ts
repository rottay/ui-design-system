/**
 * LiveFeed - Type Definitions
 *
 * Real-time data feed with auto-refresh and new-items indicator.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../types';

export interface FeedItem {
  /** Unique identifier */
  key: string;
  /** Whether this item is new (triggers pulse animation) */
  isNew?: boolean;
  /** Timestamp of the item */
  timestamp?: string | Date;
  /** Arbitrary data payload */
  [key: string]: unknown;
}

export interface LiveFeedProps<T extends FeedItem = FeedItem> extends PatternBaseProps {
  /** Feed items to display */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Callback to refresh data */
  onRefresh?: () => void;
  /** Auto-refresh interval in milliseconds (0 = disabled) */
  autoRefresh?: number;
  /** Content shown when items is empty */
  emptyState?: ReactNode;
  /** Number of new items not yet visible */
  newItemsCount?: number;
  /** Callback when "show new items" bar is clicked */
  onShowNewItems?: () => void;
  /** Callback to load more items */
  onLoadMore?: () => void;
  /** Whether there are more items to load */
  hasMore?: boolean;
  /** Maximum items to display */
  maxItems?: number;
  /** Maximum height of the feed container */
  maxHeight?: number | string;
  /** Extra content in the header area */
  header?: ReactNode;
}
