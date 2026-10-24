/**
 * @fileoverview The chart adaptation: whether a chart runs its compact mode,
 * per posture.
 *
 * One boolean, because the posture decides WHEN compact mode is active and the
 * chart's `compact` configuration keeps deciding WHAT it hides. There is
 * deliberately NO family default: compact mode is opt-in (`compactMode` and
 * `autoCompact` default to false), so a chart that declares no `adapt` renders
 * exactly as it did before the slot existed.
 *
 * @module Contracts/Kernel/Adaptation/Families/Charts
 * @category Types
 * @package @rottay/design-system
 */

export interface ChartAdaptation {
  /** Compact mode is active at this posture. */
  readonly compactMode?: boolean;
}

export interface ResolvedChartAdaptation {
  readonly compactMode: boolean;
}
