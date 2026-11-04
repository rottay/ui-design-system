import React, { useMemo, useRef, useState } from 'react';
import type { TextDirection } from '@/infrastructure/runtime/i18n';
import ModernButton from '../../../../../../primitives/inputs/button/engines/modern';
import type { CalendarViewProps, CalendarEvent } from '../../../contracts';
import { DayCell, EventChip } from '../runtime';
import { toDateKey, startTime, timeDay, timeEntries, isAllDay } from '../foundation';
import type { HourSlot, TimeDay, TimedEntry } from '../foundation';

interface TimeGridProps<T> extends Pick<CalendarViewProps<T>, 'events' | 'renderEvent' | 'onDateClick' | 'onEventClick'> {
  dates: Date[];
  currentDate: Date;
  locale: string;
  direction: TextDirection;
  allDayLabel: string;
  today: string;
  rangeLabel: string;
  labelledBy?: string;
  onEnterCell: (cell: HTMLElement) => boolean;
  onEntryKeyDown: (event: React.KeyboardEvent<HTMLElement>, entry?: CalendarEvent<T>) => void;
}

/** Hourly calendar presentation with one roving grid stop and clipped event lanes. */
export default function ModernCalendarTimeGrid<T>({ dates, events, currentDate, locale, direction, allDayLabel, today, rangeLabel, labelledBy, renderEvent, onDateClick, onEventClick, onEnterCell, onEntryKeyDown }: TimeGridProps<T>) {
  const eventsInteractive = Boolean(onEventClick);
  const timeDays = useMemo(() => dates.map(timeDay), [dates]);
  const timeRows = useMemo(() => {
    const rows = new Map<string, { slot: HourSlot; labels: Set<string> }>();
    for (const day of timeDays) for (const slot of day.slots.values()) {
      const label = slot.date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
      const row = rows.get(slot.key);
      if (row) row.labels.add(label);
      else rows.set(slot.key, { slot, labels: new Set([label]) });
    }
    return Array.from(rows.values()).map(({ slot, labels }) => ({ ...slot, label: Array.from(labels).join(' / ') }))
      .sort((a, b) => a.clock - b.clock || a.occurrence - b.occurrence);
  }, [timeDays, locale]);
  const rowIndices = useMemo(() => new Map(timeRows.map((slot, index) => [slot.key, index])), [timeRows]);
  const layouts = useMemo(() => new Map(timeDays.map((day) => [toDateKey(day.date), timeEntries(day, events, rowIndices)])), [timeDays, events, rowIndices]);
  const timeRefs = useRef(new Map<string, HTMLDivElement>());
  const [timeFocusKey, setTimeFocusKey] = useState<string | null>(null);
  const timeTargets = useMemo(() => {
    const targets = new Map<string, { date: Date; dayIndex: number; row: number }>();
    timeDays.forEach((day, dayIndex) => {
      const dateKey = toDateKey(day.date);
      targets.set(`${dateKey}/all`, { date: day.date, dayIndex, row: -1 });
      for (const slot of day.slots.values()) {
        targets.set(`${dateKey}/${slot.key}`, { date: slot.date, dayIndex, row: rowIndices.get(slot.key) ?? 0 });
      }
    });
    return targets;
  }, [timeDays, rowIndices]);
  const selectedTimeKey = useMemo(() => {
    for (const day of timeDays) {
      for (const slot of day.slots.values()) {
        if (currentDate.getTime() >= slot.date.getTime() && currentDate.getTime() < slot.end) return `${toDateKey(day.date)}/${slot.key}`;
      }
    }
    return timeTargets.keys().next().value;
  }, [currentDate, timeDays, timeTargets]);
  const activeTimeKey = timeFocusKey && timeTargets.has(timeFocusKey) ? timeFocusKey : selectedTimeKey;
  const handleTimeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, key: string) => {
    if (event.defaultPrevented || event.target !== event.currentTarget) return;
    const target = timeTargets.get(key);
    if (!target) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onDateClick?.(new Date(target.date));
      return;
    }
    if (event.key === 'F2') {
      if (eventsInteractive && onEnterCell(event.currentTarget)) event.preventDefault();
      return;
    }
    const vertical = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    const horizontal = event.key === 'ArrowRight' ? (direction === 'rtl' ? -1 : 1) : event.key === 'ArrowLeft' ? (direction === 'rtl' ? 1 : -1) : 0;
    if (!vertical && !horizontal) return;
    event.preventDefault();
    let row = target.row + vertical;
    const dayIndex = target.dayIndex + horizontal;
    while (row >= -1 && row < timeRows.length) {
      const found = Array.from(timeTargets).find(([, value]) => value.dayIndex === dayIndex && value.row === row);
      if (found) {
        const [foundKey] = found;
        setTimeFocusKey(foundKey);
        timeRefs.current.get(foundKey)?.focus();
        return;
      }
      if (!vertical) return;
      row += vertical;
    }
  };
  const renderTimeEvent = (event: CalendarEvent<T>, layout?: TimedEntry<T>) => {
    const geometry = layout ? {
      '--_ds-calendar-view-entry-offset': layout.offset,
      '--_ds-calendar-view-entry-span': layout.span,
      '--_ds-calendar-view-entry-lane': layout.lane,
      '--_ds-calendar-view-entry-lanes': layout.lanes,
    } : {};
    const accent = event.color === undefined ? {} : { '--ds-calendar-view-entry-accent': event.color };
    const entryStyle = { ...geometry, ...accent } as React.CSSProperties;
    const time = (value: Date | string) => new Date(startTime(value)).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
    const content = renderEvent ? renderEvent(event) : <>
      <span>{event.title}</span>
      {layout && <time>{time(event.start)}{event.end === undefined ? '' : ` – ${time(event.end)}`}</time>}
    </>;
    if (!eventsInteractive) return <EventChip key={event.id} className="ds-pattern-calendar-view__event" data-time-entry={Boolean(layout)} style={entryStyle}>{content}</EventChip>;
    return <ModernButton
      key={event.id}
      chrome="none"
      className="ds-pattern-calendar-view__event"
      data-time-entry={Boolean(layout)}
      tabIndex={-1}
      aria-label={event.title}
      onClick={(click) => { click.stopPropagation(); onEventClick?.(event); }}
      onKeyDown={(key) => onEntryKeyDown(key, event)}
      style={entryStyle}
    >{content}</ModernButton>;
  };
  const renderTimeCell = (day: TimeDay, dayIndex: number, slot?: HourSlot) => {
    const dateKey = toDateKey(day.date);
    const key = `${dateKey}/${slot?.key ?? 'all'}`;
    const date = slot?.date ?? day.date;
    const dayEntries = layouts.get(dateKey) ?? [];
    const allDayEvents = slot ? [] : events.filter((event) => isAllDay(event) && toDateKey(event.start) <= dateKey && (event.end === undefined ? toDateKey(event.start) : toDateKey(event.end)) >= dateKey).sort((a, b) => startTime(a.start) - startTime(b.start));
    return <DayCell
      key={key}
      data-empty="false"
      data-time-slot={Boolean(slot)}
      data-date={dateKey}
      data-hour={slot?.date.getHours()}
      data-occurrence={slot?.occurrence}
      data-selected={key === selectedTimeKey}
      data-today={dateKey === today}
      data-last-column={dayIndex === timeDays.length - 1}
      role="gridcell"
      aria-selected={key === selectedTimeKey}
      aria-label={`${date.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, ${slot ? date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) : allDayLabel}`}
      tabIndex={key === activeTimeKey ? 0 : -1}
      ref={(element) => { if (element) timeRefs.current.set(key, element); else timeRefs.current.delete(key); }}
      onFocus={() => setTimeFocusKey(key)}
      onClick={(event) => {
        if (event.defaultPrevented || event.target !== event.currentTarget) return;
        onDateClick?.(new Date(date));
      }}
      onKeyDown={(event) => handleTimeKeyDown(event, key)}
    >
      {slot ? dayEntries.filter((entry) => entry.slotKey === slot.key).map((entry) => renderTimeEvent(entry.event, entry)) : allDayEvents.map((event) => renderTimeEvent(event))}
    </DayCell>;
  };

  return (
    <div
      data-part="grid"
      data-time-grid="true"
      role="grid"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : rangeLabel}
      style={{ '--_ds-calendar-view-hour-rows': timeRows.length } as React.CSSProperties}
    >
      <div data-part="weekday-row" role="row">
        <div data-part="weekday" role="columnheader" aria-label={allDayLabel} />
        {timeDays.map((day) => <div data-part="weekday" role="columnheader" key={toDateKey(day.date)}>
          {day.date.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>)}
      </div>
      <div data-part="week-row" role="row">
        <div data-part="date-label" role="rowheader">{allDayLabel}</div>
        {timeDays.map((day, index) => renderTimeCell(day, index))}
      </div>
      {timeRows.map((row) => <div data-part="week-row" role="row" key={row.key}>
        <div data-part="date-label" role="rowheader">{row.label}</div>
        {timeDays.map((day, index) => {
          const slot = day.slots.get(row.key);
          return slot ? renderTimeCell(day, index, slot) : <DayCell data-empty="true" role="presentation" key={toDateKey(day.date)} />;
        })}
      </div>)}
    </div>
  );
}
