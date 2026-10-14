'use client';

/**
 * @fileoverview PatternVirtualList - windowed rendering for long lists.
 * Composes the measured (variable-height) virtual-scroll runtime with the
 * infinite-scroll sentinel and optional scroll-position restoration. The
 * visible window is absolutely positioned inside a full-height spacer so
 * scrollbars stay accurate regardless of dataset size.
 *
 * PAINT (WO-FAM-08 B7): the geometry the runtime MEASURES travels as
 * `--ds-virtual-list-*` custom properties and nothing else rides the `style`
 * prop. The scrollport's viewport bound, the spacer's total block size and
 * each row's measured offset are per-instance numbers, so the skin declares
 * their resting values on the root and consumes them; the constants the
 * pattern used to stamp inline (the scrollport's overflow and positioning,
 * the spacer's stacking context, the row's inline anchoring, the sentinel's
 * hairline) are the skin's, not the TSX's.
 *
 * STATE (F-37): the scrollport is a real tab stop (scrollable-region law), so
 * its interaction state is decided ONCE by the kernel and stamped through
 * `partAttributes`. The skin's focus arms pair `[data-state~='focus-visible']`
 * with the platform pseudo-class instead of deciding the same question twice.
 */

import React, { useCallback, useEffect } from 'react';
import type { PatternVirtualListProps } from '../../contracts';
import { useMeasuredScroll } from '../../../../runtime/virtualization/variable-scroll';
import { useInfiniteScroll } from '../../../../runtime/virtualization/infinite-scroll';
import { partAttributes, useInteractionState } from '@/foundation/behavior';

/**
 * Module-level scroll-offset memory keyed by `scrollRestorationKey`. Survives
 * unmount/remount within a session so a list restores its position on return.
 */
const scrollOffsets = new Map<string, number>();

const noop = (): void => {};

/** A caller number becomes a CSS length; a caller string is already one. */
function toCssLength(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

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
    height,
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

  const interaction = useInteractionState();

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

  /* The viewport bound is stamped ONLY when the caller states one. An
     unconditional stamp of the old `'100%'` default would shadow the channel on
     every render and take the resting bound away from the skin, which is where
     it is declared. */
  const viewportChannel = {
    ...(height !== undefined && { '--ds-virtual-list-block-size': toCssLength(height) }),
    ...style,
  } as React.CSSProperties;

  if (items.length === 0 && emptyState !== undefined) {
    return (
      <div
        data-part="empty"
        className={['ds-pattern-virtual-list', className].filter(Boolean).join(' ')}
        style={viewportChannel}
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
      {...partAttributes('root', interaction.state)}
      {...interaction.handlers}
      className={['ds-pattern-virtual-list', className].filter(Boolean).join(' ')}
      /* Scrollable-region law (timeline precedent): the windowed region is
         keyboard-focusable so the list can be scrolled without a pointer and
         AT lands on the list context before its items. */
      tabIndex={0}
      style={viewportChannel}
    >
      <div
        data-part="spacer"
        role="none"
        /* Measured: the total block size of the whole dataset, so the scrollbar
           is accurate for rows that were never rendered. */
        style={{ '--ds-virtual-list-spacer-block-size': `${totalSize}px` } as React.CSSProperties}
      >
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
              /* Measured: this row's own offset inside the spacer. */
              style={{ '--ds-virtual-list-item-inset-block-start': `${virtualItem.start}px` } as React.CSSProperties}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
        {onEndReached && hasMore ? (
          <div ref={sentinelRef} data-part="sentinel" aria-hidden="true" />
        ) : null}
      </div>
    </div>
  );
}
