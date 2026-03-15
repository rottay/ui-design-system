'use client';

/**
 * CalendarView - Modern Engine (DaisyUI / Tailwind)
 */

import React, { useMemo } from 'react';
import type { CalendarViewProps, CalendarEvent } from '../../types';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

function toDateKey(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatMonth(date: Date) {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

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

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent<T>[]> = {};
    for (const ev of events) {
      const key = toDateKey(ev.start);
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    }
    return map;
  }, [events]);

  const navigateMonth = (delta: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + delta);
    onDateChange?.(next);
  };

  const today = toDateKey(new Date());

  return (
    <div className={className} style={style}>
      {header}
      {toolbar ?? (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => navigateMonth(-1)}>{'<'}</button>
            <h3 className="text-lg font-semibold">{formatMonth(currentDate)}</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigateMonth(1)}>{'>'}</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => onDateChange?.(new Date())}>Today</button>
            <select
              className="select select-bordered select-sm"
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
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-md" />
        </div>
      ) : (
        <div className="grid grid-cols-7 border border-base-300 rounded-lg overflow-hidden">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-semibold py-2 bg-base-200 border-b border-base-300">
              {d}
            </div>
          ))}
          {cells.map((cell, i) => {
            const key = cell ? toDateKey(cell) : `empty-${i}`;
            const dayEvents = cell ? eventsByDate[toDateKey(cell)] ?? [] : [];
            const isToday = cell && toDateKey(cell) === today;
            return (
              <div
                key={key}
                onClick={() => cell && onDateClick?.(cell)}
                className={`min-h-[80px] p-1 border-r border-b border-base-300 last:border-r-0 ${
                  cell ? 'bg-base-100 cursor-pointer hover:bg-base-200/50' : 'bg-base-200/30'
                }`}
              >
                {cell && (
                  <>
                    <div className={`text-xs text-right px-1 ${isToday ? 'font-bold text-primary' : ''}`}>
                      {cell.getDate()}
                    </div>
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                        className="text-[11px] px-1 mt-0.5 rounded text-white truncate cursor-pointer"
                        style={{ background: ev.color ?? 'var(--ds-color-primary)' }}
                      >
                        {renderEvent ? renderEvent(ev) : ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-base-content/50 px-1">+{dayEvents.length - 3} more</div>
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
