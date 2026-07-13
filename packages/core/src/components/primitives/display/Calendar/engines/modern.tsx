'use client';

/**
 * @fileoverview Modern Calendar engine -- DaisyUI/Tailwind implementation.
 *
 * Lightweight calendar built with a CSS Grid layout, DaisyUI button classes,
 * and native `Date` objects (no dayjs dependency). Supports month view (7-column
 * day grid) and year view (3-column month grid), controlled and uncontrolled
 * value modes, date disabling via `disabledDate`/`validRange`, and custom
 * cell renderers for both day and month cells.
 *
 * Engine: **DaisyUI / Tailwind CSS**
 *
 * @example
 * ```tsx
 * <Calendar engine="modern" fullscreen={false} onChange={(d) => console.log(d)} />
 * ```
 *
 * @module Calendar/engines/modern
 * @category Display
 * @package @rottay/design-system
 */
import React, { useState, useMemo, useCallback } from 'react';
import type { CalendarProps, CalendarMode } from '../Calendar.types';

// English day/month labels. Localization is handled at a higher layer; the
// modern engine uses these as display-only labels in the grid header.
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Normalizes the incoming value (Date, ISO string, or undefined) into a Date.
// Falls back to "now" so the calendar always has a valid reference date.
const parseDate = (value: Date | string | undefined): Date => {
  if (!value) return new Date();
  return typeof value === 'string' ? new Date(value) : value;
};

