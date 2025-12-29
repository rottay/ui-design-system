'use client';

/**
 * @fileoverview TimePicker Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the TimePicker component using CSS variables.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @module ApolloTimePicker
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState } from 'react';
import type { TimePickerProps, TimeRangePickerProps } from '../../types';

// Size configuration using CSS variables
const SIZE_CONFIG: Record<string, { padding: string; fontSize: string; minWidth: string }> = {
  small: {
    padding: 'var(--ds-timepicker-sm-padding)',
    fontSize: 'var(--ds-timepicker-sm-font-size)',
    minWidth: '100px',
  },
  default: {
    padding: 'var(--ds-timepicker-md-padding)',
    fontSize: 'var(--ds-timepicker-md-font-size)',
    minWidth: '120px',
  },
  large: {
    padding: 'var(--ds-timepicker-lg-padding)',
    fontSize: 'var(--ds-timepicker-lg-font-size)',
    minWidth: '140px',
  },
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
  const [internalValue, setInternalValue] = useState<string>(() => parseTime(defaultValue));
  const [isFocused, setIsFocused] = useState(false);

  const displayValue = isControlled ? parseTime(value) : internalValue;

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

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    onChange?.(null, '');
  };

  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.default;
  const showSeconds = format.includes('ss') || format.includes('s');

  // Build class names
  const containerClasses = [
    'rottay-timepicker',
    'rottay-timepicker--apollo',
    `rottay-timepicker--${size}`,
    status && `rottay-timepicker--${status}`,
    disabled && 'rottay-timepicker--disabled',
    isFocused && 'rottay-timepicker--focused',
    className,
  ].filter(Boolean).join(' ');

  const getBorderColor = () => {
    if (status === 'error') return 'var(--ds-timepicker-error-border)';
    if (status === 'warning') return 'var(--ds-timepicker-warning-border)';
    if (isFocused) return 'var(--ds-timepicker-border-focus)';
    return 'var(--ds-timepicker-border)';
  };

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'var(--ds-font-family-base)',
    ...style,
  };

  const inputStyle: React.CSSProperties = {
    padding: sizeConfig.padding,
    paddingRight: '2rem',
    fontSize: sizeConfig.fontSize,
    border: `1px solid ${getBorderColor()}`,
    borderRadius: 'var(--ds-timepicker-radius)',
    outline: 'none',
    transition: 'var(--ds-timepicker-transition)',
    minWidth: sizeConfig.minWidth,
    backgroundColor: disabled ? 'var(--ds-timepicker-bg-disabled)' : 'var(--ds-timepicker-bg)',
    color: 'var(--ds-timepicker-color)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    boxShadow: isFocused ? 'var(--ds-timepicker-shadow-focus)' : 'none',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    right: '8px',
    color: 'var(--ds-timepicker-icon-color)',
    pointerEvents: 'none',
    fontSize: sizeConfig.fontSize,
  };

  const clearBtnStyle: React.CSSProperties = {
    position: 'absolute',
    right: '28px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--ds-timepicker-clear-color)',
    fontSize: sizeConfig.fontSize,
    padding: '0 4px',
  };

  return (
    <div className={containerClasses} style={wrapperStyle}>
      <input
        ref={ref}
        type="time"
        step={showSeconds ? 1 : 60}
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
      <span style={iconStyle}>🕐</span>
    </div>
  );
});

TimePickerBase.displayName = 'TimePicker.Apollo';

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
  const [focusedInput, setFocusedInput] = useState<'start' | 'end' | null>(null);

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

  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.default;
  const showSeconds = format.includes('ss') || format.includes('s');

  // Build class names
  const containerClasses = [
    'rottay-timepicker-range',
    'rottay-timepicker-range--apollo',
    `rottay-timepicker-range--${size}`,
    status && `rottay-timepicker-range--${status}`,
    disabled && 'rottay-timepicker-range--disabled',
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
    if (status === 'error') return 'var(--ds-timepicker-error-border)';
    if (status === 'warning') return 'var(--ds-timepicker-warning-border)';
    if (isFocused) return 'var(--ds-timepicker-border-focus)';
    return 'var(--ds-timepicker-border)';
  };

  const getInputStyle = (inputType: 'start' | 'end'): React.CSSProperties => ({
    padding: sizeConfig.padding,
    fontSize: sizeConfig.fontSize,
    border: `1px solid ${getBorderColor(focusedInput === inputType)}`,
    borderRadius: 'var(--ds-timepicker-radius)',
    outline: 'none',
    transition: 'var(--ds-timepicker-transition)',
    minWidth: sizeConfig.minWidth,
    backgroundColor: disabled ? 'var(--ds-timepicker-bg-disabled)' : 'var(--ds-timepicker-bg)',
    color: 'var(--ds-timepicker-color)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    boxShadow: focusedInput === inputType ? 'var(--ds-timepicker-shadow-focus)' : 'none',
  });

  const separatorStyle: React.CSSProperties = {
    color: 'var(--ds-timepicker-separator-color)',
  };

  return (
    <div ref={ref} className={containerClasses} style={wrapperStyle} id={id}>
      <input
        type="time"
        step={showSeconds ? 1 : 60}
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
        type="time"
        step={showSeconds ? 1 : 60}
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

TimeRangePicker.displayName = 'TimePicker.RangePicker.Apollo';

// Compound component
export const TimePicker = Object.assign(TimePickerBase, {
  RangePicker: TimeRangePicker,
});

export default TimePicker;
