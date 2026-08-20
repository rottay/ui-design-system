"use client";

/**
 * The public chart facade.
 *
 * ONE named, value-only re-export from the `families` owner — not eighteen
 * per-family re-exports. The old shape reached eighteen sibling folders
 * directly, which made the wrapper a second, competing chart barrel: it could
 * drift from `families/index.ts` in either direction (a family published here
 * but not there, or the reverse) and nothing would notice, because each line
 * was independently resolvable. Naming the owner once makes the family set a
 * single fact with a single source.
 *
 * The shape is load-bearing and mechanically enforced by
 * `scripts/taxonomy/chart-facade-parity/index.test.mjs`: exactly one non-type-only
 * `ExportDeclaration`, exactly this module specifier, exactly the eighteen
 * canonical chart component names, no aliases, no type-only elements, no
 * `export *`, no exported local declarations. Types are deliberately absent —
 * chart prop types are published from the contracts boundary, and this is a
 * runtime boundary.
 */
export {
  AreaChart,
  BarChart,
  BulletChart,
  CalendarHeatMap,
  FunnelChart,
  GanttChart,
  GaugeChart,
  HeatMap,
  Histogram,
  LineChart,
  NetworkGraph,
  PieChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  Sparkline,
  TreeMap,
  WaterfallChart,
} from "../../../../ui/patterns/visualization/charts/families";
