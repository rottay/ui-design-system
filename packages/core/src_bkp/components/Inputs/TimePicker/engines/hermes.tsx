/**
 * Hermes TimePicker Engine
 *
 * DaisyUI-based time picker implementation with unified TimePickerProps.
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

/**
 * Hermes TimePicker - DaisyUI implementation
 */
function HermesTimePicker({
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
  open: controlledOpen,
  disabledHours,
  disabledMinutes,
  disabledSeconds,
  onChange,
  onOpenChange,
  onFocus,
  onBlur,
  className = '',
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
          {allowClear && currentTime && !disabled && (
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {isDropdownOpen && (
        <div className="dropdown-content bg-base-100 rounded-box shadow-lg p-4 z-50 min-w-[200px] mt-1">
          <div className="flex gap-2 mb-4">
            {/* Hours */}
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-center mb-1 text-base-content/60">Hr</div>
              <div className="h-40 overflow-y-auto scrollbar-thin">
                {hours.map((hour) => {
                  const displayHour = use12Hours ? (hour === 0 ? 12 : hour) : hour;
                  const isDisabled = isHourDisabled(use12Hours ? hour : displayHour);

                  return (
                    <button
                      key={hour}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedHour(use12Hours && hour === 12 ? 0 : hour)}
                      className={[
                        'btn btn-sm btn-ghost w-12',
                        selectedHour === hour ? 'btn-active' : '',
                        isDisabled ? 'btn-disabled' : '',
                      ].join(' ')}
                    >
                      {String(displayHour).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes */}
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-center mb-1 text-base-content/60">Min</div>
              <div className="h-40 overflow-y-auto scrollbar-thin">
                {minutes.map((minute) => {
                  const isDisabled = isMinuteDisabled(minute);

                  return (
                    <button
                      key={minute}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedMinute(minute)}
                      className={[
                        'btn btn-sm btn-ghost w-12',
                        selectedMinute === minute ? 'btn-active' : '',
                        isDisabled ? 'btn-disabled' : '',
                      ].join(' ')}
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
                <div className="text-xs font-semibold text-center mb-1 text-base-content/60">Sec</div>
                <div className="h-40 overflow-y-auto scrollbar-thin">
                  {seconds.map((second) => {
                    const isDisabled = isSecondDisabled(second);

                    return (
                      <button
                        key={second}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedSecond(second)}
                        className={[
                          'btn btn-sm btn-ghost w-12',
                          selectedSecond === second ? 'btn-active' : '',
                          isDisabled ? 'btn-disabled' : '',
                        ].join(' ')}
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
                <div className="text-xs font-semibold text-center mb-1 text-base-content/60">-</div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedHour >= 12) {
                        setSelectedHour(selectedHour - 12);
                      }
                    }}
                    className={[
                      'btn btn-sm btn-ghost',
                      selectedHour < 12 ? 'btn-active' : '',
                    ].join(' ')}
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
                    className={[
                      'btn btn-sm btn-ghost',
                      selectedHour >= 12 ? 'btn-active' : '',
                    ].join(' ')}
                  >
                    PM
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-2 pt-3 border-t">
            {showNow && (
              <button type="button" className="btn btn-ghost btn-sm flex-1" onClick={handleNow}>
                Now
              </button>
            )}
            <button type="button" className="btn btn-primary btn-sm flex-1" onClick={handleConfirm}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

HermesTimePicker.displayName = 'HermesTimePicker';

export default HermesTimePicker;
