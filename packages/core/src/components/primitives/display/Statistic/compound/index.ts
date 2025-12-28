/**
 * @fileoverview Statistic Compound Components - Rottay Design System
 * @description Compound components for the Statistic component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module exports all compound components for the Statistic component.
 *
 * **Available Compounds:**
 * - `Countdown` - Countdown timer with format tokens
 *
 * @example Compound Usage
 * ```tsx
 * import { Statistic } from '@rottay/design-system';
 *
 * // Via compound syntax
 * <Statistic.Countdown
 *   title="Sale Ends"
 *   value={Date.now() + 86400000}
 *   format="DD:HH:mm:ss"
 * />
 *
 * // Or direct import
 * import { Countdown } from '@rottay/design-system';
 * <Countdown title="Timer" value={Date.now() + 3600000} />
 * ```
 *
 * @see {@link Statistic} for main component
 * @see {@link Countdown} for countdown implementation
 * @module Statistic/compound
 * @category Display
 * @package @rottay/design-system
 */

export { Countdown } from './Countdown';
export type { CountdownProps } from './Countdown';
