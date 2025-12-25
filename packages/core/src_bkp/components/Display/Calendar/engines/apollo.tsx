'use client';

/**
 * Apollo Calendar Engine
 *
 * Native HTML + Tailwind implementation with unified props interface.
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
 * Apollo Calendar Component
 *
 * Pure Tailwind-styled calendar display.
 */
export default function ApolloCalendar(props: CalendarProps) {
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

  // Navigation state
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
      <div className={`bg-white rounded-lg shadow ${fullscreen ? '' : 'w-80'} ${className}`} style={style}>
        {headerContent}
        {renderBody()}
      </div>
    );
  }

  function renderBody() {
    if (mode === 'month') {
      return (
        <div className="p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DEFAULT_WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
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
                      p-2 text-center text-sm rounded-md transition-colors
                      ${isSelected ? 'bg-blue-500 text-white' : ''}
                      ${isTodayDate && !isSelected ? 'ring-1 ring-blue-500 text-blue-500' : ''}
                      ${!isSelected && !isTodayDate ? 'text-gray-700' : ''}
                      ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'}
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
                    p-3 text-center text-sm rounded-md transition-colors
                    ${isCurrentMonth ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-700'}
                  `}
                  onClick={() => handleMonthSelect(date)}
                >
                  {monthCellRender ? monthCellRender(date) : (
                    cellRender ? cellRender(date, { type: 'year' }) : DEFAULT_MONTHS[date.getMonth()].slice(0, 3)
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
    <div className={`bg-white rounded-lg shadow ${fullscreen ? '' : 'w-80'} ${className}`} style={style}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          type="button"
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          onClick={handlePrevMonth}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button
          type="button"
          className="font-medium text-gray-900 hover:bg-gray-100 px-3 py-1 rounded-md transition-colors"
          onClick={() => handleModeChange(mode === 'month' ? 'year' : 'month')}
        >
          {DEFAULT_MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </button>

        <button
          type="button"
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          onClick={handleNextMonth}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Body */}
      {renderBody()}
    </div>
  );
}
