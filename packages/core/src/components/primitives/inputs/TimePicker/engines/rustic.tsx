'use client';

/**
 * @fileoverview TimePicker Rustic Engine -- pure HTML/CSS with CSS variable theming.
 * Renders a native `<input type="time">` styled entirely through `--ds-timepicker-*`
 * design tokens, including status-aware border colors, focus ring, and a clear
 * button. Includes the compound `TimePicker.RangePicker` sub-component.
 *
 * @example
 * ```tsx
 * <TimePicker engine="rustic" format="HH:mm" status="error" allowClear />
 * ```
 *
 * @module RusticTimePicker
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState } from 'react';

import { useInteractionState } from '../../../../../behavior';
import type { TimePickerProps, TimeRangePickerProps } from '../TimePicker.types';

/** Size dimensions driven by CSS variables for each size variant. */
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

/**
 * Parses a shorthand padding string (e.g., "8px 12px") into individual
 * paddingTop/Right/Bottom/Left properties, overriding paddingRight with
 * `endPadding` to make room for the clear button and clock icon.
 */
function resolveInputPadding(padding: string, endPadding: string): React.CSSProperties {
  const [top, right = top, bottom = top, left = right] = padding.split(' ');
  return {
    paddingTop: top,
    paddingRight: endPadding,
    paddingBottom: bottom,
    paddingLeft: left,
  };
}

/**
 * Rustic engine TimePicker -- framework-free, CSS-variable-driven time input.
 *
 * Uses a native `<input type="time">` for the actual time selection while
 * applying custom border, background, and focus styles via `--ds-timepicker-*`
 * tokens. Includes a conditional clear button and a decorative clock icon.
 *
 * @param props - {@link TimePickerProps} unified time picker props.
 * @returns A ref-forwarding time input with pure CSS variable styling.
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
  // Focus state drives border color and box-shadow via inline styles
  // The triad is decided once, in the behavior core. `focused` is any focus --
  // a field's focus border must appear when a pointer lands in it. A ring is
  // `focusVisible`, and this part does not draw one.
  const { state: interaction, handlers: interactionHandlers } = useInteractionState();
  const isFocused = interaction.focused;

  const displayValue = isControlled ? parseTime(value) : internalValue;

  // Build a full Date anchored to today so the caller receives a usable Date object
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

  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.default;
  // step=1 shows second spinners in the native picker; step=60 hides them
  const showSeconds = format.includes('ss') || format.includes('s');

  // BEM class names for external CSS targeting and state-driven modifiers
  const containerClasses = [
    'rottay-timepicker',
    'rottay-timepicker--rustic',
    `rottay-timepicker--${size}`,
    status && `rottay-timepicker--${status}`,
    disabled && 'rottay-timepicker--disabled',
    isFocused && 'rottay-timepicker--focused',
    className,
  ].filter(Boolean).join(' ');

  /** Resolves border color based on validation status and focus state priority. */
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
    ...resolveInputPadding(sizeConfig.padding, '2rem'),
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
    <div data-part="root" className={containerClasses} style={wrapperStyle}>
      <input
        ref={ref}
        type="time"
        step={showSeconds ? 1 : 60}
        data-part="trigger-input"
        style={inputStyle}
        value={displayValue}
        disabled={disabled}
        placeholder={placeholder}
        onChange={handleChange}
        {...interactionHandlers}
        autoFocus={autoFocus}
        id={id}
        name={name}
        aria-label={placeholder}
      />
      {allowClear && displayValue && !disabled && (
        <button
          type="button"
          data-part="clear-button"
          style={clearBtnStyle}
          onClick={handleClear}
          tabIndex={-1}
          aria-label="Clear"
        >
          ×
        </button>
      )}
      <span data-part="clock-icon" style={iconStyle}>🕐</span>
    </div>
  );
});

TimePickerBase.displayName = 'TimePicker.Rustic';

/**
 * Range variant with two paired native time inputs and a separator.
 * Each input independently updates its half of the `[start, end]` tuple
 * and tracks its own focus state for individual border highlighting.
 *
 * @param props - {@link TimeRangePickerProps} unified range picker props.
 * @returns A ref-forwarding time range input pair with pure CSS variable styling.
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
  const [focusedInput, setFocusedInput] = useState<'start' | 'end' | null>(null);

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

  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.default;
  const showSeconds = format.includes('ss') || format.includes('s');

  // BEM class names for external CSS targeting and state-driven modifiers
  const containerClasses = [
    'rottay-timepicker-range',
    'rottay-timepicker-range--rustic',
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

  /** Resolves border color based on validation status and per-input focus state. */
  const getBorderColor = (isFocused: boolean) => {
    if (status === 'error') return 'var(--ds-timepicker-error-border)';
    if (status === 'warning') return 'var(--ds-timepicker-warning-border)';
    if (isFocused) return 'var(--ds-timepicker-border-focus)';
    return 'var(--ds-timepicker-border)';
  };

  const getInputStyle = (inputType: 'start' | 'end'): React.CSSProperties => ({
    ...resolveInputPadding(sizeConfig.padding, sizeConfig.padding.split(' ')[1] || sizeConfig.padding),
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
    <div ref={ref} data-part="root" className={containerClasses} style={wrapperStyle} id={id}>
      <input
        type="time"
        step={showSeconds ? 1 : 60}
        data-part="trigger-input"
        data-range-input="start"
        style={getInputStyle('start')}
        value={displayValue[0]}
        disabled={disabled}
        placeholder={placeholder[0]}
        onChange={handleStartChange}
        onFocus={() => setFocusedInput('start')}
        onBlur={() => setFocusedInput(null)}
        aria-label={placeholder[0]}
      />
      <span data-part="separator" style={separatorStyle}>{separator}</span>
      <input
        type="time"
        step={showSeconds ? 1 : 60}
        data-part="trigger-input"
        data-range-input="end"
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

TimeRangePicker.displayName = 'TimePicker.RangePicker.Rustic';

// Compound component: TimePicker.RangePicker follows the AntD compound pattern
export const TimePicker = Object.assign(TimePickerBase, {
  RangePicker: TimeRangePicker,
});

export default TimePicker;
