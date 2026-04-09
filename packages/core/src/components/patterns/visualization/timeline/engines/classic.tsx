'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the Timeline pattern.
 *
 * Wraps Ant Design's Timeline component with support for user avatars,
 * type-based dot coloring, optional date grouping, and a `renderItem` slot
 * for full customization. Items are transformed into Ant's `items` prop
 * format using `buildItems`, which maps the pattern's color/type/icon fields
 * to Ant Design's `color`, `dot`, and `children` properties.
 *
 * @example
 * <ClassicTimeline
 *   items={[{ key: '1', title: 'Deployed v2.0', timestamp: new Date(), type: 'success' }]}
 *   mode="alternate"
 *   groupByDate
 *   showTimestamp
 * />
 */

import React, { useMemo } from 'react';
import { Timeline as AntTimeline, Typography, Avatar, Spin, Empty } from 'antd';
import type { TimelinePatternProps, TimelineItem } from '../Timeline.types';

const { Text, Paragraph } = Typography;

/** Formats a timestamp for display inside a timeline item. */
function formatTimestamp(ts: string | Date): string {
  const date = typeof ts === 'string' ? new Date(ts) : ts;
  return date.toLocaleString();
}

/** Extracts a locale-formatted date string used as a grouping key. */
function formatDateKey(ts: string | Date): string {
  const date = typeof ts === 'string' ? new Date(ts) : ts;
  return date.toLocaleDateString();
}

/** Maps semantic item types to Ant Design's Timeline dot color names. */
const typeColorMap: Record<string, string> = {
  default: 'blue',
  success: 'green',
  warning: 'orange',
  error: 'red',
  info: 'cyan',
};

/**
 * Classic (Ant Design) engine for the Timeline pattern component.
 *
 * Supports left, right, and alternate layout modes via Ant Design's Timeline
 * `mode` prop. Date grouping clusters items under calendar-date headers.
 * The `renderItem` slot receives both the raw item and a pre-built default
 * render so consumers can wrap or replace individual entries.
 *
 * @param props - {@link TimelinePatternProps} controlling items, layout mode, grouping, and callbacks.
 * @returns A vertical timeline rendered with Ant Design primitives.
 */
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

  // Map the pattern's mode to Ant Design's accepted values. The pattern
  // defines modes as union strings; Ant Design uses the same names.
  const antMode = mode === 'alternate' ? 'alternate' : mode === 'right' ? 'right' : 'left';

  // Group items by calendar date when groupByDate is enabled, rendering
  // a date header above each cluster for visual separation.
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

  /** Transforms pattern TimelineItems into Ant Design's `items` prop format. */
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
