/**
 * @fileoverview Statistic Component - Engine Router
 * @description Main entry point for the Statistic component.
 * Routes to the appropriate engine implementation based on context or props.
 *
 * The Statistic component displays numerical data with optional formatting,
 * supporting titles, prefixes, suffixes, and loading states.
 *
 * @example
 * ```tsx
 * // Basic usage
 * import { Statistic } from '@rottay/design-system';
 *
 * <Statistic title="Active Users" value={1128} />
 *
 * // With formatting
 * <Statistic
 *   title="Revenue"
 *   value={1250000.5}
 *   prefix="$"
 *   precision={2}
 * />
 *
 * // Countdown
 * <Statistic.Countdown
 *   title="Time Remaining"
 *   value={Date.now() + 3600000}
 *   format="HH:mm:ss"
 * />
 * ```
 *
 * @module components/primitives/display/Statistic
 */

import { createEngineComponent } from '../../../../system/engines/factory';
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

// Re-export base component for custom implementations
export { BaseStatistic, formatNumber } from './base';

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
