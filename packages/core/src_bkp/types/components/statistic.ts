/**
 * Statistic Component Types
 *
 * Unified type definitions for the Statistic component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Base Statistic Props
 */
export interface StatisticBaseProps {
  /** Title/label for the statistic */
  title?: ReactNode;

  /** The statistic value */
  value?: string | number;

  /** Prefix element (before value) */
  prefix?: ReactNode;

  /** Suffix element (after value) */
  suffix?: ReactNode;

  /** Value precision (decimal places) */
  precision?: number;

  /** Value style */
  valueStyle?: CSSProperties;

  /** Loading state */
  loading?: boolean;

  /** Decimal separator */
  decimalSeparator?: string;

  /** Thousands separator */
  groupSeparator?: string;

  /** Additional CSS class */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Full Statistic Props
 */
export interface StatisticProps extends StatisticBaseProps {
  /** Custom value formatter */
  formatter?: (value: string | number | undefined) => ReactNode;
}

/**
 * Countdown Props
 */
export interface CountdownProps extends StatisticBaseProps {
  /** Target time (timestamp in ms or Date) */
  value: number | Date;

  /** Format string */
  format?: string;

  /** Callback when countdown finishes */
  onFinish?: () => void;

  /** Callback on each tick */
  onChange?: (value: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format number with separators
 */
export function formatNumber(
  value: number,
  precision?: number,
  decimalSeparator: string = '.',
  groupSeparator: string = ','
): string {
  let formatted = precision !== undefined
    ? value.toFixed(precision)
    : String(value);

  // Split into integer and decimal parts
  const [intPart, decPart] = formatted.split('.');

  // Add group separator to integer part
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);

  // Combine with decimal separator
  if (decPart !== undefined) {
    return `${formattedInt}${decimalSeparator}${decPart}`;
  }

  return formattedInt;
}

/**
 * Parse countdown format string
 */
export function parseCountdownFormat(
  format: string,
  diff: number
): string {
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const milliseconds = diff % 1000;

  return format
    .replace(/DD/g, String(days).padStart(2, '0'))
    .replace(/D/g, String(days))
    .replace(/HH/g, String(hours).padStart(2, '0'))
    .replace(/H/g, String(hours))
    .replace(/mm/g, String(minutes).padStart(2, '0'))
    .replace(/m/g, String(minutes))
    .replace(/ss/g, String(seconds).padStart(2, '0'))
    .replace(/s/g, String(seconds))
    .replace(/SSS/g, String(milliseconds).padStart(3, '0'));
}

/**
 * Get time difference from now to target
 */
export function getTimeDiff(target: number | Date): number {
  const targetMs = target instanceof Date ? target.getTime() : target;
  return Math.max(0, targetMs - Date.now());
}
