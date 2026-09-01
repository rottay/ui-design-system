'use client';

/** Dedicated D3-geometry/React-SVG renderer boundary for ChartFrame consumers. */
export {
  SvgBarRenderer,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/bar';
export {
  SvgHeatMapRenderer,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/heat-map';
export {
  SvgFunnelRenderer,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/funnel';
export {
  SvgGaugeRenderer,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/gauge';
export {
  SvgLineRenderer,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/line';
export {
  SvgPieRenderer,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/pie';
export {
  SvgRadarRenderer,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/radar';
export {
  SvgScatterRenderer,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/scatter';
export {
  createSvgLineDatumKey,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/line/datum-key';
export type {
  ChartGeometryInsets,
  SvgBarDatum,
  SvgGaugeGeometry,
  SvgGaugeGeometrySegment,
  SvgGaugeSegment,
  SvgGaugeTone,
  SvgFunnelDatum,
  SvgFunnelGeometry,
  SvgFunnelGeometrySegment,
  SvgFunnelOrientation,
  SvgFunnelSegmentPosition,
  SvgHeatMapDatum,
  SvgLineCurve,
  SvgLinePoint,
  SvgLineSeries,
  SvgLineXType,
  SvgLineXValue,
  SvgPieDatum,
  SvgRadarDatum,
  SvgRadarGeometry,
  SvgRadarGeometryAxis,
  SvgRadarGeometryGridLevel,
  SvgRadarGeometryPoint,
  SvgRadarGeometrySeries,
  SvgRadarSeries,
  SvgScatterDatum,
  SvgScatterVariant,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/foundation/renderers/geometry';
export type { SvgBarRendererProps } from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/bar';
export type { SvgHeatMapRendererProps } from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/heat-map';
export type { SvgFunnelRendererProps } from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/funnel';
export type { SvgGaugeRendererProps } from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/gauge';
export type {
  SvgLineInteractionDatum,
  SvgLineRendererProps,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/line';
export type {
  SvgPieRendererProps,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/pie';
export type {
  SvgRadarInteractionDatum,
  SvgRadarRendererProps,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/radar';
export type {
  SvgScatterRendererProps,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/scatter';
export type {
  ChartActionInteraction,
  ChartActiveDatum,
  ChartExploreInteraction,
  ChartInteraction,
  ChartInteractionMeta,
  ChartInteractionMode,
  ChartInteractionPointerType,
  ChartInteractionReason,
  ChartStaticInteraction,
} from '../../../components/patterns/visualization/charts/runtime/chart-engine/foundation/interaction';
