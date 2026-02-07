/**
 * @fileoverview Statistic Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind-based statistic with semantic colors.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses DaisyUI classes with Tailwind utilities
 * for a lightweight, theme-integrated statistic display.
 *
 * **Exported Components:**
 * - `Statistic` - Main statistic component
 * - `Countdown` - Countdown timer component
 *
 * **Implementation Details:**
 * - DaisyUI semantic color classes
 * - Tailwind typography utilities
 * - Interval-based countdown updates
 * - Loading skeleton with animate-pulse
 *
 * **Class Mappings:**
 * - `text-base-content` - Default value color
 * - `text-success` - Positive value color
 * - `text-error` - Negative value color
 * - `text-warning` - Warning value color
 * - `text-2xl font-semibold` - Value styling
 * - `text-sm text-base-content/60` - Title styling
 *
 * **Advantages:**
 * - Lightweight CSS-only styling
 * - Automatic theme adaptation
 * - DaisyUI semantic colors
 * - Responsive-friendly
 *
 * @example Statistic Usage
 * ```tsx
 * import { Statistic } from '@rottay/design-system';
 *
 * <Statistic
 *   engine="modern"
 *   title="Total Users"
 *   value={10542}
 *   suffix="users"
 *   valueType="positive"
 * />
 * ```
 *
 * @see {@link Statistic} for the main component
 * @see {@link https://daisyui.com/} DaisyUI
 * @module Statistic/engines/modern
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import { forwardRef, useState, useEffect, useCallback } from 'react';
import type { StatisticProps, CountdownProps } from '../../types';
import { STATISTIC_DEFAULTS } from '../../types';

/**
 * Formats a number with precision and custom separators.
 *
 * @param value - The value to format (string or number)
 * @param precision - Number of decimal places
 * @param groupSeparator - Character used to separate thousands
 * @param decimalSeparator - Character used as decimal separator
 * @returns Formatted string with thousands separators
 */
function formatNumber(
  value: string | number,
  precision: number = STATISTIC_DEFAULTS.precision,
  groupSeparator: string = STATISTIC_DEFAULTS.groupSeparator,
  decimalSeparator: string = STATISTIC_DEFAULTS.decimalSeparator
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return String(value);
  }

  const fixed = num.toFixed(precision);
  const [integerPart, decimalPart] = fixed.split('.');

  // Add thousands separators to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);

  return decimalPart !== undefined
    ? `${formattedInteger}${decimalSeparator}${decimalPart}`
    : formattedInteger;
}

/**
 * Maps valueType to Tailwind CSS text color classes.
 */
const VALUE_TYPE_CLASS_MAP: Record<string, string> = {
  default: 'text-base-content',
  positive: 'text-success',
  negative: 'text-error',
  warning: 'text-warning',
};

/**
 * Modern Engine implementation of the Statistic component.
 *
 * This implementation uses DaisyUI and Tailwind CSS utilities
 * for a lightweight, customizable appearance.
 *
 * @example
 * ```tsx
 * <Statistic
 *   engine="modern"
 *   title="Total Users"
 *   value={10542}
 *   suffix="users"
 *   valueType="positive"
 * />
 * ```
 */
export const Statistic = forwardRef<HTMLDivElement, StatisticProps>(
  (props, ref) => {
    const {
      title,
      value,
      precision = STATISTIC_DEFAULTS.precision,
      prefix,
      suffix,
      valueStyle,
      groupSeparator = STATISTIC_DEFAULTS.groupSeparator,
      decimalSeparator = STATISTIC_DEFAULTS.decimalSeparator,
      loading,
      formatter,
      valueType = STATISTIC_DEFAULTS.valueType,
      className = '',
      style,
    } = props;

    // Format the display value
    const displayValue = formatter
      ? formatter(value ?? '')
      : value !== undefined
        ? formatNumber(value, precision, groupSeparator, decimalSeparator)
        : '--';

    // Get Tailwind class for value color
    const valueColorClass = VALUE_TYPE_CLASS_MAP[valueType] || VALUE_TYPE_CLASS_MAP.default;

    // Loading skeleton with DaisyUI animation
    if (loading) {
      return (
        <div ref={ref} className={`animate-pulse ${className}`} style={style}>
          <div className="h-4 bg-base-300 rounded w-16 mb-2" />
          <div className="h-8 bg-base-300 rounded w-24" />
        </div>
      );
    }

    return (
      <div ref={ref} className={className} style={style}>
        {title && (
          <div className="text-sm text-base-content/60 mb-1">
            {title}
          </div>
        )}
        <div
          className={`text-2xl font-semibold ${valueColorClass}`}
          style={valueStyle}
        >
          {prefix && <span className="mr-1">{prefix}</span>}
          <span>{displayValue}</span>
          {suffix && <span className="ml-1">{suffix}</span>}
        </div>
      </div>
    );
  }
);

