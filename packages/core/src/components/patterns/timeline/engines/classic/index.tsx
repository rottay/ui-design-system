'use client';

/**
 * Timeline - Classic Engine (Ant Design)
 */

import React, { useMemo } from 'react';
import { Timeline as AntTimeline, Typography, Avatar, Spin, Empty } from 'antd';
import type { TimelinePatternProps, TimelineItem } from '../../types';

const { Text, Paragraph } = Typography;

function formatTimestamp(ts: string | Date): string {
  const date = typeof ts === 'string' ? new Date(ts) : ts;
  return date.toLocaleString();
}

function formatDateKey(ts: string | Date): string {
  const date = typeof ts === 'string' ? new Date(ts) : ts;
  return date.toLocaleDateString();
}

const typeColorMap: Record<string, string> = {
  default: 'blue',
  success: 'green',
  warning: 'orange',
  error: 'red',
  info: 'cyan',
};

export default function ClassicTimeline<T>(props: TimelinePatternProps<T>) {
  const {
    items,
    renderItem,
    onItemClick,
    mode = 'left',
    showTimestamp = true,
    header,
    footer,
    emptyState,
    groupByDate,
    loading,
    className,
    style,
  } = props;

  const antMode = mode === 'alternate' ? 'alternate' : mode === 'right' ? 'right' : 'left';

  const grouped = useMemo(() => {
    if (!groupByDate) return null;
    const groups: Record<string, TimelineItem<T>[]> = {};
    for (const item of items) {
      const key = formatDateKey(item.timestamp);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [items, groupByDate]);

  const buildDefaultRender = (item: TimelineItem<T>) => (
    <div
      style={{ cursor: onItemClick ? 'pointer' : undefined }}
      onClick={onItemClick ? () => onItemClick(item) : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {item.user?.avatar && <Avatar src={item.user.avatar} size="small" />}
        {item.user && <Text strong style={{ fontSize: 13 }}>{item.user.name}</Text>}
      </div>
      <Text strong>{item.title}</Text>
      {showTimestamp && (
        <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
          {formatTimestamp(item.timestamp)}
        </Text>
      )}
      {item.description && <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>{item.description}</Paragraph>}
    </div>
  );

  const buildItems = (list: TimelineItem<T>[]) =>
    list.map((item) => {
      const defaultRender = buildDefaultRender(item);
      return {
        key: item.key,
        color: item.color ?? typeColorMap[item.type ?? 'default'] ?? 'blue',
        dot: item.icon || undefined,
        children: renderItem ? renderItem(item, defaultRender) : defaultRender,
      };
    });

  if (loading) {
    return (
      <div className={className} style={{ textAlign: 'center', padding: 48, ...style }}>
        <Spin />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={className} style={style}>
        {header}
        {emptyState ?? <Empty description="No timeline items" />}
        {footer}
      </div>
    );
  }

  return (
    <div className={`ds-pattern-timeline ds-engine-classic ${className ?? ''}`} style={style}>
      {header}
      {grouped ? (
        Object.entries(grouped).map(([dateKey, group]) => (
          <div key={dateKey} style={{ marginBottom: 24 }}>
            <Text strong style={{ fontSize: 14, color: 'var(--ds-color-neutral-600)', display: 'block', marginBottom: 12 }}>
              {dateKey}
            </Text>
            <AntTimeline mode={antMode} items={buildItems(group)} />
          </div>
        ))
      ) : (
        <AntTimeline mode={antMode} items={buildItems(items)} />
      )}
      {footer}
    </div>
  );
}
