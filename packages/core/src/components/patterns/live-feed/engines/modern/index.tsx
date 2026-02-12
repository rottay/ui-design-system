'use client';

/**
 * LiveFeed - Modern Engine (DaisyUI/Tailwind)
 */

import React, { useEffect, useRef } from 'react';
import type { LiveFeedProps, FeedItem } from '../../types';

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
      <div className={`card bg-base-100 shadow-sm ${className ?? ''}`} style={style}>
        <div className="card-body animate-pulse">
          <div className="h-4 bg-base-300 rounded w-1/3 mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-base-300 rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`card bg-base-100 shadow-sm ${className ?? ''}`} style={style}>
      <div className="card-body">
        {/* Header */}
        {(header || onRefresh) && (
          <div className="flex items-center justify-between mb-3">
            <div>{header}</div>
            {onRefresh && (
              <button className={`btn btn-ghost btn-sm btn-square ${loading ? 'loading' : ''}`} onClick={onRefresh}>
                {!loading && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )}
          </div>
        )}

        {/* New items indicator */}
        {newItemsCount != null && newItemsCount > 0 && (
          <button
            className="btn btn-info btn-sm btn-block mb-3 gap-2"
            onClick={onShowNewItems}
          >
            <div className="badge badge-sm">{newItemsCount}</div>
            new {newItemsCount === 1 ? 'item' : 'items'}
          </button>
        )}

        {/* Feed */}
        <div style={{ maxHeight: maxHeight ?? undefined, overflow: maxHeight ? 'auto' : undefined }}>
          {displayItems.length === 0 ? (
            emptyState ?? <div className="text-center py-8 text-base-content/50">No items</div>
          ) : (
            <div className="flex flex-col gap-2">
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
            <button className={`btn btn-ghost btn-sm ${loading ? 'loading' : ''}`} onClick={onLoadMore}>
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
