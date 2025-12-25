'use client';

/**
 * Hermes Calendar Engine
 *
 * DaisyUI implementation with unified props interface.
 */

import { useState, useMemo, useCallback } from 'react';
import type { CalendarProps, CalendarMode } from '../types';
import {
  getCalendarGrid,
  getMonthsGrid,
  isSameDay,
  isToday,
  DEFAULT_WEEKDAYS,
  DEFAULT_MONTHS,
} from '../../../../types/components/calendar';

/**
 * Hermes Calendar Component
 *
 * DaisyUI-styled calendar display.
 */
export default function HermesCalendar(props: CalendarProps) {
  const {
    value: controlledValue,
    defaultValue,
    mode: controlledMode,
    fullscreen = true,
    headerRender,
    cellRender,
    dateCellRender,
    monthCellRender,
    onSelect,
    onChange,
    onPanelChange,
    disabledDate,
    validRange,
    className = '',
    style,
  } = props;

  // State
  const [internalValue, setInternalValue] = useState<Date>(defaultValue ?? new Date());
  const [internalMode, setInternalMode] = useState<CalendarMode>(controlledMode ?? 'month');

  const selectedDate = controlledValue ?? internalValue;
  const mode = controlledMode ?? internalMode;

  // Navigation state (which month/year we're viewing)
  const [viewDate, setViewDate] = useState<Date>(selectedDate);

  // Handlers
  const handleDateSelect = useCallback((date: Date) => {
    if (disabledDate?.(date)) return;
    if (validRange) {
      const [start, end] = validRange;
      if (date < start || date > end) return;
    }

    if (!controlledValue) {
      setInternalValue(date);
    }
    setViewDate(date);
    onSelect?.(date);
    onChange?.(date);
  }, [controlledValue, disabledDate, validRange, onSelect, onChange]);

  const handleMonthSelect = useCallback((date: Date) => {
    setViewDate(date);
    if (mode === 'year') {
      setInternalMode('month');
      onPanelChange?.(date, 'month');
    }
  }, [mode, onPanelChange]);

  const handleModeChange = useCallback((newMode: CalendarMode) => {
    if (!controlledMode) {
      setInternalMode(newMode);
    }
    onPanelChange?.(viewDate, newMode);
  }, [controlledMode, viewDate, onPanelChange]);

  const handlePrevMonth = useCallback(() => {
    const newDate = new Date(viewDate);
    if (mode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setViewDate(newDate);
  }, [viewDate, mode]);

  const handleNextMonth = useCallback(() => {
    const newDate = new Date(viewDate);
    if (mode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setViewDate(newDate);
  }, [viewDate, mode]);

  // Calendar grid
  const calendarGrid = useMemo(() => getCalendarGrid(viewDate), [viewDate]);
  const monthsGrid = useMemo(() => getMonthsGrid(viewDate), [viewDate]);

  // Custom header render
  if (headerRender) {
    const headerContent = headerRender({
      value: viewDate,
      type: mode,
      onChange: (date) => {
        setViewDate(date);
        handleDateSelect(date);
      },
      onTypeChange: handleModeChange,
    });

    return (
      <div className={`${fullscreen ? '' : 'w-80'} ${className}`} style={style}>
        {headerContent}
        {renderBody()}
      </div>
    );
  }

  function renderBody() {
    if (mode === 'month') {
      return (
        <div className="p-2">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DEFAULT_WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-sm text-base-content/60 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          {calendarGrid.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((date, dayIndex) => {
                if (!date) {
                  return <div key={dayIndex} className="p-2" />;
                }

                const isSelected = isSameDay(date, selectedDate);
                const isTodayDate = isToday(date);
                const isDisabled = disabledDate?.(date) ?? false;

                return (
                  <button
                    key={dayIndex}
                    type="button"
                    className={`
                      p-2 text-center rounded transition-colors
                      ${isSelected ? 'bg-primary text-primary-content' : ''}
                      ${isTodayDate && !isSelected ? 'ring-1 ring-primary' : ''}
                      ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-base-200'}
                    `}
                    onClick={() => handleDateSelect(date)}
                    disabled={isDisabled}
                  >
                    {dateCellRender ? dateCellRender(date) : (
                      cellRender ? cellRender(date, { type: 'month' }) : date.getDate()
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      );
    }

    // Year mode - show months
    return (
      <div className="p-4">
        {monthsGrid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-2 mb-2">
            {row.map((date, colIndex) => {
              const isCurrentMonth = date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear();

              return (
                <button
                  key={colIndex}
                  type="button"
                  className={`
                    p-3 text-center rounded transition-colors
                    ${isCurrentMonth ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}
                  `}
                  onClick={() => handleMonthSelect(date)}
                >
                  {monthCellRender ? monthCellRender(date) : (
                    cellRender ? cellRender(date, { type: 'year' }) : DEFAULT_MONTHS[date.getMonth()]
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`card bg-base-100 ${fullscreen ? '' : 'w-80'} ${className}`} style={style}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-200">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handlePrevMonth}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => handleModeChange(mode === 'month' ? 'year' : 'month')}
          >
            {DEFAULT_MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
          </button>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleNextMonth}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Body */}
      {renderBody()}
    </div>
  );
}
