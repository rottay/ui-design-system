'use client';

/**
 * @fileoverview Rustic (Vanilla CSS) engine for the Timeline pattern.
 *
 * Zero-dependency timeline implementation using inline styles and `--ds-*`
 * CSS custom properties. The timeline line is rendered as an absolutely
 * positioned `<div>` running vertically through the dot indicators. Each
 * item is a card with a colored dot (solid circle or icon-bearing ring)
 * positioned over the line. Hover effects on clickable cards are applied
 * via imperative style mutations since inline styles cannot express
 * pseudo-classes.
 *
 * @example
 * <RusticTimeline
 *   items={[{ key: '1', title: 'Incident Resolved', timestamp: new Date(), type: 'success' }]}
 *   groupByDate
 *   onItemClick={(item) => openDetail(item)}
 * />
 */

import React, { useMemo, type CSSProperties } from 'react';
import type { TimelinePatternProps, TimelineItem } from '../Timeline.types';

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

/** Maps semantic item types to DS color token CSS variables for dot coloring. */
const typeColors: Record<string, string> = {
  default: 'var(--ds-color-primary)',
  success: 'var(--ds-color-success)',
  warning: 'var(--ds-color-warning)',
  error: 'var(--ds-color-error)',
  info: 'var(--ds-color-info)',
};

/**
 * Pre-computed style objects for timeline elements.
 * The vertical line is absolutely positioned at left:15 and spans the full
 * container height. Dot and iconDot position themselves over this line
 * using matching left offsets. Function-valued entries accept dynamic
 * parameters (color, clickable) for state-dependent styling.
 */
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

/**
 * Rustic (Vanilla CSS) engine for the Timeline pattern component.
 *
 * Renders a left-aligned vertical timeline with colored dot indicators
 * and card-style item bodies. Date grouping clusters items under
 * calendar-date headers. Clickable items receive a subtle box-shadow
 * on hover via imperative style mutations.
 *
 * @param props - {@link TimelinePatternProps} controlling items, grouping, and callbacks.
 * @returns A vertical timeline rendered with inline CSS and DS tokens.
 */
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

  // Group items by calendar date when groupByDate is enabled.
  // Returns null when grouping is off to avoid unnecessary object allocation.
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

  /** Builds the default render for a single item, including the colored dot,
   *  card body, user avatar row, and optional timestamp/description. */
  const buildDefaultRender = (item: TimelineItem<T>) => {
    // Resolve dot color: explicit item.color takes precedence, then semantic
    // type color, falling back to the primary brand color.
    const color = item.color ?? typeColors[item.type ?? 'default'];
    return (
      <div key={item.key} style={styles.item}>
        {/* Icon items get a larger ring-style dot; plain items get a solid circle. */}
        {item.icon ? (
          <div style={styles.iconDot(color)}>{item.icon}</div>
        ) : (
          <div style={styles.dot(color)} />
        )}
        <div
          style={styles.card(!!onItemClick)}
          onClick={onItemClick ? () => onItemClick(item) : undefined}
          // Imperative hover shadow because inline styles cannot express :hover.
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

  /** Renders a list of timeline items within a container that holds the
   *  vertical connector line as an absolutely-positioned child. */
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

  // Early-return for loading and empty states before building the full timeline.
  if (loading) {
    return <div className={className} style={{ ...styles.loading, ...style }}>Loading...</div>;
  }

  // Empty state preserves header/footer so surrounding layout stays intact.
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
      {/* When groupByDate is active, render each date cluster with its
          own heading; otherwise render all items as a single flat list. */}
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
