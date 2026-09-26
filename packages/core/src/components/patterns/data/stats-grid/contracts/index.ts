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
import type { PatternBaseProps, StatDef } from "../../../../../foundation/contracts/runtime/components/patterns/core";
import type { Adapt } from "../../../../../foundation/contracts/kernel/adaptation";
import type { GridMinItem } from "../../../../primitives/layout/grid/contracts";

/** The stats grid's layout-sensitive axis: a posture delta may move the card preset. */
export interface StatsGridAdaptation {
  readonly minItem?: GridMinItem;
}

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
 *   minItem="lg"
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
   * Maximum number of columns in the grid layout, for the classic and rustic
   * engines: phone renders one column, tablet up to two, and desktop this
   * ceiling (via the shared `resolveStatsGridColumns` helper). Defaults to 4.
   *
   * Modern lays out with the adaptive layout kit's auto-fit recipe instead
   * (WO-FAM-12): the tracks follow the card footprint channels and `minItem`,
   * and the container's compact posture takes one column. There `columns` is
   * only the number of placeholder cards the loading state draws.
   *
   * A caller-provided `templateColumns` (or `style.gridTemplateColumns`)
   * remains the explicit escape hatch in every engine.
   */
  columns?: number;

  /**
   * Modern: the card footprint preset the auto-fit tracks are sized for (the
   * Grid primitive's `minItem`). Instance or surface level, never a tenant
   * decision.
   */
  minItem?: GridMinItem;

  /** Modern: an explicit track list; it always wins over the auto-fit recipe. */
  templateColumns?: string;

  /** Modern: posture deltas the app declares; the family has no default of its own. */
  adapt?: Adapt<StatsGridAdaptation>;

  /**
   * Whether to render inline sparkline mini-charts for stats that provide
   * `sparklineData` in their {@link StatDef}. The Modern engine paints the
   * line and its gradient through the per-stat `--ds-stats-grid-accent`
   * channel (driven by {@link StatDef.color}, falling back to the primary
   * ramp) -- never a local literal.
   */
  sparkline?: boolean;

  /**
   * Gap between stat cards. Accepts a number (pixels), a Grid gap rung
   * (`'md'`, `'lg'`, ...) or a CSS length (e.g. `'1rem'`, which Modern carries
   * on the grid's gap channel). Unstated, Modern paints the grid's `md` rung.
   */
  gap?: number | string;

  /**
   * Visual variant applied to each stat card.
   * - `'default'`: Standard card with subtle shadow.
   * - `'outlined'`: Bordered card without fill.
   * - `'filled'`: Solid background fill.
   * - `'glass'`: Frosted glass / translucent effect. The Modern spec reserves
   *   glass for overlay backdrops, so page-level surfaces resolve their
   *   profiles away from it (see `resolveStatsGridVariant` in the
   *   dashboard/report/visualization/operational pages).
   */
  variant?: "default" | "outlined" | "filled" | "glass";

  /**
   * Whether to animate stat values counting up from zero on mount.
   * Provides a polished entrance effect for dashboard views.
   */
  animate?: boolean;

  /**
   * Shows a quiet error posture in place of the cards while preserving the
   * root frame (same contract shape as PatternDataTable's `error`). The
   * notice is announced politely (`role="status"`) and carries a governed
   * status icon, so the state never rides color alone.
   * @default false
   */
  error?: boolean;

  /**
   * Click handler fired when a stat card is clicked.
   * Typically used to navigate to a detail view for the stat.
   */
  onStatClick?: (stat: StatDef) => void;
}
