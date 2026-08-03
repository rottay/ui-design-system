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
 * COMPOSITION LAW: loading composes the public Spinner primitive (the
 * hand-rolled border spinner + its skin rules are retired — merge note in
 * the skin), and the default marker is the governed `StatusSuccessIcon`
 * semantic role (the local inline checkmark SVG is retired) inheriting the
 * skin's per-type `currentColor`. Timestamps are real `<time>` elements with
 * a machine-readable `dateTime` and locale-formatted text.
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
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import ModernSpinner from '../../../../../primitives/feedback/Spinner/engines/modern';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';

const ROOT_CLASS_NAME = 'ds-pattern-timeline ds-engine-modern';

/** Formats a timestamp for display inside a timeline item (active locale). */
function formatTimestamp(ts: string | Date, locale: string): string {
  const date = typeof ts === 'string' ? new Date(ts) : ts;
  return date.toLocaleString(locale);
}

/** Machine-readable ISO value for `<time dateTime>`; undefined when the
    timestamp does not parse (the visible text still renders). */
function toIsoTimestamp(ts: string | Date): string | undefined {
  const date = typeof ts === 'string' ? new Date(ts) : ts;
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** Extracts a locale-formatted date string used as a grouping key. */
function formatDateKey(ts: string | Date, locale: string): string {
  const date = typeof ts === 'string' ? new Date(ts) : ts;
  return date.toLocaleDateString(locale);
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
  // Optional channel with an English floor: the pattern renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  /* Timestamps and group keys follow the active locale (floor: the runtime
     default, matching the historical behaviour). */
  const locale = i18n?.locale ?? 'default';
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
      const key = formatDateKey(item.timestamp, locale);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [items, groupByDate, locale]);

  /** Builds the default render for a single timeline item. In alternate mode,
   *  odd-indexed items are placed on the right side by flipping `data-side`.
   *  All paint AND micro-layout (meta row, timestamp type, badge geometry,
   *  clickable-card states) live in `skin/pattern-timeline.css` — the engine
   *  stamps parts, side, type and the clickable channel only. */
  const buildDefaultRender = (item: TimelineItem<T>, index: number, total: number) => {
    const isAlternate = mode === 'alternate';
    const isRight = mode === 'right' || (isAlternate && index % 2 === 1);
    const clickable = Boolean(onItemClick);
    const activate = clickable
      ? {
          role: 'button' as const,
          tabIndex: 0,
          onClick: () => onItemClick?.(item),
          onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onItemClick?.(item);
            }
          },
        }
      : {};

    return (
      <>
        {index !== 0 && <hr data-part="connector" data-edge="leading" aria-hidden="true" className="ds-timeline-modern__connector" />}
        {showTimestamp && (
          <div data-part="timestamp-slot" data-side={isRight ? 'right' : 'left'} className="ds-timeline-modern__timestamp-slot">
            {!isRight && (
              <time data-part="timestamp" dateTime={toIsoTimestamp(item.timestamp)} className="ds-timeline-modern__timestamp">
                {formatTimestamp(item.timestamp, locale)}
              </time>
            )}
          </div>
        )}
        <div data-part="marker" className="ds-timeline-modern__marker">
          {/* Custom icon if provided; otherwise the governed status.success
              semantic role (the retired local checkmark SVG), decorative and
              inheriting the skin's per-type currentColor — the item's title
              carries the meaning. */}
          {item.icon ? (
            <span data-part="marker-icon" data-type={item.type ?? 'default'} className="ds-timeline-modern__marker-icon">{item.icon}</span>
          ) : (
            <span data-part="marker-icon" data-type={item.type ?? 'default'} className="ds-timeline-modern__marker-icon">
              <StatusSuccessIcon decorative size="md" />
            </span>
          )}
        </div>
        <div
          data-part="item-card"
          data-side={isRight ? 'right' : 'left'}
          data-clickable={clickable || undefined}
          className="ds-timeline-modern__item-card"
          {...activate}
        >
          <div data-part="item-meta" className="ds-timeline-modern__item-meta">
            {item.user?.avatar && (
              <div data-part="avatar" className="ds-timeline-modern__avatar">
                <img src={item.user.avatar} alt={item.user.name} />
              </div>
            )}
            {item.user && <span data-part="user-name" className="ds-timeline-modern__user-name">{item.user.name}</span>}
            {item.type && item.type !== 'default' && (
              <span data-part="type-badge" data-type={item.type} className="ds-timeline-modern__type-badge">{item.type}</span>
            )}
          </div>
          <div data-part="item-title" className="ds-timeline-modern__item-title">{item.title}</div>
          {isRight && showTimestamp && (
            <time data-part="timestamp" dateTime={toIsoTimestamp(item.timestamp)} className="ds-timeline-modern__timestamp">
              {formatTimestamp(item.timestamp, locale)}
            </time>
          )}
          {item.description && <p data-part="item-description" className="ds-timeline-modern__item-description">{item.description}</p>}
        </div>
        {index !== total - 1 && <hr data-part="connector" data-edge="trailing" aria-hidden="true" className="ds-timeline-modern__connector" />}
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

  // Early-return loading state: the composed Spinner primitive owns ring,
  // cadence and the polite status role (the hand-rolled border spinner and
  // its skin rules are retired — merge note in the skin).
  if (loading) {
    return (
      <div data-part="root" data-loading="true" data-empty="false" data-mode={mode} className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')} style={style}>
        <ModernSpinner size="md" data-part="spinner" />
      </div>
    );
  }

  // Empty state preserves header/footer so surrounding layout stays intact.
  if (items.length === 0) {
    return (
      <div data-part="root" data-loading="false" data-empty="true" data-mode={mode} className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')} style={style}>
        {header}
        {emptyState ?? (
          <div data-part="empty" className="ds-timeline-modern__empty">
            {i18n?.tOr('empty.description', 'No timeline items') ?? 'No timeline items'}
          </div>
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
          <div data-part="date-group" key={dateKey} className="ds-timeline-modern__date-group">
            <div data-part="date-heading" className="ds-timeline-modern__date-heading">{dateKey}</div>
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
