'use client';

/**
 * DatePicker - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { useState } from 'react';
import type { DatePickerProps, RangePickerProps } from '../../types';

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
    minWidth: '140px',
  },
  inputSmall: {
    padding: '4px 28px 4px 8px',
    fontSize: '12px',
    minWidth: '120px',
  },
  inputLarge: {
    padding: '12px 36px 12px 16px',
    fontSize: '16px',
    minWidth: '160px',
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
  const [focused, setFocused] = useState(false);

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

  return (
    <div className={className} style={{ ...styles.wrapper, ...style }}>
      <input
        ref={ref}
        type={getInputType()}
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
        min={picker === 'year' ? 1900 : undefined}
        max={picker === 'year' ? 2100 : undefined}
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
      <span style={styles.icon}>📅</span>
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

  const getInputStyle = () => {
    const base = { ...styles.input };
    if (size === 'small') Object.assign(base, styles.inputSmall);
    if (size === 'large') Object.assign(base, styles.inputLarge);
    if (status === 'error') Object.assign(base, styles.inputError);
    if (status === 'warning') Object.assign(base, styles.inputWarning);
    if (disabled) Object.assign(base, styles.inputDisabled);
    return base;
  };

  return (
    <div ref={ref} className={className} style={{ ...styles.rangeWrapper, ...style }} id={id}>
      <input
        type="date"
        style={getInputStyle()}
        value={displayValue[0]}
        disabled={disabled}
        placeholder={placeholder[0]}
        onChange={handleStartChange}
        aria-label={placeholder[0]}
      />
      <span style={styles.separator}>{separator}</span>
      <input
        type="date"
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

RangePicker.displayName = 'DatePicker.RangePicker.Apollo';

// Compound component
export const DatePicker = Object.assign(DatePickerBase, {
  RangePicker,
});

export default DatePicker;
