/**
 * @fileoverview Statistic Countdown Component - Rottay Design System
 * @description Countdown timer with customizable format tokens.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The Countdown component displays time remaining until a target date/time.
 * Updates ride a self-throttled requestAnimationFrame loop; under reduced
 * motion a plain one-second timeout chain drives the same once-per-second
 * display update so no continuous animation-frame loop runs.
 *
 * **Exported Components:**
 * - `Countdown` - Main countdown timer component
 *
 * **Exported Functions:**
 * - `formatTime` - Time formatting with tokens
 *
 * **Format Tokens:**
 * - `DD` - Days, zero-padded (01-99)
 * - `D` - Days (1-99)
 * - `HH` - Hours, zero-padded (00-23)
 * - `H` - Hours (0-23)
 * - `mm` - Minutes, zero-padded (00-59)
 * - `m` - Minutes (0-59)
 * - `ss` - Seconds, zero-padded (00-59)
 * - `s` - Seconds (0-59)
 *
 * **Event Callbacks:**
 * - `onFinish` - Called when countdown reaches zero
 * - `onChange` - Called every second with remaining ms
 *
 * @example Basic Usage
 * ```tsx
 * <Countdown
 *   title="Sale Ends In"
 *   value={Date.now() + 86400000}
 *   format="DD:HH:mm:ss"
 * />
 * ```
 *
 * @example With Callbacks
 * ```tsx
 * <Countdown
 *   value={Date.now() + 3600000}
 *   onFinish={() => alert('Time is up!')}
 *   onChange={(ms) => console.log('Remaining:', ms)}
 * />
 * ```
 *
 * @see {@link Statistic} for parent component
 * @module Statistic/compound/Countdown
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import { useBreakpoints } from '@/infrastructure/runtime/responsive';
import type { CountdownProps } from '../../contracts';
import { STATISTIC_DEFAULTS } from '../../contracts';

/**
 * Props for the Countdown component.
 */
export type { CountdownProps };

