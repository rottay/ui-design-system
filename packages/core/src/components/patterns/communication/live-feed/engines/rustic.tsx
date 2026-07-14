'use client';

/**
 * @fileoverview Rustic (Vanilla / CSS variables) engine for the LiveFeed pattern.
 * Renders a real-time feed using only inline styles with `--ds-*` design tokens,
 * making it framework-agnostic. Supports auto-refresh polling, a "new items" bar,
 * load-more pagination, and a custom `feedPulse` keyframe animation for new entries.
 * Injects its own `@keyframes` via an inline `<style>` tag to stay self-contained.
 *
 * @example
 * <RusticLiveFeed
 *   items={[{ key: '1', title: 'New signup', isNew: true }]}
 *   renderItem={(item) => <span>{item.title}</span>}
 *   autoRefresh={8000}
 *   maxHeight={400}
 *   header={<strong>Activity</strong>}
 * />
 */

import React, { useEffect, useRef } from 'react';
import type { LiveFeedProps, FeedItem } from '../LiveFeed.types';

// ---------------------------------------------------------------------------
// Static style objects.
// All visual tokens reference --ds-* CSS custom properties with optional
// component-scoped overrides (--ds-live-feed-*) so consumers can theme the
// feed independently of the global palette.
// ---------------------------------------------------------------------------

const s = {
  container: {
    fontFamily: 'var(--ds-font-family-base)',
    color: 'var(--ds-color-neutral-900)',
    background: 'var(--ds-live-feed-bg, var(--ds-color-bg-elevated))',
    border: '1px solid var(--ds-live-feed-border, var(--ds-color-border))',
    borderRadius: 'var(--ds-radius-lg)',
    padding: '1.5rem',
  } as React.CSSProperties,
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  } as React.CSSProperties,
  refreshBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    color: 'var(--ds-live-feed-refresh-color, var(--ds-color-text-secondary))',
    fontSize: '1rem',
    borderRadius: 'var(--ds-radius-sm)',
  } as React.CSSProperties,
  newBar: {
    textAlign: 'center' as const,
    padding: '0.5rem',
    marginBottom: '0.75rem',
    background: 'var(--ds-live-feed-new-bg, var(--ds-color-info-bg))',
    borderRadius: 'var(--ds-radius-md)',
    cursor: 'pointer',
    fontSize: 'var(--ds-font-size-sm)',
    color: 'var(--ds-live-feed-new-color, var(--ds-color-info))',
    fontWeight: 500,
    border: '1px solid var(--ds-live-feed-new-border, var(--ds-color-info-border))',
  } as React.CSSProperties,
  newBadge: {
    display: 'inline-block',
    padding: '0 0.375rem',
    borderRadius: 'var(--ds-radius-full, 9999px)',
    fontSize: 'var(--ds-font-size-xs)',
    fontWeight: 600,
    background: 'var(--ds-live-feed-badge-bg, var(--ds-color-primary))',
    color: 'var(--ds-live-feed-badge-color, var(--ds-color-text-on-primary))',
    marginRight: '0.375rem',
  } as React.CSSProperties,
  empty: {
    textAlign: 'center' as const,
    padding: '2rem 0',
    color: 'var(--ds-live-feed-empty-color, var(--ds-color-text-muted))',
    fontSize: 'var(--ds-font-size-sm)',
  } as React.CSSProperties,
  feedList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  } as React.CSSProperties,
  loadMore: {
    display: 'block',
    margin: '0.75rem auto 0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--ds-live-feed-load-more-color, var(--ds-color-primary))',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: 500,
    padding: '0.25rem 0.75rem',
    borderRadius: 'var(--ds-radius-md)',
  } as React.CSSProperties,
  // Skeleton factory: returns a pulsing placeholder block at the given width/height.
  // Used during initial loading state to hint at incoming content layout.
  skeleton: (w: string, h: string) => ({
    width: w,
    height: h,
    borderRadius: 'var(--ds-radius-md)',
    background: 'var(--ds-live-feed-skeleton-bg, var(--ds-color-bg-tertiary))',
    animation: 'pulse 1.5s ease-in-out infinite',
  } as React.CSSProperties),
};

