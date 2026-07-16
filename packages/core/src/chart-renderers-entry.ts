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
export type { SvgLineRendererProps } from './components/patterns/visualization/charts/kernel/renderers/SvgLineRenderer';
