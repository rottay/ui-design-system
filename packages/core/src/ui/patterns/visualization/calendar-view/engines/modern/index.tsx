'use client';

/**
 * @fileoverview Modern engine for the CalendarView pattern.
 * Renders a month grid with event chips, composing public DS primitives
 * (Button for navigation/today, Select for the view switch, Spinner for
 * loading) — the pattern never recreates a control with its own HTML/CSS.
 * Geometry and the pattern's own paint live in the modern
 * pattern-calendar-view skin, keyed on the `data-part`/`data-*` contract
 * this file stamps. Own copy resolves through the optional `components`
 * i18n channel with an English floor; weekday and month names follow the
 * active locale via Intl, and the grid's week start follows the locale's
 * own `Intl.Locale.getWeekInfo()` (Sunday floor).
 *
 * PINS: the previous/next controls are the TEXT buttons
 * '<' / '>' (`getByText('<')` / `getByText('>')`) — governed chevron icons
 * are blocked by that pin; both carry localized aria-labels. The month grid
 * layout is owned by the Modern skin through its `data-part="grid"` contract.
 * An empty events array still renders the full grid, so no Empty state is
 * composed.
 *
 * DEBT: the contract offers month/week/day views; this engine renders the
 * month grid for every mode — the Select surface stays per contract and
 * the week/day time-slot engines are documented follow-up, not half-built.
 *
 * @example
 * <ModernCalendarView
 *   events={[{ id: '1', title: 'Standup', start: new Date(), color: '#3b82f6' }]}
 *   currentDate={new Date()}
 *   onDateClick={(date) => console.log(date)}
 * />
 */

import React, { useMemo } from 'react';
import type { CalendarViewProps, CalendarEvent } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import ModernSelect from '../../../../../primitives/inputs/Select/engines/modern';
import ModernSpinner from '../../../../../primitives/feedback/Spinner/engines/modern';

const ROOT_CLASS_NAME = 'ds-pattern-calendar-view ds-engine-modern';

/**
 * Week start for the active locale, from the sanctioned Intl runtime:
 * `Intl.Locale.getWeekInfo().firstDay` (1 = Monday … 7 = Sunday), floored to
 * Sunday (7) when the runtime predates weekInfo or the locale is the
 * 'default' placeholder. Never a hardcoded locale table.
 */
function weekStartDay(locale: string): number {
  try {
    const loc = new Intl.Locale(
      locale === 'default' ? navigator.language : locale,
    ) as Intl.Locale & { getWeekInfo?: () => { firstDay?: number } };
    return loc.getWeekInfo?.().firstDay ?? 7;
  } catch {
    return 7;
  }
}

/** Jan 4 2026 is a Sunday: weekday short names derive from the active locale,
    rotated so the row starts on the locale's own week start. */
function weekdayNames(locale: string, weekStart: number): string[] {
  const sunday = weekStart % 7; // 7 (Sunday) -> 0, matching Date.getDay()
  return Array.from({ length: 7 }, (_, i) =>
    new Date(2026, 0, 4 + ((sunday + i) % 7)).toLocaleDateString(locale, { weekday: 'short' }),
  );
}

/**
 * Build a 7-column grid for the given month, aligned to the locale's week
 * start. Leading nulls pad the days before the 1st; trailing nulls complete
 * the last row to exactly 7 columns, preventing layout shift between months.
 */
function getMonthGrid(date: Date, weekStart: number) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() - (weekStart % 7) + 7) % 7;
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

/**
 * Modern calendar view rendering a month grid with event chips.
 * @param props - CalendarViewProps including events array, navigation callbacks,
 *   optional custom toolbar/header, and a generic `T` for event payload data.
 * @returns A month grid card; loading state composes the Spinner primitive.
 */
