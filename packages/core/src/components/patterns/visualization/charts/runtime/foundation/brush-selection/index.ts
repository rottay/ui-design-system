/**
 * @fileoverview Shared brush-selection contract for chart range interactions.
 * Owned by the charts runtime foundation so sibling interaction capabilities
 * (the drag-select brush presentation and the viewport zoom/pan controller)
 * both depend downward on one selection shape instead of on each other.
 */

export interface BrushSelection {
  /** Start index or value (always <= end) */
  start: number;
  /** End index or value (always >= start) */
  end: number;
}
