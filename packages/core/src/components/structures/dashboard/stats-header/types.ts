/**
 * @fileoverview Type definitions for the StatsHeader chrome family.
 *
 * StatsHeader renders operational stat cards with counter animations,
 * sparkline dots, contextual insights, and gradient glow accents.
 * Each card feels like a live metric on an operations dashboard.
 *
 * @category Structures
 */

import type { ReactNode } from 'react';

/**
 * Accent color token names that map to `--ds-color-*` CSS variables.
 */
export type AccentColor = 'primary' | 'success' | 'warning' | 'error' | 'info';

/**
 * A single stat metric definition.
 *
 * Each item drives one card in the StatsHeader row. Numeric values
 * animate with a count-up effect on mount; string values render
 * immediately.
 *
 * @example
 * ```ts
 * const stat: StatItem = {
 *   key: 'total',
 *   label: 'Total Events',
 *   value: 142,
 *   change: 8,
 *   changeType: 'increase',
 *   periodLabel: 'this week',
 *   icon: <CalendarDays size={18} />,
 *   sparkDots: [30, 45, 60, 40, 80, 70, 95],
 *   insight: 'Peak on Saturdays',
 *   accentColor: 'primary',
 * };
 * ```
 */
export interface StatItem {
  /** Unique identifier */
  key: string;
  /** Metric label (displayed above the value) */
  label: string;
  /** Metric value (string or number -- numbers animate on mount) */
  value: string | number;
  /** Absolute change value */
  change?: number;
  /** Direction of the change */
  changeType?: 'increase' | 'decrease' | 'neutral';
  /** Override text for the change display */
  changeLabel?: string;
  /** Period label below the change, e.g. "this week", "vs last month" */
  periodLabel?: string;
  /** Text/symbol before the value */
  prefix?: string;
  /** Text/symbol after the value */
  suffix?: string;
  /** Icon displayed in the top-right corner */
  icon?: ReactNode;
  /** Contextual insight line, e.g. "Peak on Saturdays" */
  insight?: string;
  /** 7 values (0-100 scale) for sparkline dots visualization */
  sparkDots?: number[];
  /** Accent color for gradient glow and sparkline dots */
  accentColor?: AccentColor;
  /** Optional progress bar percentage (0-100), secondary to sparkDots */
  progress?: number;
  /** Optional click handler to filter by this stat */
  onClick?: () => void;
}

/**
 * Props for the StatsHeader pattern component.
 *
 * Renders 3-5 stat cards in a responsive horizontal row above data
 * tables, each with animated counters, sparkline dots, gradient glow,
 * and contextual insights.
 *
 * @example
 * ```tsx
 * <StatsHeader
 *   stats={[
 *     {
 *       key: 'total',
 *       label: 'Total Events',
 *       value: 142,
 *       change: 8,
 *       changeType: 'increase',
 *       periodLabel: 'this week',
 *       icon: <CalendarDays size={18} />,
 *       sparkDots: [30, 45, 60, 40, 80, 70, 95],
 *       insight: 'Peak on Saturdays',
 *       accentColor: 'primary',
 *     },
 *   ]}
 * />
 * ```
 */
export interface StatsHeaderProps {
  /** Array of stat items to display */
  stats: StatItem[];
  /** Show skeleton loading state */
  loading?: boolean;
}