export default function ModernCalendarView<T>(props: CalendarViewProps<T>) {
  // Optional channel with an English floor: the calendar renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key. The
  // locale drives weekday/month names; without a provider it floors to the
  // browser default locale (the engine's historical behaviour).
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;
  const locale = i18n?.locale ?? 'default';

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

  const copy = {
    today: tOr('calendarView.today', 'Today'),
    previousMonth: tOr('calendarView.previousMonth', 'Previous month'),
    nextMonth: tOr('calendarView.nextMonth', 'Next month'),
    viewMonth: tOr('calendarView.viewMonth', 'Month'),
    viewWeek: tOr('calendarView.viewWeek', 'Week'),
    viewDay: tOr('calendarView.viewDay', 'Day'),
  };

  const weekStart = useMemo(() => weekStartDay(locale), [locale]);
  const cells = useMemo(() => getMonthGrid(currentDate, weekStart), [currentDate, weekStart]);
  const dayNames = useMemo(() => weekdayNames(locale, weekStart), [locale, weekStart]);

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
          composed nav with month title and view-mode selector. */}
      {toolbar ?? (
        <div data-part="toolbar">
          <div data-part="navigation">
            <ModernButton
              variant="ghost"
              size="sm"
              data-part="toolbar-action"
              data-action="previous"
              aria-label={copy.previousMonth}
              onClick={() => navigateMonth(-1)}
            >
              {'<'}
            </ModernButton>
            <h3 data-part="month-title">
              {currentDate.toLocaleString(locale, { month: 'long', year: 'numeric' })}
            </h3>
            <ModernButton
              variant="ghost"
              size="sm"
              data-part="toolbar-action"
              data-action="next"
              aria-label={copy.nextMonth}
              onClick={() => navigateMonth(1)}
            >
              {'>'}
            </ModernButton>
          </div>
          <div data-part="view-controls">
            <ModernButton
              variant="ghost"
              size="sm"
              data-part="toolbar-action"
              data-action="today"
              onClick={() => onDateChange?.(new Date())}
            >
              {copy.today}
            </ModernButton>
            {/* Slot keeps the historical data-part; the composed Select owns
                the control chrome and its dropdown. */}
            <span data-part="view-select">
              <ModernSelect
                size="sm"
                value={view}
                onChange={(val) => onViewChange?.(val as 'month' | 'week' | 'day')}
                options={[
                  { value: 'month', label: copy.viewMonth },
                  { value: 'week', label: copy.viewWeek },
                  { value: 'day', label: copy.viewDay },
                ]}
              />
            </span>
          </div>
        </div>
      )}
      {/* Loading uses a conditional branch (not an overlay) so the grid
          DOM is not rendered at all -- saves layout computation for large
          event sets. The composed Spinner owns ring and cadence. */}
      {loading ? (
        <div data-part="loading">
          <ModernSpinner size="md" data-part="spinner" />
        </div>
      ) : (
        /* Grid geometry and frame are skin-owned through the public anatomy. */
        <div data-part="grid">
          {dayNames.map((d) => (
            <div data-part="weekday" key={d}>
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
              >
                {cell && (
                  <>
                    <div data-part="date-label" data-today={Boolean(isToday)}>
                      {cell.getDate()}
                    </div>
                    {/* Show at most 3 event chips per cell to keep the grid compact;
                        overflow is shown as "+N more" below. */}
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        data-part="event"
                        key={ev.id}
                        /* Event chips are the primary interactive content, so
                           they are real keyboard targets (Enter/Space fire the
                           same callback as click). Full APG grid navigation
                           across day cells is documented debt, not half-built. */
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            onEventClick?.(ev);
                          }
                        }}
                        /* Per-event color is consumer config data: it rides the
                           accent hatch (quoted key) and the skin owns the fill. */
                        style={{ '--ds-calendar-event-accent': ev.color } as React.CSSProperties}
                      >
                        {renderEvent ? renderEvent(ev) : ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div data-part="overflow-count">
                        {tOr('calendarView.overflowMore', '+{count} more', { count: dayEvents.length - 3 })}
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
