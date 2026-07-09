'use client';

/**
 * @fileoverview Modern (DaisyUI/Tailwind) engine for the Timeline pattern.
 *
 * Uses DaisyUI's `timeline`, `timeline-vertical`, `timeline-start`,
 * `timeline-end`, and `timeline-box` classes to compose a vertical timeline.
 * Supports left, right, and alternate layout modes by conditionally swapping
 * `timeline-start` and `timeline-end` classes per item. Type-based semantic
 * badges use DaisyUI's badge color variants.
 *
 * @example
 * <ModernTimeline
 *   items={[{ key: '1', title: 'PR Merged', timestamp: '2026-03-15', type: 'success' }]}
 *   mode="alternate"
 *   onItemClick={(item) => openDetail(item)}
 * />
 */

import React, { useMemo } from 'react';
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

/** Maps semantic item types to DS token badge styles. */
const typeBadgeStyle: Record<string, React.CSSProperties> = {
  default: { background: 'color-mix(in srgb, var(--ds-color-info) 15%, transparent)', color: 'var(--ds-color-info)' },
  success: { background: 'color-mix(in srgb, var(--ds-color-success) 15%, transparent)', color: 'var(--ds-color-success)' },
  warning: { background: 'color-mix(in srgb, var(--ds-color-warning) 15%, transparent)', color: 'var(--ds-color-warning)' },
  error: { background: 'color-mix(in srgb, var(--ds-color-error) 15%, transparent)', color: 'var(--ds-color-error)' },
  info: { background: 'color-mix(in srgb, var(--ds-color-info) 15%, transparent)', color: 'var(--ds-color-info)' },
};

/**
 * Modern (DaisyUI/Tailwind) engine for the Timeline pattern component.
 *
 * Renders a `<ul class="timeline timeline-vertical">` with `<li>` entries
 * that use DaisyUI's timeline utility classes for connector lines and dot
 * indicators. In alternate mode, even-indexed items swap start/end placement
 * for a zigzag layout.
 *
 * @param props - {@link TimelinePatternProps} controlling items, layout mode, grouping, and callbacks.
 * @returns A vertical timeline rendered with DaisyUI/Tailwind classes.
 */
export default function ModernTimeline<T>(props: TimelinePatternProps<T>) {
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

  /** Builds the default render for a single timeline item. In alternate mode,
   *  odd-indexed items are placed on the right side by swapping start/end classes. */
  const buildDefaultRender = (item: TimelineItem<T>, index: number, total: number) => {
    const isAlternate = mode === 'alternate';
    const isRight = mode === 'right' || (isAlternate && index % 2 === 1);

    return (
      <>
        {index !== 0 && <hr />}
        {showTimestamp && (
          <div className={isRight ? 'timeline-end timeline-box' : 'timeline-start'}>
            {!isRight && (
              <time className="font-mono text-xs opacity-60">
                {formatTimestamp(item.timestamp)}
              </time>
            )}
          </div>
        )}
        <div className="timeline-middle">
          {/* Render custom icon if provided; otherwise fall back to a
              checkmark circle SVG colored by the item's semantic type. */}
          {item.icon ? (
            <span className="flex items-center justify-center w-5 h-5">{item.icon}</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: item.type === 'error' ? 'var(--ds-color-error)' : item.type === 'success' ? 'var(--ds-color-success)' : item.type === 'warning' ? 'var(--ds-color-warning)' : 'var(--ds-color-primary)' }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div
          className={`${isRight ? 'timeline-start' : 'timeline-end'} timeline-box ${onItemClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
          onClick={onItemClick ? () => onItemClick(item) : undefined}
        >
          <div className="flex items-center gap-2 mb-1">
            {item.user?.avatar && (
              <div style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: '50%', overflow: 'hidden' }}>
                <img src={item.user.avatar} alt={item.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            {item.user && <span className="text-xs font-semibold">{item.user.name}</span>}
            {item.type && item.type !== 'default' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '9999px', padding: '1px 5px', fontSize: 10, ...typeBadgeStyle[item.type] }}>{item.type}</span>
            )}
          </div>
          <div className="font-semibold text-sm">{item.title}</div>
          {isRight && showTimestamp && (
            <time className="font-mono text-xs opacity-60">
              {formatTimestamp(item.timestamp)}
            </time>
          )}
          {item.description && <p className="text-xs opacity-70 mt-1">{item.description}</p>}
        </div>
        {index !== total - 1 && <hr />}
      </>
    );
  };

  /** Renders a list of timeline items as a DaisyUI vertical timeline. */
  const renderList = (list: TimelineItem<T>[]) => (
    <ul className="timeline timeline-vertical">
      {list.map((item, index) => {
        const defaultRender = buildDefaultRender(item, index, list.length);
        return renderItem ? (
          <li key={item.key}>{renderItem(item, defaultRender)}</li>
        ) : (
          <li key={item.key}>{defaultRender}</li>
        );
      })}
    </ul>
  );

  // Early-return loading state using DaisyUI's built-in spinner component.
  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className ?? ''}`} style={style}>
        <span style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid var(--ds-color-border)', borderTopColor: 'var(--ds-color-primary)', borderRadius: '50%', animation: 'ds-spin var(--ds-motion-glacial) linear infinite' }} />
      </div>
    );
  }

  // Empty state preserves header/footer so surrounding layout stays intact.
  if (items.length === 0) {
    return (
      <div className={className} style={style}>
        {header}
        {emptyState ?? (
          <div className="text-center py-12 opacity-60">No timeline items</div>
        )}
        {footer}
      </div>
    );
  }

  return (
    <div className={`ds-pattern-timeline ds-engine-modern ${className ?? ''}`} style={style}>
      {header}
      {/* When groupByDate is active, render each date cluster with its
          own heading; otherwise render all items as a single flat list. */}
      {grouped ? (
        Object.entries(grouped).map(([dateKey, group]) => (
          <div key={dateKey} className="mb-6">
            <div className="text-sm font-semibold opacity-70 mb-3">{dateKey}</div>
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
