'use client';

/**
 * @fileoverview Rustic (Vanilla CSS) engine for the CalendarView pattern.
 * Renders a month grid using only inline styles backed by --ds-* design-token
 * CSS variables. Zero dependency on Ant Design or Tailwind -- every visual
 * property is resolved through CSS custom properties with hardcoded fallbacks,
 * making this engine safe for any host environment.
 *
 * @example
 * <RusticCalendarView
 *   events={[{ id: '1', title: 'Standup', start: '2026-03-15' }]}
 *   currentDate={new Date(2026, 2, 1)}
 *   onViewChange={(view) => console.log(view)}
 * />
 */

import React, { useMemo } from 'react';
import type { CalendarViewProps, CalendarEvent } from '../CalendarView.types';

/** Abbreviated day headers starting at Sunday to match JS Date.getDay() indices. */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Build a 7-column grid for the given month. Leading nulls pad the days
 * before the 1st (Sunday-aligned); trailing nulls complete the last row
 * to exactly 7 columns, preventing layout shift between months.
 */
function getMonthGrid(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Normalize a Date or ISO string into a YYYY-MM-DD key for event lookup. */
function toDateKey(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Format a date as "March 2026" using the browser's default locale. */
function formatMonth(date: Date) {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

/**
 * Rustic (Vanilla CSS) calendar view rendering a month grid with event chips.
 * All styling uses inline CSSProperties backed by --ds-* design tokens with
 * hardcoded fallbacks, ensuring the component works without any CSS framework.
 * @param props - CalendarViewProps including events array, navigation callbacks,
 *   optional custom toolbar/header, and a generic `T` for event payload data.
 * @returns A rounded month grid with inline loading text for the loading state.
 */
export default function RusticCalendarView<T>(props: CalendarViewProps<T>) {
  const {
    events,
    view = 'month',
    currentDate = new Date(),
    onDateChange,
    onViewChange,
    onEventClick,
    onDateClick,
    renderEvent,
    toolbar,
    header,
    className,
    style,
    loading = false,
  } = props;

  const cells = useMemo(() => getMonthGrid(currentDate), [currentDate]);

  // Index events by date string for O(1) lookup per cell during render.
  // Only keyed by start date -- multi-day events appear on their start day only.
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent<T>[]> = {};
    for (const ev of events) {
      const key = toDateKey(ev.start);
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    }
    return map;
  }, [events]);

  // Navigate forward or backward by one month. Creates a new Date to
  // avoid mutating the controlled currentDate prop.
  const navigateMonth = (delta: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + delta);
    onDateChange?.(next);
  };

  const today = toDateKey(new Date());

  // Shared button style object reused by nav buttons, Today, and the
  // view-mode select. Uses --ds-color-border-primary with a fallback chain
  // so it renders correctly even without a full DS theme loaded.
  const btn: React.CSSProperties = {
    padding: '4px 10px',
    border: '1px solid var(--ds-color-border-primary, var(--ds-color-border))',
    borderRadius: 'var(--ds-radius-sm, 4px)',
    background: 'var(--ds-color-bg-elevated, var(--ds-color-bg-primary))',
    color: 'var(--ds-color-text-primary, var(--ds-color-text))',
    cursor: 'pointer',
    fontSize: 13,
  };

  return (
    <div className={className} style={style}>
      {header}
      {/* Render custom toolbar if provided; otherwise show the default
          inline-styled nav with prev/next buttons, a Today shortcut, and
          a view-mode select dropdown. */}
      {toolbar ?? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={btn} onClick={() => navigateMonth(-1)}>{'<'}</button>
            <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--ds-color-text-primary, var(--ds-color-text))' }}>
              {formatMonth(currentDate)}
            </span>
            <button style={btn} onClick={() => navigateMonth(1)}>{'>'}</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={btn} onClick={() => onDateChange?.(new Date())}>Today</button>
            <select
              style={{ ...btn, padding: '4px 8px' }}
              value={view}
              onChange={(e) => onViewChange?.(e.target.value as any)}
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
            </select>
          </div>
        </div>
      )}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))' }}>
          Loading...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid var(--ds-color-border-primary, var(--ds-color-border))', borderRadius: 'var(--ds-radius-md, 8px)', overflow: 'hidden' }}>
          {DAY_NAMES.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, padding: '8px 0', background: 'var(--ds-color-bg-secondary, var(--ds-color-bg-muted))', borderBottom: '1px solid var(--ds-color-border-primary, var(--ds-color-border))' }}>
              {d}
            </div>
          ))}
          {/* Render each date cell. Null cells (padding before the 1st and
              after the last day) use a secondary background and no click handler. */}
          {cells.map((cell, i) => {
            const key = cell ? toDateKey(cell) : `empty-${i}`;
            const dayEvents = cell ? eventsByDate[toDateKey(cell)] ?? [] : [];
            const isToday = cell && toDateKey(cell) === today;
            return (
              <div
                key={key}
                onClick={() => cell && onDateClick?.(cell)}
                style={{
                  minHeight: 80,
                  padding: 4,
                  // Suppress the right border on the last column (Saturday) to
                  // avoid a double-border with the grid's outer border.
                  borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--ds-color-border-primary, var(--ds-color-border))' : undefined,
                  borderBottom: '1px solid var(--ds-color-border-primary, var(--ds-color-border))',
                  background: cell ? 'var(--ds-color-bg-elevated, var(--ds-color-bg-primary))' : 'var(--ds-color-bg-secondary, var(--ds-color-bg-muted))',
                  cursor: cell ? 'pointer' : 'default',
                }}
              >
                {cell && (
                  <>
                    <div style={{
                      fontSize: 12,
                      textAlign: 'right',
                      padding: '2px 4px',
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? 'var(--ds-color-primary)' : 'var(--ds-color-text-primary, var(--ds-color-text))',
                    }}>
                      {cell.getDate()}
                    </div>
                    {/* Show at most 3 event chips per cell to keep the grid compact;
                        overflow is shown as "+N more" below. */}
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                        style={{
                          fontSize: 11,
                          padding: '1px 4px',
                          marginTop: 2,
                          borderRadius: 'var(--ds-radius-xs, 3px)',
                          background: ev.color ?? 'var(--ds-color-primary)',
                          color: 'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                        }}
                      >
                        {renderEvent ? renderEvent(ev) : ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div style={{ fontSize: 10, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))', padding: '0 4px' }}>
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
