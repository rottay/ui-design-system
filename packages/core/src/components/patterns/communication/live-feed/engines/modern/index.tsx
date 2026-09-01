'use client';

/**
 * @fileoverview Modern engine for the LiveFeed pattern.
 *
 * A scrollable, auto-refreshing feed: header with refresh, an "N new items"
 * banner, the item list, an infinite-scroll sentinel and load-more. Every
 * control COMPOSES a certified primitive -- Button (refresh / banner /
 * load-more), the Spinner modern engine (busy icons) and Empty (default
 * empty state); the engine stamps only anatomy (`data-part` /
 * `data-skeleton`) and every visual decision lives in the modern skin
 * (`runtime/engines/modern/skin/live-feed/index.css`).
 *
 * PINS (tests untouched, contract minimal intact):
 * - `LiveFeed.pulse.test.tsx` queries the list rows as
 *   `.flex.flex-col.gap-2 > div`, so the list keeps those Tailwind layout
 *   utilities; it also requires `ds-pulse-changed` (single-flash,
 *   reduced-motion-guarded in foundation/animations/transitions/index.css) on
 *   `isNew` rows and an EMPTY className on the rest.
 * - `PatternLiveFeed.engine-advanced.test.tsx` requires an `.animate-pulse`
 *   node inside the modern loading skeleton, the refresh control as the
 *   FIRST button in DOM order, and the banner reachable by
 *   `getByRole('button', { name: /new items/i })`.
 *
 * A11Y: the list is `aria-live="polite"` so arriving items are announced to
 * assistive tech (the contract owns no pause affordance; the polling
 * interval is caller-controlled via `autoRefresh`).
 *
 * Copy runs through the guarded i18n channel with documented English floors.
 *
 * @module Patterns/LiveFeed/Engines/Modern
 * @category Patterns
 * @package @rottay/design-system
 */

import React, { useCallback, useEffect, useRef } from 'react';
import type { LiveFeedProps, FeedItem } from '../../contracts';
import { useInfiniteScroll } from '../../../../runtime/virtualization/infinite-scroll';
import { Button } from '../../../../../primitives/inputs/button';
import { Empty } from '../../../../../primitives/display/empty';
import { VisuallyHidden } from '../../../../../primitives/foundation';
import ModernSpinner from '../../../../../primitives/feedback/spinner/engines/modern';
import { ActionRefreshIcon } from '@/graphics/icons/semantic/generated/roles/action-refresh';
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
  const feedLabel = translation?.tOr('liveFeed.feedLabel', 'Feed') ?? 'Feed';

  // Callers pass an inline arrow far more often than a memoized handler, so
  // onRefresh identity cannot gate the timer: the tick reads the latest ref.
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  });

  // A tick that fires while the previous fetch is still in flight stacks
  // duplicate requests on exactly the slow feeds polling is meant to serve.
  const loadingRef = useRef(loading);
  useEffect(() => {
    loadingRef.current = loading;
  });

  // Auto-refresh polls at the given interval (ms). Setting autoRefresh to 0
  // or omitting it disables polling entirely.
  // Presence of a handler is a dependency; its identity is not, so an inline
  // arrow cannot restart the timer. Cleanup closes over its own id.
  const hasRefresh = Boolean(onRefresh);
  useEffect(() => {
    if (autoRefresh && autoRefresh > 0 && hasRefresh) {
      const id = setInterval(() => {
        if (loadingRef.current) return;
        onRefreshRef.current?.();
      }, autoRefresh);
      return () => clearInterval(id);
    }
  }, [autoRefresh, hasRefresh]);

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

  // Merging buffered items unmounts the banner that was holding focus, which
  // strands the caret on <body>; the feed region is the semantic successor.
  const handleShowNewItems = useCallback(() => {
    onShowNewItems?.();
    scrollContainerRef.current?.focus();
  }, [onShowNewItems]);

  /* Skeleton loading state: only shown when there are zero items and loading
     is true. Subsequent refreshes keep existing items visible (no flicker). */
  const headerRow = (header || onRefresh) && (
    <div data-part="header-row">
      <div data-part="header-content">{header}</div>
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
  );

  if (loading && items.length === 0) {
    return (
      <div
        data-part="root"
        aria-busy={true}
        className={`ds-pattern-live-feed ds-engine-modern ${className ?? ''}`}
        style={style}
      >
        <div data-part="body">
          {headerRow}
          <div data-part="skeleton-list" className="animate-pulse">
            <div data-part="skeleton" data-skeleton="title" />
            {[1, 2, 3].map((i) => (
              <div key={i} data-part="skeleton" data-skeleton="row" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-part="root"
      aria-busy={Boolean(loading)}
      className={`ds-pattern-live-feed ds-engine-modern ${className ?? ''}`}
      style={style}
    >
      <div data-part="body">
        {/* Header */}
        {headerRow}

        {/* Buffered arrivals never enter the list, so the polite list region
            cannot announce them -- this status is their only AT channel. */}
        <VisuallyHidden role="status" aria-live="polite">
          {newItemsCount != null && newItemsCount > 0
            ? translation?.tOr('liveFeed.newItemsAnnouncement', '{count} pending updates', {
                count: newItemsCount,
              }) ?? `${newItemsCount} pending updates`
            : ''}
        </VisuallyHidden>

        {/* New items indicator -- full-width info button so it is impossible to miss.
            Clicking merges buffered items into the visible list (handled by parent). */}
        {newItemsCount != null && newItemsCount > 0 && (
          <Button
            engine="modern"
            variant="ghost"
            size="sm"
            data-part="banner"
            onClick={handleShowNewItems}
          >
            <span data-part="badge">{newItemsCount}</span>
            {newItemsCount === 1
              ? translation?.tOr('liveFeed.newItem', 'new item') ?? 'new item'
              : translation?.tOr('liveFeed.newItems', 'new items') ?? 'new items'}
          </Button>
        )}

        {/* Feed -- maxHeight enables vertical scrolling for bounded-height containers.
            When omitted, the feed grows unbounded. maxHeight/overflow stay inline:
            they are runtime-measured values (the ScrollArea precedent), not paint. */}
        {/* A bounded scroller must be tab-reachable or keyboard-only users can
            never scroll it (WCAG 2.1.1); unbounded it stays programmatic-only. */}
        <div
          ref={scrollContainerRef}
          data-part="viewport"
          tabIndex={maxHeight ? 0 : -1}
          role={maxHeight ? 'region' : undefined}
          aria-label={maxHeight ? feedLabel : undefined}
          style={{ maxHeight: maxHeight ?? undefined, overflow: maxHeight ? 'auto' : undefined }}
        >
          {displayItems.length === 0
            ? emptyState ?? (
                <div data-part="empty">
                  <Empty image="simple" description={emptyLabel} />
                </div>
              )
            : null}
          {/* Stays mounted while empty: a live region created already-populated
              is not announced, so it must exist before the first items land. */}
          {/* The Tailwind layout classes on the list are PINNED by
              LiveFeed.pulse.test.tsx (`.flex.flex-col.gap-2 > div` row
              queries) — they stay as layout utilities until the test is
              re-pointed at `data-part='list'`. The list is a polite live
              region: arriving items are announced to assistive tech. */}
          <div data-part="list" className="flex flex-col gap-2" role="log" aria-live="polite">
            {/* ds-pulse-changed (foundation/animations/transitions/index.css) flashes
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
