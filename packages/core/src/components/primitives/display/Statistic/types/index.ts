/**
 * @fileoverview Statistic Component Types
 * @description Re-exports from centralized types for the Statistic component.
 * @module components/primitives/display/Statistic/types
 */

export type {
  StatisticProps,
  CountdownProps,
  StatisticValue,
  StatisticValueType,
} from '../../../../../types/primitives/display/Statistic';

export { STATISTIC_DEFAULTS } from '../../../../../types/primitives/display/Statistic';

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
