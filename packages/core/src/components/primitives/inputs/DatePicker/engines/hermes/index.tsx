'use client';

/**
 * DatePicker - Hermes Engine (DaisyUI/Tailwind)
 */
import React, { useState } from 'react';
import type { DatePickerProps, RangePickerProps } from '../../types';

const sizeClasses = {
  small: 'input-sm',
  default: 'input-md',
  large: 'input-lg',
};

const DatePickerBase = React.forwardRef<HTMLInputElement, DatePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    picker = 'date',
    format: _format,
    disabled = false,
    size = 'default',
    status,
    placeholder = 'Select date',
    allowClear = true,
    onChange,
    className = '',
    style,
    autoFocus,
    id,
    name,
  } = props;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(() => {
    if (defaultValue) {
      return defaultValue instanceof Date
        ? defaultValue.toISOString().split('T')[0]
        : String(defaultValue);
    }
    return '';
  });

  const displayValue = isControlled
    ? (value instanceof Date ? value.toISOString().split('T')[0] : String(value || ''))
    : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    const date = dateStr ? new Date(dateStr) : null;

    if (!isControlled) {
      setInternalValue(dateStr);
    }
    onChange?.(date, dateStr);
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    onChange?.(null, '');
  };

  const getInputType = () => {
    switch (picker) {
      case 'month':
        return 'month';
      case 'year':
        return 'number';
      case 'week':
        return 'week';
      default:
        return 'date';
    }
  };

  const sizeClass = sizeClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
  const statusClass = status === 'error' ? 'input-error' : status === 'warning' ? 'input-warning' : '';

  return (
    <div className="relative inline-flex items-center" style={style}>
      <input
        ref={ref}
        type={getInputType()}
        className={`input input-bordered ${sizeClass} ${statusClass} ${className}`}
        value={displayValue}
        disabled={disabled}
        placeholder={placeholder}
        onChange={handleChange}
        autoFocus={autoFocus}
        id={id}
        name={name}
        min={picker === 'year' ? 1900 : undefined}
        max={picker === 'year' ? 2100 : undefined}
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
      <span className="absolute right-2 text-base-content/50">📅</span>
    </div>
  );
});

DatePickerBase.displayName = 'DatePicker.Hermes';

// RangePicker component
const RangePicker = React.forwardRef<HTMLDivElement, RangePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    disabled = false,
    size = 'default',
    status,
    placeholder = ['Start date', 'End date'],
    separator = '→',
    allowClear: _allowClear = true,
    onChange,
    className = '',
    style,
    id,
  } = props;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<[string, string]>(() => {
    if (defaultValue) {
      return [
        defaultValue[0] instanceof Date ? defaultValue[0].toISOString().split('T')[0] : String(defaultValue[0]),
        defaultValue[1] instanceof Date ? defaultValue[1].toISOString().split('T')[0] : String(defaultValue[1]),
      ];
    }
    return ['', ''];
  });

  const displayValue = isControlled
    ? [
        value?.[0] instanceof Date ? value[0].toISOString().split('T')[0] : String(value?.[0] || ''),
        value?.[1] instanceof Date ? value[1].toISOString().split('T')[0] : String(value?.[1] || ''),
      ] as [string, string]
    : internalValue;

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    const date = dateStr ? new Date(dateStr) : null;
    const newValue: [string, string] = [dateStr, displayValue[1]];

    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(
      [date, displayValue[1] ? new Date(displayValue[1]) : null],
      newValue
    );
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    const date = dateStr ? new Date(dateStr) : null;
    const newValue: [string, string] = [displayValue[0], dateStr];

    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(
      [displayValue[0] ? new Date(displayValue[0]) : null, date],
      newValue
    );
  };

  const sizeClass = sizeClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
  const statusClass = status === 'error' ? 'input-error' : status === 'warning' ? 'input-warning' : '';

  return (
    <div ref={ref} className={`inline-flex items-center gap-2 ${className}`} style={style} id={id}>
      <input
        type="date"
        className={`input input-bordered ${sizeClass} ${statusClass}`}
        value={displayValue[0]}
        disabled={disabled}
        placeholder={placeholder[0]}
        onChange={handleStartChange}
      />
      <span className="text-base-content/60">{separator}</span>
      <input
        type="date"
        className={`input input-bordered ${sizeClass} ${statusClass}`}
        value={displayValue[1]}
        disabled={disabled}
        placeholder={placeholder[1]}
        onChange={handleEndChange}
      />
    </div>
  );
});

RangePicker.displayName = 'DatePicker.RangePicker.Hermes';

// Compound component
export const DatePicker = Object.assign(DatePickerBase, {
  RangePicker,
});

export default DatePicker;
