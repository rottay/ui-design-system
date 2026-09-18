/**
 * @fileoverview The typed chart family registry -- one row per family.
 *
 * Six lists describe the eighteen chart families and none is derived from
 * another: the `families/` barrel, the charts barrel, the public entrypoints,
 * the showroom registry, the frozen governance manifest and the `family-cut`
 * roster. This owner is the row set those lists become projections of, and it
 * is what makes a family's paint MODEL a declared fact rather than a shape
 * inferred from whichever expression its renderer happens to use.
 *
 * The seed values are a CENSUS of the tree as measured, not a target state:
 * `geometry: 'family-owned'` and `a11y: 'own'` record where a family sits
 * today, and `honoursColorsProp` records what a family actually does with the
 * prop it declares -- which is why `scatter`, alone among the categorical
 * families, is `false`.
 */

/** How a family decides colour. Only `categorical` cycles a palette. */
export type ChartPaintModel = 'categorical' | 'sequential' | 'semantic' | 'single';

/** Stable family id; equals the `families/` folder basename. */
export type ChartFamilyId =
  | 'area-chart'
  | 'bar-chart'
  | 'bullet'
  | 'calendar-heat-map'
  | 'funnel-chart'
  | 'gantt-chart'
  | 'gauge'
  | 'heat-map'
  | 'histogram'
  | 'line-chart'
  | 'network-graph'
  | 'pie-chart'
  | 'radar-chart'
  | 'sankey'
  | 'scatter'
  | 'sparkline'
  | 'tree-map'
  | 'waterfall';

export interface ChartFamilyRow {
  /** Stable id; equals the family folder basename. */
  readonly id: ChartFamilyId;
  /** The single class namespace this family's skin may use. */
  readonly namespace: `ds-chart-${string}`;
  readonly paintModel: ChartPaintModel;
  /**
   * Size of this family's own per-series cadence (dash, tint, hollow/solid).
   * Distinct from the paint slot count. `null` when the family has no cadence.
   */
  readonly cadenceSize: number | null;
  /** Whether the public `colors` prop is honoured. One answer for all 18. */
  readonly honoursColorsProp: boolean;
  readonly geometry: 'engine' | 'family-owned';
  readonly a11y: 'scaffold' | 'own';
}

function row(
  id: ChartFamilyId,
  namespace: `ds-chart-${string}`,
  paintModel: ChartPaintModel,
  cadenceSize: number | null,
  honoursColorsProp: boolean,
  geometry: ChartFamilyRow['geometry'],
  a11y: ChartFamilyRow['a11y'],
): ChartFamilyRow {
  return Object.freeze({
    id,
    namespace,
    paintModel,
    cadenceSize,
    honoursColorsProp,
    geometry,
    a11y,
  });
}

export const CHART_FAMILY_REGISTRY: Readonly<Record<ChartFamilyId, ChartFamilyRow>> =
  Object.freeze({
    'area-chart': row('area-chart', 'ds-chart-area', 'categorical', 5, true, 'engine', 'scaffold'),
    'bar-chart': row('bar-chart', 'ds-chart-bar', 'categorical', 2, true, 'engine', 'scaffold'),
    bullet: row('bullet', 'ds-chart-bullet', 'semantic', null, false, 'engine', 'scaffold'),
    'calendar-heat-map': row(
      'calendar-heat-map',
      'ds-chart-calendar-heatmap',
      'sequential',
      null,
      false,
      'engine',
      'scaffold',
    ),
    'funnel-chart': row('funnel-chart', 'ds-chart-funnel', 'categorical', null, true, 'engine', 'scaffold'),
    'gantt-chart': row('gantt-chart', 'ds-chart-gantt', 'categorical', null, true, 'engine', 'scaffold'),
    gauge: row('gauge', 'ds-chart-gauge', 'semantic', null, false, 'engine', 'scaffold'),
    'heat-map': row('heat-map', 'ds-chart-heatmap', 'sequential', null, false, 'engine', 'scaffold'),
    histogram: row('histogram', 'ds-chart-histogram', 'single', null, false, 'engine', 'scaffold'),
    'line-chart': row('line-chart', 'ds-chart-line', 'categorical', 5, true, 'engine', 'scaffold'),
    'network-graph': row(
      'network-graph',
      'ds-chart-network-graph',
      'categorical',
      null,
      true,
      'family-owned',
      'scaffold',
    ),
    'pie-chart': row('pie-chart', 'ds-chart-pie', 'categorical', null, true, 'engine', 'scaffold'),
    'radar-chart': row('radar-chart', 'ds-chart-radar', 'categorical', 5, true, 'engine', 'scaffold'),
    sankey: row('sankey', 'ds-chart-sankey', 'categorical', null, true, 'family-owned', 'scaffold'),
    // Declares `ChartColorsProps` and never reads it (its own header records the
    // drop as deliberate). Recorded as measured; the retirement-or-restore of
    // the prop across every categorical family is an open owner decision.
    scatter: row('scatter', 'ds-chart-scatter', 'categorical', null, false, 'engine', 'scaffold'),
    // The one family that stamps its own role="img" instead of routing through
    // the shared scaffold.
    sparkline: row('sparkline', 'ds-chart-sparkline', 'single', null, false, 'engine', 'own'),
    'tree-map': row('tree-map', 'ds-chart-treemap', 'categorical', null, true, 'engine', 'scaffold'),
    waterfall: row('waterfall', 'ds-chart-waterfall', 'semantic', null, false, 'engine', 'scaffold'),
  });

/** Every family id, in the registry's declaration order. */
export const CHART_FAMILY_IDS: readonly ChartFamilyId[] = Object.freeze(
  Object.keys(CHART_FAMILY_REGISTRY) as ChartFamilyId[],
);

/** Narrow an arbitrary string to a registered family id. */
export function isChartFamilyId(value: unknown): value is ChartFamilyId {
  return (
    typeof value === 'string'
    && Object.prototype.hasOwnProperty.call(CHART_FAMILY_REGISTRY, value)
  );
}
