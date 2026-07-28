'use client';

/**
 * @fileoverview Modern (token-driven) engine for the LiveFeed pattern.
 * Renders a real-time feed inside a DS token card with optional auto-refresh
 * polling, a "new items" banner, and load-more pagination.
 *
 * COMPOSITION LAW (Lote 2): every control is a DS primitive — the refresh,
 * banner and load-more buttons are the public Button (caller `data-part`
 * wins the root anatomy hook per P-79, so `live-feed.css` owns their
 * paint), and the busy spinners are the Spinner primitive's modern engine.
 * The raw `<button>` elements, the hand-rolled spinner spans and the
 * Tailwind layout utilities are gone; the geometry they carried inline
 * moved to `live-feed.css`. Copy is localized through
 * `useOptionalTranslation('components')` with the documented English floor.
 *
 * New items receive the `ds-pulse-changed` single-flash utility to signal freshness.
 *
 * @example
 * <ModernLiveFeed
 *   items={[{ key: '1', text: 'Payment confirmed', isNew: true }]}
 *   renderItem={(item) => <div className="p-2">{item.text}</div>}
 *   autoRefresh={10000}
 *   hasMore
 *   onLoadMore={() => fetchPage(page + 1)}
 * />
 */

import React, { useEffect, useRef } from 'react';
import type { LiveFeedProps, FeedItem } from '../../contracts';
import { panelCardStyle, cardBodyStyle, pillBadgeSmStyle } from '../../../../foundation/engine-styles/modern';
import { useInfiniteScroll } from '../../../../runtime/virtualization/infinite-scroll';
import { Button } from '../../../../../primitives/inputs/Button';
import ModernSpinner from '../../../../../primitives/feedback/Spinner/engines/modern';
import { ActionRefreshIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-refresh';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

const NO_OP = (): void => {};

/**
 * Modern (token-driven) LiveFeed engine.
 *
 * Supports polling-based auto-refresh, a configurable item cap (maxItems),
 * and a scrollable feed area.
 *
 * @typeParam T - Feed item shape, must extend {@link FeedItem}.
 * @param props - {@link LiveFeedProps} -- items, renderItem callback, refresh/load-more controls.
 * @returns A scrollable feed wrapped in a token-styled card.
 */
export default function ModernLiveFeed<T extends FeedItem>(props: LiveFeedProps<T>) {
  const {
    items,
    renderItem,
    onRefresh,
    autoRefresh,
    emptyState,
    newItemsCount,
    onShowNewItems,
    onLoadMore,
    hasMore,
    maxItems,
    maxHeight,
    header,
    loading,
    className,
    style,
  } = props;

  /* ---- localized copy (components catalog, English floor) ---- */
  const translation = useOptionalTranslation('components');
  const refreshLabel = translation?.tOr('liveFeed.refresh', 'Refresh') ?? 'Refresh';
  const loadMoreLabel = translation?.tOr('liveFeed.loadMore', 'Load more') ?? 'Load more';
  const emptyLabel = translation?.tOr('liveFeed.empty', 'No items') ?? 'No items';

  // Interval ref persists across renders so the useEffect cleanup can
  // clear the correct timer when dependencies change or the component unmounts.
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Auto-refresh polls at the given interval (ms). Setting autoRefresh to 0
  // or omitting it disables polling entirely.
  useEffect(() => {
    if (autoRefresh && autoRefresh > 0 && onRefresh) {
      intervalRef.current = setInterval(onRefresh, autoRefresh);
      return () => clearInterval(intervalRef.current);
    }
  }, [autoRefresh, onRefresh]);

  // Cap visible items to prevent excessive DOM nodes in high-throughput feeds.
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  // Infinite scroll: an end-of-feed sentinel auto-loads the next page. Observes
  // the internal scroll container when maxHeight bounds it, else the viewport.
  // The Load more button below stays as an explicit fallback.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { sentinelRef } = useInfiniteScroll({
    hasMore: hasMore ?? false,
    onLoadMore: onLoadMore ?? NO_OP,
    enabled: Boolean(onLoadMore) && Boolean(hasMore),
    rootMargin: '0px 0px 120px 0px',
    root: maxHeight ? scrollContainerRef : null,
  });

  // Skeleton loading state: only shown when there are zero items and loading is true.
  // Subsequent refreshes keep existing items visible (no flicker).
  if (loading && items.length === 0) {
    return (
      <div data-part="root" className={`ds-pattern-live-feed ds-engine-modern ${className ?? ''}`} style={{ ...panelCardStyle, ...style }}>
        <div data-part="skeleton-list" style={cardBodyStyle}>
          <div data-part="skeleton" data-skeleton="title" />
          {[1, 2, 3].map((i) => (
            <div key={i} data-part="skeleton" data-skeleton="row" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-part="root" className={`ds-pattern-live-feed ds-engine-modern ${className ?? ''}`} style={{ ...panelCardStyle, ...style }}>
      <div style={cardBodyStyle}>
        {/* Header */}
        {(header || onRefresh) && (
          <div data-part="header-row">
            <div>{header}</div>
            {onRefresh && (
              <Button
                engine="modern"
                variant="ghost"
                size="sm"
                data-part="refresh"
                icon={loading ? <ModernSpinner size="sm" data-part="spinner" /> : <ActionRefreshIcon size={14} decorative />}
                aria-label={refreshLabel}
                onClick={onRefresh}
              />
            )}
          </div>
        )}

        {/* New items indicator -- full-width info button so it is impossible to miss.
            Clicking merges buffered items into the visible list (handled by parent). */}
        {newItemsCount != null && newItemsCount > 0 && (
          <Button
            engine="modern"
            variant="ghost"
            size="sm"
            data-part="banner"
            onClick={onShowNewItems}
          >
            <span data-part="badge" style={pillBadgeSmStyle}>{newItemsCount}</span>
            {newItemsCount === 1
              ? translation?.tOr('liveFeed.newItem', 'new item') ?? 'new item'
              : translation?.tOr('liveFeed.newItems', 'new items') ?? 'new items'}
          </Button>
        )}

        {/* Feed -- maxHeight enables vertical scrolling for bounded-height containers.
            When omitted, the feed grows unbounded. maxHeight/overflow stay inline:
            they are runtime-measured values (the ScrollArea precedent), not paint. */}
        <div ref={scrollContainerRef} style={{ maxHeight: maxHeight ?? undefined, overflow: maxHeight ? 'auto' : undefined }}>
          {displayItems.length === 0 ? (
            emptyState ?? <div data-part="empty">{emptyLabel}</div>
          ) : (
            /* The Tailwind layout classes on the list are PINNED by
               LiveFeed.pulse.test.tsx (`.flex.flex-col.gap-2 > div` row
               queries) — they stay as layout utilities until the test is
               re-pointed at `data-part='list'`. */
            <div data-part="list" className="flex flex-col gap-2">
              {/* ds-pulse-changed (foundation/animations/transitions.css) flashes
                  ONCE on insertion to signal a freshly-arrived item. Each item
                  has a stable key, so the flash plays when its DOM node is first
                  inserted and does not replay on subsequent re-renders while
                  isNew stays true, satisfying the never-loop pulse discipline. */}
              {displayItems.map((item, i) => (
                <div key={item.key} className={item.isNew ? 'ds-pulse-changed' : ''}>
                  {renderItem(item, i)}
                </div>
              ))}
            </div>
          )}
          {/* End-of-feed sentinel: triggers onLoadMore when scrolled into view. */}
          {hasMore && onLoadMore ? (
            <div ref={sentinelRef} data-part="sentinel" aria-hidden="true" />
          ) : null}
        </div>

        {/* Load more */}
        {hasMore && onLoadMore && (
          <div data-part="footer">
            <Button
              engine="modern"
              variant="ghost"
              size="sm"
              data-part="load-more"
              icon={loading ? <ModernSpinner size="sm" data-part="spinner" /> : undefined}
              onClick={onLoadMore}
            >
              {loadMoreLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
