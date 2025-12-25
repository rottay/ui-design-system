/**
 * Hermes DatePicker Engine
 *
 * DaisyUI-based datepicker implementation with unified DatePickerProps.
 * Uses native HTML date input with DaisyUI styling.
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

/**
 * Map size to DaisyUI input classes
 */
const sizeClasses = {
  small: 'input-sm',
  middle: '',
  large: 'input-lg',
};

/**
 * Map status to DaisyUI classes
 */
const statusClasses = {
  error: 'input-error',
  warning: 'input-warning',
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Hermes DatePicker - DaisyUI implementation
 */
function HermesDatePicker({
  value,
  defaultValue,
  placeholder = 'Select date',
  disabled,
  picker = 'date',
  showToday = true,
  size = 'middle',
  status,
  allowClear = true,
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
  className = '',
  style,
  id,
  name,
  autoFocus,
}: DatePickerProps) {
  // State
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => toDate(defaultValue ?? null));
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => toDate(defaultValue ?? null) ?? new Date());
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>(
    picker === 'year' ? 'years' : picker === 'month' ? 'months' : 'days'
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Classes
  const inputClasses = [
    'input',
    'input-bordered',
    'w-full',
    sizeClasses[size],
    status && statusClasses[status],
    'cursor-pointer',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={containerRef} className="dropdown w-full" style={style}>
      <div className="relative">
        <input
          ref={inputRef}
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
          className={inputClasses}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {allowClear && currentDate && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-ghost btn-xs btn-circle"
              tabIndex={-1}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg className="w-4 h-4 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {isDropdownOpen && (
        <div className="dropdown-content bg-base-100 rounded-box shadow-lg p-4 z-50 min-w-[280px] mt-1">
          {/* Presets */}
          {presets && presets.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-xs btn-ghost"
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
            <button type="button" className="btn btn-ghost btn-xs" onClick={goToPrevYear}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button type="button" className="btn btn-ghost btn-xs" onClick={goToPrevMonth}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm font-semibold"
              onClick={() => setViewMode(viewMode === 'days' ? 'months' : 'days')}
            >
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </button>

            <button type="button" className="btn btn-ghost btn-xs" onClick={goToNextMonth}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button type="button" className="btn btn-ghost btn-xs" onClick={goToNextYear}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-base-content/60 py-1">
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
              const isDisabled = isDateDisabled(date);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDate(date)}
                  className={[
                    'btn btn-sm btn-square',
                    isSelected ? 'btn-primary' : 'btn-ghost',
                    isToday && !isSelected ? 'ring-1 ring-primary' : '',
                    isDisabled ? 'btn-disabled opacity-30' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Today button */}
          {showToday && (
            <div className="mt-3 pt-3 border-t">
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-block"
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

HermesDatePicker.displayName = 'HermesDatePicker';

export default HermesDatePicker;
