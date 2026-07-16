'use client';

import { useMemo, type CSSProperties } from 'react';

import { useChartDimensions } from '../../hooks/use-chart-dimensions';
import {
  buildSvgLineGeometry,
  type ChartGeometryInsets,
  type SvgLineCurve,
  type SvgLineSeries,
  type SvgLineXType,
} from './ChartGeometry';
import { ChartRendererSurface } from './ChartRendererSurface';

type ChartPaintStyle = CSSProperties & {
  '--ds-chart-mark-color'?: string;
};

export interface SvgLineRendererProps {
  readonly series: readonly SvgLineSeries[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly width?: number;
  readonly height?: number;
  /** Recompute geometry from the container width. Defaults to true. */
  readonly responsive?: boolean;
  readonly xType?: SvgLineXType;
  readonly curve?: SvgLineCurve;
  readonly showArea?: boolean;
  readonly showDots?: boolean;
  readonly insets?: ChartGeometryInsets;
  readonly maxTicks?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/** React-owned semantic SVG line renderer. D3 only calculates paths/scales. */
export function SvgLineRenderer({
  series,
  ariaLabel,
  ariaDescription,
  width = 640,
  height = 360,
  responsive = true,
  xType = 'category',
  curve = 'linear',
  showArea = false,
  showDots = true,
  insets,
  maxTicks,
  className,
  style,
}: SvgLineRendererProps): React.ReactElement {
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive ? dimensions.width : width;
  const geometry = useMemo(
    () => buildSvgLineGeometry({
      series,
      width: geometryWidth,
      height,
      xType,
      curve,
      showArea,
      insets,
      maxTicks,
    }),
    [curve, geometryWidth, height, insets, maxTicks, series, showArea, xType],
  );
  const pointCount = geometry.series.reduce(
    (count, currentSeries) => count + currentSeries.points.length,
    0,
  );

  return (
    <ChartRendererSurface
      rendererId="svg.line"
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={pointCount === 0}
      className={['ds-chart-renderer-line', className].filter(Boolean).join(' ')}
      style={style}
      ownerRef={containerRef}
    >
      <g data-part="grid" aria-hidden="true">
        {geometry.yTicks.map((tick) => (
          <line
            key={tick.id}
            data-part="grid-line"
            x1={geometry.plot.x}
            x2={geometry.plot.x + geometry.plot.width}
            y1={tick.y}
            y2={tick.y}
          />
        ))}
      </g>

      <g data-part="axis" data-axis="x" aria-hidden="true">
        {geometry.xTicks.map((tick) => (
          <text
            key={tick.id}
            data-part="axis-tick-label"
            x={tick.x}
            y={tick.y + 20}
            textAnchor="middle"
          >
            {tick.label}
          </text>
        ))}
      </g>

      <g data-part="axis" data-axis="y" aria-hidden="true">
        {geometry.yTicks.map((tick) => (
          <text
            key={tick.id}
            data-part="axis-tick-label"
            x={tick.x - 8}
            y={tick.y}
            textAnchor="end"
            dominantBaseline="middle"
          >
            {tick.label}
          </text>
        ))}
      </g>

      <line
        data-part="baseline"
        aria-hidden="true"
        x1={geometry.plot.x}
        x2={geometry.plot.x + geometry.plot.width}
        y1={geometry.baseline}
        y2={geometry.baseline}
      />

      <g data-part="series-collection">
        {geometry.series.map((currentSeries, seriesIndex) => {
          const paintStyle: ChartPaintStyle = {
            '--ds-chart-mark-color': currentSeries.seriesColor
              ?? `var(--ds-chart-series-${(seriesIndex % 10) + 1}, var(--ds-color-primary))`,
          };

          return (
            <g
              key={currentSeries.id}
              data-part="line-series"
              data-series-id={currentSeries.id}
              aria-label={currentSeries.label}
              style={paintStyle}
            >
              {showArea && currentSeries.areaPath ? (
                <path data-part="area" d={currentSeries.areaPath} aria-hidden="true" />
              ) : null}
              <path data-part="line" d={currentSeries.path} aria-hidden="true" />
              {showDots ? currentSeries.points.map((point) => {
                const accessibleLabel = point.ariaLabel
                  ?? `${currentSeries.label}, ${point.xLabel ?? point.x}: ${point.valueLabel ?? point.value}`;
                return (
                  <circle
                    key={point.id}
                    data-part="point"
                    data-datum-id={point.id}
                    cx={point.xPosition}
                    cy={point.yPosition}
                    r={4}
                    aria-label={accessibleLabel}
                  >
                    <title>{accessibleLabel}</title>
                  </circle>
                );
              }) : null}
            </g>
          );
        })}
      </g>
    </ChartRendererSurface>
  );
}
