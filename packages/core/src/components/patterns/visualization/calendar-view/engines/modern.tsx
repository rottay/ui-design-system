'use client';

/**
 * @fileoverview Modern (DaisyUI/Tailwind) engine for the CalendarView pattern.
 * Renders a month grid using Tailwind utility classes and DaisyUI component
 * classes (select, loading spinner) and DS token inline styles for buttons. Styling uses no
 * inline styles, except for per-event color which must be dynamic.
 *
 * @example
 * <ModernCalendarView
 *   events={[{ id: '1', title: 'Standup', start: new Date(), color: '#3b82f6' }]}
 *   currentDate={new Date()}
 *   onDateClick={(date) => console.log(date)}
 * />
 */

import React, { useMemo } from 'react';
import type { CalendarViewProps, CalendarEvent } from '../CalendarView.types';

/** Abbreviated day headers starting at Sunday to match JS Date.getDay() indices. */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ROOT_CLASS_NAME = 'ds-pattern-calendar-view ds-engine-modern';

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
 * Modern (DaisyUI/Tailwind) calendar view rendering a month grid with event chips.
 * @param props - CalendarViewProps including events array, navigation callbacks,
 *   optional custom toolbar/header, and a generic `T` for event payload data.
 * @returns A rounded month grid card; loading state uses DaisyUI's spinner.
 */
export default function ModernCalendarView<T>(props: CalendarViewProps<T>) {
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
    className = '',
    style,
    loading = false,
  } = props;

  const cells = useMemo(() => getMonthGrid(currentDate), [currentDate]);

  // Index events by date string for O(1) lookup per cell during render.
  // Only keyed by start date -- multi-day events appear on their start day only.
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent<T>[]>();
    for (const ev of events) {
      const key = toDateKey(ev.start);
      const bucket = map.get(key);
      if (bucket) bucket.push(ev);
      else map.set(key, [ev]);
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

  return (
    <div
      data-part="root"
      data-loading={loading}
      data-view-mode={view}
      className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
      style={style}
    >
      {header}
      {/* Render custom toolbar if provided; otherwise show the default
          DaisyUI ghost-button nav with month title and view-mode selector. */}
      {toolbar ?? (
        <div data-part="toolbar" className="flex items-center justify-between mb-4">
          <div data-part="navigation" className="flex items-center gap-2">
            <button data-part="toolbar-action" data-action="previous" style={{ height: 32, padding: '0 12px', fontSize: 13, cursor: 'pointer' }} onClick={() => navigateMonth(-1)}>{'<'}</button>
            <h3 data-part="month-title" className="text-lg font-semibold">{formatMonth(currentDate)}</h3>
            <button data-part="toolbar-action" data-action="next" style={{ height: 32, padding: '0 12px', fontSize: 13, cursor: 'pointer' }} onClick={() => navigateMonth(1)}>{'>'}</button>
          </div>
          <div data-part="view-controls" className="flex items-center gap-2">
            <button data-part="toolbar-action" data-action="today" style={{ height: 32, padding: '0 12px', fontSize: 13, cursor: 'pointer' }} onClick={() => onDateChange?.(new Date())}>Today</button>
            <select
              data-part="view-select"
              style={{ padding: '4px 8px', fontSize: 13 }}
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
      {/* Loading uses a conditional branch (not an overlay) so the grid
          DOM is not rendered at all -- saves layout computation for large
          event sets. */}
      {loading ? (
        <div data-part="loading" className="flex justify-center py-12">
          <span data-part="spinner" style={{ display: 'inline-block', width: 24, height: 24, animation: 'ds-spin var(--ds-motion-glacial) linear infinite' }} />
        </div>
      ) : (
        <div data-part="grid" className="grid grid-cols-7 border rounded-lg overflow-hidden">
          {DAY_NAMES.map((d) => (
            <div data-part="weekday" key={d} className="text-center text-xs font-semibold py-2 border-b">
              {d}
            </div>
          ))}
          {/* Render each date cell. Null cells (padding before the 1st and
              after the last day) use a faded background and no click handler. */}
          {cells.map((cell, i) => {
            const key = cell ? toDateKey(cell) : `empty-${i}`;
            const dayEvents = cell ? eventsByDate.get(toDateKey(cell)) ?? [] : [];
            const isToday = cell && toDateKey(cell) === today;
            return (
              <div
                data-part="day-cell"
                data-empty={cell === null}
                data-today={Boolean(isToday)}
                data-last-column={(i + 1) % 7 === 0}
                key={key}
                onClick={() => cell && onDateClick?.(cell)}
                className={`min-h-[80px] p-1 border-r border-b last:border-r-0 ${
                  cell ? 'cursor-pointer' : ''
                }`}
              >
                {cell && (
                  <>
                    <div data-part="date-label" className={`text-xs text-right px-1 ${isToday ? 'font-bold' : ''}`}>
                      {cell.getDate()}
                    </div>
                    {/* Show at most 3 event chips per cell to keep the grid compact;
                        overflow is shown as "+N more" below. */}
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        data-part="event"
                        key={ev.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                        className="text-[11px] px-1 mt-0.5 rounded truncate cursor-pointer"
                        // Per-event color must be inline because it varies per item;
                        // falls back to the DS primary token when no color is set.
                        style={{ background: ev.color ?? 'var(--ds-color-primary)' }}
                      >
                        {renderEvent ? renderEvent(ev) : ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div data-part="overflow-count" className="text-[10px] px-1">+{dayEvents.length - 3} more</div>
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
