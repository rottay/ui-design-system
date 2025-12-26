'use client';

/**
 * InputNumber - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { useState, useCallback } from 'react';
import type { InputNumberProps } from '../../types';

const styles = {
  wrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  inputWrapper: {
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
  },
  input: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #d9d9d9',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '120px',
  },
  inputSmall: {
    padding: '4px 8px',
    fontSize: '12px',
    width: '100px',
  },
  inputLarge: {
    padding: '12px 16px',
    fontSize: '16px',
    width: '140px',
  },
  inputFocused: {
    borderColor: 'var(--primary-color, #1890ff)',
    boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
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
  prefix: {
    position: 'absolute' as const,
    left: '8px',
    color: '#999',
    pointerEvents: 'none' as const,
  },
  suffix: {
    position: 'absolute' as const,
    right: '32px',
    color: '#999',
    pointerEvents: 'none' as const,
  },
  controls: {
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'absolute' as const,
    right: '4px',
    gap: '1px',
  },
  controlButton: {
    width: '20px',
    height: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '8px',
    color: '#666',
    padding: 0,
  },
  addon: {
    padding: '8px 12px',
    backgroundColor: '#fafafa',
    border: '1px solid #d9d9d9',
    fontSize: '14px',
  },
  addonBefore: {
    borderRight: 'none',
    borderRadius: '6px 0 0 6px',
  },
  addonAfter: {
    borderLeft: 'none',
    borderRadius: '0 6px 6px 0',
  },
};

export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (props, ref) => {
    const {
      value,
      defaultValue,
      min,
      max,
      step = 1,
      precision,
      disabled = false,
      readOnly = false,
      size = 'default',
      status,
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      placeholder,
      controls = true,
      onChange,
      onPressEnter,
      onStep,
      className = '',
      style,
      autoFocus,
      id,
      name,
    } = props;

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<number | string | null>(defaultValue ?? null);
    const [focused, setFocused] = useState(false);
    const currentValue = isControlled ? value : internalValue;

    const parseNumber = (val: string): number | null => {
      if (val === '' || val === '-') return null;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    };

    const formatValue = (val: number | string | null | undefined): string => {
      if (val === null || val === undefined) return '';
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num)) return '';
      if (precision !== undefined) {
        return num.toFixed(precision);
      }
      return String(num);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseNumber(e.target.value);
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    };

    const handleStep = useCallback((direction: 'up' | 'down') => {
      const current = typeof currentValue === 'string' ? parseFloat(currentValue) : (currentValue ?? 0);
      const stepNum = typeof step === 'string' ? parseFloat(step) : step;
      const offset = direction === 'up' ? stepNum : -stepNum;
      let newValue = current + offset;

      if (min !== undefined && newValue < min) newValue = min;
      if (max !== undefined && newValue > max) newValue = max;
      if (precision !== undefined) {
        newValue = parseFloat(newValue.toFixed(precision));
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      onStep?.(newValue, { offset: stepNum, type: direction });
    }, [currentValue, step, min, max, precision, isControlled, onChange, onStep]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onPressEnter?.(e);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleStep('up');
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleStep('down');
      }
    };

    const getInputStyle = (): React.CSSProperties => {
      const base: React.CSSProperties = { ...styles.input };
      if (size === 'small') Object.assign(base, styles.inputSmall);
      if (size === 'large') Object.assign(base, styles.inputLarge);
      if (focused) Object.assign(base, styles.inputFocused);
      if (status === 'error') Object.assign(base, styles.inputError);
      if (status === 'warning') Object.assign(base, styles.inputWarning);
      if (disabled) Object.assign(base, styles.inputDisabled);
      if (prefix) base.paddingLeft = '28px';
      if (suffix || controls) base.paddingRight = controls ? '36px' : '28px';
      if (addonBefore) base.borderRadius = '0';
      if (addonAfter) base.borderRadius = '0';
      if (addonBefore && !addonAfter) base.borderRadius = '0 6px 6px 0';
      if (addonAfter && !addonBefore) base.borderRadius = '6px 0 0 6px';
      return base;
    };

    return (
      <div className={className} style={{ ...styles.wrapper, ...style }}>
        {addonBefore && (
          <span style={{ ...styles.addon, ...styles.addonBefore }}>{addonBefore}</span>
        )}
        <div style={styles.inputWrapper}>
          {prefix && <span style={styles.prefix}>{prefix}</span>}
          <input
            ref={ref}
            type="number"
            style={getInputStyle()}
            value={formatValue(currentValue)}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus={autoFocus}
            id={id}
            name={name}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={typeof currentValue === 'number' ? currentValue : undefined}
          />
          {suffix && <span style={{ ...styles.suffix, right: controls ? '32px' : '8px' }}>{suffix}</span>}
          {controls && !disabled && !readOnly && (
            <div style={styles.controls}>
              <button
                type="button"
                style={styles.controlButton}
                onClick={() => handleStep('up')}
                tabIndex={-1}
                aria-label="Increase"
              >
                ▲
              </button>
              <button
                type="button"
                style={styles.controlButton}
                onClick={() => handleStep('down')}
                tabIndex={-1}
                aria-label="Decrease"
              >
                ▼
              </button>
            </div>
          )}
        </div>
        {addonAfter && (
          <span style={{ ...styles.addon, ...styles.addonAfter }}>{addonAfter}</span>
        )}
      </div>
    );
  }
);

InputNumber.displayName = 'InputNumber.Apollo';

export default InputNumber;
