'use client';

/**
 * CalendarView - Rustic Engine (Pure inline styles with --ds-* CSS vars)
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

  const btn: React.CSSProperties = {
    padding: '4px 10px',
    border: '1px solid var(--ds-color-border, #d9d9d9)',
    borderRadius: 'var(--ds-radius-sm, 4px)',
    background: 'var(--ds-color-bg, #fff)',
    color: 'var(--ds-color-text, #1a1a1a)',
    cursor: 'pointer',
    fontSize: 13,
  };

  return (
    <div className={className} style={style}>
      {header}
      {toolbar ?? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={btn} onClick={() => navigateMonth(-1)}>{'<'}</button>
            <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--ds-color-text, #1a1a1a)' }}>
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
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--ds-color-text-muted, #888)' }}>
          Loading...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid var(--ds-color-border, #e5e5e5)', borderRadius: 'var(--ds-radius-md, 8px)', overflow: 'hidden' }}>
          {DAY_NAMES.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, padding: '8px 0', background: 'var(--ds-color-bg-subtle, #fafafa)', borderBottom: '1px solid var(--ds-color-border, #e5e5e5)' }}>
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
                style={{
                  minHeight: 80,
                  padding: 4,
                  borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--ds-color-border, #e5e5e5)' : undefined,
                  borderBottom: '1px solid var(--ds-color-border, #e5e5e5)',
                  background: cell ? 'var(--ds-color-bg, #fff)' : 'var(--ds-color-bg-subtle, #fafafa)',
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
                      color: isToday ? 'var(--ds-color-primary, #1677ff)' : 'var(--ds-color-text, #1a1a1a)',
                    }}>
                      {cell.getDate()}
                    </div>
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                        style={{
                          fontSize: 11,
                          padding: '1px 4px',
                          marginTop: 2,
                          borderRadius: 'var(--ds-radius-xs, 3px)',
                          background: ev.color ?? 'var(--ds-color-primary, #1677ff)',
                          color: 'var(--ds-color-text-on-primary)',
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
                      <div style={{ fontSize: 10, color: 'var(--ds-color-text-muted, #888)', padding: '0 4px' }}>
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
