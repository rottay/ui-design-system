/**
 * @fileoverview Type definitions for the StatsGrid pattern component.
 * Defines {@link StatsGridProps} which controls stat card rendering,
 * responsive column count, sparkline toggling, visual card variants,
 * value animation on mount, and per-stat click handlers.
 *
 * Individual stat data is defined by the shared {@link StatDef} interface
 * from `../types`, which includes value, change indicators, sparkline data,
 * and optional prefix/suffix formatting.
 */

import type { ReactNode } from "react";
import type { PatternBaseProps, StatDef } from "../../foundation/types";

/**
 * Props for the StatsGrid pattern component.
 *
 * Renders a responsive grid of stat cards, each driven by a {@link StatDef}.
 * Supports inline sparkline charts (via D3), animated value transitions,
 * and multiple visual variants.
 *
 * @example
 * ```tsx
 * <StatsGrid
 *   stats={[
 *     { key: 'revenue', label: 'Revenue', value: 45200, prefix: '$',
 *       change: 12.5, changeType: 'increase', sparklineData: [30, 35, 42, 45] },
 *     { key: 'users', label: 'Active Users', value: 1280,
 *       change: -3.2, changeType: 'decrease' },
 *   ]}
 *   columns={3}
 *   sparkline
 *   variant="outlined"
 *   animate
 *   onStatClick={(stat) => navigateTo(stat.href)}
 * />
 * ```
 */
export interface StatsGridProps extends PatternBaseProps {
  /** Array of stat definitions that drive the individual stat cards. */
  stats: StatDef[];

  /**
   * Custom renderer for individual stat cards. Receives the stat definition
   * and the default rendered output, enabling selective overrides.
   */
  renderStat?: (stat: StatDef, defaultRender: ReactNode) => ReactNode;

  /**
   * Maximum number of columns in the grid layout. Phone renders one column,
   * tablet renders up to two, and desktop preserves this explicit ceiling
   * (via the shared `resolveStatsGridColumns` helper). Identical across
   * classic, modern, and rustic. Defaults to 4.
   *
   * A caller-provided `style.gridTemplateColumns` remains the explicit escape
   * hatch when a product needs a layout outside this adaptive progression.
   */
  columns?: number;

  /**
   * Whether to render D3-powered sparkline mini-charts for stats
   * that provide `sparklineData` in their {@link StatDef}.
   */
  sparkline?: boolean;

  /**
   * Gap between stat cards. Accepts a number (pixels) or a CSS
   * spacing string (e.g., `'1rem'`).
   */
  gap?: number | string;

  /**
   * Visual variant applied to each stat card.
   * - `'default'`: Standard card with subtle shadow.
   * - `'outlined'`: Bordered card without fill.
   * - `'filled'`: Solid background fill.
   * - `'glass'`: Frosted glass / translucent effect.
   */
  variant?: "default" | "outlined" | "filled" | "glass";

  /**
   * Whether to animate stat values counting up from zero on mount.
   * Provides a polished entrance effect for dashboard views.
   */
  animate?: boolean;

  /**
   * Click handler fired when a stat card is clicked.
   * Typically used to navigate to a detail view for the stat.
   */
  onStatClick?: (stat: StatDef) => void;
}
