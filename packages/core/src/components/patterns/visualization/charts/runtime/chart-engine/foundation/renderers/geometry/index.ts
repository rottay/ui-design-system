/**
 * Immutable geometry builders for the React-owned SVG chart renderers.
 *
 * D3 is deliberately limited to scales, paths and interpolation. This module
 * never selects, appends, removes or mutates DOM nodes.
 */

export {
  DEFAULT_CARTESIAN_INSETS,
  DEFAULT_HEATMAP_INSETS,
  DEFAULT_RADIAL_INSETS,
} from './foundation';
export type {
  ChartGeometryInsets,
  ChartGeometryRect,
  ChartGeometryTick,
  SvgLineCurve,
} from './foundation';
export { buildSvgBarGeometry, buildSvgBarSeriesGeometry } from './bar';
export type {
  SvgBarDatum,
  SvgBarGeometryDatum,
  SvgBarGeometry,
  BuildSvgBarGeometryOptions,
  SvgBarSeriesPoint,
  SvgBarSeriesInput,
  SvgBarLayout,
  SvgBarSeriesGeometryDatum,
  SvgBarSeriesGeometry,
  BuildSvgBarSeriesGeometryOptions,
} from './bar';
export { buildSvgPieGeometry } from './pie';
export type {
  SvgPieDatum,
  SvgPieGeometryDatum,
  SvgPieGeometry,
  BuildSvgPieGeometryOptions,
} from './pie';
export { buildSvgGaugeGeometry } from './gauge';
export type {
  SvgGaugeSegment,
  SvgGaugeTone,
  SvgGaugeGeometrySegment,
  SvgGaugeGeometry,
  BuildSvgGaugeGeometryOptions,
} from './gauge';
export { buildSvgRadarGeometry } from './radar';
export type {
  SvgRadarDatum,
  SvgRadarSeries,
  SvgRadarGeometryAxis,
  SvgRadarGeometryPoint,
  SvgRadarGeometryGridLevel,
  SvgRadarGeometrySeries,
  SvgRadarGeometry,
  BuildSvgRadarGeometryOptions,
} from './radar';
export { DEFAULT_FUNNEL_INSETS, buildSvgFunnelGeometry } from './funnel';
export type {
  SvgFunnelDatum,
  SvgFunnelOrientation,
  SvgFunnelSegmentPosition,
  SvgFunnelGeometrySegment,
  SvgFunnelGeometry,
  BuildSvgFunnelGeometryOptions,
} from './funnel';
export { buildSvgLineGeometry } from './line';
export type {
  SvgLineXValue,
  SvgLineXType,
  SvgLinePoint,
  SvgLineSeries,
  SvgLineGeometryPoint,
  SvgLineGeometrySeries,
  SvgLineGeometry,
  BuildSvgLineGeometryOptions,
} from './line';
export { buildSvgScatterGeometry } from './scatter';
export type {
  SvgScatterVariant,
  SvgScatterDatum,
  SvgScatterGeometryDatum,
  SvgScatterTrendLine,
  SvgScatterGeometry,
  BuildSvgScatterGeometryOptions,
} from './scatter';
export { buildSvgHeatMapGeometry } from './heat-map';
export type {
  SvgHeatMapDatum,
  SvgHeatMapGeometryDatum,
  SvgHeatMapGeometry,
  BuildSvgHeatMapGeometryOptions,
} from './heat-map';
export { buildSvgBulletGeometry } from './bullet';
export type {
  SvgBulletDatum,
  SvgBulletOrientation,
  SvgBulletTier,
  SvgBulletBand,
  SvgBulletItemGeometry,
  SvgBulletGeometry,
  BuildSvgBulletGeometryOptions,
} from './bullet';
export { buildSvgTreeMapGeometry } from './treemap';
export type {
  SvgTreeMapNode,
  SvgTreeMapTile,
  SvgTreeMapGeometry,
  BuildSvgTreeMapGeometryOptions,
} from './treemap';
export { buildSvgCalendarHeatMapGeometry } from './calendar-heat-map';
export type {
  SvgCalendarHeatMapCell,
  SvgCalendarHeatMapLabel,
  SvgCalendarHeatMapGeometry,
  BuildSvgCalendarHeatMapGeometryOptions,
} from './calendar-heat-map';
export { buildSvgGanttGeometry } from './gantt';
export type {
  SvgGanttTask,
  SvgGanttBarGeometry,
  SvgGanttGeometry,
  BuildSvgGanttGeometryOptions,
} from './gantt';
export { buildSvgAreaGeometry } from './area';
export type {
  SvgAreaPoint,
  SvgAreaSeries,
  SvgAreaGeometryPoint,
  SvgAreaGeometrySeries,
  SvgAreaGeometry,
  BuildSvgAreaGeometryOptions,
} from './area';
export { buildSvgSparklineGeometry } from './sparkline';
export type {
  SvgSparklineCurve,
  SvgSparklineDot,
  SvgSparklineGeometry,
  BuildSvgSparklineGeometryOptions,
} from './sparkline';
export { buildSvgHistogramGeometry } from './histogram';
export type {
  SvgHistogramBin,
  SvgHistogramCumulativePoint,
  SvgHistogramCumulative,
  SvgHistogramGeometry,
  BuildSvgHistogramGeometryOptions,
} from './histogram';
export { buildSvgWaterfallGeometry } from './waterfall';
export type {
  SvgWaterfallType,
  SvgWaterfallDatum,
  SvgWaterfallBar,
  SvgWaterfallConnector,
  SvgWaterfallGeometry,
  BuildSvgWaterfallGeometryOptions,
} from './waterfall';
