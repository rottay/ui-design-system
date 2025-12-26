/**
 * @fileoverview Statistic Base Component
 * @description Engine-agnostic base implementation using CSS variables
 * for consistent styling across all engines.
 * @module components/primitives/display/Statistic/base
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
      '--statistic-loading-bg': 'var(--color-bg-secondary, #f5f5f5)',
    } as React.CSSProperties;

    // Container styles
    const containerStyle: React.CSSProperties = {
      ...statisticVars,
      ...style,
    };

    // Title styles using CSS variables
    const titleStyle: React.CSSProperties = {
      fontSize: 'var(--statistic-title-font-size)',
      color: 'var(--statistic-title-color)',
      marginBottom: '4px',
    };

    // Value container styles using CSS variables
    const valueContainerStyle: React.CSSProperties = {
      fontSize: 'var(--statistic-value-font-size)',
      fontWeight: 'var(--statistic-value-font-weight)' as any,
      color: 'var(--statistic-value-color)',
      ...valueStyle,
    };

    // Loading skeleton styles
    const skeletonStyle: React.CSSProperties = {
      background: 'var(--statistic-loading-bg)',
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
