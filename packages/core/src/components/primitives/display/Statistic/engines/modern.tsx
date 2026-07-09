/**
 * @fileoverview Statistic Modern Engine - Rottay Design System
 * @description Token-driven statistic with Tailwind utilities and --ds-* CSS custom properties.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses Tailwind utilities with DS token inline styles
 * for a lightweight, theme-integrated statistic display.
 *
 * **Exported Components:**
 * - `Statistic` - Main statistic component
 * - `Countdown` - Countdown timer component
 *
 * **Implementation Details:**
 * - DS token semantic color styles
 * - Tailwind typography utilities
 * - Interval-based countdown updates
 * - Loading skeleton with animate-pulse
 *
 * **Token Mappings:**
 * - `var(--ds-statistic-value-color)` - Default value color (falls back to --ds-color-text-primary)
 * - `var(--ds-statistic-positive-color)` - Positive value color (falls back to --ds-color-success)
 * - `var(--ds-statistic-negative-color)` - Negative value color (falls back to --ds-color-error)
 * - `var(--ds-statistic-warning-color)` - Warning value color (falls back to --ds-color-warning)
 * - `var(--ds-statistic-value-font-size)` / `var(--ds-statistic-value-font-weight)` - Value styling
 * - `var(--ds-statistic-title-font-size)` / `var(--ds-statistic-title-color)` - Title styling
 * - `var(--ds-statistic-title-margin-bottom)` - Title bottom margin
 * - `var(--ds-statistic-prefix-color)` / `var(--ds-statistic-suffix-color)` - Prefix/suffix color
 * - `var(--ds-statistic-loading-bg)` - Loading skeleton background
 * - `var(--ds-spacing-*)` - All spacing/margins
 * - `var(--ds-radius-sm)` - Loading skeleton radius
 * - `var(--ds-font-family-mono)` - Countdown monospace digits
 *
 * **Advantages:**
 * - Fully token-governed (no hardcoded px/font-size/spacing)
 * - Automatic theme adaptation via --ds-* CSS custom properties
 * - DS token semantic colors
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
 * @see {@link Statistic} for the main component
 * @module Statistic/engines/modern
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import { CountUp } from '../../../../../motion';
import type { StatisticProps, CountdownProps } from '../Statistic.types';
import { STATISTIC_DEFAULTS } from '../Statistic.types';

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
 * Maps valueType to DS token color values for inline styles.
 */
const VALUE_TYPE_STYLE_MAP: Record<string, React.CSSProperties> = {
  default: { color: 'var(--ds-statistic-value-color, var(--ds-color-text-primary))' },
  positive: { color: 'var(--ds-statistic-positive-color, var(--ds-color-success))' },
  negative: { color: 'var(--ds-statistic-negative-color, var(--ds-color-error))' },
  warning: { color: 'var(--ds-statistic-warning-color, var(--ds-color-warning))' },
};

