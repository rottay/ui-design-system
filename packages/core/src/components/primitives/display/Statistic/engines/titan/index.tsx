/**
 * @fileoverview Statistic Titan Engine - Rottay Design System
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
 * - Uses `antd/Statistic.Countdown` for timer
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
 *   engine="titan"
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
 *   engine="titan"
 *   title="Time Remaining"
 *   value={Date.now() + 3600000}
 *   format="HH:mm:ss"
 * />
 * ```
 *
 * @see {@link Statistic} for the main component
 * @see {@link https://ant.design/components/statistic} Ant Design Statistic
 * @module Statistic/engines/titan
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import { Statistic as AntStatistic } from 'antd';
import type { StatisticProps, CountdownProps } from '../../types';
import { STATISTIC_DEFAULTS } from '../../types';

/**
 * Maps Rottay valueType to CSS color values.
 * Used to apply semantic coloring to statistic values.
 */
const VALUE_TYPE_COLOR_MAP: Record<string, string> = {
  default: 'inherit',
  positive: '#52c41a',
  negative: '#ff4d4f',
  warning: '#faad14',
};

/**
 * Titan Engine implementation of the Statistic component.
 *
 * This implementation wraps Ant Design's Statistic component,
 * providing a consistent API while leveraging Ant Design's
 * styling and functionality.
 *
 * @example
 * ```tsx
 * <Statistic
 *   engine="titan"
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
      valueType = STATISTIC_DEFAULTS.valueType,
      className,
      style,
    } = props;

    // Apply valueType coloring to valueStyle
    const computedValueStyle: React.CSSProperties = {
      ...valueStyle,
      ...(valueType !== 'default' && { color: VALUE_TYPE_COLOR_MAP[valueType] }),
    };

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
          formatter={formatter}
        />
      </div>
    );
  }
);

Statistic.displayName = 'Statistic.Titan';

/**
 * Titan Engine implementation of the Countdown component.
 *
 * Wraps Ant Design's Statistic.Countdown component, providing
 * countdown functionality with the Rottay Design System API.
 *
 * @example
 * ```tsx
 * <Countdown
 *   engine="titan"
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

    // Apply valueType coloring to valueStyle
    const computedValueStyle: React.CSSProperties = {
      ...valueStyle,
      ...(valueType !== 'default' && { color: VALUE_TYPE_COLOR_MAP[valueType] }),
    };

    return (
      <div ref={ref} className={className} style={style}>
        <AntStatistic.Countdown
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

Countdown.displayName = 'Statistic.Countdown.Titan';

export default Statistic;
