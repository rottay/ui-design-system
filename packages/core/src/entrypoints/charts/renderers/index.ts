'use client';

/** Dedicated D3-geometry/React-SVG renderer boundary for ChartFrame consumers. */
export {
  SvgBarRenderer,
} from '../../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/bar';
export {
  SvgHeatMapRenderer,
} from '../../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/heat-map';
export {
  SvgLineRenderer,
} from '../../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/line';
export {
  SvgPieRenderer,
} from '../../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/pie';
export {
  SvgScatterRenderer,
} from '../../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/scatter';
export {
  createSvgLineDatumKey,
} from '../../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/line/datum-key';
export type {
  ChartGeometryInsets,
  SvgBarDatum,
  SvgHeatMapDatum,
  SvgLineCurve,
  SvgLinePoint,
  SvgLineSeries,
  SvgLineXType,
  SvgLineXValue,
  SvgPieDatum,
  SvgScatterDatum,
  SvgScatterVariant,
} from '../../../ui/patterns/visualization/charts/runtime/chart-engine/foundation/renderers/geometry';
export type { SvgBarRendererProps } from '../../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/bar';
export type { SvgHeatMapRendererProps } from '../../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/heat-map';
export type {
  SvgLineInteractionDatum,
  SvgLineRendererProps,
} from '../../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/line';
export type {
  SvgPieRendererProps,
} from '../../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/pie';
export type {
  SvgScatterRendererProps,
} from '../../../ui/patterns/visualization/charts/runtime/chart-engine/presentation/react/renderers/scatter';
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
} from '../../../ui/patterns/visualization/charts/runtime/chart-engine/foundation/interaction';
