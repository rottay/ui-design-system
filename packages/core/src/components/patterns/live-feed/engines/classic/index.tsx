'use client';

/**
 * LiveFeed - Classic Engine (Ant Design)
 */

import React, { useEffect, useRef } from 'react';
import { Card, Button, Skeleton, Empty, Badge } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { LiveFeedProps, FeedItem } from '../../types';

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
      {/* New items bar */}
      {newItemsCount != null && newItemsCount > 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '8px 0',
            marginBottom: 12,
            background: '#e6f4ff',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            color: '#1677ff',
            fontWeight: 500,
          }}
          onClick={onShowNewItems}
        >
          <Badge count={newItemsCount} size="small" style={{ marginRight: 6 }} />
          new {newItemsCount === 1 ? 'item' : 'items'}
        </div>
      )}

      <div style={{ maxHeight: maxHeight ?? undefined, overflow: maxHeight ? 'auto' : undefined }}>
        {displayItems.length === 0 ? (
          emptyState ?? <Empty description="No items" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
