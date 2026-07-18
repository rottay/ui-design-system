'use client';

import { useMemo, type CSSProperties } from 'react';

import { useChartDimensions } from '../../../../runtime/dimensions';
import {
  buildSvgHistogramGeometry,
  type ChartGeometryInsets,
} from '../../../../foundation/renderers/geometry';
import { ChartRendererSurface } from '..';

export interface SvgHistogramRendererProps {
  readonly values: readonly number[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly ariaDescribedBy?: string;
  readonly width?: number;
  readonly height?: number;
  /** Recompute geometry from the container width. Defaults to true. */
  readonly responsive?: boolean;
  readonly bins?: number;
  readonly thresholds?: readonly number[];
  readonly density?: boolean;
  readonly cumulative?: boolean;
  readonly showLabels?: boolean;
  /** Bar paint. Applied inline because the histogram carries a single explicit
   * colour, not the tenant categorical palette channel. */
  readonly color?: string;
  /** Cumulative overlay paint. */
  readonly cumulativeColor?: string;
  readonly formatValue?: (value: number) => string;
  readonly xLabel?: string;
  readonly yLabel?: string;
  readonly insets?: ChartGeometryInsets;
  readonly maxTicks?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
}

const DEFAULT_BAR_PAINT = 'var(--ds-color-primary)';
const DEFAULT_CUMULATIVE_PAINT = 'var(--ds-color-info)';

/**
 * React-owned semantic SVG histogram renderer. `d3.bin` stays inside the pure
 * geometry builder; this renderer owns no D3. The single bar colour and the
 * cumulative colour are explicit props (not the categorical palette), so they
 * paint inline while grid, axes, and labels inherit the generic renderer skin.
 */
export function SvgHistogramRenderer({
  values,
  ariaLabel,
  ariaDescription,
  ariaDescribedBy,
  width = 640,
  height = 360,
  responsive = true,
  bins,
  thresholds,
  density = false,
  cumulative = false,
  showLabels = false,
  color = DEFAULT_BAR_PAINT,
  cumulativeColor = DEFAULT_CUMULATIVE_PAINT,
  formatValue,
  xLabel,
  yLabel,
  insets,
  maxTicks,
  className,
  style,
}: SvgHistogramRendererProps): React.ReactElement {
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive ? dimensions.width : width;
  const geometry = useMemo(
    () => buildSvgHistogramGeometry({
      values,
      width: geometryWidth,
      height,
      bins,
      thresholds,
      density,
      cumulative,
      insets,
      maxTicks,
    }),
    [bins, cumulative, density, geometryWidth, height, insets, maxTicks, thresholds, values],
  );
  const formatBinLabel = (value: number): string => (formatValue ? formatValue(value) : String(value));

  return (
    <ChartRendererSurface
      rendererId="svg.histogram"
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      ariaDescribedBy={ariaDescribedBy}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.bins.length === 0}
      className={['ds-chart-renderer-histogram', className].filter(Boolean).join(' ')}
      style={style}
      ownerRef={containerRef}
    >
      <g data-part="plot-area" data-variant={density ? 'density' : 'frequency'}>
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
              {formatValue ? formatBinLabel(Number(tick.value)) : tick.label}
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

        <g data-part="marks">
          {geometry.bins.map((bin) => {
            const rangeLabel = `${formatBinLabel(bin.x0)} - ${formatBinLabel(bin.x1)}`;
            const measured = density ? bin.densityValue : bin.count;
            return (
              <g
                key={bin.id}
                data-part="bar-mark"
                data-datum-id={bin.id}
                data-series="histogram"
                aria-label={`${rangeLabel}: ${density ? measured.toFixed(4) : measured}`}
              >
                <rect
                  data-part="bar"
                  data-series="histogram"
                  x={bin.x}
                  y={bin.y}
                  width={bin.width}
                  height={bin.height}
                  fill={color}
                  fillOpacity={0.85}
                />
                {showLabels ? (
                  <text
                    data-part="value-label"
                    x={bin.labelX}
                    y={bin.labelY}
                    textAnchor="middle"
                  >
                    {density ? bin.densityValue.toFixed(2) : bin.count}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>

        {geometry.cumulative ? (
          <g data-part="cumulative">
            <g data-part="axis" data-axis="cumulative" aria-hidden="true">
              {geometry.cumulative.axisTicks.map((tick) => (
                <text
                  key={tick.id}
                  data-part="axis-tick-label"
                  data-axis="cumulative"
                  x={tick.x + 6}
                  y={tick.y}
                  textAnchor="start"
                  dominantBaseline="middle"
                  fill={cumulativeColor}
                >
                  {tick.label}
                </text>
              ))}
            </g>
            <path
              data-part="cumulative-line"
              d={geometry.cumulative.path}
              fill="none"
              stroke={cumulativeColor}
              strokeWidth={2}
              aria-hidden="true"
            />
            {geometry.cumulative.points.map((point, index) => (
              <circle
                key={`cumulative-${index}`}
                data-part="cumulative-point"
                data-series="cumulative"
                cx={point.cx}
                cy={point.cy}
                r={3}
                fill={cumulativeColor}
                aria-hidden="true"
              />
            ))}
          </g>
        ) : null}

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
