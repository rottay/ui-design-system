/**
 * DatePicker - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef, useState, useRef, useMemo } from 'react';
import type { DatePickerProps } from '../types';
import { DATE_PICKER_DEFAULTS } from '../types';

/**
 * Size configurations
 */
const SIZE_CONFIG = {
  small: { height: 24, fontSize: 12, padding: '0 7px' },
  default: { height: 32, fontSize: 14, padding: '0 11px' },
  large: { height: 40, fontSize: 16, padding: '0 11px' },
};

/**
 * Calendar icon
 */
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
  </svg>
);

/**
 * Clear icon
 */
const ClearIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

/**
 * Format date to string
 */
const formatDate = (date: Date | null, format: string): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
};

/**
 * Parse string to date
 */
const parseDate = (value: Date | string | null | undefined): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Base DatePicker component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseDatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue,
      picker = DATE_PICKER_DEFAULTS.picker,
      format = 'YYYY-MM-DD',
      showTime,
      showToday = DATE_PICKER_DEFAULTS.showToday,
      showNow,
      disabled = false,
      readOnly = false,
      size = DATE_PICKER_DEFAULTS.size,
      status,
      placeholder = 'Select date',
      placement = DATE_PICKER_DEFAULTS.placement,
      popupClassName,
      popupStyle,
      allowClear = DATE_PICKER_DEFAULTS.allowClear,
      open: controlledOpen,
      prefix,
      suffixIcon,
      disabledDate,
      onChange,
      onOpenChange,
      onPanelChange,
      className = '',
      style = {},
      autoFocus,
      id,
      name,
      bordered = DATE_PICKER_DEFAULTS.bordered,
      variant = DATE_PICKER_DEFAULTS.variant,
      locale,
      renderExtraFooter,
      cellRender,
    } = props;

    const [internalValue, setInternalValue] = useState<Date | null>(
      parseDate(defaultValue)
    );
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const currentValue = controlledValue !== undefined
      ? parseDate(controlledValue)
      : internalValue;

    const actualOpen = controlledOpen !== undefined ? controlledOpen : isOpen;

    // Size config
    const sizeKey = size === 'small' ? 'small' : size === 'large' ? 'large' : 'default';
    const config = SIZE_CONFIG[sizeKey];

    // Handle date selection
    const handleDateSelect = (date: Date) => {
      if (disabledDate?.(date)) return;

      if (controlledValue === undefined) {
        setInternalValue(date);
      }
      onChange?.(date, formatDate(date, format));
      setIsOpen(false);
      onOpenChange?.(false);
    };

    // Handle clear
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (controlledValue === undefined) {
        setInternalValue(null);
      }
      onChange?.(null, '');
    };

    // Handle input click
    const handleInputClick = () => {
      if (disabled || readOnly) return;
      const newOpen = !actualOpen;
      setIsOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    // CSS variables
    const pickerVars = useMemo<React.CSSProperties>(() => ({
      '--picker-height': `${config.height}px`,
      '--picker-font-size': `${config.fontSize}px`,
      '--picker-padding': config.padding,
      '--picker-border-color': status === 'error' ? 'var(--color-error, #ff4d4f)' : status === 'warning' ? 'var(--color-warning, #faad14)' : 'var(--color-border, #d9d9d9)',
      '--picker-bg': variant === 'filled' ? 'var(--color-bg-secondary, #f5f5f5)' : 'var(--color-bg-elevated, #fff)',
      '--picker-focus-border': 'var(--color-primary, #1677ff)',
      '--picker-focus-shadow': '0 0 0 2px rgba(22, 119, 255, 0.1)',
    } as React.CSSProperties), [config, status, variant]);

    const wrapperStyle: React.CSSProperties = {
      ...pickerVars,
      position: 'relative',
      display: 'inline-block',
      width: '100%',
      ...style,
    };

    const inputWrapperStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      height: 'var(--picker-height)',
      padding: 'var(--picker-padding)',
      backgroundColor: 'var(--picker-bg)',
      border: bordered && variant !== 'borderless' ? '1px solid var(--picker-border-color)' : 'none',
      borderRadius: 'var(--radius-md, 6px)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s',
    };

    const inputStyle: React.CSSProperties = {
      flex: 1,
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      fontSize: 'var(--picker-font-size)',
      cursor: 'inherit',
    };

    const iconStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      color: 'var(--color-text-secondary)',
      marginLeft: 4,
    };

    const displayValue = currentValue ? formatDate(currentValue, format) : '';

    return (
      <div
        ref={ref}
        className={`rottay-date-picker ${disabled ? 'rottay-date-picker--disabled' : ''} ${actualOpen ? 'rottay-date-picker--open' : ''} ${className}`}
        style={wrapperStyle}
      >
        <div
          className="rottay-date-picker__input-wrapper"
          style={inputWrapperStyle}
          onClick={handleInputClick}
        >
          {prefix && <span className="rottay-date-picker__prefix" style={{ marginRight: 4 }}>{prefix}</span>}
          <input
            ref={inputRef}
            type="text"
            id={id}
            name={name}
            value={displayValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly
            autoFocus={autoFocus}
            className="rottay-date-picker__input"
            style={inputStyle}
          />
          {allowClear && currentValue && !disabled && (
            <span
              className="rottay-date-picker__clear"
              style={{ ...iconStyle, cursor: 'pointer' }}
              onClick={handleClear}
            >
              <ClearIcon />
            </span>
          )}
          <span className="rottay-date-picker__suffix" style={iconStyle}>
            {suffixIcon || <CalendarIcon />}
          </span>
        </div>

        {actualOpen && (
          <div
            className={`rottay-date-picker__dropdown ${popupClassName || ''}`}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              padding: 8,
              backgroundColor: 'var(--color-bg-elevated, #fff)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg, 8px)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1050,
              minWidth: 280,
              ...popupStyle,
            }}
          >
            <div className="rottay-date-picker__panel">
              <div className="rottay-date-picker__header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 500 }}>
                  {currentValue ? formatDate(currentValue, 'YYYY-MM') : formatDate(new Date(), 'YYYY-MM')}
                </span>
              </div>
              <div className="rottay-date-picker__body" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} style={{ padding: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>{day}</div>
                ))}
                {/* Simplified calendar - in real implementation would show full month */}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <div
                    key={day}
                    onClick={() => {
                      const date = new Date();
                      date.setDate(day);
                      handleDateSelect(date);
                    }}
                    style={{
                      padding: 4,
                      cursor: 'pointer',
                      borderRadius: 4,
                      backgroundColor: currentValue?.getDate() === day ? 'var(--color-primary)' : 'transparent',
                      color: currentValue?.getDate() === day ? '#fff' : 'inherit',
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>
              {showToday && (
                <div className="rottay-date-picker__footer" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                  <button
                    type="button"
                    onClick={() => handleDateSelect(new Date())}
                    style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Today
                  </button>
                </div>
              )}
              {renderExtraFooter && (
                <div className="rottay-date-picker__extra-footer" style={{ marginTop: 8 }}>
                  {renderExtraFooter()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

BaseDatePicker.displayName = 'BaseDatePicker';
