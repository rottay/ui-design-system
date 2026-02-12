'use client';

/**
 * LiveFeed - Rustic Engine (Vanilla HTML/CSS with --ds-* vars)
 */

import React, { useEffect, useRef } from 'react';
import type { LiveFeedProps, FeedItem } from '../../types';

const s = {
  container: {
    fontFamily: 'var(--ds-font-family-base)',
    color: 'var(--ds-color-neutral-900)',
    background: 'var(--ds-color-neutral-0, #fff)',
    border: '1px solid var(--ds-color-neutral-200)',
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
    color: 'var(--ds-color-neutral-500)',
    fontSize: '1rem',
    borderRadius: 'var(--ds-radius-sm)',
  } as React.CSSProperties,
  newBar: {
    textAlign: 'center' as const,
    padding: '0.5rem',
    marginBottom: '0.75rem',
    background: 'var(--ds-color-primary-50, #eff6ff)',
    borderRadius: 'var(--ds-radius-md)',
    cursor: 'pointer',
    fontSize: 'var(--ds-font-size-sm)',
    color: 'var(--ds-color-primary-600)',
    fontWeight: 500,
    border: '1px solid var(--ds-color-primary-200, #bfdbfe)',
  } as React.CSSProperties,
  newBadge: {
    display: 'inline-block',
    padding: '0 0.375rem',
    borderRadius: 'var(--ds-radius-full, 9999px)',
    fontSize: 'var(--ds-font-size-xs)',
    fontWeight: 600,
    background: 'var(--ds-color-primary-600)',
    color: '#fff',
    marginRight: '0.375rem',
  } as React.CSSProperties,
  empty: {
    textAlign: 'center' as const,
    padding: '2rem 0',
    color: 'var(--ds-color-neutral-400)',
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
    color: 'var(--ds-color-primary-600)',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: 500,
    padding: '0.25rem 0.75rem',
    borderRadius: 'var(--ds-radius-md)',
  } as React.CSSProperties,
  skeleton: (w: string, h: string) => ({
    width: w,
    height: h,
    borderRadius: 'var(--ds-radius-md)',
    background: 'var(--ds-color-neutral-200)',
    animation: 'pulse 1.5s ease-in-out infinite',
  } as React.CSSProperties),
};

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

  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (autoRefresh && autoRefresh > 0 && onRefresh) {
      intervalRef.current = setInterval(onRefresh, autoRefresh);
      return () => clearInterval(intervalRef.current);
    }
  }, [autoRefresh, onRefresh]);

  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  if (loading && items.length === 0) {
    return (
      <div className={className} style={{ ...s.container, ...style }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
        <div style={s.skeleton('30%', '1rem')} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ ...s.skeleton('100%', '3.5rem'), marginTop: '0.5rem' }} />
        ))}
      </div>
    );
  }

  return (
    <div className={className} style={{ ...s.container, ...style }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} } @keyframes feedPulse { 0%{background:var(--ds-color-primary-50,#eff6ff)} 100%{background:transparent} }`}</style>

      {(header || onRefresh) && (
        <div style={s.headerRow}>
          <div>{header}</div>
          {onRefresh && (
            <button style={s.refreshBtn} onClick={onRefresh} aria-label="Refresh">
              &#8635;
            </button>
          )}
        </div>
      )}

      {newItemsCount != null && newItemsCount > 0 && (
        <div style={s.newBar} onClick={onShowNewItems}>
          <span style={s.newBadge}>{newItemsCount}</span>
          new {newItemsCount === 1 ? 'item' : 'items'}
        </div>
      )}

      <div style={{ maxHeight: maxHeight ?? undefined, overflow: maxHeight ? 'auto' : undefined }}>
        {displayItems.length === 0 ? (
          emptyState ?? <div style={s.empty}>No items</div>
        ) : (
          <div style={s.feedList}>
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

      {hasMore && onLoadMore && (
        <button style={s.loadMore} onClick={onLoadMore}>
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}
