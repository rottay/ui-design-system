/**
 * @fileoverview Statistic Component Type Definitions
 * @description Centralized type definitions for the Statistic component,
 * following the Rottay Design System architecture.
 * @module types/primitives/display/Statistic
 */

import type { ReactNode, CSSProperties } from 'react';
import type { BaseComponentProps, LoadableProps } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

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
