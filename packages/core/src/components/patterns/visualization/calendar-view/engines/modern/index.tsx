'use client';

/**
 * @fileoverview Modern engine for the CalendarView pattern.
 * Renders month, week and day grids with event chips, composing public DS primitives
 * (Button for navigation/today, Select for the view switch, Spinner for
 * loading) — the pattern never recreates a control with its own HTML/CSS.
 * Geometry and the pattern's own paint live in the modern
 * pattern-calendar-view skin, keyed on the `data-part`/`data-*` contract
 * this file stamps. Own copy resolves through the optional `components`
 * i18n channel with an English floor; weekday and month names follow the
 * active locale via Intl, and the grid's week start follows the locale's
 * native week-info when available, with the shared locale policy otherwise.
 *
 * PINS: the previous/next controls are the TEXT buttons
 * '<' / '>' (`getByText('<')` / `getByText('>')`) — governed chevron icons
 * are blocked by that pin; both carry localized aria-labels. The month grid
 * layout is owned by the Modern skin through its `data-part="grid"` contract.
 * An empty events array still renders the full grid, so no Empty state is
 * composed.
 *
 * APG GRID: the month grid is a real ARIA grid — `role="grid"` labelled by
 * the month title (aria-live, so month changes are announced), one
 * `role="row"` per week plus the `role="columnheader"` weekday row (the
 * wrappers are layout-transparent: the skin gives them `display: contents`,
 * so the seven-column geometry is untouched). Day cells are `role="gridcell"`
 * with `aria-selected` tracking the controlled `currentDate`, a full-date
 * localized `aria-label`, and a roving tabindex: arrow keys move by day /
 * week (inline arrows mirror under RTL via the shared direction authority),
 * Enter/Space fires `onDateClick`. Focus never leaves the displayed month —
 * month navigation stays parent-owned through the toolbar.
 *
 * @example
 * <ModernCalendarView
 *   events={[{ id: '1', title: 'Standup', start: new Date(), color: '#3b82f6' }]}
 *   currentDate={new Date()}
 *   onDateClick={(date) => console.log(date)}
 * />
 */

