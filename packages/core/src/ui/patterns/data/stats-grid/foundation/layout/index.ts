/**
 * @fileoverview StatsGrid layout helpers. Resolves the CSS Grid column axis
 * shared by every engine.
 *
 * Layout is a component-layer concern (Quiet Premium spec section 10:
 * "Layout belongs to the component layer; engines theme, they do not
 * re-layout"). Every engine renders the same responsive column progression
 * for a given `columns` ceiling by calling this function; the column axis
 * is not an engine-themable option.
 *
 * This is a pure function (no hooks) so it can be called from engine
 * adapters that may or may not be React components.
 */

/**
 * Canonical viewport tiers used by the StatsGrid layout contract.
 */
export type StatsGridViewport = "phone" | "tablet" | "desktop";

const DEFAULT_COLUMNS = 4;
const TABLET_COLUMN_CEILING = 2;

/**
 * Resolves the number of columns shared by every StatsGrid engine.
 *
 * `columns` is the caller's desktop ceiling, not a request to squeeze that
 * many cards into every viewport. Phone always projects one card per row;
 * tablet progresses to at most two; desktop preserves the explicit ceiling.
 */
export function resolveStatsGridColumnCount(
  columns = DEFAULT_COLUMNS,
  viewport: StatsGridViewport = "desktop"
): number {
  const normalizedColumns = Number.isFinite(columns)
    ? Math.max(1, Math.floor(columns))
    : DEFAULT_COLUMNS;

  if (viewport === "phone") return 1;
  if (viewport === "tablet") {
    return Math.min(TABLET_COLUMN_CEILING, normalizedColumns);
  }
  return normalizedColumns;
}

/**
 * Resolves the `gridTemplateColumns` value shared by every StatsGrid engine:
 * a viewport-safe grid of equal-width tracks.
 *
 * `minmax(0, 1fr)` is intentional: plain `1fr` keeps an automatic minimum
 * and allows long labels or values to widen a track beyond its container.
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
export function resolveStatsGridColumns(
  columns = DEFAULT_COLUMNS,
  viewport: StatsGridViewport = "desktop"
): string {
  const resolvedColumns = resolveStatsGridColumnCount(columns, viewport);
  return `repeat(${resolvedColumns}, minmax(0, 1fr))`;
}
