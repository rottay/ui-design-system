'use client';

import { useId, useMemo, type CSSProperties } from 'react';

import { useResolvedChartPersonality } from '@/infrastructure/runtime/personality';
import { useChartDimensions } from '../../../../runtime/dimensions';
import {
  buildSvgAreaGeometry,
  type ChartGeometryInsets,
  type SvgAreaSeries,
  type SvgLineCurve,
} from '../../../../foundation/renderers/geometry';
import { ChartRendererSurface } from '..';

const FALLBACK_SERIES_PAINT = 'var(--ds-color-primary)';

export interface SvgAreaRendererProps {
  readonly series: readonly SvgAreaSeries[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly ariaDescribedBy?: string;
  readonly width?: number;
  readonly height?: number;
  /** Recompute geometry from the container width. Defaults to true. */
  readonly responsive?: boolean;
  readonly curve?: SvgLineCurve;
  readonly stacked?: boolean;
  /** Solid-fill opacity used when the gradient personality is inactive. */
  readonly opacity?: number;
  /** Overrides the personality gradient-fill decision. */
  readonly gradient?: boolean;
  readonly showDots?: boolean;
  readonly xLabel?: string;
  readonly yLabel?: string;
  readonly insets?: ChartGeometryInsets;
  readonly maxTicks?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * React-owned semantic SVG area renderer. Composes the pure area geometry
 * (line top edge + filled band, diverging stacks supported) and reproduces the
 * established area anatomy React-owned: per-series gradient fills (when the
 * gradient personality is active), a `series-line` top edge, and solid fills
 * honouring the caller opacity otherwise. D3 only lives in the geometry
 * builder; this renderer owns no D3 and no imperative DOM.
 */
export function SvgAreaRenderer({
  series,
  ariaLabel,
  ariaDescription,
  ariaDescribedBy,
  width = 640,
  height = 360,
  responsive = true,
  curve,
  stacked = false,
  opacity = 0.3,
  gradient,
  showDots,
  xLabel,
  yLabel,
  insets,
  maxTicks,
  className,
  style,
}: SvgAreaRendererProps): React.ReactElement {
  const chartPersonality = useResolvedChartPersonality();
  const uniqueId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const resolvedCurve: SvgLineCurve = curve
    ?? (chartPersonality.lineStyle === 'sharp' ? 'linear' : chartPersonality.lineStyle);
  const resolvedGradient = gradient ?? chartPersonality.useGradientFill;
  const resolvedShowDots = showDots ?? chartPersonality.showDots;
  const resolvedOpacity = Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : 0.3;
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive ? dimensions.width : width;
  const geometry = useMemo(
    () => buildSvgAreaGeometry({
      series,
      width: geometryWidth,
      height,
      curve: resolvedCurve,
      stacked,
      insets,
      maxTicks,
    }),
    [geometryWidth, height, insets, maxTicks, resolvedCurve, series, stacked],
  );
  const pointCount = geometry.series.reduce(
    (count, currentSeries) => count + currentSeries.points.length,
    0,
  );

  return (
    <ChartRendererSurface
      rendererId="svg.area"
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      ariaDescribedBy={ariaDescribedBy}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={pointCount === 0}
      className={['ds-chart-renderer-area', className].filter(Boolean).join(' ')}
      style={style}
      ownerRef={containerRef}
    >
      <g data-part="plot-area" data-stacked={stacked ? 'true' : 'false'}>
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

        <g data-part="series-collection">
          {geometry.series.map((currentSeries, seriesIndex) => {
            const seriesColor = currentSeries.seriesColor ?? FALLBACK_SERIES_PAINT;
            const gradientId = `area-${uniqueId}-series-${seriesIndex}`;
            return (
              <g
                key={currentSeries.id}
                data-part="area-series"
                data-series-id={currentSeries.id}
                data-series-index={seriesIndex % 5}
                aria-label={currentSeries.label}
              >
                {resolvedGradient ? (
                  <defs data-part="definitions">
                    <linearGradient id={gradientId} data-part="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop data-part="area-gradient-stop" data-position="start" offset="0%" stopColor={seriesColor} stopOpacity={0.36} />
                      <stop data-part="area-gradient-stop" data-position="end" offset="100%" stopColor={seriesColor} stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                ) : null}
                {currentSeries.areaPath ? (
                  <path
                    data-part="area"
                    d={currentSeries.areaPath}
                    fill={resolvedGradient ? `url(#${gradientId})` : seriesColor}
                    fillOpacity={resolvedGradient ? 1 : resolvedOpacity}
                    aria-hidden="true"
                  />
                ) : null}
                <path
                  data-part="series-line"
                  d={currentSeries.path}
                  fill="none"
                  stroke={seriesColor}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                {resolvedShowDots ? currentSeries.points.map((point) => (
                  <circle
                    key={point.id}
                    data-part="series-point"
                    data-datum-id={point.id}
                    cx={point.xPosition}
                    cy={point.yPosition}
                    r={3}
                    fill={seriesColor}
                    aria-hidden="true"
                  />
                )) : null}
              </g>
            );
          })}
        </g>

        {xLabel ? (
          <text
            data-part="axis-label"
            data-axis="x"
            x={geometry.width / 2}
            y={geometry.height - 4}
            textAnchor="middle"
            aria-hidden="true"
          >
            {xLabel}
          </text>
        ) : null}
        {yLabel ? (
          <text
            data-part="axis-label"
            data-axis="y"
            transform="rotate(-90)"
            x={-geometry.height / 2}
            y={14}
            textAnchor="middle"
            aria-hidden="true"
          >
            {yLabel}
          </text>
        ) : null}
      </g>
    </ChartRendererSurface>
  );
}
