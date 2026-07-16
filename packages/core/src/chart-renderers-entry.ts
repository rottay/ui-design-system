'use client';

/** Dedicated D3-geometry/React-SVG renderer boundary for ChartFrame consumers. */
export {
  SvgBarRenderer,
} from './components/patterns/visualization/charts/kernel/renderers/SvgBarRenderer';
export {
  SvgHeatMapRenderer,
} from './components/patterns/visualization/charts/kernel/renderers/SvgHeatMapRenderer';
export {
  SvgLineRenderer,
} from './components/patterns/visualization/charts/kernel/renderers/SvgLineRenderer';
export {
  createSvgLineDatumKey,
} from './components/patterns/visualization/charts/kernel/renderers/SvgLineDatumKey';
export type {
  ChartGeometryInsets,
  SvgBarDatum,
  SvgHeatMapDatum,
  SvgLineCurve,
  SvgLinePoint,
  SvgLineSeries,
  SvgLineXType,
  SvgLineXValue,
} from './components/patterns/visualization/charts/kernel/renderers/ChartGeometry';
export type { SvgBarRendererProps } from './components/patterns/visualization/charts/kernel/renderers/SvgBarRenderer';
export type { SvgHeatMapRendererProps } from './components/patterns/visualization/charts/kernel/renderers/SvgHeatMapRenderer';
export type {
  SvgLineInteractionDatum,
  SvgLineRendererProps,
} from './components/patterns/visualization/charts/kernel/renderers/SvgLineRenderer';
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
} from './components/patterns/visualization/charts/kernel/interaction/ChartInteraction';
