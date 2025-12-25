'use client';

/**
 * Apollo Statistic Engine
 *
 * Native HTML + Tailwind implementation with unified props interface.
 */

import { useMemo } from 'react';
import type { StatisticProps } from '../types';
import { formatNumber } from '../../../../types/components/statistic';

/**
 * Apollo Statistic Component
 *
 * Pure Tailwind-styled statistic display.
 */
export default function ApolloStatistic(props: StatisticProps) {
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
    <div className={`inline-block ${className}`} style={style}>
      {/* Title */}
      {title && (
        <div className="text-gray-500 text-sm mb-1">
          {title}
        </div>
      )}

      {/* Value */}
      <div
        className="text-2xl font-semibold text-gray-900"
        style={valueStyle}
      >
        {loading ? (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <span className="flex items-center gap-1">
            {prefix && <span className="text-lg text-gray-600">{prefix}</span>}
            <span>{formattedValue}</span>
            {suffix && <span className="text-lg text-gray-600">{suffix}</span>}
          </span>
        )}
      </div>
    </div>
  );
}
