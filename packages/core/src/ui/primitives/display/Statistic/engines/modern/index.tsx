/**
 * @fileoverview Statistic Modern Engine - Rottay Design System
 * @description Token-driven statistic with Tailwind utilities and --ds-* CSS custom properties.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine renders semantic markup with `data-part` hooks; every painted
 * and static-geometry channel lives in the token-driven modern skin
 * (`foundation/tokens/css/runtime/engines/modern/skin/statistic.css`).
 * The DaisyUI `stat-title` / `stat-value` classes are gone -- the skin owns
 * the title/value typography through the data hooks.
 *
 * **Exported Components:**
 * - `Statistic` - Main statistic component
 * - `Countdown` - Countdown timer component
 *
 * **Implementation Details:**
 * - DS token semantic color styles (via the skin's data-trend rules)
 * - Skin-owned typography (no utility-class paint)
 * - Interval-based countdown updates
 * - Loading skeleton animated by the skin (ds-foundation-pulse)
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
import { CountUp } from '@/graphics/motion';
import type { StatisticProps, CountdownProps } from '../../contracts';
import { STATISTIC_DEFAULTS } from '../../contracts';

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
 * Scope class carried by both exports. The value's trend color is selected from
 * `data-trend` by `foundation/tokens/css/runtime/engines/modern/skin/statistic.css`, which resolves
 * an unrecognised trend to the `default` color. Both the class and `data-trend`
 * must reach the DOM for the color to paint.
 */
const SCOPE_CLASSES = 'rottay-statistic rottay-statistic--modern';

/**
 * Modern Engine implementation of the Statistic component.
 *
 * This implementation uses structural utilities and the token-driven modern
 * skin for a lightweight, customizable appearance.
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

    // Loading skeleton: the pulse animation and bar geometry are the skin's,
    // keyed on data-loading + data-part="skeleton-line".
    if (loading) {
      return (
        <div ref={ref} className={`${SCOPE_CLASSES} ${className}`.trim()} data-part="root" data-loading="true" data-has-title={!!title} data-countdown="false" style={style}>
          <div data-part="skeleton-line" />
          <div data-part="skeleton-line" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`${SCOPE_CLASSES} ${className}`.trim()}
        data-part="root"
        data-loading="false"
        data-countdown="false"
        data-has-title={!!title}
        data-has-prefix={!!prefix}
        data-has-suffix={!!suffix}
        data-animated={shouldAnimateValue}
        data-value-type={valueType}
        style={style}
      >
        {title && (
          <div data-part="title">
            {title}
          </div>
        )}
        <div
          data-part="value"
          data-trend={valueType}
          style={valueStyle}
        >
          {prefix && (
            <span data-part="prefix">
              {prefix}
            </span>
          )}
          {shouldAnimateValue ? (
            <span data-part="number">
              <CountUp
                from={countFrom}
                to={value}
                formatter={(nextValue) =>
                  formatNumber(nextValue, precision, groupSeparator, decimalSeparator)
                }
              />
            </span>
          ) : (
            <span data-part="number">{displayValue}</span>
          )}
          {suffix && (
            <span data-part="suffix">
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

    return (
      <div
        ref={ref}
        className={`${SCOPE_CLASSES} ${className}`.trim()}
        data-part="root"
        data-countdown="true"
        data-has-title={!!title}
        data-has-prefix={!!prefix}
        data-has-suffix={!!suffix}
        data-value-type={valueType}
        style={style}
      >
        {title && (
          <div data-part="title">
            {title}
          </div>
        )}
        {/* The countdown's monospace digits are painted by the skin, keyed on
            [data-countdown='true'], so the layout does not shift as numbers
            change during the countdown. */}
        <div
          data-part="value"
          data-trend={valueType}
          style={valueStyle}
        >
          {prefix && (
            <span data-part="prefix">
              {prefix}
            </span>
          )}
          <span data-part="number">{formatTime(timeLeft, format)}</span>
          {suffix && (
            <span data-part="suffix">
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