Statistic.displayName = 'Statistic.Modern';

/**
 * Formats milliseconds into a time string based on format pattern.
 *
 * @param ms - Time in milliseconds
 * @param format - Format string with tokens (DD, D, HH, H, mm, m, ss, s)
 * @returns Formatted time string
 */
function formatTime(ms: number, format: string): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return format
    .replace('DD', String(days).padStart(2, '0'))
    .replace('D', String(days))
    .replace('HH', String(hours).padStart(2, '0'))
    .replace('H', String(hours))
    .replace('mm', String(minutes).padStart(2, '0'))
    .replace('m', String(minutes))
    .replace('ss', String(seconds).padStart(2, '0'))
    .replace('s', String(seconds));
}

/**
 * Modern Engine implementation of the Countdown component.
 *
 * Provides a countdown timer with DaisyUI/Tailwind styling.
 * Uses requestAnimationFrame for smooth updates.
 *
 * @example
 * ```tsx
 * <Countdown
 *   engine="modern"
 *   title="Flash Sale Ends"
 *   value={Date.now() + 3600000}
 *   format="HH:mm:ss"
 *   valueType="warning"
 * />
 * ```
 */
export const Countdown = forwardRef<HTMLDivElement, CountdownProps>(
  (props, ref) => {
    const {
      title,
      value,
      format = STATISTIC_DEFAULTS.countdownFormat,
      prefix,
      suffix,
      valueStyle,
      valueType = STATISTIC_DEFAULTS.valueType,
      onFinish,
      onChange,
      className = '',
      style,
    } = props;

    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isFinished, setIsFinished] = useState(false);

    // Calculate target time
    const getTargetTime = useCallback(() => {
      return typeof value === 'string' ? new Date(value).getTime() : value;
    }, [value]);

    // Update countdown with interval
    useEffect(() => {
      const targetTime = getTargetTime();

      const updateTime = () => {
        const now = Date.now();
        const diff = Math.max(0, targetTime - now);
        setTimeLeft(diff);
        onChange?.(diff);

        if (diff === 0 && !isFinished) {
          setIsFinished(true);
          onFinish?.();
        }
      };

      // Initial update
      updateTime();

      // Set up interval for updates
      const interval = setInterval(updateTime, 1000);

      return () => clearInterval(interval);
    }, [value, onFinish, onChange, getTargetTime, isFinished]);

    // Reset finished state when value changes
    useEffect(() => {
      setIsFinished(false);
    }, [value]);

    // Get Tailwind class for value color
    const valueColorClass = VALUE_TYPE_CLASS_MAP[valueType] || VALUE_TYPE_CLASS_MAP.default;

    return (
      <div ref={ref} className={className} style={style}>
        {title && (
          <div className="text-sm text-base-content/60 mb-1">
            {title}
          </div>
        )}
        <div
          className={`text-2xl font-semibold font-mono ${valueColorClass}`}
          style={valueStyle}
        >
          {prefix && <span className="mr-1">{prefix}</span>}
          <span>{formatTime(timeLeft, format)}</span>
          {suffix && <span className="ml-1">{suffix}</span>}
        </div>
      </div>
    );
  }
);

Countdown.displayName = 'Statistic.Countdown.Modern';

export default Statistic;
