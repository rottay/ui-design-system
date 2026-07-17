/**
 * @fileoverview Statistic Classic Engine - Rottay Design System
 * @description Ant Design-based statistic with native countdown support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine wraps Ant Design's Statistic component to provide
 * comprehensive numerical display with countdown functionality.
 *
 * **Exported Components:**
 * - `Statistic` - Main statistic wrapper
 * - `Countdown` - Ant Design countdown wrapper
 *
 * **Implementation Details:**
 * - Uses `antd/Statistic` for core rendering
 * - Uses `antd/Statistic.Timer` for countdown timers
 * - Maps valueType to inline colors
 * - Consistent with Ant Design theming
 *
 * **Ant Design Features:**
 * - Built-in number formatting
 * - Native countdown component
 * - Loading skeleton
 * - Theme token integration
 *
 * @example Statistic Usage
 * ```tsx
 * import { Statistic } from '@rottay/design-system';
 *
 * <Statistic
 *   engine="classic"
 *   title="Account Balance"
 *   value={1128.99}
 *   precision={2}
 *   prefix="$"
 * />
 * ```
 *
 * @example Countdown Usage
 * ```tsx
 * <Statistic.Countdown
 *   engine="classic"
 *   title="Time Remaining"
 *   value={Date.now() + 3600000}
 *   format="HH:mm:ss"
 * />
 * ```
 *
 * @see {@link Statistic} for the main component
 * @see {@link https://ant.design/components/statistic} Ant Design Statistic
 * @module Statistic/engines/classic
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import { Statistic as AntStatistic } from 'antd';
import { CountUp } from '@/graphics/motion';
import type { StatisticProps, CountdownProps } from '../../contracts';
import { STATISTIC_DEFAULTS } from '../../contracts';

/**
 * Maps Rottay valueType to CSS color values.
 * Used to apply semantic coloring to statistic values.
 */
const VALUE_TYPE_COLOR_MAP: Record<string, string> = {
  default: 'inherit',
  positive: 'var(--ds-color-success)',
  negative: 'var(--ds-color-error)',
  warning: 'var(--ds-color-warning)',
};

/**
 * Classic Engine implementation of the Statistic component.
 *
 * This implementation wraps Ant Design's Statistic component,
 * providing a consistent API while leveraging Ant Design's
 * styling and functionality.
 *
 * @example
 * ```tsx
 * <Statistic
 *   engine="classic"
 *   title="Account Balance"
 *   value={1128.99}
 *   precision={2}
 *   prefix="$"
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

    // Merge user-supplied valueStyle with semantic color override.
    // The spread order ensures valueType color only applies when non-default,
    // allowing explicit valueStyle.color to still win via the spread above.
    const computedValueStyle: React.CSSProperties = {
      ...valueStyle,
      ...(valueType !== 'default' && { color: VALUE_TYPE_COLOR_MAP[valueType] }),
    };

    // When animateValue is requested and no custom formatter is provided,
    // swap in the CountUp motion component to animate from countFrom to value.
    // CountUp handles its own rAF loop, so we only supply the locale formatter.
    const resolvedFormatter =
      !formatter && animateValue && typeof value === 'number'
        ? () => (
            <CountUp
              from={countFrom}
              to={value}
              formatter={(nextValue) =>
                typeof nextValue === 'number'
                  ? nextValue.toLocaleString(undefined, {
                      minimumFractionDigits: precision,
                      maximumFractionDigits: precision,
                    })
                  : String(nextValue)
              }
            />
          )
        : formatter;

    return (
      <div ref={ref} className={className} style={style}>
        <AntStatistic
          title={title}
          value={value}
          precision={precision}
          prefix={prefix}
          suffix={suffix}
          valueStyle={computedValueStyle}
          groupSeparator={groupSeparator}
          decimalSeparator={decimalSeparator}
          loading={loading}
          formatter={resolvedFormatter}
        />
      </div>
    );
  }
);

Statistic.displayName = 'Statistic.Classic';

/**
 * Classic Engine implementation of the Countdown component.
 *
 * Wraps Ant Design's Statistic.Timer component in countdown mode, providing
 * countdown functionality with the Rottay Design System API.
 *
 * @example
 * ```tsx
 * <Countdown
 *   engine="classic"
 *   title="Time Remaining"
 *   value={Date.now() + 1000 * 60 * 60}
 *   format="HH:mm:ss"
 *   onFinish={() => console.log('Done!')}
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

    // Apply semantic color based on valueType (same pattern as Statistic above)
    const computedValueStyle: React.CSSProperties = {
      ...valueStyle,
      ...(valueType !== 'default' && { color: VALUE_TYPE_COLOR_MAP[valueType] }),
    };

    return (
      <div ref={ref} className={className} style={style}>
        {/* AntStatistic.Timer with type="countdown" handles the decrement logic
            internally -- we only supply the target timestamp and format pattern.
            The onChange cast to any is needed because Ant expects a slightly
            different signature than our DS-unified CountdownProps. */}
        <AntStatistic.Timer
          type="countdown"
          title={title}
          value={value}
          format={format}
          prefix={prefix}
          suffix={suffix}
          valueStyle={computedValueStyle}
          onFinish={onFinish}
          onChange={onChange as any}
        />
      </div>
    );
  }
);

Countdown.displayName = 'Statistic.Countdown.Classic';

export default Statistic;
