'use client';

/**
 * Calendar - Hermes Engine (DaisyUI/Tailwind)
 */
import React, { useState, useMemo, useCallback } from 'react';
import type { CalendarProps, CalendarMode } from '../../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const parseDate = (value: Date | string | undefined): Date => {
  if (!value) return new Date();
  return typeof value === 'string' ? new Date(value) : value;
};

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

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<Date>(() => parseDate(defaultValue));
  const [mode, setMode] = useState<CalendarMode>(modeProp || defaultMode);

  const currentDate = isControlled ? parseDate(value) : internalValue;
  const today = new Date();

  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

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

  const containerClass = fullscreen ? 'w-full' : 'w-80';

  return (
    <div
      ref={ref}
      className={`bg-base-100 rounded-lg p-4 ${containerClass} ${className}`}
      style={style}
      id={id}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button className="btn btn-sm btn-ghost" onClick={handlePrevYear}>«</button>
          {mode === 'month' && <button className="btn btn-sm btn-ghost" onClick={handlePrevMonth}>‹</button>}
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`btn btn-sm ${mode === 'month' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleModeChange('month')}
          >
            {MONTHS[viewMonth]} {viewYear}
          </button>
          <button
            className={`btn btn-sm ${mode === 'year' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleModeChange('year')}
          >
            Year
          </button>
        </div>
        <div className="flex items-center gap-2">
          {mode === 'month' && <button className="btn btn-sm btn-ghost" onClick={handleNextMonth}>›</button>}
          <button className="btn btn-sm btn-ghost" onClick={handleNextYear}>»</button>
        </div>
      </div>

      {mode === 'month' ? (
        <>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-base-content/60 py-2">
                {fullscreen ? day : day.charAt(0)}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
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
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-lg
                    transition-colors relative
                    ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-base-200 cursor-pointer'}
                    ${isSelected ? 'bg-primary text-primary-content' : ''}
                    ${isToday && !isSelected ? 'border border-primary' : ''}
                  `}
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled}
                >
                  <span className={fullscreen ? 'text-sm' : 'text-xs'}>{day}</span>
                  {dateCellRender && (
                    <div className="absolute bottom-0 left-0 right-0 text-xs truncate">
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
        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((month, i) => {
            const date = new Date(viewYear, i, 1);
            const isCurrentMonth = i === today.getMonth() && viewYear === today.getFullYear();
            const isSelected = i === currentDate.getMonth() && viewYear === currentDate.getFullYear();

            return (
              <button
                key={month}
                className={`
                  p-4 rounded-lg text-center transition-colors
                  ${isSelected ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}
                  ${isCurrentMonth && !isSelected ? 'border border-primary' : ''}
                `}
                onClick={() => handleMonthClick(i)}
              >
                <span className={fullscreen ? 'text-sm' : 'text-xs'}>{month}</span>
                {monthCellRender && (
                  <div className="mt-1 text-xs">
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

Calendar.displayName = 'Calendar.Hermes';

export default Calendar;
