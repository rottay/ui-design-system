/**
 * Apollo TimePicker Engine
 *
 * Native HTML + Tailwind CSS time picker implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { TimePickerProps } from '../../../../types/components/timepicker';
import {
  toTime,
  formatTime,
  generateHours,
  generateMinutesOrSeconds,
} from '../../../../types/components/timepicker';
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

/**
 * Apollo TimePicker - Native HTML + Tailwind implementation
 */
function ApolloTimePicker({
  value,
  defaultValue,
  placeholder = 'Select time',
  disabled,
  format: timeFormat = 'HH:mm:ss',
  use12Hours = false,
  hourStep = 1,
  minuteStep = 1,
  secondStep = 1,
  hideDisabledOptions = false,
  showNow = true,
  size = 'middle',
  status,
  allowClear = true,
  bordered = true,
  open: controlledOpen,
  disabledHours,
  disabledMinutes,
  disabledSeconds,
  onChange,
  onOpenChange,
  onFocus,
  onBlur,
  className,
  style,
  id,
  name,
  autoFocus,
}: TimePickerProps) {
  // State
  const [selectedTime, setSelectedTime] = useState<Date | null>(() => toTime(defaultValue ?? null));
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number>(
    () => toTime(defaultValue ?? null)?.getHours() ?? 0
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(
    () => toTime(defaultValue ?? null)?.getMinutes() ?? 0
  );
  const [selectedSecond, setSelectedSecond] = useState<number>(
    () => toTime(defaultValue ?? null)?.getSeconds() ?? 0
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Controlled
  const isControlled = value !== undefined;
  const currentTime = isControlled ? toTime(value) : selectedTime;
  const isDropdownOpen = controlledOpen !== undefined ? controlledOpen : isOpen;

  // Update selection from current value
  useEffect(() => {
    if (currentTime) {
      setSelectedHour(currentTime.getHours());
      setSelectedMinute(currentTime.getMinutes());
      setSelectedSecond(currentTime.getSeconds());
    }
  }, [currentTime]);

  // Open/close dropdown
  const openDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      onOpenChange?.(true);
    }
  }, [disabled, onOpenChange]);

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

  // Check if time is disabled
  const isHourDisabled = (hour: number): boolean => {
    if (!disabledHours) return false;
    return disabledHours().includes(hour);
  };

  const isMinuteDisabled = (minute: number): boolean => {
    if (!disabledMinutes) return false;
    return disabledMinutes(selectedHour).includes(minute);
  };

  const isSecondDisabled = (second: number): boolean => {
    if (!disabledSeconds) return false;
    return disabledSeconds(selectedHour, selectedMinute).includes(second);
  };

  // Generate options
  const hours = generateHours(use12Hours).filter((h) =>
    hideDisabledOptions ? !isHourDisabled(h) : true
  );
  const minutes = generateMinutesOrSeconds(minuteStep).filter((m) =>
    hideDisabledOptions ? !isMinuteDisabled(m) : true
  );
  const showSeconds = timeFormat.includes('s');
  const seconds = showSeconds
    ? generateMinutesOrSeconds(secondStep).filter((s) =>
        hideDisabledOptions ? !isSecondDisabled(s) : true
      )
    : [];

  // Handle selection
  const handleConfirm = () => {
    const newTime = new Date();
    newTime.setHours(selectedHour, selectedMinute, selectedSecond, 0);

    if (!isControlled) {
      setSelectedTime(newTime);
    }

    const timeString = formatTime(newTime, timeFormat);
    onChange?.(newTime, timeString);
    closeDropdown();
  };

  // Handle Now
  const handleNow = () => {
    const now = new Date();
    setSelectedHour(now.getHours());
    setSelectedMinute(now.getMinutes());
    setSelectedSecond(now.getSeconds());
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isControlled) {
      setSelectedTime(null);
    }
    onChange?.(null, '');
  };

  // Format display value
  const displayValue = currentTime ? formatTime(currentTime, timeFormat) : '';

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
          {allowClear && currentTime && !disabled && (
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {isDropdownOpen && (
        <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[200px]">
          <div className="flex gap-2 mb-4">
            {/* Hours */}
            <div className="flex flex-col">
              <div className="text-xs font-medium text-center mb-1 text-gray-500">Hr</div>
              <div className="h-40 overflow-y-auto">
                {hours.map((hour) => {
                  const displayHour = use12Hours ? (hour === 0 ? 12 : hour) : hour;
                  const isDisabled = isHourDisabled(use12Hours ? hour : displayHour);

                  return (
                    <button
                      key={hour}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedHour(use12Hours && hour === 12 ? 0 : hour)}
                      className={cn(
                        'w-10 py-1 rounded text-sm font-medium transition-colors',
                        selectedHour === hour
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 text-gray-900',
                        isDisabled && 'opacity-30 cursor-not-allowed'
                      )}
                    >
                      {String(displayHour).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes */}
            <div className="flex flex-col">
              <div className="text-xs font-medium text-center mb-1 text-gray-500">Min</div>
              <div className="h-40 overflow-y-auto">
                {minutes.map((minute) => {
                  const isDisabled = isMinuteDisabled(minute);

                  return (
                    <button
                      key={minute}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedMinute(minute)}
                      className={cn(
                        'w-10 py-1 rounded text-sm font-medium transition-colors',
                        selectedMinute === minute
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 text-gray-900',
                        isDisabled && 'opacity-30 cursor-not-allowed'
                      )}
                    >
                      {String(minute).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seconds */}
            {showSeconds && (
              <div className="flex flex-col">
                <div className="text-xs font-medium text-center mb-1 text-gray-500">Sec</div>
                <div className="h-40 overflow-y-auto">
                  {seconds.map((second) => {
                    const isDisabled = isSecondDisabled(second);

                    return (
                      <button
                        key={second}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedSecond(second)}
                        className={cn(
                          'w-10 py-1 rounded text-sm font-medium transition-colors',
                          selectedSecond === second
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100 text-gray-900',
                          isDisabled && 'opacity-30 cursor-not-allowed'
                        )}
                      >
                        {String(second).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AM/PM */}
            {use12Hours && (
              <div className="flex flex-col">
                <div className="text-xs font-medium text-center mb-1 text-gray-500">-</div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedHour >= 12) {
                        setSelectedHour(selectedHour - 12);
                      }
                    }}
                    className={cn(
                      'px-2 py-1 rounded text-sm font-medium transition-colors',
                      selectedHour < 12
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 text-gray-900'
                    )}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedHour < 12) {
                        setSelectedHour(selectedHour + 12);
                      }
                    }}
                    className={cn(
                      'px-2 py-1 rounded text-sm font-medium transition-colors',
                      selectedHour >= 12
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 text-gray-900'
                    )}
                  >
                    PM
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            {showNow && (
              <button
                type="button"
                className="flex-1 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                onClick={handleNow}
              >
                Now
              </button>
            )}
            <button
              type="button"
              className="flex-1 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
              onClick={handleConfirm}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

ApolloTimePicker.displayName = 'ApolloTimePicker';

export default ApolloTimePicker;
