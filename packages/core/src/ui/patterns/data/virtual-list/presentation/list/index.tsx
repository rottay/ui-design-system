'use client';

/**
 * @fileoverview PatternVirtualList - windowed rendering for long lists.
 * Composes the measured (variable-height) virtual-scroll runtime with the
 * infinite-scroll sentinel and optional scroll-position restoration. Renders
 * raw token-styled containers like the other data patterns; the visible window
 * is absolutely positioned inside a full-height spacer so scrollbars stay
 * accurate regardless of dataset size.
 */

import React, { useCallback, useEffect } from 'react';
import type { PatternVirtualListProps } from '../../contracts';
import { useMeasuredScroll } from '../../../../runtime/virtualization/variable-scroll';
import { useInfiniteScroll } from '../../../../runtime/virtualization/infinite-scroll';

/**
 * Module-level scroll-offset memory keyed by `scrollRestorationKey`. Survives
 * unmount/remount within a session so a list restores its position on return.
 */
const scrollOffsets = new Map<string, number>();

const noop = (): void => {};

export function PatternVirtualList<T>(props: PatternVirtualListProps<T>): React.ReactElement {
  const {
    items,
    renderItem,
    getItemKey,
    estimateSize = 48,
    overscan = 4,
    onEndReached,
    hasMore = false,
    endReachedThreshold = 200,
    scrollRestorationKey,
    height = '100%',
    emptyState,
    className,
    style,
    id,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
  } = props;

  const { scrollRef, totalSize, virtualItems, onScroll } = useMeasuredScroll({
    count: items.length,
    estimateSize,
    overscan,
  });

  const infiniteEnabled = Boolean(onEndReached) && hasMore;
  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    onLoadMore: onEndReached ?? noop,
    enabled: infiniteEnabled,
    rootMargin: `0px 0px ${endReachedThreshold}px 0px`,
    root: scrollRef,
  });

  // Restore the remembered offset on mount; persist it on unmount.
  useEffect(() => {
    if (!scrollRestorationKey) return undefined;
    const element = scrollRef.current;
    const saved = scrollOffsets.get(scrollRestorationKey);
    if (element && saved !== undefined) element.scrollTop = saved;
    return () => {
      const current = scrollRef.current;
      if (current) scrollOffsets.set(scrollRestorationKey, current.scrollTop);
    };
  }, [scrollRestorationKey, scrollRef]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      onScroll(event);
      if (scrollRestorationKey) {
        scrollOffsets.set(scrollRestorationKey, event.currentTarget.scrollTop);
      }
    },
    [onScroll, scrollRestorationKey],
  );

  if (items.length === 0 && emptyState !== undefined) {
    return (
      <div
        data-part="empty"
        className={['ds-pattern-virtual-list', className].filter(Boolean).join(' ')}
        style={{ height, ...style }}
        id={id}
        data-testid={dataTestId}
        aria-label={ariaLabel}
      >
        {emptyState}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      role="list"
      aria-label={ariaLabel}
      id={id}
      data-testid={dataTestId}
      data-part="root"
      className={['ds-pattern-virtual-list', className].filter(Boolean).join(' ')}
      /* Scrollable-region law (timeline precedent): the windowed region is
         keyboard-focusable so the list can be scrolled without a pointer and
         AT lands on the list context before its items. */
      tabIndex={0}
      style={{
        height,
        overflowY: 'auto',
        position: 'relative',
        ...style,
      }}
    >
      <div data-part="spacer" role="none" style={{ position: 'relative', width: '100%', height: totalSize }}>
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          const key = getItemKey ? getItemKey(item, virtualItem.index) : virtualItem.index;
          return (
            <div
              key={key}
              ref={virtualItem.measureRef}
              role="listitem"
              aria-setsize={items.length}
              aria-posinset={virtualItem.index + 1}
              data-part="item"
              data-index={virtualItem.index}
              style={{ position: 'absolute', top: virtualItem.start, left: 0, right: 0 }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
        {onEndReached && hasMore ? (
          <div
            ref={sentinelRef}
            data-part="sentinel"
            aria-hidden="true"
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1 }}
          />
        ) : null}
      </div>
    </div>
  );
}