/**
 * Formats milliseconds into a human-readable time string.
 *
 * @param ms - Time remaining in milliseconds
 * @param format - Format string with tokens (DD, D, HH, H, mm, m, ss, s)
 * @returns Formatted time string
 *
 * @example
 * formatTime(90061000, 'DD:HH:mm:ss') // Returns "01:01:01:01"
 * formatTime(3661000, 'HH:mm:ss') // Returns "01:01:01"
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
 * Countdown component for displaying time remaining until a target.
 *
 * This is a base implementation that can be used directly or extended
 * by engine-specific implementations for enhanced styling.
 *
 * @example
 * ```tsx
 * // Countdown to a specific date
 * <Countdown
 *   title="Sale Ends In"
 *   value={Date.now() + 86400000}
 *   format="DD:HH:mm:ss"
 *   onFinish={() => alert('Sale ended!')}
 * />
 *
 * // Simple countdown with custom styling
 * <Countdown
 *   value={Date.now() + 3600000}
 *   valueStyle={{ color: 'red' }}
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
      onFinish,
      onChange,
      loading,
      valueType,
      className = '',
      style,
    } = props;

    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isFinished, setIsFinished] = useState(false);
    const { prefersReducedMotion } = useBreakpoints();

    // Calculate target time from value
    const getTargetTime = useCallback(() => {
      if (typeof value === 'string') {
        return new Date(value).getTime();
      }
      return value;
    }, [value]);

    // Update countdown timer
    useEffect(() => {
      const targetTime = getTargetTime();
      let animationFrameId: number | undefined;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      // Reads the clock, pushes the next value, and reports whether the timer
      // should keep running. Advancing the displayed time is a function, not
      // motion, so it runs under reduced motion too; only the scheduling
      // mechanism below differs.
      const tick = (): boolean => {
        const diff = Math.max(0, targetTime - Date.now());

        setTimeLeft(diff);
        onChange?.(diff);

        if (diff === 0 && !isFinished) {
          setIsFinished(true);
          onFinish?.();
          return false;
        }
        return diff > 0;
      };

      // Initial update
      const initialDiff = Math.max(0, targetTime - Date.now());
      setTimeLeft(initialDiff);

      if (initialDiff <= 0) {
        if (!isFinished) {
          setIsFinished(true);
          onFinish?.();
        }
        return;
      }

      if (prefersReducedMotion) {
        // Reduced motion: no continuous requestAnimationFrame loop. A
        // one-second timeout chain keeps the timing display advancing without
        // running a per-frame animation loop.
        const schedule = (): void => {
          timeoutId = setTimeout(() => {
            if (tick()) schedule();
          }, 1000);
        };
        schedule();
      } else {
        let lastUpdate = 0;
        const updateTime = (timestamp: number): void => {
          // Throttle updates to once per second for performance
          if (timestamp - lastUpdate < 1000) {
            animationFrameId = requestAnimationFrame(updateTime);
            return;
          }
          lastUpdate = timestamp;
          if (tick()) {
            animationFrameId = requestAnimationFrame(updateTime);
          }
        };
        animationFrameId = requestAnimationFrame(updateTime);
      }

      return () => {
        if (animationFrameId !== undefined) {
          cancelAnimationFrame(animationFrameId);
        }
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }
      };
    }, [value, onFinish, onChange, getTargetTime, isFinished, prefersReducedMotion]);

    // Reset finished state when value changes
    useEffect(() => {
      setIsFinished(false);
    }, [value]);

    // CSS variables for theming
    const countdownVars: React.CSSProperties = {
      '--ds-statistic-title-color': 'var(--ds-color-text-secondary)',
      '--ds-statistic-title-font-size': 'var(--ds-font-size-sm, 14px)',
      '--ds-statistic-value-color': valueType === 'positive'
        ? 'var(--ds-color-success)'
        : valueType === 'negative'
          ? 'var(--ds-color-error)'
          : valueType === 'warning'
            ? 'var(--ds-color-warning)'
            : 'var(--ds-color-text-primary)',
      '--ds-statistic-value-font-size': 'var(--ds-font-size-2xl, 20px)',
      '--ds-statistic-value-font-weight': 'var(--ds-font-weight-semibold, 600)',
    } as React.CSSProperties;

    const containerStyle: React.CSSProperties = {
      ...countdownVars,
      ...style,
    };

    const titleStyle: React.CSSProperties = {
      fontSize: 'var(--ds-statistic-title-font-size)',
      marginBottom: '4px',
    };

    const valueContainerStyle: React.CSSProperties = {
      fontSize: 'var(--ds-statistic-value-font-size)',
      fontWeight: 'var(--ds-statistic-value-font-weight)' as any,
      fontFamily: 'var(--ds-font-family-mono, monospace)',
      ...valueStyle,
    };

    // Loading skeleton
    if (loading) {
      return (
        <div ref={ref} className={`rottay-statistic rottay-statistic--countdown rottay-statistic--loading ${className}`} data-part="root" data-loading="true" style={containerStyle}>
          <div data-part="skeleton-line" style={{ height: '16px', width: '64px', marginBottom: '8px' }} />
          <div data-part="skeleton-line" style={{ height: '32px', width: '120px' }} />
        </div>
      );
    }

    return (
      <div ref={ref} className={`rottay-statistic rottay-statistic--countdown ${className}`} data-part="root" data-loading="false" style={containerStyle}>
        {title && (
          <div className="rottay-statistic__title" data-part="title" style={titleStyle}>
            {title}
          </div>
        )}
        <div className="rottay-statistic__value" data-part="value" data-trend={valueType || 'default'} style={valueContainerStyle}>
          {prefix && <span className="rottay-statistic__prefix" data-part="prefix" style={{ marginRight: '4px' }}>{prefix}</span>}
          <span className="rottay-statistic__content">{formatTime(timeLeft, format)}</span>
          {suffix && <span className="rottay-statistic__suffix" data-part="suffix" style={{ marginLeft: '4px' }}>{suffix}</span>}
        </div>
      </div>
    );
  }
);

Countdown.displayName = 'Statistic.Countdown';

export default Countdown;