import React, { useId, useMemo, useRef, useState } from 'react';
import type { CalendarViewProps, CalendarEvent } from '../../contracts';
import { toDateKey, startTime } from './foundation';
import { DayCell, EventChip } from './runtime';
import ModernCalendarTimeGrid from './presentation';
import { useOptionalDirection, useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { arrayValueAt } from '@/foundation/kernel/collections';
import { resolveWeekStartsOn } from '@/components/primitives/foundation/calendar';
import ModernButton from '../../../../../primitives/inputs/button/engines/modern';
import ModernSelect from '../../../../../primitives/inputs/select/engines/modern';
import ModernSpinner from '../../../../../primitives/feedback/spinner/engines/modern';

const ROOT_CLASS_NAME = 'ds-pattern-calendar-view ds-engine-modern';

/**
 * Week start for the active locale, from the sanctioned Intl runtime:
 * `Intl.Locale.getWeekInfo().firstDay` (1 = Monday … 7 = Sunday), with the
 * shared locale policy when week-info is unavailable. An invalid or
 * unavailable locale retains the Sunday floor.
 */
function weekStartDay(locale: string): number {
  try {
    const resolvedLocale = locale === 'default' ? navigator.language : locale;
    const loc = new Intl.Locale(resolvedLocale) as Intl.Locale & { getWeekInfo?: () => { firstDay?: number }; weekInfo?: { firstDay?: number } };
    return loc.getWeekInfo?.().firstDay ?? loc.weekInfo?.firstDay ?? resolveWeekStartsOn(resolvedLocale);
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

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Modern calendar view with controlled month, week and day layouts.
 * @param props - CalendarViewProps including events array, navigation callbacks,
 *   optional custom toolbar/header, and a generic `T` for event payload data.
 * @returns A calendar grid; loading state composes the Spinner primitive.
 */
export default function ModernCalendarView<T>(props: CalendarViewProps<T>) {
  // Optional channel with an English floor: the calendar renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key. The
  // locale drives weekday/month names; without a provider it floors to the
  // browser default locale (the engine's historical behaviour).
  const i18n = useOptionalTranslation('components');
  // The reading direction comes from the shared i18n authority, not a DOM
  // probe of a node's `dir` chain: the locale knows it on the server too, and a
  // probe re-derives from paint a fact the provider already holds.
  const direction = useOptionalDirection();

  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string => {
    const resolved = i18n?.tOr(key, floor, params);
    if (resolved !== undefined) return resolved;
    // No provider: the English floor still has to read as copy, never as a
    // raw `{count}` placeholder.
    return params
      ? floor.replace(/\{(\w+)\}/g, (match, name: string) =>
          name in params ? String(params[name]) : match,
        )
      : floor;
  };
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
    previous: view === 'month' ? tOr('calendarView.previousMonth', 'Previous month') : view === 'week' ? tOr('calendarView.previousWeek', 'Previous week') : tOr('calendarView.previousDay', 'Previous day'),
    next: view === 'month' ? tOr('calendarView.nextMonth', 'Next month') : view === 'week' ? tOr('calendarView.nextWeek', 'Next week') : tOr('calendarView.nextDay', 'Next day'),
    allDay: tOr('calendarView.allDay', 'All day'),
    showLess: tOr('calendarView.showLess', 'Show fewer events'),
    viewMonth: tOr('calendarView.viewMonth', 'Month'),
    viewWeek: tOr('calendarView.viewWeek', 'Week'),
    viewDay: tOr('calendarView.viewDay', 'Day'),
    viewMode: tOr('calendarView.viewMode', 'Calendar view mode'),
  };

  const monthLabel = currentDate.toLocaleString(locale, { month: 'long', year: 'numeric' });

  const weekStart = useMemo(() => weekStartDay(locale), [locale]);
  const cells = useMemo(() => getMonthGrid(currentDate, weekStart), [currentDate, weekStart]);
  const dayNames = useMemo(() => weekdayNames(locale, weekStart), [locale, weekStart]);

  const visibleDays = useMemo(() => {
    const first = new Date(currentDate);
    first.setHours(0, 0, 0, 0);
    if (view === 'week') first.setDate(first.getDate() - (first.getDay() - weekStart % 7 + 7) % 7);
    return Array.from({ length: view === 'week' ? 7 : 1 }, (_, index) => {
      const date = new Date(first);
      date.setDate(date.getDate() + index);
      return date;
    });
  }, [currentDate, view, weekStart]);
  const rangeLabel = view === 'month' ? monthLabel : view === 'day'
    ? currentDate.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : visibleDays.map((date, index) => index === 0 || index === 6 ? date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' }) : '').filter(Boolean).join(' – ');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // Index events by date string for O(1) lookup per cell during render. An
  // event carrying an `end` occupies EVERY day it spans, not just its start
  // day -- a three-day trip that vanished after day one was reading as three
  // separate calendars. The walk is clamped to the days this grid renders, so
  // an open-ended range never expands past the visible month.
  const eventsByDate = useMemo(() => {
    const visible = new Set<string>();
    for (const c of cells) if (c) visible.add(toDateKey(c));

    const map = new Map<string, CalendarEvent<T>[]>();
    const push = (key: string, ev: CalendarEvent<T>) => {
      const bucket = map.get(key);
      if (bucket) bucket.push(ev);
      else map.set(key, [ev]);
    };

    for (const ev of events) {
      const startKey = toDateKey(ev.start);
      push(startKey, ev);
      if (ev.end === undefined) continue;
      const endKey = toDateKey(ev.end);
      if (endKey === startKey) continue;
      // Walk calendar days (local midnight), never raw instants: DST shifts
      // must not drop or duplicate a day.
      const cursor = new Date(startTime(ev.start));
      cursor.setHours(12, 0, 0, 0);
      const endStamp = startTime(ev.end);
      for (let guard = 0; guard < 400; guard += 1) {
        cursor.setTime(cursor.getTime() + DAY_MS);
        const key = toDateKey(cursor);
        if (cursor.getTime() > endStamp + DAY_MS) break;
        if (visible.has(key)) push(key, ev);
        if (key === endKey) break;
      }
    }

    // Within a day the chips read chronologically, so the three that survive
    // the overflow cap are the earliest -- not whatever order the caller's
    // array happened to arrive in.
    for (const bucket of map.values()) {
      bucket.sort((a, b) => startTime(a.start) - startTime(b.start));
    }
    return map;
  }, [events, cells]);

  // Navigation follows the active view without mutating currentDate.
  // Month changes clamp the day before setting the target month. The day is clamped to
  // the target month's length first: a bare `setMonth` on Jan 31 overflows
  // into March and skips February entirely.
  const navigateDate = (delta: number) => {
    if (view !== 'month') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + delta * (view === 'week' ? 7 : 1));
      onDateChange?.(next);
      return;
    }
    const targetMonth = currentDate.getMonth() + delta;
    const daysInTarget = new Date(currentDate.getFullYear(), targetMonth + 1, 0).getDate();
    const next = new Date(currentDate);
    next.setDate(Math.min(next.getDate(), daysInTarget));
    next.setMonth(targetMonth);
    onDateChange?.(next);
  };

  const today = toDateKey(new Date());
  const currentKey = toDateKey(currentDate);
  const eventsInteractive = Boolean(onEventClick);

  /* APG grid state: the grid's accessible name comes from the month title
     (aria-labelledby); the title itself is aria-live so month changes are
     announced. Weeks chunk the flat cell array into role="row" wrappers that
     the skin renders as `display: contents` (layout-transparent). */
  const titleId = useId();
  const weeks = useMemo(() => {
    const chunked: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) chunked.push(cells.slice(i, i + 7));
    return chunked;
  }, [cells]);

  /* Roving tabindex: the grid has ONE tab stop. The default stop is today
     when it falls inside the displayed month, otherwise the month's first
     day cell; keyboard moves retarget it within the month (the parent owns
     month navigation, so arrows at the edges are a no-op by design). */
  const cellRefs = useRef(new Map<string, HTMLDivElement>());
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const cellKeySet = useMemo(() => {
    const set = new Set<string>();
    for (const c of cells) if (c) set.add(toDateKey(c));
    return set;
  }, [cells]);
  const defaultFocusKey = useMemo(() => {
    if (cellKeySet.has(today)) return today;
    const first = cells.find((c): c is Date => c !== null);
    return first ? toDateKey(first) : null;
  }, [cells, cellKeySet, today]);
  const activeFocusKey = focusKey && cellKeySet.has(focusKey) ? focusKey : defaultFocusKey;

  const moveFocus = (cell: Date, delta: number) => {
    const target = new Date(cell);
    target.setDate(target.getDate() + delta);
    const key = toDateKey(target);
    if (!cellKeySet.has(key)) return; // month edges: the toolbar owns navigation
    setFocusKey(key);
    cellRefs.current.get(key)?.focus();
  };

  /* APG in-cell interaction mode. The chips are widgets inside a gridcell, so
     they must not each own a tab stop (a busy month put ~90 of them in the
     page tab order). F2 enters the cell and focuses the first chip; Escape
     returns to the cell; Up/Down walk the stack. Enter/Space stay bound to
     `onDateClick` on EVERY cell, so the documented callback is untouched. */
  const enterCell = (cellNode: HTMLElement): boolean => {
    const firstChip = cellNode.querySelector<HTMLElement>('.ds-pattern-calendar-view__event[tabindex], .ds-pattern-calendar-view__overflow-action');
    if (!firstChip) return false;
    firstChip.focus();
    return true;
  };

  const handleChipKeyDown = (e: React.KeyboardEvent<HTMLElement>, ev?: CalendarEvent<T>) => {
    const chip = e.currentTarget;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (ev) onEventClick?.(ev);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      chip.closest<HTMLElement>('[data-part="day-cell"]')?.focus();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      // Inside interaction mode the day grid must not move underfoot: the
      // stack edges absorb the key instead of jumping a week.
      e.preventDefault();
      e.stopPropagation();
      const entries = Array.from(chip.closest('[data-part="day-cell"]')?.querySelectorAll<HTMLElement>('.ds-pattern-calendar-view__event[tabindex], .ds-pattern-calendar-view__overflow-action') ?? []);
      const index = entries.indexOf(chip);
      const sibling = arrayValueAt(entries, index + (e.key === 'ArrowDown' ? 1 : -1));
      if (e.key === 'ArrowUp' && index === 0) return;
      sibling?.focus();
    }
  };

  const handleCellKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, cell: Date) => {
    // Inline arrows mirror under RTL: ArrowLeft always moves visually left,
    // which is the NEXT day in an RTL grid (Tree primitive idiom).
    const rtl = direction === 'rtl';
    if (e.key === 'F2') {
      if (!eventsInteractive && !e.currentTarget.querySelector('.ds-pattern-calendar-view__overflow-action')) return;
      if (enterCell(e.currentTarget)) e.preventDefault();
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDateClick?.(cell);
      return;
    }
    const delta =
      e.key === 'ArrowLeft' ? (rtl ? 1 : -1)
      : e.key === 'ArrowRight' ? (rtl ? -1 : 1)
      : e.key === 'ArrowUp' ? -7
      : e.key === 'ArrowDown' ? 7
      : 0;
    if (delta === 0) return;
    e.preventDefault();
    moveFocus(cell, delta);
  };

  return (
    <div
      data-part="root"
      data-loading={loading}
      aria-busy={loading || undefined}
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
              className="ds-pattern-calendar-view__toolbar-action"
              data-action="previous"
              aria-label={copy.previous}
              onClick={() => navigateDate(-1)}
            >
              {'<'}
            </ModernButton>
            {/* The title doubles as the grid's accessible name and a polite
                live region: navigating months announces the new range. */}
            <h3 data-part="month-title" id={titleId} aria-live="polite">
              {rangeLabel}
            </h3>
            <ModernButton
              variant="ghost"
              size="sm"
              className="ds-pattern-calendar-view__toolbar-action"
              data-action="next"
              aria-label={copy.next}
              onClick={() => navigateDate(1)}
            >
              {'>'}
            </ModernButton>
          </div>
          <div data-part="view-controls">
            <ModernButton
              variant="ghost"
              size="sm"
              className="ds-pattern-calendar-view__toolbar-action"
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
                aria-label={copy.viewMode}
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
          <ModernSpinner size="md" className="ds-pattern-calendar-view__spinner" />
        </div>
      ) : view !== 'month' ? (
        <ModernCalendarTimeGrid
          dates={visibleDays} events={events} currentDate={currentDate}
          locale={locale} direction={direction} allDayLabel={copy.allDay}
          today={today} rangeLabel={rangeLabel} labelledBy={toolbar == null ? titleId : undefined}
          onDateClick={onDateClick} onEventClick={onEventClick} renderEvent={renderEvent}
          onEnterCell={enterCell} onEntryKeyDown={handleChipKeyDown}
        />
      ) : (
        /* Grid geometry and frame are skin-owned through the public anatomy.
           APG: role=grid labelled by the month title; week rows are
           layout-transparent wrappers (the skin sets display: contents). */
        <div
          data-part="grid"
          role="grid"
          /* A caller-supplied toolbar replaces the default month title, so
             the id reference would dangle and leave the grid unnamed: fall
             back to the same localized month string as a direct label. */
          aria-labelledby={toolbar == null ? titleId : undefined}
          aria-label={toolbar == null ? undefined : rangeLabel}
        >
          <div data-part="weekday-row" role="row">
            {dayNames.map((d) => (
              <div data-part="weekday" role="columnheader" key={d}>
                {d}
              </div>
            ))}
          </div>
          {/* Render each week row, then each date cell inside it. Null cells
              (padding before the 1st and after the last day) are presentational
              and carry no click handler. */}
          {weeks.map((week, weekIndex) => (
            <div data-part="week-row" role="row" key={weekIndex}>
              {week.map((cell, dayIndex) => {
                const cellKey = cell ? toDateKey(cell) : `empty-${weekIndex}-${dayIndex}`;
                const dayEvents = cell ? eventsByDate.get(cellKey) ?? [] : [];
                const isToday = cell && cellKey === today;
                const isSelected = cell && cellKey === currentKey;
                return (
                  <DayCell
                    data-empty={cell === null}
                    data-today={Boolean(isToday)}
                    data-selected={Boolean(isSelected)}
                    data-last-column={dayIndex === 6}
                    key={cellKey}
                    /* APG gridcell: real day cells are keyboard targets with a
                       roving tabindex; padding cells are presentational. */
                    role={cell ? 'gridcell' : 'presentation'}
                    aria-selected={cell ? Boolean(isSelected) : undefined}
                    /* The cell name carries its agenda weight: a screen-reader
                       user arrowing the month hears which days hold work
                       before deciding to enter one. */
                    aria-label={
                      cell
                        ? [
                            cell.toLocaleDateString(locale, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }),
                            dayEvents.length > 0
                              ? tOr(
                                  dayEvents.length === 1
                                    ? 'calendarView.eventCountOne'
                                    : 'calendarView.eventCountOther',
                                  dayEvents.length === 1 ? '{count} event' : '{count} events',
                                  { count: dayEvents.length },
                                )
                              : null,
                          ]
                            .filter(Boolean)
                            .join(', ')
                        : undefined
                    }
                    tabIndex={cell ? (cellKey === activeFocusKey ? 0 : -1) : undefined}
                    ref={
                      cell
                        ? (el: HTMLDivElement | null) => {
                            if (el) cellRefs.current.set(cellKey, el);
                            else cellRefs.current.delete(cellKey);
                          }
                        : undefined
                    }
                    onClick={() => cell && onDateClick?.(cell)}
                    onFocus={cell ? () => setFocusKey(cellKey) : undefined}
                    onKeyDown={cell ? (e) => handleCellKeyDown(e, cell) : undefined}
                  >
                    {cell && (
                      <>
                        <div data-part="date-label" data-today={Boolean(isToday)} aria-hidden="true">
                          {cell.getDate()}
                        </div>
                        {/* Show at most 3 event chips per cell to keep the grid compact;
                            overflow is shown as "+N more" below. */}
                        {(expandedDate === cellKey ? dayEvents : dayEvents.slice(0, 3)).map((ev) => {
                          /* Per-event color is consumer config data: it rides the
                             family's own accent channel (quoted key) and the skin
                             owns the fill. An event that states NO colour stamps
                             no accent, so the derived resting accent stays reachable
                             from the theme instead of being shadowed on every
                             render by an inline property. */
                          const accent =
                            ev.color === undefined
                              ? undefined
                              : ({ '--ds-calendar-view-entry-accent': ev.color } as React.CSSProperties);
                          /* Without `onEventClick` the chip is read-only content:
                             advertising a button and a tab stop would sell an
                             inert control (and add a tab stop per chip). */
                          if (!eventsInteractive) {
                            return (
                              <EventChip key={ev.id} className="ds-pattern-calendar-view__event" {...(accent === undefined ? {} : { style: accent })}>
                                {renderEvent ? renderEvent(ev) : ev.title}
                              </EventChip>
                            );
                          }
                          return (
                            <ModernButton
                              key={ev.id}
                              chrome="none"
                              className="ds-pattern-calendar-view__event"
                              /* APG grid: a widget inside a cell is reached
                                 through the cell (F2), never through its own
                                 tab stop. */
                              tabIndex={-1}
                              /* A `renderEvent` chip can be pure iconography;
                                 the event title is the control's name floor. */
                              aria-label={renderEvent ? ev.title : undefined}
                              onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                              onKeyDown={(e) => handleChipKeyDown(e as React.KeyboardEvent<HTMLElement>, ev)}
                              style={accent}
                            >
                              {renderEvent ? renderEvent(ev) : ev.title}
                            </ModernButton>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <span data-part="overflow-count">
                            <ModernButton
                              chrome="none"
                              className="ds-pattern-calendar-view__overflow-action"
                              tabIndex={-1}
                              aria-expanded={expandedDate === cellKey}
                              onClick={(event) => { event.stopPropagation(); setExpandedDate(expandedDate === cellKey ? null : cellKey); }}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  setExpandedDate(expandedDate === cellKey ? null : cellKey);
                                } else handleChipKeyDown(event, undefined);
                              }}
                            >
                              {expandedDate === cellKey ? copy.showLess : tOr('calendarView.overflowMore', '+{count} more', { count: dayEvents.length - 3 })}
                            </ModernButton>
                          </span>
                        )}
                      </>
                    )}
                  </DayCell>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
