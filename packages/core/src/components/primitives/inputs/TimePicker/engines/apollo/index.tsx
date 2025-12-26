'use client';

/**
 * TimePicker - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { useState } from 'react';
import type { TimePickerProps, TimeRangePickerProps } from '../../types';

const styles = {
  wrapper: {
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
  },
  input: {
    padding: '8px 32px 8px 12px',
    fontSize: '14px',
    border: '1px solid #d9d9d9',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    minWidth: '120px',
  },
  inputSmall: {
    padding: '4px 28px 4px 8px',
    fontSize: '12px',
    minWidth: '100px',
  },
  inputLarge: {
    padding: '12px 36px 12px 16px',
    fontSize: '16px',
    minWidth: '140px',
  },
  inputError: {
    borderColor: '#ff4d4f',
  },
  inputWarning: {
    borderColor: '#faad14',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  icon: {
    position: 'absolute' as const,
    right: '8px',
    color: '#999',
    pointerEvents: 'none' as const,
  },
  clearBtn: {
    position: 'absolute' as const,
    right: '28px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
    fontSize: '14px',
    padding: '0 4px',
  },
  rangeWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  separator: {
    color: '#999',
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
  const [focused, setFocused] = useState(false);

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

  const getInputStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = { ...styles.input };
    if (size === 'small') Object.assign(base, styles.inputSmall);
    if (size === 'large') Object.assign(base, styles.inputLarge);
    if (status === 'error') Object.assign(base, styles.inputError);
    if (status === 'warning') Object.assign(base, styles.inputWarning);
    if (disabled) Object.assign(base, styles.inputDisabled);
    if (focused) {
      base.borderColor = 'var(--primary-color, #1890ff)';
      base.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
    }
    return base;
  };

  const showSeconds = format.includes('ss') || format.includes('s');

  return (
    <div className={className} style={{ ...styles.wrapper, ...style }}>
      <input
        ref={ref}
        type="time"
        step={showSeconds ? 1 : 60}
        style={getInputStyle()}
        value={displayValue}
        disabled={disabled}
        placeholder={placeholder}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        id={id}
        name={name}
        aria-label={placeholder}
      />
      {allowClear && displayValue && !disabled && (
        <button
          type="button"
          style={styles.clearBtn}
          onClick={handleClear}
          tabIndex={-1}
          aria-label="Clear"
        >
          ×
        </button>
      )}
      <span style={styles.icon}>🕐</span>
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

  const getInputStyle = () => {
    const base = { ...styles.input };
    if (size === 'small') Object.assign(base, styles.inputSmall);
    if (size === 'large') Object.assign(base, styles.inputLarge);
    if (status === 'error') Object.assign(base, styles.inputError);
    if (status === 'warning') Object.assign(base, styles.inputWarning);
    if (disabled) Object.assign(base, styles.inputDisabled);
    return base;
  };

  const showSeconds = format.includes('ss') || format.includes('s');

  return (
    <div ref={ref} className={className} style={{ ...styles.rangeWrapper, ...style }} id={id}>
      <input
        type="time"
        step={showSeconds ? 1 : 60}
        style={getInputStyle()}
        value={displayValue[0]}
        disabled={disabled}
        placeholder={placeholder[0]}
        onChange={handleStartChange}
        aria-label={placeholder[0]}
      />
      <span style={styles.separator}>{separator}</span>
      <input
        type="time"
        step={showSeconds ? 1 : 60}
        style={getInputStyle()}
        value={displayValue[1]}
        disabled={disabled}
        placeholder={placeholder[1]}
        onChange={handleEndChange}
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
