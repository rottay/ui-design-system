'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the LiveFeed pattern.
 * Renders a real-time feed of items inside an Ant Design Card with optional
 * auto-refresh polling, a "new items" notification bar, and infinite-scroll
 * load-more support. New items receive an `antPulse` animation to draw attention.
 *
 * @example
 * <ClassicLiveFeed
 *   items={[{ key: '1', message: 'Order received', isNew: true }]}
 *   renderItem={(item) => <Text>{item.message}</Text>}
 *   autoRefresh={5000}
 *   onRefresh={() => fetchLatest()}
 *   maxItems={50}
 * />
 */

import React, { useEffect, useRef } from 'react';
import { Card, Button, Skeleton, Empty, Badge } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { LiveFeedProps, FeedItem } from '../../contracts';

/**
 * Classic (Ant Design) LiveFeed engine.
 *
 * Supports polling-based auto-refresh, a banner showing the count of unseen items,
 * and a capped display list to prevent rendering hundreds of DOM nodes at once.
 *
 * @typeParam T - Feed item shape, must extend {@link FeedItem}.
 * @param props - {@link LiveFeedProps} -- items, renderItem callback, refresh/load-more controls.
 * @returns A scrollable feed wrapped in an Ant Design Card.
 */
export default function ClassicLiveFeed<T extends FeedItem>(props: LiveFeedProps<T>) {
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

  // Interval ref persists across renders so the cleanup function in useEffect
  // can clear the correct timer when autoRefresh or onRefresh changes.
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Auto-refresh polls at the specified interval (ms). The cleanup function
  // ensures no leaked intervals when the component unmounts or the interval changes.
  useEffect(() => {
    if (autoRefresh && autoRefresh > 0 && onRefresh) {
      intervalRef.current = setInterval(onRefresh, autoRefresh);
      return () => clearInterval(intervalRef.current);
    }
  }, [autoRefresh, onRefresh]);

  // Cap visible items to avoid rendering hundreds of feed entries at once,
  // which would hurt scroll performance. Older items are still in the parent's data array.
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  // Show skeleton only on initial load (no items yet). Subsequent refreshes
  // keep the existing items visible with a loading indicator on the refresh button.
  if (loading && items.length === 0) {
    return (
      <Card className={className} style={style}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  return (
    <Card
      className={className}
      style={style}
      title={header}
      extra={onRefresh && <Button type="text" icon={<ReloadOutlined />} size="small" onClick={onRefresh} loading={loading} />}
    >
      {/* New items bar -- shown when the parent has buffered items that are not yet
          in the visible list. Clicking it triggers onShowNewItems so the parent can
          prepend them (e.g. scroll-to-top + merge). */}
      {newItemsCount != null && newItemsCount > 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '8px 0',
            marginBottom: 12,
            background: 'var(--ds-color-info-bg)',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            color: 'var(--ds-color-info)',
            fontWeight: 500,
          }}
          onClick={onShowNewItems}
        >
          <Badge count={newItemsCount} size="small" style={{ marginRight: 6 }} />
          new {newItemsCount === 1 ? 'item' : 'items'}
        </div>
      )}

      {/* Scrollable feed container. maxHeight enables vertical scrolling for long feeds,
          while leaving it undefined lets the container grow freely. */}
      <div style={{ maxHeight: maxHeight ?? undefined, overflow: maxHeight ? 'auto' : undefined }}>
        {displayItems.length === 0 ? (
          emptyState ?? <Empty description="No items" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* isNew items get an Ant Design pulse animation to visually distinguish
                freshly arrived entries from previously rendered ones. */}
            {displayItems.map((item, i) => (
              <div
                key={item.key}
                style={{
                  animation: item.isNew ? 'antPulse 0.6s ease-out' : undefined,
                }}
              >
                {renderItem(item, i)}
              </div>
            ))}
          </div>
        )}
      </div>

      {hasMore && onLoadMore && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Button type="link" onClick={onLoadMore} loading={loading}>Load more</Button>
        </div>
      )}
    </Card>
  );
}
