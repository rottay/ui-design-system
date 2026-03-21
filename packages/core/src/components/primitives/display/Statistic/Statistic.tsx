'use client';

/**
 * @fileoverview Statistic - Numerical data display with formatting and countdown.
 * Renders a title + formatted value pair with optional prefix/suffix and
 * semantic coloring (positive/negative/warning). `Statistic.Countdown`
 * provides a live countdown timer compound sub-component.
 *
 * @example
 * ```tsx
 * import { Statistic } from '@rottay/design-system';
 *
 * <Statistic title="Revenue" value={1250000} prefix="$" precision={2} />
 * <Statistic title="Growth" value={15.5} suffix="%" valueType="positive" />
 *
 * <Statistic.Countdown
 *   title="Sale Ends"
 *   value={Date.now() + 3600000}
 *   format="HH:mm:ss"
 * />
 * ```
 *
 * @module Statistic
 * @category Display
 */

import { createElement, forwardRef } from 'react';

import { createEngineComponent } from '../../../../runtime/engines/factory';
import { useOptionalTokens } from '../../../../hooks';
import {
  mergePersonalityStyle,
  resolveStatisticPersonalityStyle,
} from '../../../../runtime/personality/primitives';
import type { StatisticProps, CountdownProps } from './Statistic.types';
import { Countdown } from './compound';

export type {
  StatisticProps,
  CountdownProps,
  StatisticValue,
  StatisticValueType,
} from './Statistic.types';

export { STATISTIC_DEFAULTS, CSS_VARS } from './Statistic.types';

export { Countdown };

/**
 * Formats a number with custom separators and precision.
 *
 * @param value - The value to format (number or string)
 * @param precision - Number of decimal places (default: 0)
 * @param groupSeparator - Thousands separator (default: ',')
 * @param decimalSeparator - Decimal separator (default: '.')
 * @returns Formatted string representation
 *
 * @example
 * ```ts
 * formatNumber(1234567, 0, ',', '.') // "1,234,567"
 * formatNumber(1234.5678, 2, ',', '.') // "1,234.57"
 * formatNumber(1234567.89, 2, '.', ',') // "1.234.567,89"
 * ```
 */
export function formatNumber(
  value: number | string,
  precision: number = 0,
  groupSeparator: string = ',',
  decimalSeparator: string = '.'
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return String(value);
  }

  const fixed = num.toFixed(precision);
  const [intPart, decPart] = fixed.split('.');

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);

  return decPart !== undefined
    ? `${formattedInt}${decimalSeparator}${decPart}`
    : formattedInt;
}

/** Engine-routed base for the static value display. */
const StatisticBase = createEngineComponent<StatisticProps>('Statistic', {
  classic: () => import('./engines/classic').then(m => ({ default: m.Statistic })),
  modern: () => import('./engines/modern').then(m => ({ default: m.Statistic })),
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Statistic })),
});

/** Engine-routed base for the live countdown timer. */
const CountdownBase = createEngineComponent<CountdownProps>('Statistic.Countdown', {
  classic: () => import('./engines/classic').then(m => ({ default: m.Countdown })),
  modern: () => import('./engines/modern').then(m => ({ default: m.Countdown })),
  rustic: () => import('./engines/rustic').then(m => ({ default: m.Countdown })),
});

/**
 * Personality wrapper for Statistic.
 *
 * Merges count-up animation and typography styles from the tenant's personality
 * tokens so dashboard metrics adopt the correct visual energy level.
 */
const StatisticComponent = forwardRef<any, StatisticProps>((props, ref) => {
  const tokens = useOptionalTokens();
  const { style, animateValue, ...rest } = props;

  return createElement(StatisticBase, {
    ref,
    ...rest,
    // Count-up animation defaults come from personality so dashboards can feel
    // energetic or restrained without rewriting each stat call site.
    animateValue: animateValue ?? tokens?.personality.animation.countUpEnabled,
    style: tokens ? mergePersonalityStyle(style, resolveStatisticPersonalityStyle(tokens)) : style,
  });
});

StatisticComponent.displayName = 'Statistic';

/**
 * Personality wrapper for Countdown.
 * Shares the same typography/value styling contract as Statistic so they
 * look visually consistent when placed side by side on dashboards.
 */
const CountdownEngine = forwardRef<any, CountdownProps>((props, ref) => {
  const tokens = useOptionalTokens();
  const { style, ...rest } = props;

  return createElement(CountdownBase, {
    ref,
    ...rest,
    style: tokens ? mergePersonalityStyle(style, resolveStatisticPersonalityStyle(tokens)) : style,
  });
});

CountdownEngine.displayName = 'Statistic.Countdown';

/** Compound assembly: attaches Countdown so consumers write `Statistic.Countdown`. */
export const Statistic = Object.assign(StatisticComponent, {
  /** Live countdown timer that ticks down to a target timestamp. */
  Countdown: CountdownEngine,
});

export default Statistic;
