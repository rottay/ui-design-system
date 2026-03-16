'use client';

/**
 * @fileoverview TimePicker Modern Engine -- DaisyUI/Tailwind with native time inputs.
 * Uses the browser's built-in `<input type="time">` for time selection,
 * styled with DaisyUI's `input` classes. Includes a compound
 * `TimePicker.RangePicker` sub-component with two paired time inputs.
 *
 * @example
 * ```tsx
 * <TimePicker engine="modern" format="HH:mm" size="default" />
 * ```
 *
 * @module TimePicker/Engines/Modern
 * @category Inputs
 * @package @rottay/design-system
 */
import React, { useState } from 'react';
import type { TimePickerProps, TimeRangePickerProps } from '../TimePicker.types';

/** Maps DS size values to DaisyUI input size modifier classes. */
const sizeClasses = {
  small: 'input-sm',
  default: 'input-md',
  large: 'input-lg',
};

/**
 * Modern engine TimePicker -- native `<input type="time">` with DaisyUI styling.
 *
 * Parses incoming `Date | string` values into time strings for the native input
 * and converts them back to Date objects on change. The `step` attribute is set
 * to 1 (second precision) or 60 (minute precision) based on the format prop.
 *
 * @param props - {@link TimePickerProps} unified time picker props.
 * @returns A ref-forwarding time input with DaisyUI styling.
 */
const TimePickerBase = React.forwardRef<HTMLInputElement, TimePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    format = 'HH:mm:ss',
    disabled = false,
    size = 'default',
    status,
    placeholder = 'Select time',
    allowClear = true,
    onChange,
    className = '',
    style,
    autoFocus,
    id,
    name,
  } = props;

  /**
   * Normalises a Date or string into an "HH:mm:ss" time string.
   * Accepts bare time strings, ISO date strings, and Date objects.
   */
  const parseTime = (val: Date | string | null | undefined): string => {
    if (!val) return '';
    if (typeof val === 'string') {
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(val)) return val;
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        return date.toTimeString().slice(0, 8);
      }
      return '';
    }
    return val.toTimeString().slice(0, 8);
  };

  // Controlled vs uncontrolled: external `value` takes precedence
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(() => parseTime(defaultValue));

  const displayValue = isControlled ? parseTime(value) : internalValue;

  // Construct a full Date anchored to today so the caller receives a usable Date object
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value;
    const today = new Date();
    const [hours, minutes, seconds = '00'] = timeStr.split(':');
    today.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));

    if (!isControlled) {
      setInternalValue(timeStr);
    }
    onChange?.(today, timeStr);
  };

  /** Clears the time value and notifies parent with null. */
  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    onChange?.(null, '');
  };

  const sizeClass = sizeClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
  const statusClass = status === 'error' ? 'input-error' : status === 'warning' ? 'input-warning' : '';

  // step=1 shows second spinners in the native picker; step=60 hides them
  const showSeconds = format.includes('ss') || format.includes('s');

  return (
    <div className="relative inline-flex items-center" style={style}>
      <input
        ref={ref}
        type="time"
        step={showSeconds ? 1 : 60}
        className={`input input-bordered ${sizeClass} ${statusClass} ${className}`}
        value={displayValue}
        disabled={disabled}
        placeholder={placeholder}
        onChange={handleChange}
        autoFocus={autoFocus}
        id={id}
        name={name}
      />
      {allowClear && displayValue && !disabled && (
        <button
          type="button"
          className="absolute right-8 btn btn-xs btn-ghost btn-circle"
          onClick={handleClear}
          tabIndex={-1}
        >
          ×
        </button>
      )}
      <span className="absolute right-2 text-base-content/50">🕐</span>
    </div>
  );
});

TimePickerBase.displayName = 'TimePicker.Modern';

/**
 * Range variant with two paired native time inputs and a separator.
 * Each input independently updates its half of the `[start, end]` tuple.
 *
 * @param props - {@link TimeRangePickerProps} unified range picker props.
 * @returns A ref-forwarding time range input pair with DaisyUI styling.
 */
const TimeRangePicker = React.forwardRef<HTMLDivElement, TimeRangePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    format = 'HH:mm:ss',
    disabled = false,
    size = 'default',
    status,
    placeholder = ['Start time', 'End time'],
    separator = '→',
    onChange,
    className = '',
    style,
    id,
  } = props;

  const parseTime = (val: Date | string | null | undefined): string => {
    if (!val) return '';
    if (typeof val === 'string') {
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(val)) return val;
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        return date.toTimeString().slice(0, 8);
      }
      return '';
    }
    return val.toTimeString().slice(0, 8);
  };

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<[string, string]>(() => {
    if (defaultValue) {
      return [parseTime(defaultValue[0]), parseTime(defaultValue[1])];
    }
    return ['', ''];
  });

  const displayValue = isControlled
    ? [parseTime(value?.[0]), parseTime(value?.[1])] as [string, string]
    : internalValue;

  /** Converts a time string to a Date anchored to today, or null if empty. */
  const createDate = (timeStr: string): Date | null => {
    if (!timeStr) return null;
    const today = new Date();
    const [hours, minutes, seconds = '00'] = timeStr.split(':');
    today.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
    return today;
  };

  // Start input change preserves the current end value
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value;
    const newValue: [string, string] = [timeStr, displayValue[1]];

    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(
      [createDate(timeStr), createDate(displayValue[1])],
      newValue
    );
  };

  // End input change preserves the current start value
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value;
    const newValue: [string, string] = [displayValue[0], timeStr];

    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(
      [createDate(displayValue[0]), createDate(timeStr)],
      newValue
    );
  };

  const sizeClass = sizeClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
  const statusClass = status === 'error' ? 'input-error' : status === 'warning' ? 'input-warning' : '';
  const showSeconds = format.includes('ss') || format.includes('s');

  return (
    <div ref={ref} className={`inline-flex items-center gap-2 ${className}`} style={style} id={id}>
      <input
        type="time"
        step={showSeconds ? 1 : 60}
        className={`input input-bordered ${sizeClass} ${statusClass}`}
        value={displayValue[0]}
        disabled={disabled}
        placeholder={placeholder[0]}
        onChange={handleStartChange}
      />
      <span className="text-base-content/60">{separator}</span>
      <input
        type="time"
        step={showSeconds ? 1 : 60}
        className={`input input-bordered ${sizeClass} ${statusClass}`}
        value={displayValue[1]}
        disabled={disabled}
        placeholder={placeholder[1]}
        onChange={handleEndChange}
      />
    </div>
  );
});

TimeRangePicker.displayName = 'TimePicker.RangePicker.Modern';

// Compound component: TimePicker.RangePicker mirrors AntD's compound API
export const TimePicker = Object.assign(TimePickerBase, {
  RangePicker: TimeRangePicker,
});

export default TimePicker;
