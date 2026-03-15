'use client';

/**
 * Timeline - Rustic Engine (Inline styles with --ds-* CSS variables)
 */

import React, { useMemo, type CSSProperties } from 'react';
import type { TimelinePatternProps, TimelineItem } from '../Timeline.types';

function formatTimestamp(ts: string | Date): string {
  const date = typeof ts === 'string' ? new Date(ts) : ts;
  return date.toLocaleString();
}

function formatDateKey(ts: string | Date): string {
  const date = typeof ts === 'string' ? new Date(ts) : ts;
  return date.toLocaleDateString();
}

const typeColors: Record<string, string> = {
  default: 'var(--ds-color-primary)',
  success: 'var(--ds-color-success)',
  warning: 'var(--ds-color-warning)',
  error: 'var(--ds-color-error)',
  info: 'var(--ds-color-info)',
};

const styles = {
  container: {
    position: 'relative' as const,
  },
  line: {
    position: 'absolute' as const,
    left: 15,
    top: 0,
    bottom: 0,
    width: 2,
    background: 'var(--ds-color-neutral-200)',
  },
  item: {
    position: 'relative' as const,
    paddingLeft: 44,
    paddingBottom: 24,
  },
  dot: (color: string): CSSProperties => ({
    position: 'absolute',
    left: 8,
    top: 4,
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: color,
    border: '3px solid var(--ds-color-background)',
    boxShadow: `0 0 0 2px ${color}`,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  iconDot: (color: string): CSSProperties => ({
    position: 'absolute',
    left: 4,
    top: 0,
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: 'var(--ds-color-background)',
    border: `2px solid ${color}`,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
  }),
  card: (clickable: boolean): CSSProperties => ({
    background: 'var(--ds-color-background)',
    border: '1px solid var(--ds-color-neutral-200)',
    borderRadius: 'var(--ds-radius-md, 8px)',
    padding: '12px 16px',
    cursor: clickable ? 'pointer' : undefined,
    transition: 'box-shadow 0.15s',
  }),
  title: {
    fontWeight: 600,
    fontSize: 'var(--ds-font-size-sm, 14px)',
    color: 'var(--ds-color-text)',
  } as CSSProperties,
  timestamp: {
    fontSize: 'var(--ds-font-size-xs, 12px)',
    color: 'var(--ds-color-text-muted)',
    marginLeft: 8,
  } as CSSProperties,
  description: {
    fontSize: 'var(--ds-font-size-xs, 12px)',
    color: 'var(--ds-color-text-secondary)',
    marginTop: 4,
  } as CSSProperties,
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  } as CSSProperties,
  avatar: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    objectFit: 'cover' as const,
  },
  userName: {
    fontSize: 'var(--ds-font-size-xs, 12px)',
    fontWeight: 600,
    color: 'var(--ds-color-text)',
  } as CSSProperties,
  dateGroup: {
    fontSize: 'var(--ds-font-size-sm, 14px)',
    fontWeight: 600,
    color: 'var(--ds-color-text-secondary)',
    marginBottom: 12,
  } as CSSProperties,
  loading: {
    textAlign: 'center' as const,
    padding: 48,
    color: 'var(--ds-color-text-muted)',
  },
  empty: {
    textAlign: 'center' as const,
    padding: 48,
    color: 'var(--ds-color-text-muted)',
  },
};

export default function RusticTimeline<T>(props: TimelinePatternProps<T>) {
  const {
    items,
    renderItem,
    onItemClick,
    showTimestamp = true,
    header,
    footer,
    emptyState,
    groupByDate,
    loading,
    className,
    style,
  } = props;

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

  const buildDefaultRender = (item: TimelineItem<T>) => {
    const color = item.color ?? typeColors[item.type ?? 'default'];
    return (
      <div key={item.key} style={styles.item}>
        {item.icon ? (
          <div style={styles.iconDot(color)}>{item.icon}</div>
        ) : (
          <div style={styles.dot(color)} />
        )}
        <div
          style={styles.card(!!onItemClick)}
          onClick={onItemClick ? () => onItemClick(item) : undefined}
          onMouseEnter={(e) => { if (onItemClick) (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
          onMouseLeave={(e) => { if (onItemClick) (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
        >
          {item.user && (
            <div style={styles.user}>
              {item.user.avatar && <img src={item.user.avatar} alt={item.user.name} style={styles.avatar} />}
              <span style={styles.userName}>{item.user.name}</span>
            </div>
          )}
          <div>
            <span style={styles.title}>{item.title}</span>
            {showTimestamp && (
              <span style={styles.timestamp}>{formatTimestamp(item.timestamp)}</span>
            )}
          </div>
          {item.description && <div style={styles.description}>{item.description}</div>}
        </div>
      </div>
    );
  };

  const renderList = (list: TimelineItem<T>[]) => (
    <div style={styles.container}>
      <div style={styles.line} />
      {list.map((item) => {
        const defaultRender = buildDefaultRender(item);
        return renderItem ? (
          <div key={item.key} style={styles.item}>
            {renderItem(item, defaultRender)}
          </div>
        ) : defaultRender;
      })}
    </div>
  );

  if (loading) {
    return <div className={className} style={{ ...styles.loading, ...style }}>Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div className={className} style={style}>
        {header}
        {emptyState ?? <div style={styles.empty}>No timeline items</div>}
        {footer}
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {header}
      {grouped ? (
        Object.entries(grouped).map(([dateKey, group]) => (
          <div key={dateKey} style={{ marginBottom: 24 }}>
            <div style={styles.dateGroup}>{dateKey}</div>
            {renderList(group)}
          </div>
        ))
      ) : (
        renderList(items)
      )}
      {footer}
    </div>
  );
}
