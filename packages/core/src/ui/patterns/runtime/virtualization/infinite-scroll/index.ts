'use client';

/**
 * @fileoverview IntersectionObserver-driven infinite scroll. A sentinel element
 * placed at the end of a list calls `onLoadMore` whenever it scrolls into view
 * while `hasMore` is true. Extracted from the PatternLiveFeed hasMore/onLoadMore
 * contract so any list (LiveFeed, VirtualList, transcript rails) shares one
 * sentinel implementation. Zero external dependencies.
 */

import { useCallback, useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseInfiniteScrollOptions {
  /** Whether more items remain to load. When false the sentinel is inert. */
  hasMore: boolean;
  /** Invoked when the sentinel enters view and more items remain. */
  onLoadMore: () => void;
  /** Master switch; set false to suspend loading entirely. @default true */
  enabled?: boolean;
  /**
   * Distance from the scroll edge at which to trigger, as an
   * IntersectionObserver `rootMargin`. @default '0px'
   */
  rootMargin?: string;
  /** IntersectionObserver threshold. @default 0 */
  threshold?: number;
  /**
   * Scroll container to observe within. Omit (or null) to observe against the
   * viewport.
   */
  root?: React.RefObject<HTMLElement | null> | null;
}

export interface UseInfiniteScrollReturn {
  /** Ref callback to attach to the end-of-list sentinel element. */
  sentinelRef: (element: HTMLElement | null) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Wire an end-of-list sentinel to a load-more callback.
 *
 * @example
 * ```tsx
 * const { sentinelRef } = useInfiniteScroll({ hasMore, onLoadMore: fetchNextPage });
 * return (
 *   <div>
 *     {items.map(renderItem)}
 *     <div ref={sentinelRef} aria-hidden="true" />
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll(options: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const { hasMore, onLoadMore, enabled = true, rootMargin = '0px', threshold = 0, root } = options;

  // The observer callback reads the latest values through refs so a changing
  // hasMore/onLoadMore never tears down and rebuilds the observer.
  const hasMoreRef = useRef(hasMore);
  const onLoadMoreRef = useRef(onLoadMore);
  const enabledRef = useRef(enabled);
  hasMoreRef.current = hasMore;
  onLoadMoreRef.current = onLoadMore;
  enabledRef.current = enabled;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelElementRef = useRef<HTMLElement | null>(null);

  const connect = useCallback(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && enabledRef.current && hasMoreRef.current) {
            onLoadMoreRef.current();
          }
        }
      },
      { root: root?.current ?? null, rootMargin, threshold },
    );

    if (sentinelElementRef.current) observer.observe(sentinelElementRef.current);
    observerRef.current = observer;
  }, [root, rootMargin, threshold]);

  useEffect(() => {
    connect();
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [connect]);

  const sentinelRef = useCallback((element: HTMLElement | null) => {
    sentinelElementRef.current = element;
    if (!observerRef.current) return;
    observerRef.current.disconnect();
    if (element) observerRef.current.observe(element);
  }, []);

  return { sentinelRef };
}
