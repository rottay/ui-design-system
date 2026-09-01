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
 * the skin), and the default marker is the governed status semantic role for
 * the item's type (the local inline checkmark SVG is retired) inheriting the
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

import React, { useId, useMemo } from 'react';
import type { TimelinePatternProps, TimelineItem } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import ModernSpinner from '../../../../../primitives/feedback/spinner/engines/modern';
import { StatusSuccessIcon } from '@/graphics/icons/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/semantic/generated/roles/status-warning';
import { StatusErrorIcon } from '@/graphics/icons/semantic/generated/roles/status-error';
import { StatusInfoIcon } from '@/graphics/icons/semantic/generated/roles/status-info';

const ROOT_CLASS_NAME = 'ds-pattern-timeline ds-engine-modern';

/* The glyph carries the item's type: the skin only recolors marker-icon, so a
   shared glyph would leave the type readable by colour alone. */
const MARKER_ICON_BY_TYPE = {
  default: StatusSuccessIcon,
  success: StatusSuccessIcon,
  warning: StatusWarningIcon,
  error: StatusErrorIcon,
  info: StatusInfoIcon,
} as const;

/* The badge is product copy, not a debug token: the raw union member used to
   reach the screen verbatim in every locale. */
const TYPE_BADGE_FLOOR = {
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  info: 'Info',
} as const;

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
  const groupHeadingIdPrefix = useId();
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
    const MarkerIcon = MARKER_ICON_BY_TYPE[item.type ?? 'default'];
    const badgeType = item.type && item.type !== 'default' ? item.type : null;
    // The per-item marker tint travels as a family-private channel, never as
    // an inline `color`: the skin owns that property outright (base tone, the
    // three per-type tones, and the forced-colors neutralisation) and reads
    // this as its first choice. Same shape as the connector's line-color
    // channel below, and it lets forced-colors mode actually reach the marker
    // -- an inline colour outranked the CanvasText rule written for it.
    const markerColorStyle = item.color
      ? ({ '--_ds-timeline-marker-color': item.color } as React.CSSProperties)
      : undefined;
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
          /* The timestamp has ONE home on both sides: it always reads on the
             track opposite its card, so no side renders an empty counterweight. */
          <div data-part="timestamp-slot" data-side={isRight ? 'right' : 'left'} className="ds-timeline-modern__timestamp-slot">
            <time
              data-part="timestamp"
              dateTime={toIsoTimestamp(item.timestamp)}
              dir="auto"
              className="ds-timeline-modern__timestamp"
            >
              {formatTimestamp(item.timestamp, locale)}
            </time>
          </div>
        )}
        <div data-part="marker" className="ds-timeline-modern__marker">
          {/* Custom icon if provided; otherwise the governed status semantic
              role matching the item's type (the retired local checkmark SVG),
              decorative and inheriting the skin's per-type currentColor — the
              item's title carries the meaning. */}
          {item.icon ? (
            <span data-part="marker-icon" data-type={item.type ?? 'default'} style={markerColorStyle} className="ds-timeline-modern__marker-icon">{item.icon}</span>
          ) : (
            <span data-part="marker-icon" data-type={item.type ?? 'default'} style={markerColorStyle} className="ds-timeline-modern__marker-icon">
              <MarkerIcon decorative size="md" />
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
                <img src={item.user.avatar} alt="" />
              </div>
            )}
            {item.user && <span data-part="user-name" className="ds-timeline-modern__user-name">{item.user.name}</span>}
            {badgeType && (
              <span data-part="type-badge" data-type={badgeType} className="ds-timeline-modern__type-badge">
                {i18n?.tOr(`timeline.type.${badgeType}`, TYPE_BADGE_FLOOR[badgeType]) ?? TYPE_BADGE_FLOOR[badgeType]}
              </span>
            )}
          </div>
          <div data-part="item-title" className="ds-timeline-modern__item-title">{item.title}</div>
          {item.description && <p data-part="item-description" className="ds-timeline-modern__item-description">{item.description}</p>}
        </div>
        {index !== total - 1 && <hr data-part="connector" data-edge="trailing" aria-hidden="true" className="ds-timeline-modern__connector" />}
      </>
    );
  };

  /** Renders a list of timeline items as a vertical timeline. */
  const renderList = (list: TimelineItem<T>[], labelledBy?: string) => (
    <ul data-part="list" aria-labelledby={labelledBy} className="ds-timeline-modern__list">
      {list.map((item, index) => {
        const defaultRender = buildDefaultRender(item, index, list.length);
        const itemStyle = item.color
          ? ({ '--ds-timeline-line-color': item.color } as React.CSSProperties)
          : undefined;
        return renderItem ? (
          <li data-part="item" data-type={item.type ?? 'default'} style={itemStyle} className="ds-timeline-modern__item" key={item.key}>{renderItem(item, defaultRender)}</li>
        ) : (
          <li data-part="item" data-type={item.type ?? 'default'} style={itemStyle} className="ds-timeline-modern__item" key={item.key}>{defaultRender}</li>
        );
      })}
    </ul>
  );

  // Early-return loading state: the composed Spinner primitive owns ring,
  // cadence and the polite status role (the hand-rolled border spinner and
  // its skin rules are retired — merge note in the skin).
  if (loading) {
    return (
      <div data-part="root" data-loading="true" data-empty="false" data-mode={mode} aria-busy="true" className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')} style={style}>
        {header}
        <ModernSpinner size="md" data-part="spinner" />
        {footer}
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
        Object.entries(grouped).map(([dateKey, group]) => {
          const headingId = `${groupHeadingIdPrefix}-${dateKey}`;
          return (
            <div data-part="date-group" role="group" aria-labelledby={headingId} key={dateKey} className="ds-timeline-modern__date-group">
              <div data-part="date-heading" id={headingId} role="heading" aria-level={3} dir="auto" className="ds-timeline-modern__date-heading">{dateKey}</div>
              {renderList(group, headingId)}
            </div>
          );
        })
      ) : (
        renderList(items)
      )}
      {footer}
    </div>
  );
}
