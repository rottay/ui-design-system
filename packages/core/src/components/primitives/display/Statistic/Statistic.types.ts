/**
 * @fileoverview Statistic Types - Rottay Design System
 * @description Type definitions and constants for the Statistic component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module re-exports types from the centralized type system and provides
 * CSS variable mappings for theming the Statistic component.
 *
 * **Exported Types:**
 * - `StatisticProps` - Main component properties
 * - `CountdownProps` - Countdown timer properties
 * - `StatisticValue` - Value type (number | string)
 * - `StatisticValueType` - Semantic value types
 *
 * **Exported Constants:**
 * - `STATISTIC_DEFAULTS` - Default configuration values
 * - `CSS_VARS` - CSS variable name mappings
 *
 * @example Type Usage
 * ```tsx
 * import type { StatisticProps, CountdownProps } from '@rottay/design-system';
 *
 * const props: StatisticProps = {
 *   title: 'Revenue',
 *   value: 1250000,
 *   precision: 2,
 *   prefix: '$',
 * };
 * ```
 *
 * @see {@link Statistic} for component implementation
 * @module Statistic/types
 * @category Display
 * @package @rottay/design-system
 */

export type {
  StatisticProps,
  CountdownProps,
  StatisticValue,
  StatisticValueType,
} from '../../../../contracts/primitives/display/Statistic';

export { STATISTIC_DEFAULTS } from '../../../../contracts/primitives/display/Statistic';

/**
 * CSS variable mapping for Statistic component theming.
 * These variables can be overridden in the theme to customize appearance.
 */
export const CSS_VARS = {
  /** Title text color */
  titleColor: '--statistic-title-color',
  /** Title font size */
  titleFontSize: '--statistic-title-font-size',
  /** Value text color */
  valueColor: '--statistic-value-color',
  /** Value font size */
  valueFontSize: '--statistic-value-font-size',
  /** Value font weight */
  valueFontWeight: '--statistic-value-font-weight',
  /** Positive value color (for increases) */
  positiveColor: '--statistic-positive-color',
  /** Negative value color (for decreases) */
  negativeColor: '--statistic-negative-color',
  /** Warning value color */
  warningColor: '--statistic-warning-color',
  /** Loading skeleton background */
  loadingBg: '--statistic-loading-bg',
} as const;
