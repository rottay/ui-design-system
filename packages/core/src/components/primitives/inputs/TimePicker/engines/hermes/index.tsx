'use client';

/**
 * TimePicker - Hermes Engine (DaisyUI/Tailwind)
 */
import React, { useState } from 'react';
import type { TimePickerProps, TimeRangePickerProps } from '../../types';

const sizeClasses = {
  small: 'input-sm',
  default: 'input-md',
  large: 'input-lg',
};

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

  const parseTime = (val: Date | string | null | undefined): string => {
    if (!val) return '';
    if (typeof val === 'string') {
      // If already a time string, return as is
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(val)) return val;
      // Try to parse as date
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        return date.toTimeString().slice(0, 8);
      }
      return '';
    }
    return val.toTimeString().slice(0, 8);
  };

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(() => parseTime(defaultValue));

  const displayValue = isControlled ? parseTime(value) : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value;
    // Create a Date object with today's date and the selected time
    const today = new Date();
    const [hours, minutes, seconds = '00'] = timeStr.split(':');
    today.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));

    if (!isControlled) {
      setInternalValue(timeStr);
    }
    onChange?.(today, timeStr);
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    onChange?.(null, '');
  };

  const sizeClass = sizeClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
  const statusClass = status === 'error' ? 'input-error' : status === 'warning' ? 'input-warning' : '';

  // Determine input step based on format
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

TimePickerBase.displayName = 'TimePicker.Hermes';

// TimeRangePicker component
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

  const createDate = (timeStr: string): Date | null => {
    if (!timeStr) return null;
    const today = new Date();
    const [hours, minutes, seconds = '00'] = timeStr.split(':');
    today.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
    return today;
  };

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

TimeRangePicker.displayName = 'TimePicker.RangePicker.Hermes';

// Compound component
export const TimePicker = Object.assign(TimePickerBase, {
  RangePicker: TimeRangePicker,
});

export default TimePicker;
