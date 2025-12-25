'use client';

/**
 * Hermes Statistic Engine
 *
 * DaisyUI implementation with unified props interface.
 */

import { useMemo } from 'react';
import type { StatisticProps } from '../types';
import { formatNumber } from '../../../../types/components/statistic';

/**
 * Hermes Statistic Component
 *
 * DaisyUI-styled statistic display.
 */
export default function HermesStatistic(props: StatisticProps) {
  const {
    title,
    value,
    prefix,
    suffix,
    precision,
    valueStyle,
    loading = false,
    decimalSeparator = '.',
    groupSeparator = ',',
    formatter,
    className = '',
    style,
  } = props;

  // Format the value
  const formattedValue = useMemo(() => {
    if (formatter) {
      return formatter(value);
    }

    if (value === undefined || value === null) {
      return '-';
    }

    if (typeof value === 'number') {
      return formatNumber(value, precision, decimalSeparator, groupSeparator);
    }

    return value;
  }, [value, formatter, precision, decimalSeparator, groupSeparator]);

  return (
    <div className={`stat p-0 ${className}`} style={style}>
      {/* Title */}
      {title && (
        <div className="stat-title text-base-content/60 text-sm mb-1">
          {title}
        </div>
      )}

      {/* Value */}
      <div className="stat-value text-2xl font-semibold" style={valueStyle}>
        {loading ? (
          <span className="loading loading-dots loading-md" />
        ) : (
          <span className="flex items-center gap-1">
            {prefix && <span className="text-lg">{prefix}</span>}
            <span>{formattedValue}</span>
            {suffix && <span className="text-lg">{suffix}</span>}
          </span>
        )}
      </div>
    </div>
  );
}