/**
 * Modern Engine implementation of the Statistic component.
 *
 * This implementation uses Tailwind CSS utilities and DS token inline styles
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
      animateValue = false,
      countFrom = 0,
      valueType = STATISTIC_DEFAULTS.valueType,
      className = '',
      style,
    } = props;

    // Resolve display value: custom formatter takes priority, then formatNumber,
    // and '--' as a fallback when value is undefined (empty-state indicator).
    const displayValue = formatter
      ? formatter(value ?? '')
      : value !== undefined
        ? formatNumber(value, precision, groupSeparator, decimalSeparator)
        : '--';

    // Only animate when explicitly requested, value is numeric, and no custom
    // formatter or loading state would conflict with the CountUp animation.
    const shouldAnimateValue =
      animateValue && typeof value === 'number' && !formatter && !loading;

    // Get DS token style for value color
    const valueColorStyle = VALUE_TYPE_STYLE_MAP[valueType] || VALUE_TYPE_STYLE_MAP.default;

    // Loading skeleton with Tailwind animate-pulse
    if (loading) {
      return (
        <div ref={ref} className={className} style={{
          ...style,
          animation: 'pulse 2s var(--ds-motion-ease-in-out) infinite',
          animationDuration: 'var(--ds-skeleton-animation-duration, 1.5s)',
        }}>
          <div
            style={{
              height: 'var(--ds-spacing-4, 1rem)',
              width: 'var(--ds-spacing-16, 4rem)',
              borderRadius: 'var(--ds-radius-sm, 6px)',
              marginBottom: 'var(--ds-spacing-2, 0.5rem)',
              background: 'var(--ds-statistic-loading-bg, var(--ds-surface-panel))',
            }}
          />
          <div
            style={{
              height: 'var(--ds-spacing-8, 2rem)',
              width: 'var(--ds-spacing-24, 6rem)',
              borderRadius: 'var(--ds-radius-sm, 6px)',
              background: 'var(--ds-statistic-loading-bg, var(--ds-surface-panel))',
            }}
          />
        </div>
      );
    }

    return (
      <div ref={ref} className={className} style={style}>
        {title && (
          <div
            className="stat-title"
            style={{
              lineHeight: 'var(--ds-line-height-sm, 1.25rem)',
              marginBottom: 'var(--ds-statistic-title-margin-bottom, var(--ds-spacing-1, 0.25rem))',
            }}
          >
            {title}
          </div>
        )}
        <div
          className="stat-value"
          style={{
            lineHeight: 'var(--ds-line-height-2xl, 2rem)',
            ...valueColorStyle,
            ...valueStyle,
          }}
        >
          {prefix && (
            <span style={{ marginRight: 'var(--ds-spacing-1, 0.25rem)', color: 'var(--ds-statistic-prefix-color, inherit)' }}>
              {prefix}
            </span>
          )}
          {shouldAnimateValue ? (
            <CountUp
              from={countFrom}
              to={value}
              formatter={(nextValue) =>
                formatNumber(nextValue, precision, groupSeparator, decimalSeparator)
              }
            />
          ) : (
            <span>{displayValue}</span>
          )}
          {suffix && (
            <span style={{ marginLeft: 'var(--ds-spacing-1, 0.25rem)', color: 'var(--ds-statistic-suffix-color, inherit)' }}>
              {suffix}
            </span>
          )}
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
 * Provides a countdown timer with Tailwind utility and DS token styling.
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
    // Tracks whether onFinish has already fired to prevent duplicate calls
    const [isFinished, setIsFinished] = useState(false);

    // Normalise the target: accept either an ISO date string or epoch ms number.
    const getTargetTime = useCallback(() => {
      return typeof value === 'string' ? new Date(value).getTime() : value;
    }, [value]);

    // 1-second interval drives the countdown. We clamp to 0 so the display
    // never shows negative time, and fire onFinish exactly once when diff hits 0.
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

      // Run immediately so the user never sees the initial 0 state
      updateTime();

      const interval = setInterval(updateTime, 1000);

      return () => clearInterval(interval);
    }, [value, onFinish, onChange, getTargetTime, isFinished]);

    // When the target value changes (e.g. new deadline), allow onFinish to fire again
    useEffect(() => {
      setIsFinished(false);
    }, [value]);

    // Get DS token style for value color
    const valueColorStyle = VALUE_TYPE_STYLE_MAP[valueType] || VALUE_TYPE_STYLE_MAP.default;

    return (
      <div ref={ref} className={className} style={style}>
        {title && (
          <div
            className="stat-title"
            style={{
              lineHeight: 'var(--ds-line-height-sm, 1.25rem)',
              marginBottom: 'var(--ds-statistic-title-margin-bottom, var(--ds-spacing-1, 0.25rem))',
            }}
          >
            {title}
          </div>
        )}
        {/* font-mono ensures digits occupy equal widths so the layout
            does not shift as numbers change during the countdown. */}
        <div
          className="stat-value"
          style={{
            lineHeight: 'var(--ds-line-height-2xl, 2rem)',
            fontFamily: 'var(--ds-font-family-mono, ui-monospace, monospace)',
            ...valueColorStyle,
            ...valueStyle,
          }}
        >
          {prefix && (
            <span style={{ marginRight: 'var(--ds-spacing-1, 0.25rem)', color: 'var(--ds-statistic-prefix-color, inherit)' }}>
              {prefix}
            </span>
          )}
          <span>{formatTime(timeLeft, format)}</span>
          {suffix && (
            <span style={{ marginLeft: 'var(--ds-spacing-1, 0.25rem)', color: 'var(--ds-statistic-suffix-color, inherit)' }}>
              {suffix}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Countdown.displayName = 'Statistic.Countdown.Modern';

export default Statistic;
