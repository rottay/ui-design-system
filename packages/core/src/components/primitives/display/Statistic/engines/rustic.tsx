/**
 * @fileoverview Statistic Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS statistic with WCAG-compliant colors.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides a lightweight, dependency-free statistic using only
 * inline styles and semantic HTML elements.
 *
 * **Exported Components:**
 * - `Statistic` - Main statistic component
 * - `Countdown` - Countdown timer with ARIA attributes
 *
 * **Implementation Details:**
 * - Uses inline styles for all visual properties
 * - WCAG 2.1 AA compliant color contrast
 * - Interval-based countdown updates
 * - Semantic HTML and ARIA attributes
 *
 * **Accessibility Features:**
 * - `role="status"` on loading skeleton
 * - `role="timer"` on countdown
 * - `aria-live="polite"` for updates
 * - `aria-atomic="true"` for complete announcements
 * - Screen reader friendly text
 *
 * **Advantages:**
 * - Zero external dependencies
 * - Smallest bundle size
 * - Maximum browser compatibility
 * - Full accessibility compliance
 * - SSR-safe implementation
 *
 * @example Statistic Usage
 * ```tsx
 * import { Statistic } from '@rottay/design-system';
 *
 * <Statistic
 *   engine="rustic"
 *   title="Revenue"
 *   value={125000}
 *   prefix="$"
 *   valueType="positive"
 * />
 * ```
 *
 * @example Countdown Usage
 * ```tsx
 * <Statistic.Countdown
 *   engine="rustic"
 *   title="Offer Expires"
 *   value={Date.now() + 86400000}
 *   format="DD:HH:mm:ss"
 * />
 * ```
 *
 * @see {@link Statistic} for the main component
 * @module Statistic/engines/rustic
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
 * Base styles for the Statistic component.
 * Uses semantic color values for accessibility.
 */
const STYLES = {
  container: {},
  title: {
    fontSize: 'var(--ds-statistic-title-font-size, 14px)',
    color: 'var(--ds-statistic-title-color, var(--ds-color-text-secondary))',
    marginBottom: '4px',
    lineHeight: 1.5,
  } as React.CSSProperties,
  value: {
    fontSize: 'var(--ds-statistic-value-font-size, 24px)',
    fontWeight: 600,
    color: 'var(--ds-statistic-value-color, var(--ds-color-text-primary))',
    lineHeight: 1.3,
  } as React.CSSProperties,
  prefix: {
    marginRight: '4px',
  } as React.CSSProperties,
  suffix: {
    marginLeft: '4px',
  } as React.CSSProperties,
  skeleton: {
    background: 'var(--ds-statistic-skeleton-bg, var(--ds-color-bg-secondary))',
    borderRadius: '4px',
  } as React.CSSProperties,
};

/**
 * Maps valueType to CSS color values.
 * Uses WCAG 2.1 AA compliant colors for accessibility.
 */
const VALUE_TYPE_COLOR_MAP: Record<string, string> = {
  default: 'var(--ds-statistic-value-color, var(--ds-color-text-primary))',
  positive: 'var(--ds-statistic-positive-color, var(--ds-color-success))',
  negative: 'var(--ds-statistic-negative-color, var(--ds-color-error))',
  warning: 'var(--ds-statistic-warning-color, var(--ds-color-warning))',
};

/**
 * Rustic Engine implementation of the Statistic component.
 *
 * This implementation uses vanilla HTML and inline CSS styles,
 * making it fully accessible and independent of CSS frameworks.
 * Follows WCAG 2.1 AA guidelines for color contrast.
 *
 * @example
 * ```tsx
 * <Statistic
 *   engine="rustic"
 *   title="Revenue"
 *   value={125000}
 *   prefix="$"
 *   precision={2}
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
      className,
      style,
    } = props;

    // Format the display value
    const displayValue = formatter
      ? formatter(value ?? '')
      : value !== undefined
        ? formatNumber(value, precision, groupSeparator, decimalSeparator)
        : '--';
    const shouldAnimateValue =
      animateValue && typeof value === 'number' && !formatter && !loading;

    // Get color for value type
    const valueColor = VALUE_TYPE_COLOR_MAP[valueType] || VALUE_TYPE_COLOR_MAP.default;

    // Loading skeleton
    if (loading) {
      return (
        <div ref={ref} className={className} style={style} role="status" aria-busy="true">
          <div style={{ ...STYLES.skeleton, height: 16, width: 64, marginBottom: 8 }} />
          <div style={{ ...STYLES.skeleton, height: 32, width: 96 }} />
          <span className="sr-only">Loading...</span>
        </div>
      );
    }

    return (
      <div ref={ref} className={className} style={style}>
        {title && (
          <div style={STYLES.title}>
            {title}
          </div>
        )}
        <div
          style={{
            ...STYLES.value,
            color: valueColor,
            ...valueStyle,
          }}
        >
          {prefix && <span style={STYLES.prefix}>{prefix}</span>}
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
          {suffix && <span style={STYLES.suffix}>{suffix}</span>}
        </div>
      </div>
    );
  }
);

Statistic.displayName = 'Statistic.Rustic';

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
 * Rustic Engine implementation of the Countdown component.
 *
 * Provides a countdown timer using vanilla HTML/CSS.
 * Uses semantic HTML and ARIA attributes for accessibility.
 *
 * @example
 * ```tsx
 * <Countdown
 *   engine="rustic"
 *   title="Offer Expires"
 *   value={Date.now() + 86400000}
 *   format="DD:HH:mm:ss"
 *   onFinish={() => alert('Offer expired!')}
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
      className,
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

    // Get color for value type
    const valueColor = VALUE_TYPE_COLOR_MAP[valueType] || VALUE_TYPE_COLOR_MAP.default;

    // Countdown-specific value style with monospace font
    const countdownValueStyle: React.CSSProperties = {
      ...STYLES.value,
      fontFamily: 'monospace',
      color: valueColor,
      ...valueStyle,
    };

    return (
      <div
        ref={ref}
        className={className}
        style={style}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        {title && (
          <div style={STYLES.title}>
            {title}
          </div>
        )}
        <div style={countdownValueStyle}>
          {prefix && <span style={STYLES.prefix}>{prefix}</span>}
          <span>{formatTime(timeLeft, format)}</span>
          {suffix && <span style={STYLES.suffix}>{suffix}</span>}
        </div>
      </div>
    );
  }
);

Countdown.displayName = 'Statistic.Countdown.Rustic';

export default Statistic;