/**
 * Modern Calendar backed by DaisyUI/Tailwind -- no external date library.
 *
 * Uses a 7-column CSS Grid for month view and a 3-column grid for year view.
 * Supports controlled (`value`) and uncontrolled (`defaultValue`) modes,
 * custom day/month cell renderers, and date disabling via `disabledDate` or
 * `validRange`.
 *
 * @param props - Unified DS CalendarProps (see Calendar.types.ts)
 * @returns A DaisyUI-styled calendar component
 */
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>((props, ref) => {
  const {
    value,
    defaultValue,
    mode: modeProp,
    defaultMode = 'month',
    fullscreen = true,
    validRange,
    disabledDate,
    dateCellRender,
    monthCellRender,
    onPanelChange,
    onChange,
    onSelect,
    className = '',
    style,
    id,
  } = props;

  // Controlled vs uncontrolled: when `value` is provided, the consumer owns
  // the selected date and we read from it on every render. Otherwise internal
  // state tracks the selection.
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<Date>(() => parseDate(defaultValue));
  const [mode, setMode] = useState<CalendarMode>(modeProp || defaultMode);

  const currentDate = isControlled ? parseDate(value) : internalValue;
  const today = new Date();

  // viewYear/viewMonth track which month page is displayed, independent of
  // the selected date. This lets the user browse to future/past months without
  // changing the selection.
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

  // Day 0 of the *next* month gives the last day of the current month.
  // This is a standard JS Date trick to get the count of days.
  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  // getDay() returns 0=Sunday..6=Saturday. This tells us how many blank cells
  // to render before the 1st of the month in the 7-column grid.
  const firstDayOfMonth = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay();
  }, [viewYear, viewMonth]);

  const isDateDisabled = useCallback((date: Date) => {
    if (disabledDate && disabledDate(date)) return true;
    if (validRange) {
      const [start, end] = validRange;
      if (date < start || date > end) return true;
    }
    return false;
  }, [disabledDate, validRange]);

  const handleDateClick = useCallback((day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    if (isDateDisabled(date)) return;

    if (!isControlled) {
      setInternalValue(date);
    }
    onChange?.(date);
    onSelect?.(date, { source: 'date' });
  }, [viewYear, viewMonth, isControlled, onChange, onSelect, isDateDisabled]);

  // Selecting a month in year view both selects the date AND switches back to
  // month view, so the user can drill down from year -> month -> day in sequence.
  const handleMonthClick = useCallback((month: number) => {
    const date = new Date(viewYear, month, 1);
    setViewMonth(month);

    if (!isControlled) {
      setInternalValue(date);
    }
    onChange?.(date);
    onSelect?.(date, { source: 'month' });
    setMode('month');
    onPanelChange?.(date, 'month');
  }, [viewYear, isControlled, onChange, onSelect, onPanelChange]);

  // Month navigation wraps around the year boundary: going before January
  // decrements the year and sets month to December, and vice versa.
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handlePrevYear = () => setViewYear((y) => y - 1);
  const handleNextYear = () => setViewYear((y) => y + 1);

  const handleModeChange = (newMode: CalendarMode) => {
    setMode(newMode);
    onPanelChange?.(currentDate, newMode);
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // Fullscreen fills the parent container; compact mode constrains to w-80
  // (320px) for use in popovers, sidebars, or date picker dropdowns.
  const containerClass = fullscreen ? 'w-full' : 'w-80';

  return (
    <div
      ref={ref}
      className={`rounded-lg p-4 ${containerClass} ${className}`}
      data-part="root"
      data-mode={mode}
      style={{ background: 'var(--ds-surface-card)', ...style }}
      id={id}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4" data-part="header">
        <div className="flex items-center gap-2">
          <button data-part="nav-button" data-direction="prev-year" style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }} onClick={handlePrevYear}>«</button>
          {mode === 'month' && <button data-part="nav-button" data-direction="prev-month" style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }} onClick={handlePrevMonth}>‹</button>}
        </div>
        <div className="flex items-center gap-2">
          <button
            data-part="mode-toggle"
            data-mode="month"
            data-active={mode === 'month' ? 'true' : 'false'}
            style={mode === 'month'
              ? { background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-on-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }
              : { background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }
            }
            onClick={() => handleModeChange('month')}
          >
            {MONTHS[viewMonth]} {viewYear}
          </button>
          <button
            data-part="mode-toggle"
            data-mode="year"
            data-active={mode === 'year' ? 'true' : 'false'}
            style={mode === 'year'
              ? { background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-on-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }
              : { background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }
            }
            onClick={() => handleModeChange('year')}
          >
            Year
          </button>
        </div>
        <div className="flex items-center gap-2">
          {mode === 'month' && <button data-part="nav-button" data-direction="next-month" style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }} onClick={handleNextMonth}>›</button>}
          <button data-part="nav-button" data-direction="next-year" style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer' }} onClick={handleNextYear}>»</button>
        </div>
      </div>

      {mode === 'month' ? (
        <>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-sm font-medium py-2" data-part="weekday-header" style={{ color: 'var(--ds-color-text-secondary)' }}>
                {fullscreen ? day : day.charAt(0)}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1" data-part="grid">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(viewYear, viewMonth, day);
              const isToday = isSameDay(date, today);
              const isSelected = isSameDay(date, currentDate);
              const isDisabled = isDateDisabled(date);

              return (
                <button
                  key={day}
                  data-part="cell"
                  data-selected={isSelected ? 'true' : 'false'}
                  data-today={isToday ? 'true' : 'false'}
                  data-disabled={isDisabled || undefined}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-lg
                    transition-colors relative
                    ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    ${isToday && !isSelected ? 'border' : ''}
                  `}
                  style={{
                    ...(isSelected
                      ? { background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-inverse)' }
                      : {}),
                    ...(isToday && !isSelected ? { borderColor: 'var(--ds-color-primary)' } : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !isDisabled) {
                      (e.currentTarget as HTMLElement).style.background = 'var(--ds-surface-inset)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isDisabled) {
                      (e.currentTarget as HTMLElement).style.background = '';
                    }
                  }}
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled}
                >
                  <span className={fullscreen ? 'text-sm' : 'text-xs'}>{day}</span>
                  {dateCellRender && (
                    <div className="absolute bottom-0 left-0 right-0 text-xs truncate" data-part="cell-content">
                      {dateCellRender(date)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        /* Year view - show months */
        <div className="grid grid-cols-3 gap-2" data-part="grid">
          {MONTHS.map((month, i) => {
            const date = new Date(viewYear, i, 1);
            const isCurrentMonth = i === today.getMonth() && viewYear === today.getFullYear();
            const isSelected = i === currentDate.getMonth() && viewYear === currentDate.getFullYear();

            return (
              <button
                key={month}
                data-part="cell"
                data-selected={isSelected ? 'true' : 'false'}
                data-today={isCurrentMonth ? 'true' : 'false'}
                className={`
                  p-4 rounded-lg text-center transition-colors
                  ${isCurrentMonth && !isSelected ? 'border' : ''}
                `}
                style={{
                  ...(isSelected
                    ? { background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-inverse)' }
                    : {}),
                  ...(isCurrentMonth && !isSelected ? { borderColor: 'var(--ds-color-primary)' } : {}),
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.background = 'var(--ds-surface-inset)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.background = '';
                  }
                }}
                onClick={() => handleMonthClick(i)}
              >
                <span className={fullscreen ? 'text-sm' : 'text-xs'}>{month}</span>
                {monthCellRender && (
                  <div className="mt-1 text-xs" data-part="cell-content">
                    {monthCellRender(date)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

Calendar.displayName = 'Calendar.Modern';

export default Calendar;
