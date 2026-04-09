'use client';

/**
 * @fileoverview Modern (token-driven) engine for the LiveFeed pattern.
 * Renders a real-time feed inside a DS token card with optional auto-refresh
 * polling, a "new items" banner, and load-more pagination.
 * New items receive Tailwind's `animate-pulse` class to signal freshness.
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
import type { LiveFeedProps, FeedItem } from '../LiveFeed.types';
import { panelCardStyle, cardBodyStyle, pillBadgeSmStyle, spinnerStyle } from '../../_internal/engines/modern/styles';

/**
 * Modern (token-driven) LiveFeed engine.
 *
 * Uses DS token inline styles and shared modern-styles helpers. Supports
 * polling-based auto-refresh, a configurable item cap (maxItems), and
 * scrollable feed area.
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

  // Skeleton loading state: only shown when there are zero items and loading is true.
  // Subsequent refreshes keep existing items visible (no flicker).
  if (loading && items.length === 0) {
    return (
      <div className={className ?? ''} style={{ ...panelCardStyle, boxShadow: 'var(--ds-elevation-1)', ...style }}>
        <div className="animate-pulse" style={cardBodyStyle}>
          <div style={{ height: 16, borderRadius: 'var(--ds-radius-sm)', width: '33%', marginBottom: 16, background: 'var(--ds-surface-panel)' }} />
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 64, borderRadius: 'var(--ds-radius-sm)', marginBottom: 8, background: 'var(--ds-surface-panel)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className ?? ''} style={{ ...panelCardStyle, boxShadow: 'var(--ds-elevation-1)', ...style }}>
      <div style={cardBodyStyle}>
        {/* Header */}
        {(header || onRefresh) && (
          <div className="flex items-center justify-between mb-3">
            <div>{header}</div>
            {onRefresh && (
              <button style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', width: 32, height: 32, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 13 }} onClick={onRefresh}>
                {loading ? (
                  <span style={spinnerStyle(14)} />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )}
          </div>
        )}

        {/* New items indicator -- full-width info button so it is impossible to miss.
            Clicking merges buffered items into the visible list (handled by parent). */}
        {newItemsCount != null && newItemsCount > 0 && (
          <button
            style={{ background: 'var(--ds-color-info, #3b82f6)', color: 'var(--ds-color-text-on-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginBottom: 12 }}
            onClick={onShowNewItems}
          >
            <div style={{ ...pillBadgeSmStyle, background: 'var(--ds-surface-panel)', color: 'var(--ds-color-text-primary)' }}>{newItemsCount}</div>
            new {newItemsCount === 1 ? 'item' : 'items'}
          </button>
        )}

        {/* Feed -- maxHeight enables vertical scrolling for bounded-height containers.
            When omitted, the feed grows unbounded. */}
        <div style={{ maxHeight: maxHeight ?? undefined, overflow: maxHeight ? 'auto' : undefined }}>
          {displayItems.length === 0 ? (
            emptyState ?? <div className="text-center py-8" style={{ color: 'var(--ds-color-text-secondary)' }}>No items</div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Tailwind animate-pulse on new items provides a visual cue that the
                  entry just arrived, helping users track real-time changes. */}
              {displayItems.map((item, i) => (
                <div key={item.key} className={item.isNew ? 'animate-pulse' : ''}>
                  {renderItem(item, i)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load more */}
        {hasMore && onLoadMore && (
          <div className="text-center mt-3">
            <button style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={onLoadMore}>
              {loading && <span style={spinnerStyle(14)} />}
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
