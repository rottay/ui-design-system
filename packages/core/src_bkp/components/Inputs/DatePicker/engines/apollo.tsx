/**
 * Apollo DatePicker Engine
 *
 * Native HTML + Tailwind CSS datepicker implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { DatePickerProps } from '../../../../types/components/datepicker';
import {
  toDate,
  formatDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  isSameDay,
} from '../../../../types/components/datepicker';
import { cn } from '../../../../utils/cn';

/**
 * Size styles
 */
const sizeStyles = {
  small: 'px-2 py-1 text-sm',
  middle: 'px-3 py-2 text-base',
  large: 'px-4 py-3 text-lg',
};

/**
 * Status styles
 */
const statusStyles = {
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  warning: 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500',
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Apollo DatePicker - Native HTML + Tailwind implementation
 */
function ApolloDatePicker({
  value,
  defaultValue,
  placeholder = 'Select date',
  disabled,
  picker = 'date',
  showToday = true,
  size = 'middle',
  status,
  allowClear = true,
  bordered = true,
  format: dateFormat = 'YYYY-MM-DD',
  open: controlledOpen,
  minDate,
  maxDate,
  disabledDate,
  presets,
  onChange,
  onOpenChange,
  onFocus,
  onBlur,
  className,
  style,
  id,
  name,
  autoFocus,
}: DatePickerProps) {
  // State
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => toDate(defaultValue ?? null));
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => toDate(defaultValue ?? null) ?? new Date());

  const containerRef = useRef<HTMLDivElement>(null);

  // Controlled
  const isControlled = value !== undefined;
  const currentDate = isControlled ? toDate(value) : selectedDate;
  const isDropdownOpen = controlledOpen !== undefined ? controlledOpen : isOpen;

  // Open/close dropdown
  const openDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      onOpenChange?.(true);
      if (currentDate) {
        setViewDate(currentDate);
      }
    }
  }, [disabled, onOpenChange, currentDate]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

  // Check if date is disabled
  const isDateDisabled = useCallback((date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (disabledDate) return disabledDate(date);
    return false;
  }, [minDate, maxDate, disabledDate]);

  // Handle date selection
  const handleSelectDate = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (!isControlled) {
      setSelectedDate(date);
    }

    const dateString = formatDate(date, Array.isArray(dateFormat) ? dateFormat[0] : dateFormat);
    onChange?.(date, dateString);
    closeDropdown();
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isControlled) {
      setSelectedDate(null);
    }
    onChange?.(null, '');
  };

  // Navigation
  const goToPrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToPrevYear = () => {
    setViewDate((prev) => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
  };

  const goToNextYear = () => {
    setViewDate((prev) => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days: (Date | null)[] = [];

    // Empty slots for days before start
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Format display value
  const displayValue = currentDate
    ? formatDate(currentDate, Array.isArray(dateFormat) ? dateFormat[0] : dateFormat)
    : '';

  return (
    <div ref={containerRef} className="relative w-full" style={style}>
      <div className="relative">
        <input
          type="text"
          id={id}
          name={name}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          readOnly
          onClick={openDropdown}
          onFocus={(e) => {
            openDropdown();
            onFocus?.(e);
          }}
          onBlur={onBlur}
          className={cn(
            'w-full rounded-md transition-colors cursor-pointer pr-10',
            'focus:outline-none focus:ring-2',
            bordered
              ? 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
              : 'border-transparent',
            sizeStyles[size],
            status && statusStyles[status],
            disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
            className
          )}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {allowClear && currentDate && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              tabIndex={-1}
            >
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {isDropdownOpen && (
        <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[280px]">
          {/* Presets */}
          {presets && presets.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b border-gray-100">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="px-2 py-1 text-xs rounded hover:bg-gray-100 text-gray-700 transition-colors"
                  onClick={() => {
                    const date = typeof preset.value === 'function' ? preset.value() : preset.value;
                    handleSelectDate(date);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                onClick={goToPrevYear}
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                onClick={goToPrevMonth}
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            <span className="font-semibold text-gray-900">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                onClick={goToNextMonth}
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                onClick={goToNextYear}
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="p-2" />;
              }

              const isSelected = currentDate && isSameDay(date, currentDate);
              const isToday = isSameDay(date, new Date());
              const isDisabledDay = isDateDisabled(date);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  disabled={isDisabledDay}
                  onClick={() => handleSelectDate(date)}
                  className={cn(
                    'w-8 h-8 rounded-md text-sm font-medium transition-colors',
                    'flex items-center justify-center',
                    isSelected && 'bg-blue-600 text-white hover:bg-blue-700',
                    !isSelected && isToday && 'ring-1 ring-blue-500 text-blue-600',
                    !isSelected && !isToday && 'hover:bg-gray-100 text-gray-900',
                    isDisabledDay && 'opacity-30 cursor-not-allowed hover:bg-transparent'
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Today button */}
          {showToday && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                className="w-full py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                onClick={() => handleSelectDate(new Date())}
              >
                Today
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

ApolloDatePicker.displayName = 'ApolloDatePicker';

export default ApolloDatePicker;
