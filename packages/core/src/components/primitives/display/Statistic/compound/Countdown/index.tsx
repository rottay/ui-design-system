/**
 * @fileoverview Statistic Countdown Component - Rottay Design System
 * @description Countdown timer with customizable format tokens.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The Countdown component displays time remaining until a target date/time.
 * Uses requestAnimationFrame for smooth, performant updates.
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
import type { CountdownProps } from '../../types';
import { STATISTIC_DEFAULTS } from '../../types';

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
      let animationFrameId: number;
      let lastUpdate = 0;

      const updateTime = (timestamp: number) => {
        // Throttle updates to once per second for performance
        if (timestamp - lastUpdate < 1000) {
          animationFrameId = requestAnimationFrame(updateTime);
          return;
        }
        lastUpdate = timestamp;

        const now = Date.now();
        const diff = Math.max(0, targetTime - now);

        setTimeLeft(diff);
        onChange?.(diff);

        if (diff === 0 && !isFinished) {
          setIsFinished(true);
          onFinish?.();
        } else if (diff > 0) {
          animationFrameId = requestAnimationFrame(updateTime);
        }
      };

      // Initial update
      const now = Date.now();
      const initialDiff = Math.max(0, targetTime - now);
      setTimeLeft(initialDiff);

      if (initialDiff > 0) {
        animationFrameId = requestAnimationFrame(updateTime);
      } else if (!isFinished) {
        setIsFinished(true);
        onFinish?.();
      }

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }, [value, onFinish, onChange, getTargetTime, isFinished]);

    // Reset finished state when value changes
    useEffect(() => {
      setIsFinished(false);
    }, [value]);

    // CSS variables for theming
    const countdownVars: React.CSSProperties = {
      '--statistic-title-color': 'var(--color-text-secondary, #00000073)',
      '--statistic-title-font-size': 'var(--font-size-sm, 14px)',
      '--statistic-value-color': valueType === 'positive'
        ? 'var(--color-success, #52c41a)'
        : valueType === 'negative'
          ? 'var(--color-error, #ff4d4f)'
          : valueType === 'warning'
            ? 'var(--color-warning, #faad14)'
            : 'var(--color-text-primary, #000000e0)',
      '--statistic-value-font-size': 'var(--font-size-2xl, 24px)',
      '--statistic-value-font-weight': 'var(--font-weight-semibold, 600)',
    } as React.CSSProperties;

    const containerStyle: React.CSSProperties = {
      ...countdownVars,
      ...style,
    };

    const titleStyle: React.CSSProperties = {
      fontSize: 'var(--statistic-title-font-size)',
      color: 'var(--statistic-title-color)',
      marginBottom: '4px',
    };

    const valueContainerStyle: React.CSSProperties = {
      fontSize: 'var(--statistic-value-font-size)',
      fontWeight: 'var(--statistic-value-font-weight)' as any,
      color: 'var(--statistic-value-color)',
      fontFamily: 'var(--font-family-mono, monospace)',
      ...valueStyle,
    };

    // Loading skeleton
    if (loading) {
      return (
        <div ref={ref} className={`rottay-statistic rottay-statistic--countdown rottay-statistic--loading ${className}`} style={containerStyle}>
          <div style={{ height: '16px', width: '64px', marginBottom: '8px', background: '#f5f5f5', borderRadius: '4px' }} />
          <div style={{ height: '32px', width: '120px', background: '#f5f5f5', borderRadius: '4px' }} />
        </div>
      );
    }

    return (
      <div ref={ref} className={`rottay-statistic rottay-statistic--countdown ${className}`} style={containerStyle}>
        {title && (
          <div className="rottay-statistic__title" style={titleStyle}>
            {title}
          </div>
        )}
        <div className="rottay-statistic__value" style={valueContainerStyle}>
          {prefix && <span className="rottay-statistic__prefix" style={{ marginRight: '4px' }}>{prefix}</span>}
          <span className="rottay-statistic__content">{formatTime(timeLeft, format)}</span>
          {suffix && <span className="rottay-statistic__suffix" style={{ marginLeft: '4px' }}>{suffix}</span>}
        </div>
      </div>
    );
  }
);

Countdown.displayName = 'Statistic.Countdown';

export default Countdown;