/**
 * Rustic (Vanilla) LiveFeed engine.
 *
 * Uses inline styles exclusively, referencing `--ds-*` CSS custom properties for
 * theming. Injects `@keyframes pulse` and `@keyframes feedPulse` via an inline
 * `<style>` tag so no external stylesheet is needed.
 *
 * @typeParam T - Feed item shape, must extend {@link FeedItem}.
 * @param props - {@link LiveFeedProps} -- items, renderItem callback, refresh/load-more controls.
 * @returns A scrollable feed as a styled container div.
 */
export default function RusticLiveFeed<T extends FeedItem>(props: LiveFeedProps<T>) {
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

  // Interval ref persists across renders for correct cleanup on unmount.
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Auto-refresh: polls at the given interval. Setting autoRefresh to 0 disables it.
  useEffect(() => {
    if (autoRefresh && autoRefresh > 0 && onRefresh) {
      intervalRef.current = setInterval(onRefresh, autoRefresh);
      return () => clearInterval(intervalRef.current);
    }
  }, [autoRefresh, onRefresh]);

  // Cap visible items to prevent excessive DOM rendering in high-throughput feeds.
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  // Skeleton loading: only on first load (empty items). Subsequent refreshes
  // preserve existing items so users see continuous content.
  if (loading && items.length === 0) {
    return (
      <div data-part="root" className={`ds-pattern-live-feed ds-engine-rustic ${className ?? ''}`} style={{ ...s.container, ...style }}>
        {/* Inline @keyframes since rustic engine has no external CSS dependency. */}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
        <div data-part="skeleton" style={s.skeleton('30%', '1rem')} />
        {[1, 2, 3].map((i) => (
          <div key={i} data-part="skeleton" style={{ ...s.skeleton('100%', '3.5rem'), marginTop: '0.5rem' }} />
        ))}
      </div>
    );
  }

  return (
    <div data-part="root" className={`ds-pattern-live-feed ds-engine-rustic ${className ?? ''}`} style={{ ...s.container, ...style }}>
      {/* Two keyframes injected inline:
          - pulse: skeleton loading shimmer
          - feedPulse: background flash on newly arrived feed items,
            fading from info-bg to transparent over 1s. */}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} } @keyframes feedPulse { 0%{background:var(--ds-live-feed-new-bg,var(--ds-color-info-bg))} 100%{background:transparent} }`}</style>

      {(header || onRefresh) && (
        <div style={s.headerRow}>
          <div>{header}</div>
          {onRefresh && (
            <button data-part="refresh" style={s.refreshBtn} onClick={onRefresh} aria-label="Refresh">
              &#8635;
            </button>
          )}
        </div>
      )}

      {/* New items bar -- clickable banner that tells the user how many unseen items
          are buffered. The parent decides how to merge them into the visible list. */}
      {newItemsCount != null && newItemsCount > 0 && (
        <div data-part="banner" style={s.newBar} onClick={onShowNewItems}>
          <span data-part="badge" style={s.newBadge}>{newItemsCount}</span>
          new {newItemsCount === 1 ? 'item' : 'items'}
        </div>
      )}

      {/* Scrollable feed area. maxHeight makes the container scroll;
          when omitted, the list grows without constraint. */}
      <div style={{ maxHeight: maxHeight ?? undefined, overflow: maxHeight ? 'auto' : undefined }}>
        {displayItems.length === 0 ? (
          emptyState ?? <div data-part="empty" style={s.empty}>No items</div>
        ) : (
          <div style={s.feedList}>
            {/* New items receive feedPulse animation: a 1s background flash from
                info-bg to transparent, drawing the user's eye to the fresh entry. */}
            {displayItems.map((item, i) => (
              <div
                key={item.key}
                style={item.isNew ? { animation: 'feedPulse 1s ease-out' } : undefined}
              >
                {renderItem(item, i)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load-more button. Text changes to "Loading..." during fetch to give
          the user feedback without adding a separate spinner element. */}
      {hasMore && onLoadMore && (
        <button data-part="load-more" style={s.loadMore} onClick={onLoadMore}>
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}
