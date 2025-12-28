/**
 * @fileoverview Statistic Base Component - Rottay Design System
 * @description Base statistic implementation using CSS custom properties.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides the foundation for all Statistic engine implementations.
 * Uses CSS variables for consistent theming across the design system.
 *
 * **Exported Components:**
 * - `BaseStatistic` - Main statistic component
 *
 * **Exported Functions:**
 * - `formatNumber` - Number formatting with separators
 *
 * **Implementation Details:**
 * - CSS custom properties for theming
 * - Semantic value type coloring
 * - Loading skeleton states
 * - Ref forwarding support
 *
 * **CSS Custom Properties Used:**
 * - `--color-text-secondary` - Title color
 * - `--color-text-primary` - Default value color
 * - `--color-success` - Positive value color
 * - `--color-error` - Negative value color
 * - `--color-warning` - Warning value color
 * - `--font-size-sm` - Title font size
 * - `--font-size-2xl` - Value font size
 *
 * @example Basic Usage
 * ```tsx
 * import { BaseStatistic, formatNumber } from '@rottay/design-system';
 *
 * <BaseStatistic title="Revenue" value={1250000} prefix="$" />
 * ```
 *
 * @see {@link Statistic} for engine-aware component
 * @module Statistic/base
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { StatisticProps } from '../types';
import { STATISTIC_DEFAULTS } from '../types';

/**
 * Formats a numeric value with thousands separators and decimal precision.
 *
 * @param value - The value to format
 * @param precision - Number of decimal places
 * @param groupSeparator - Character for thousands separator
 * @param decimalSeparator - Character for decimal point
 * @returns Formatted string representation of the value
 *
 * @example
 * formatNumber(1234567.89, 2, ',', '.') // Returns "1,234,567.89"
 * formatNumber(1000, 0, ' ', ',') // Returns "1 000"
 */
export function formatNumber(
  value: number | string,
  precision: number,
  groupSeparator: string,
  decimalSeparator: string
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);

  const fixed = num.toFixed(precision);
  const [integer, decimal] = fixed.split('.');
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);

  return decimal ? `${formattedInteger}${decimalSeparator}${decimal}` : formattedInteger;
}

/**
 * Base Statistic component using CSS variables for theming.
 * This component provides the foundation for engine-specific implementations.
 *
 * The component uses CSS custom properties for styling, allowing themes
 * to override appearance without modifying component code.
 *
 * @example
 * ```tsx
 * <BaseStatistic
 *   title="Total Revenue"
 *   value={1250000}
 *   prefix="$"
 *   precision={2}
 * />
 * ```
 */
export const BaseStatistic = forwardRef<HTMLDivElement, StatisticProps>(
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

    // Build CSS variables for theming
    const statisticVars: React.CSSProperties = {
      '--ds-statistic-title-color': 'var(--ds-color-text-secondary, #00000073)',
      '--ds-statistic-title-font-size': 'var(--ds-font-size-sm, 14px)',
      '--ds-statistic-value-color': valueType === 'positive'
        ? 'var(--ds-color-success, #52c41a)'
        : valueType === 'negative'
          ? 'var(--ds-color-error, #ff4d4f)'
          : valueType === 'warning'
            ? 'var(--ds-color-warning, #faad14)'
            : 'var(--ds-color-text-primary, #000000e0)',
      '--ds-statistic-value-font-size': 'var(--ds-font-size-2xl, 24px)',
      '--ds-statistic-value-font-weight': 'var(--ds-font-weight-semibold, 600)',
      '--ds-statistic-loading-bg': 'var(--ds-color-bg-secondary, #f5f5f5)',
    } as React.CSSProperties;

    // Container styles
    const containerStyle: React.CSSProperties = {
      ...statisticVars,
      ...style,
    };

    // Title styles using CSS variables
    const titleStyle: React.CSSProperties = {
      fontSize: 'var(--ds-statistic-title-font-size)',
      color: 'var(--ds-statistic-title-color)',
      marginBottom: '4px',
    };

    // Value container styles using CSS variables
    const valueContainerStyle: React.CSSProperties = {
      fontSize: 'var(--ds-statistic-value-font-size)',
      fontWeight: 'var(--ds-statistic-value-font-weight)' as any,
      color: 'var(--ds-statistic-value-color)',
      ...valueStyle,
    };

    // Loading skeleton styles
    const skeletonStyle: React.CSSProperties = {
      background: 'var(--ds-statistic-loading-bg)',
      borderRadius: '4px',
      animation: 'pulse 1.5s ease-in-out infinite',
    };

    // Render loading skeleton
    if (loading) {
      return (
        <div ref={ref} className={`rottay-statistic rottay-statistic--loading ${className}`} style={containerStyle}>
          <div style={{ ...skeletonStyle, height: '16px', width: '64px', marginBottom: '8px' }} />
          <div style={{ ...skeletonStyle, height: '32px', width: '96px' }} />
        </div>
      );
    }

    return (
      <div ref={ref} className={`rottay-statistic ${className}`} style={containerStyle}>
        {title && (
          <div className="rottay-statistic__title" style={titleStyle}>
            {title}
          </div>
        )}
        <div className="rottay-statistic__value" style={valueContainerStyle}>
          {prefix && <span className="rottay-statistic__prefix" style={{ marginRight: '4px' }}>{prefix}</span>}
          <span className="rottay-statistic__content">{displayValue}</span>
          {suffix && <span className="rottay-statistic__suffix" style={{ marginLeft: '4px' }}>{suffix}</span>}
        </div>
      </div>
    );
  }
);

BaseStatistic.displayName = 'BaseStatistic';
