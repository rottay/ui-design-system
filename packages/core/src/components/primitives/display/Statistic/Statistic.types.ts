/**
 * @fileoverview Statistic Types - Rottay Design System
 * @description Type definitions, constants, and CSS variable mappings for the
 * Statistic component. Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides type definitions, default configuration values,
 * and CSS variable mappings for theming the Statistic component.
 *
 * **Type Categories:**
 * - `StatisticProps`: Main component props (title, value, precision, prefix, suffix, loading, valueStyle)
 * - `CountdownProps`: Countdown timer props (value, format, onFinish, onChange)
 * - `StatisticValue`: Allowed value types (number | string)
 * - `StatisticValueType`: Semantic value types for color coding ('positive' | 'negative' | 'warning' | 'default')
 *
 * **Multi-Tenant Support:**
 * All visual aspects are controlled through CSS custom properties in `CSS_VARS`,
 * allowing complete theming customization per tenant without code changes.
 *
 * @example Type Usage
 * ```tsx
 * import type { StatisticProps, CountdownProps, StatisticValueType } from '@rottay/design-system';
 *
 * // Revenue statistic with formatting
 * const revenueProps: StatisticProps = {
 *   title: 'Revenue',
 *   value: 1250000,
 *   precision: 2,
 *   prefix: '$',
 * };
 *
 * // Countdown to deadline
 * const countdownProps: CountdownProps = {
 *   value: Date.now() + 1000 * 60 * 60 * 24,
 *   format: 'HH:mm:ss',
 *   onFinish: () => console.log('Time is up!'),
 * };
 *
 * // Semantic value type for trend coloring
 * const trend: StatisticValueType = 'positive';
 * ```
 *
 * @example Default Values and CSS Variables
 * ```tsx
 * import { STATISTIC_DEFAULTS, CSS_VARS } from '@rottay/design-system';
 *
 * // Access default configuration
 * console.log(STATISTIC_DEFAULTS.precision);  // Default precision
 *
 * // Reference CSS variables for custom theming
 * console.log(CSS_VARS.valueColor);     // '--statistic-value-color'
 * console.log(CSS_VARS.positiveColor);  // '--statistic-positive-color'
 * ```
 *
 * @see {@link StatisticProps} - Main component props
 * @see {@link CountdownProps} - Countdown timer props
 * @see {@link STATISTIC_DEFAULTS} - Default configuration values
 * @see {@link CSS_VARS} - CSS variable name mappings for theming
 * @module Statistic/types
 * @category Display
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { BaseComponentProps, LoadableProps } from '../../../../contracts/common';
import type { EngineAwareProps } from '../../../../contracts/engine';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Value type that can be displayed in a Statistic component.
 * Supports both numeric values and string representations.
 */
export type StatisticValue = string | number;

/**
 * Value styles that control the appearance of the statistic value.
 * Used for semantic coloring of the displayed value.
 */
export type StatisticValueType = 'default' | 'positive' | 'negative' | 'warning';

/**
 * Core props for the Statistic component.
 *
 * @example
 * ```tsx
 * <Statistic
 *   title="Active Users"
 *   value={1128}
 *   prefix={<UserIcon />}
 *   precision={0}
 * />
 * ```
 */
export interface StatisticProps extends BaseComponentProps, LoadableProps, EngineAwareProps {
  /**
   * Title text displayed above the statistic value.
   * Can be a string or any React node for custom formatting.
   */
  title?: ReactNode;

  /**
   * The statistic value to display.
   * Numbers will be formatted according to precision and separator settings.
   * @example 1234567 // Displays as "1,234,567"
   */
  value?: StatisticValue;

  /**
   * Number of decimal places to display.
   * Only applies to numeric values.
   * @default 0
   */
  precision?: number;

  /**
   * Content to display before the value.
   * Useful for currency symbols or icons.
   * @example "$" or <ArrowUpIcon />
   */
  prefix?: ReactNode;

  /**
   * Content to display after the value.
   * Useful for units or percentage signs.
   * @example "%" or "users"
   */
  suffix?: ReactNode;

  /**
   * Custom styles applied to the value element.
   * Allows fine-grained control over the value appearance.
   */
  valueStyle?: CSSProperties;

  /**
   * Character used to separate thousands in the number.
   * @default ","
   */
  groupSeparator?: string;

  /**
   * Character used as the decimal separator.
   * @default "."
   */
  decimalSeparator?: string;

  /**
   * Custom function to format the displayed value.
   * When provided, overrides default number formatting.
   * @param value - The raw value to format
   * @returns Formatted value as a React node
   */
  formatter?: (value: StatisticValue) => ReactNode;

  /**
   * Enables animated count-up behavior for numeric values.
   * When omitted, the active personality profile decides the default.
   */
  animateValue?: boolean;

