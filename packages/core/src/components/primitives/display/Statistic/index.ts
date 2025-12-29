/**
 * @fileoverview Statistic Component - Rottay Design System
 * @description Numerical data display with formatting, countdown, and value types.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The Statistic component displays numerical data with optional formatting,
 * supporting titles, prefixes, suffixes, value types, and countdown timers.
 *
 * **Multi-Engine Architecture:**
 * - **Titan**: Ant Design Statistic with full feature support
 * - **Hermes**: DaisyUI-styled statistic with Tailwind utilities
 * - **Apollo**: Pure HTML/CSS with WCAG-compliant colors
 *
 * **Key Features:**
 * - Number formatting with separators and precision
 * - Semantic value types (positive, negative, warning)
 * - Prefix and suffix support
 * - Loading skeleton states
 * - Countdown timer compound component
 * - Custom formatter function support
 *
 * **Compound Components:**
 * - `Statistic.Countdown` - Countdown timer with format tokens
 *
 * **CSS Custom Properties:**
 * - `--statistic-title-color` - Title text color
 * - `--statistic-title-font-size` - Title font size
 * - `--statistic-value-color` - Value text color
 * - `--statistic-value-font-size` - Value font size
 * - `--statistic-positive-color` - Positive value color
 * - `--statistic-negative-color` - Negative value color
 * - `--statistic-warning-color` - Warning value color
 *
 * @example Basic Usage
 * ```tsx
 * import { Statistic } from '@rottay/design-system';
 *
 * <Statistic title="Active Users" value={1128} />
 * ```
 *
 * @example With Formatting
 * ```tsx
 * <Statistic
 *   title="Revenue"
 *   value={1250000.5}
 *   prefix="$"
 *   precision={2}
 * />
 * ```
 *
 * @example Value Types
 * ```tsx
 * <Statistic title="Growth" value={15.5} suffix="%" valueType="positive" />
 * <Statistic title="Loss" value={-8.2} suffix="%" valueType="negative" />
 * ```
 *
 * @example Countdown Timer
 * ```tsx
 * <Statistic.Countdown
 *   title="Time Remaining"
 *   value={Date.now() + 3600000}
 *   format="HH:mm:ss"
 *   onFinish={() => console.log('Done!')}
 * />
 * ```
 *
 * @see {@link StatisticProps} for component props
 * @see {@link CountdownProps} for countdown props
 * @module Statistic
 * @category Display
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { StatisticProps, CountdownProps } from './types';
import { Countdown } from './compound';

// Re-export types
export type {
  StatisticProps,
  CountdownProps,
  StatisticValue,
  StatisticValueType,
} from './types';

export { STATISTIC_DEFAULTS, CSS_VARS } from './types';

// Re-export compound components
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

// Re-export base component for custom implementations

/**
 * Statistic component for displaying numerical data.
 *
 * Supports multiple rendering engines:
 * - **Titan**: Ant Design implementation (default)
 * - **Hermes**: DaisyUI/Tailwind implementation
 * - **Apollo**: Vanilla HTML/CSS implementation
 *
 * @example
 * ```tsx
 * // Default engine (Titan)
 * <Statistic title="Users" value={1024} />
 *
 * // Specific engine
 * <Statistic engine="hermes" title="Users" value={1024} />
 *
 * // With value type for semantic coloring
 * <Statistic title="Growth" value={15.5} suffix="%" valueType="positive" />
 * ```
 */
const StatisticBase = createEngineComponent<StatisticProps>('Statistic', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Statistic })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Statistic })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Statistic })),
});

/**
 * Engine-aware Countdown component.
 * Routes to the appropriate engine implementation.
 */
const CountdownEngine = createEngineComponent<CountdownProps>('Statistic.Countdown', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Countdown })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Countdown })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Countdown })),
});

/**
 * Statistic component with compound components attached.
 *
 * Available compound components:
 * - `Statistic.Countdown` - Countdown timer component
 *
 * @example
 * ```tsx
 * // Countdown usage
 * <Statistic.Countdown
 *   title="Sale Ends In"
 *   value={Date.now() + 86400000}
 *   format="DD:HH:mm:ss"
 *   onFinish={() => console.log('Sale ended!')}
 * />
 * ```
 */
export const Statistic = Object.assign(StatisticBase, {
  Countdown: CountdownEngine,
});

export default Statistic;
