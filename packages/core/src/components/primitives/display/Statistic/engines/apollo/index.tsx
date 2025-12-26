/**
 * @fileoverview Statistic - Apollo Engine Implementation
 * @description Vanilla HTML/CSS implementation of the Statistic component.
 * Provides maximum accessibility and minimal dependencies with inline styles.
 * Ideal for environments where external CSS frameworks are not available.
 * @module components/primitives/display/Statistic/engines/apollo
 */

'use client';

import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import type { StatisticProps, CountdownProps } from '../../types';
import { STATISTIC_DEFAULTS } from '../../types';
import { formatNumber } from '../../base';

/**
 * Base styles for the Statistic component.
 * Uses semantic color values for accessibility.
 */
const STYLES = {
  container: {},
  title: {
    fontSize: '14px',
    color: '#00000073',
    marginBottom: '4px',
    lineHeight: 1.5,
  } as React.CSSProperties,
  value: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#000000e0',
    lineHeight: 1.3,
  } as React.CSSProperties,
  prefix: {
    marginRight: '4px',
  } as React.CSSProperties,
  suffix: {
    marginLeft: '4px',
  } as React.CSSProperties,
  skeleton: {
    background: '#f5f5f5',
    borderRadius: '4px',
  } as React.CSSProperties,
};

/**
 * Maps valueType to CSS color values.
 * Uses WCAG 2.1 AA compliant colors for accessibility.
 */
const VALUE_TYPE_COLOR_MAP: Record<string, string> = {
  default: '#000000e0',
  positive: '#52c41a',
  negative: '#ff4d4f',
  warning: '#faad14',
};

/**
 * Apollo Engine implementation of the Statistic component.
 *
 * This implementation uses vanilla HTML and inline CSS styles,
 * making it fully accessible and independent of CSS frameworks.
 * Follows WCAG 2.1 AA guidelines for color contrast.
 *
 * @example
 * ```tsx
 * <Statistic
 *   engine="apollo"
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
          <span>{displayValue}</span>
          {suffix && <span style={STYLES.suffix}>{suffix}</span>}
        </div>
      </div>
    );
  }
);

Statistic.displayName = 'Statistic.Apollo';

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
 * Apollo Engine implementation of the Countdown component.
 *
 * Provides a countdown timer using vanilla HTML/CSS.
 * Uses semantic HTML and ARIA attributes for accessibility.
 *
 * @example
 * ```tsx
 * <Countdown
 *   engine="apollo"
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

Countdown.displayName = 'Statistic.Countdown.Apollo';

export default Statistic;
