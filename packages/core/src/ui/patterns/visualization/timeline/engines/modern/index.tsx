'use client';

/**
 * @fileoverview Modern engine for the Timeline pattern.
 *
 * Composes a vertical timeline from Rottay-namespaced parts. The rail geometry
 * -- the three-track item grid, the connector placement, and the side on which
 * each item's card and timestamp land -- is owned by
 * `skin/pattern-timeline.css`, keyed on `data-part` + `data-side`. Supports
 * left, right, and alternate layout modes by flipping `data-side` per item;
 * the skin reads that attribute instead of the engine swapping class names.
 *
 * @example
 * <ModernTimeline
 *   items={[{ key: '1', title: 'PR Merged', timestamp: '2026-03-15', type: 'success' }]}
 *   mode="alternate"
 *   onItemClick={(item) => openDetail(item)}
 * />
 */

import React, { useMemo } from 'react';
import type { TimelinePatternProps, TimelineItem } from '../../contracts';

const ROOT_CLASS_NAME = 'ds-pattern-timeline ds-engine-modern';

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

/**
 * Modern engine for the Timeline pattern component.
 *
 * Renders a `<ul>` rail with `<li>` entries whose connector lines and dot
 * indicators are placed by the skin's item grid. In alternate mode,
 * odd-indexed items flip `data-side` for a zigzag layout.
 *
 * @param props - {@link TimelinePatternProps} controlling items, layout mode, grouping, and callbacks.
 * @returns A vertical timeline rendered from Rottay-namespaced parts.
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
   *  odd-indexed items are placed on the right side by flipping `data-side`. */
  const buildDefaultRender = (item: TimelineItem<T>, index: number, total: number) => {
    const isAlternate = mode === 'alternate';
    const isRight = mode === 'right' || (isAlternate && index % 2 === 1);

    return (
      <>
        {index !== 0 && <hr data-part="connector" data-edge="leading" className="ds-timeline-modern__connector" />}
        {showTimestamp && (
          <div data-part="timestamp-slot" data-side={isRight ? 'right' : 'left'} className="ds-timeline-modern__timestamp-slot">
            {!isRight && (
              <time data-part="timestamp" className="font-mono text-xs opacity-60">
                {formatTimestamp(item.timestamp)}
              </time>
            )}
          </div>
        )}
        <div data-part="marker" className="ds-timeline-modern__marker">
          {/* Render custom icon if provided; otherwise fall back to a
              checkmark circle SVG colored by the item's semantic type. */}
          {item.icon ? (
            <span data-part="marker-icon" data-type={item.type ?? 'default'} className="flex items-center justify-center w-5 h-5">{item.icon}</span>
          ) : (
            <svg data-part="marker-icon" data-type={item.type ?? 'default'} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="ds-timeline-modern__marker-icon w-5 h-5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div
          data-part="item-card"
          data-side={isRight ? 'right' : 'left'}
          data-clickable={Boolean(onItemClick)}
          className={`ds-timeline-modern__item-card ${onItemClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
          onClick={onItemClick ? () => onItemClick(item) : undefined}
        >
          <div className="flex items-center gap-2 mb-1">
            {item.user?.avatar && (
              <div data-part="avatar" className="ds-timeline-modern__avatar" style={{ display: 'inline-flex', width: 24, height: 24, overflow: 'hidden' }}>
                <img src={item.user.avatar} alt={item.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            {item.user && <span className="text-xs font-semibold">{item.user.name}</span>}
            {item.type && item.type !== 'default' && (
              <span data-part="type-badge" data-type={item.type} className="ds-timeline-modern__type-badge" style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 5px', fontSize: 10 }}>{item.type}</span>
            )}
          </div>
          <div className="font-semibold text-sm">{item.title}</div>
          {isRight && showTimestamp && (
            <time data-part="timestamp" className="font-mono text-xs opacity-60">
              {formatTimestamp(item.timestamp)}
            </time>
          )}
          {item.description && <p className="text-xs opacity-70 mt-1">{item.description}</p>}
        </div>
        {index !== total - 1 && <hr data-part="connector" data-edge="trailing" className="ds-timeline-modern__connector" />}
      </>
    );
  };

  /** Renders a list of timeline items as a vertical timeline. */
  const renderList = (list: TimelineItem<T>[]) => (
    <ul data-part="list" className="ds-timeline-modern__list">
      {list.map((item, index) => {
        const defaultRender = buildDefaultRender(item, index, list.length);
        return renderItem ? (
          <li data-part="item" data-type={item.type ?? 'default'} className="ds-timeline-modern__item" key={item.key}>{renderItem(item, defaultRender)}</li>
        ) : (
          <li data-part="item" data-type={item.type ?? 'default'} className="ds-timeline-modern__item" key={item.key}>{defaultRender}</li>
        );
      })}
    </ul>
  );

  // Early-return loading state using DaisyUI's built-in spinner component.
  if (loading) {
    return (
      <div data-part="root" data-loading="true" data-empty="false" data-mode={mode} className={[ROOT_CLASS_NAME, 'flex justify-center items-center py-12', className].filter(Boolean).join(' ')} style={style}>
        <span data-part="spinner" className="ds-timeline-modern__spinner" style={{ display: 'inline-block', width: 24, height: 24, animation: 'ds-spin var(--ds-motion-glacial) linear infinite' }} />
      </div>
    );
  }

  // Empty state preserves header/footer so surrounding layout stays intact.
  if (items.length === 0) {
    return (
      <div data-part="root" data-loading="false" data-empty="true" data-mode={mode} className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')} style={style}>
        {header}
        {emptyState ?? (
          <div data-part="empty" className="text-center py-12 opacity-60">No timeline items</div>
        )}
        {footer}
      </div>
    );
  }

  return (
    <div data-part="root" data-loading="false" data-empty="false" data-mode={mode} data-grouped={Boolean(grouped)} className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')} style={style}>
      {header}
      {/* When groupByDate is active, render each date cluster with its
          own heading; otherwise render all items as a single flat list. */}
      {grouped ? (
        Object.entries(grouped).map(([dateKey, group]) => (
          <div data-part="date-group" key={dateKey} className="mb-6">
            <div data-part="date-heading" className="text-sm font-semibold opacity-70 mb-3">{dateKey}</div>
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
