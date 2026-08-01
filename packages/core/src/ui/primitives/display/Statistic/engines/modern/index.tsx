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
 * - Trend semantics pair `valueType` color with a governed icon plus a
 *   localized visually-hidden text alternative (never hue alone)
 * - Count-up reserves the final formatted width (`ch`, tabular-nums) so the
 *   animated value never moves the surrounding layout
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

import React, { forwardRef, useState, useEffect, useCallback, useId } from 'react';
import { VisuallyHidden } from '../../../../foundation';
import { CountUp } from '@/graphics/motion';
import { DataTrendIcon } from '@/graphics/icons/presentation/semantic/generated/roles/data-trend';
import { DataTrendDownIcon } from '@/graphics/icons/presentation/semantic/generated/roles/data-trend-down';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
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
 * Trend semantics (Phase B): `valueType` used to recolor the value and nothing
 * else, so trend polarity rode hue alone — invisible to color-blind users and
 * stripped entirely under forced-colors. Every non-default type now pairs the
 * color with a governed icon (shape carries the signal in forced-colors) and a
 * visually-hidden localized text alternative (AT never had the semantics).
 * The map is closed: an unrecognized trend paints the `default` color and
 * renders NO icon, mirroring the skin's fallback law.
 */
const TREND_SEMANTICS = {
  positive: { Icon: DataTrendIcon, labelKey: 'statistic.trendPositive', labelFallback: 'Increasing' },
  negative: { Icon: DataTrendDownIcon, labelKey: 'statistic.trendNegative', labelFallback: 'Decreasing' },
  warning: { Icon: StatusWarningIcon, labelKey: 'statistic.trendWarning', labelFallback: 'Warning' },
} as const;

type TrendType = keyof typeof TREND_SEMANTICS;

function isTrendType(valueType: StatisticProps['valueType']): valueType is TrendType {
  return valueType !== undefined && valueType in TREND_SEMANTICS;
}

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

    // Accessibility labels: translated when an I18nProvider is mounted, with
    // the documented English fallbacks otherwise (a missing catalog key
    // echoes the raw key back, which the endsWith guard detects — the same
    // channel-ahead-of-catalog idiom as the Carousel K4-C wiring).
    const i18n = useOptionalTranslation('components');
    const trendLabel = (key: string, fallback: string): string => {
      const translated = i18n?.t(key);
      return translated && !translated.endsWith(key) ? translated : fallback;
    };

    // Title/value association: the title labels the metric, so a titled
    // statistic is a named group (AT announces "Revenue, group" and then the
    // value) instead of two unrelated text runs.
    const titleId = useId();
    const hasTitle = Boolean(title);

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

    // Trend semantics: governed icon + localized hidden text, never hue alone.
    const trend = isTrendType(valueType) ? TREND_SEMANTICS[valueType] : undefined;

    // GEOMETRY RESERVE (sanctioned instance geometry, not paint): the count-up
    // writes intermediate strings that grow (0 -> ... -> 12,500), which used
    // to push the suffix/wrap on every frame. With the skin's tabular-nums,
    // one digit == one `ch`, and separators are never WIDER than a digit, so
    // the WIDER of both endpoints' formatted lengths is a safe upper bound
    // that freezes the row geometry from the first frame. Final length alone
    // under-reserved a count-DOWN (countFrom > value): its wider intermediate
    // strings still shifted the row mid-animation (P2 stability fix).
    // Reduced-motion/static renders skip the reserve because they paint the
    // final value directly.
    const numberReserveStyle =
      shouldAnimateValue && typeof displayValue === 'string'
        ? ({
            minInlineSize: `${Math.max(
              displayValue.length,
              formatNumber(countFrom, precision, groupSeparator, decimalSeparator).length
            )}ch`,
          } as React.CSSProperties)
        : undefined;

    // Loading skeleton: the pulse animation and bar geometry are the skin's,
    // keyed on data-loading + data-part="skeleton-line". aria-busy keeps the
    // pending state observable; the bars approximate the title/value anatomy.
    if (loading) {
      return (
        <div ref={ref} className={`${SCOPE_CLASSES} ${className}`.trim()} data-part="root" data-loading="true" data-has-title={!!title} data-countdown="false" aria-busy="true" style={style}>
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
        data-has-title={hasTitle}
        data-has-prefix={!!prefix}
        data-has-suffix={!!suffix}
        data-animated={shouldAnimateValue}
        data-value-type={valueType}
        role={hasTitle ? 'group' : undefined}
        aria-labelledby={hasTitle ? titleId : undefined}
        style={style}
      >
        {title && (
          <div data-part="title" id={titleId}>
            {title}
          </div>
        )}
        <div
          data-part="value"
          data-trend={valueType}
          style={valueStyle}
        >
          {trend && (
            <>
              <trend.Icon decorative size="md" />
              <VisuallyHidden>{trendLabel(trend.labelKey, trend.labelFallback)}</VisuallyHidden>
            </>
          )}
          {prefix && (
            <span data-part="prefix">
              {prefix}
            </span>
          )}
          {shouldAnimateValue ? (
            <span data-part="number" style={numberReserveStyle}>
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

    // Same trend-semantics and title-association law as the main Statistic
    // render (one shared anatomy, one shared skin).
    const i18n = useOptionalTranslation('components');
    const trendLabel = (key: string, fallback: string): string => {
      const translated = i18n?.t(key);
      return translated && !translated.endsWith(key) ? translated : fallback;
    };
    const titleId = useId();
    const hasTitle = Boolean(title);
    const trend = isTrendType(valueType) ? TREND_SEMANTICS[valueType] : undefined;

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
        data-has-title={hasTitle}
        data-has-prefix={!!prefix}
        data-has-suffix={!!suffix}
        data-value-type={valueType}
        role={hasTitle ? 'group' : undefined}
        aria-labelledby={hasTitle ? titleId : undefined}
        style={style}
      >
        {title && (
          <div data-part="title" id={titleId}>
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
          {trend && (
            <>
              <trend.Icon decorative size="md" />
              <VisuallyHidden>{trendLabel(trend.labelKey, trend.labelFallback)}</VisuallyHidden>
            </>
          )}
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
