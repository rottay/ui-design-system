'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the CalendarView pattern.
 * Renders a month grid using Ant Design's Button, Select, Spin, and Typography
 * primitives. The grid is a CSS 7-column layout with date cells that display up
 * to 3 event chips each, falling back to a "+N more" overflow indicator.
 *
 * @example
 * <ClassicCalendarView
 *   events={[{ id: '1', title: 'Standup', start: new Date() }]}
 *   currentDate={new Date()}
 *   onEventClick={(ev) => console.log(ev.id)}
 * />
 */

import React, { useMemo } from 'react';
import { Button, Space, Typography, Spin, Select } from 'antd';
import type { CalendarViewProps, CalendarEvent } from '../../contracts';

const { Title, Text } = Typography;

/** Abbreviated day headers starting at Sunday to match JS Date.getDay() indices. */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Build a 7-column grid for the given month. Leading nulls pad Sunday-start
 * weeks before the 1st; trailing nulls pad the last row to a full 7 columns.
 * The grid always produces rows of exactly 7 cells, which prevents layout
 * shift when navigating between months that span different numbers of weeks.
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
 * Classic (Ant Design) calendar view rendering a month grid with event chips.
 * @param props - CalendarViewProps including events array, navigation callbacks,
 *   optional custom toolbar/header, and a generic `T` for event payload data.
 * @returns A month grid wrapped in an Ant Design Spin overlay for loading state.
 */
export default function ClassicCalendarView<T>(props: CalendarViewProps<T>) {
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
    <div className={className} style={style}>
      {header}
      {/* Render custom toolbar if provided; otherwise show the default
          nav controls with prev/next month buttons, a Today shortcut, and
          a view-mode selector (month/week/day). */}
      {toolbar ?? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <Button size="small" onClick={() => navigateMonth(-1)}>{'<'}</Button>
            <Title level={5} style={{ margin: 0 }}>{formatMonth(currentDate)}</Title>
            <Button size="small" onClick={() => navigateMonth(1)}>{'>'}</Button>
          </Space>
          <Space>
            <Button size="small" onClick={() => onDateChange?.(new Date())}>Today</Button>
            <Select
              size="small"
              value={view}
              onChange={(v) => onViewChange?.(v)}
              options={[
                { label: 'Month', value: 'month' },
                { label: 'Week', value: 'week' },
                { label: 'Day', value: 'day' },
              ]}
              style={{ width: 100 }}
            />
          </Space>
        </div>
      )}
      <Spin spinning={loading}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid var(--ds-color-border-subtle)' }}>
          {DAY_NAMES.map((d) => (
            <div key={d} style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 600, fontSize: 12, borderBottom: '1px solid var(--ds-color-border-subtle)', background: 'var(--ds-color-bg-secondary)' }}>
              {d}
            </div>
          ))}
          {/* Render each date cell. Null cells (padding before the 1st and after
              the last day) get a muted background and no click handler. */}
          {cells.map((cell, i) => {
            const key = cell ? toDateKey(cell) : `empty-${i}`;
            const dayEvents = cell ? eventsByDate.get(toDateKey(cell)) ?? [] : [];
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
                  borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--ds-color-border-subtle)' : undefined,
                  borderBottom: '1px solid var(--ds-color-border-subtle)',
                  background: cell ? 'var(--ds-color-bg-primary)' : 'var(--ds-color-bg-secondary)',
                  cursor: cell ? 'pointer' : 'default',
                }}
              >
                {cell && (
                  <>
                    <div style={{
                      fontSize: 12,
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? 'var(--ds-color-primary)' : undefined,
                      textAlign: 'right',
                      padding: '2px 4px',
                    }}>
                      {cell.getDate()}
                    </div>
                    {/* Show at most 3 events per cell to keep the grid compact;
                        overflow is shown as "+N more" below. */}
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                        style={{
                          fontSize: 11,
                          padding: '1px 4px',
                          marginTop: 2,
                          borderRadius: 3,
                          background: ev.color ?? 'var(--ds-color-primary)',
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
                      <Text type="secondary" style={{ fontSize: 10 }}>+{dayEvents.length - 3} more</Text>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Spin>
    </div>
  );
}
