/**
 * @fileoverview StatsGrid layout helpers. Resolves the CSS Grid column axis
 * shared by every engine.
 *
 * Layout is a component-layer concern (Quiet Premium spec section 10:
 * "Layout belongs to the component layer; engines theme, they do not
 * re-layout"). Every engine renders the same fixed-count horizontal grid
 * for a given `columns` value by calling this function; the column axis
 * is not an engine-themable option.
 *
 * This is a pure function (no hooks) so it can be called from engine
 * adapters that may or may not be React components.
 */

/**
 * Resolves the `gridTemplateColumns` value shared by every StatsGrid engine:
 * a fixed grid of `columns` equal-width tracks, laid out horizontally.
 *
 * @param columns - Number of grid columns. Defaults to 4, matching each
 * engine's own `columns` prop default.
 *
 * @example
 * ```tsx
 * const gridStyle = {
 *   display: 'grid',
 *   gridTemplateColumns: resolveStatsGridColumns(columns),
 *   gap,
 * };
 * ```
 */
export function resolveStatsGridColumns(columns = 4): string {
  return `repeat(${columns}, 1fr)`;
}
