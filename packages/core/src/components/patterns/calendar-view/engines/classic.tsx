'use client';

/**
 * CalendarView - Classic Engine (Ant Design)
 */

import React, { useMemo } from 'react';
import { Button, Space, Typography, Spin, Select } from 'antd';
import type { CalendarViewProps, CalendarEvent } from '../CalendarView.types';

const { Title, Text } = Typography;

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