  /**
   * Starting value used by count-up animations.
   * Only applies when `animateValue` is enabled and the value is numeric.
   * @default 0
   */
  countFrom?: number;

  /**
   * Semantic type affecting the value color.
   * - default: Standard text color
   * - positive: Success/green color (for increases)
   * - negative: Error/red color (for decreases)
   * - warning: Warning/yellow color
   * @default 'default'
   */
  valueType?: StatisticValueType;
}

/**
 * Props for the Statistic.Countdown component.
 * Extends StatisticProps with countdown-specific functionality.
 *
 * @example
 * ```tsx
 * <Statistic.Countdown
 *   title="Time Remaining"
 *   value={Date.now() + 1000 * 60 * 60 * 24}
 *   format="HH:mm:ss"
 *   onFinish={() => console.log('Countdown finished!')}
 * />
 * ```
 */
export interface CountdownProps extends Omit<StatisticProps, 'value' | 'precision' | 'formatter'> {
  /**
   * Target time for the countdown.
   * Accepts a Unix timestamp (milliseconds) or ISO date string.
   * The countdown shows time remaining until this target.
   */
  value: number | string;

  /**
   * Format string for displaying the countdown.
   * Supports the following tokens:
   * - DD: Days with leading zero
   * - D: Days without leading zero
   * - HH: Hours with leading zero
   * - H: Hours without leading zero
   * - mm: Minutes with leading zero
   * - m: Minutes without leading zero
   * - ss: Seconds with leading zero
   * - s: Seconds without leading zero
   * @default "HH:mm:ss"
   */
  format?: string;

  /**
   * Callback function invoked when the countdown reaches zero.
   * Useful for triggering actions like refreshing data or showing notifications.
   */
  onFinish?: () => void;

  /**
   * Callback function invoked on each tick of the countdown.
   * Receives the remaining time in milliseconds.
   * @param value - Remaining time in milliseconds
   */
  onChange?: (value?: number) => void;
}

/**
 * Default values for Statistic component props.
 * Used to ensure consistent behavior across all engine implementations.
 */
export const STATISTIC_DEFAULTS = {
  /** Default number of decimal places */
  precision: 0,
  /** Default thousands separator */
  groupSeparator: ',',
  /** Default decimal separator */
  decimalSeparator: '.',
  /** Default loading state */
  loading: false,
  /** Default countdown format */
  countdownFormat: 'HH:mm:ss',
  /** Default value type */
  valueType: 'default' as const,
} as const;

// ============================================================================
// CSS Variable Mapping
// ============================================================================

/**
 * CSS custom property names for theming the Statistic component.
 * Override these variables in your tenant theme to customize the appearance
 * of all Statistic instances without modifying component code.
 *
 * @constant
 *
 * @remarks
 * These CSS variables should be defined in your theme stylesheet:
 * ```css
 * :root {
 *   --statistic-title-color: var(--ds-color-text-secondary);
 *   --statistic-title-font-size: 14px;
 *   --statistic-value-color: var(--ds-color-text-primary);
 *   --statistic-value-font-size: 24px;
 *   --statistic-value-font-weight: 600;
 *   --statistic-positive-color: var(--ds-color-success);
 *   --statistic-negative-color: var(--ds-color-error);
 *   --statistic-warning-color: var(--ds-color-warning);
 *   --statistic-loading-bg: var(--ds-color-bg-skeleton);
 * }
 * ```
 *
 * @example Using CSS Variables in Custom Wrappers
 * ```tsx
 * import { CSS_VARS } from '@rottay/design-system';
 *
 * // Reference variable names for dynamic styling
 * const trendStyle = {
 *   color: `var(${CSS_VARS.positiveColor})`,
 * };
 * ```
 */
export const CSS_VARS = {
  /** CSS variable for the title/label text color above the value. */
  titleColor: '--statistic-title-color',

  /** CSS variable for the title/label font size. */
  titleFontSize: '--statistic-title-font-size',

  /** CSS variable for the main statistic value text color. */
  valueColor: '--statistic-value-color',

  /** CSS variable for the main statistic value font size. */
  valueFontSize: '--statistic-value-font-size',

  /** CSS variable for the main statistic value font weight. */
  valueFontWeight: '--statistic-value-font-weight',

  /** CSS variable for positive/increase trend color (typically green). */
  positiveColor: '--statistic-positive-color',

  /** CSS variable for negative/decrease trend color (typically red). */
  negativeColor: '--statistic-negative-color',

  /** CSS variable for warning/caution trend color (typically yellow/orange). */
  warningColor: '--statistic-warning-color',

  /** CSS variable for the skeleton loading placeholder background color. */
  loadingBg: '--statistic-loading-bg',
} as const;
