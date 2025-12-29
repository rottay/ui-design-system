'use client';

/**
 * @fileoverview DatePicker Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the DatePicker component using CSS variables.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @module ApolloDatePicker
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState } from 'react';
import type { DatePickerProps, RangePickerProps } from '../../types';

// Size configuration using CSS variables
const SIZE_CONFIG: Record<string, { padding: string; fontSize: string; minWidth: string }> = {
  small: {
    padding: 'var(--ds-datepicker-sm-padding)',
    fontSize: 'var(--ds-datepicker-sm-font-size)',
    minWidth: '120px',
  },
  default: {
    padding: 'var(--ds-datepicker-md-padding)',
    fontSize: 'var(--ds-datepicker-md-font-size)',
    minWidth: '140px',
  },
  large: {
    padding: 'var(--ds-datepicker-lg-padding)',
    fontSize: 'var(--ds-datepicker-lg-font-size)',
    minWidth: '160px',
  },
};

const DatePickerBase = React.forwardRef<HTMLInputElement, DatePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    picker = 'date',
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
  const [isFocused, setIsFocused] = useState(false);

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

  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.default;

  // Build class names
  const containerClasses = [
    'rottay-datepicker',
    'rottay-datepicker--apollo',
    `rottay-datepicker--${size}`,
    status && `rottay-datepicker--${status}`,
    disabled && 'rottay-datepicker--disabled',
    isFocused && 'rottay-datepicker--focused',
    className,
  ].filter(Boolean).join(' ');

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'var(--ds-font-family-base)',
    ...style,
  };

  const getBorderColor = () => {
    if (status === 'error') return 'var(--ds-datepicker-error-border)';
    if (status === 'warning') return 'var(--ds-datepicker-warning-border)';
    if (isFocused) return 'var(--ds-datepicker-border-focus)';
    return 'var(--ds-datepicker-border)';
  };

  const inputStyle: React.CSSProperties = {
    padding: sizeConfig.padding,
    paddingRight: '2rem',
    fontSize: sizeConfig.fontSize,
    border: `1px solid ${getBorderColor()}`,
    borderRadius: 'var(--ds-datepicker-radius)',
    outline: 'none',
    transition: 'var(--ds-datepicker-transition)',
    minWidth: sizeConfig.minWidth,
    backgroundColor: disabled ? 'var(--ds-datepicker-bg-disabled)' : 'var(--ds-datepicker-bg)',
    color: 'var(--ds-datepicker-color)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    boxShadow: isFocused ? 'var(--ds-datepicker-shadow-focus)' : 'none',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    right: '8px',
    color: 'var(--ds-datepicker-icon-color)',
    pointerEvents: 'none',
    fontSize: sizeConfig.fontSize,
  };

  const clearBtnStyle: React.CSSProperties = {
    position: 'absolute',
    right: '28px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--ds-datepicker-clear-color)',
    fontSize: sizeConfig.fontSize,
    padding: '0 4px',
    transition: 'color 0.2s',
  };

  return (
    <div className={containerClasses} style={wrapperStyle}>
      <input
        ref={ref}
        type={getInputType()}
        style={inputStyle}
        value={displayValue}
        disabled={disabled}
        placeholder={placeholder}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={autoFocus}
        id={id}
        name={name}
        min={picker === 'year' ? 1900 : undefined}
        max={picker === 'year' ? 2100 : undefined}
        aria-label={placeholder}
      />
      {allowClear && displayValue && !disabled && (
        <button
          type="button"
          style={clearBtnStyle}
          onClick={handleClear}
          tabIndex={-1}
          aria-label="Clear"
        >
          ×
        </button>
      )}
      <span style={iconStyle}>📅</span>
    </div>
  );
});

DatePickerBase.displayName = 'DatePicker.Apollo';

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
  const [focusedInput, setFocusedInput] = useState<'start' | 'end' | null>(null);

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

  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.default;

  // Build class names
  const containerClasses = [
    'rottay-datepicker-range',
    'rottay-datepicker-range--apollo',
    `rottay-datepicker-range--${size}`,
    status && `rottay-datepicker-range--${status}`,
    disabled && 'rottay-datepicker-range--disabled',
    className,
  ].filter(Boolean).join(' ');

  const wrapperStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'var(--ds-font-family-base)',
    ...style,
  };

  const getBorderColor = (isFocused: boolean) => {
    if (status === 'error') return 'var(--ds-datepicker-error-border)';
    if (status === 'warning') return 'var(--ds-datepicker-warning-border)';
    if (isFocused) return 'var(--ds-datepicker-border-focus)';
    return 'var(--ds-datepicker-border)';
  };

  const getInputStyle = (inputType: 'start' | 'end'): React.CSSProperties => ({
    padding: sizeConfig.padding,
    fontSize: sizeConfig.fontSize,
    border: `1px solid ${getBorderColor(focusedInput === inputType)}`,
    borderRadius: 'var(--ds-datepicker-radius)',
    outline: 'none',
    transition: 'var(--ds-datepicker-transition)',
    minWidth: sizeConfig.minWidth,
    backgroundColor: disabled ? 'var(--ds-datepicker-bg-disabled)' : 'var(--ds-datepicker-bg)',
    color: 'var(--ds-datepicker-color)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    boxShadow: focusedInput === inputType ? 'var(--ds-datepicker-shadow-focus)' : 'none',
  });

  const separatorStyle: React.CSSProperties = {
    color: 'var(--ds-datepicker-separator-color)',
  };

  return (
    <div ref={ref} className={containerClasses} style={wrapperStyle} id={id}>
      <input
        type="date"
        style={getInputStyle('start')}
        value={displayValue[0]}
        disabled={disabled}
        placeholder={placeholder[0]}
        onChange={handleStartChange}
        onFocus={() => setFocusedInput('start')}
        onBlur={() => setFocusedInput(null)}
        aria-label={placeholder[0]}
      />
      <span style={separatorStyle}>{separator}</span>
      <input
        type="date"
        style={getInputStyle('end')}
        value={displayValue[1]}
        disabled={disabled}
        placeholder={placeholder[1]}
        onChange={handleEndChange}
        onFocus={() => setFocusedInput('end')}
        onBlur={() => setFocusedInput(null)}
        aria-label={placeholder[1]}
      />
    </div>
  );
});

RangePicker.displayName = 'DatePicker.RangePicker.Apollo';

// Compound component
export const DatePicker = Object.assign(DatePickerBase, {
  RangePicker,
});

export default DatePicker;
