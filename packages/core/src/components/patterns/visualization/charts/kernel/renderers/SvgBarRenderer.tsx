'use client';

import { useMemo, type CSSProperties } from 'react';

import { useChartDimensions } from '../../hooks/use-chart-dimensions';
import {
  buildSvgBarGeometry,
  type ChartGeometryInsets,
  type SvgBarDatum,
} from './ChartGeometry';
import { ChartRendererSurface } from './ChartRendererSurface';

type ChartPaintStyle = CSSProperties & {
  '--ds-chart-mark-color'?: string;
};

export interface SvgBarRendererProps {
  readonly data: readonly SvgBarDatum[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly width?: number;
  readonly height?: number;
  /** Recompute geometry from the container width. Defaults to true. */
  readonly responsive?: boolean;
  readonly orientation?: 'vertical' | 'horizontal';
  readonly insets?: ChartGeometryInsets;
  readonly bandPadding?: number;
  readonly maxTicks?: number;
  readonly barRadius?: number;
  readonly showValues?: boolean;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/** React-owned semantic SVG bar renderer. D3 only calculates geometry. */
export function SvgBarRenderer({
  data,
  ariaLabel,
  ariaDescription,
  width = 640,
  height = 360,
  responsive = true,
  orientation = 'vertical',
  insets,
  bandPadding,
  maxTicks,
  barRadius = 4,
  showValues = false,
  className,
  style,
}: SvgBarRendererProps): React.ReactElement {
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive ? dimensions.width : width;
  const geometry = useMemo(
    () => buildSvgBarGeometry({
      data,
      width: geometryWidth,
      height,
      orientation,
      insets,
      bandPadding,
      maxTicks,
    }),
    [bandPadding, data, geometryWidth, height, insets, maxTicks, orientation],
  );
  const radius = Number.isFinite(barRadius) ? Math.max(0, barRadius) : 4;

  return (
    <ChartRendererSurface
      rendererId="svg.bar"
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.bars.length === 0}
      className={['ds-chart-renderer-bar', className].filter(Boolean).join(' ')}
      style={style}
      ownerRef={containerRef}
    >
      <g data-part="grid" aria-hidden="true">
        {geometry.valueTicks.map((tick) => (
          <line
            key={tick.id}
            data-part="grid-line"
            x1={geometry.orientation === 'vertical' ? geometry.plot.x : tick.x}
            x2={geometry.orientation === 'vertical' ? geometry.plot.x + geometry.plot.width : tick.x}
            y1={geometry.orientation === 'vertical' ? tick.y : geometry.plot.y}
            y2={geometry.orientation === 'vertical' ? tick.y : geometry.plot.y + geometry.plot.height}
          />
        ))}
      </g>

      <g data-part="axis" data-axis="category" aria-hidden="true">
        {geometry.categoryTicks.map((tick) => (
          <text
            key={tick.id}
            data-part="axis-tick-label"
            data-axis="category"
            x={geometry.orientation === 'vertical' ? tick.x : tick.x - 8}
            y={geometry.orientation === 'vertical' ? tick.y + 20 : tick.y}
            textAnchor={geometry.orientation === 'vertical' ? 'middle' : 'end'}
            dominantBaseline={geometry.orientation === 'vertical' ? undefined : 'middle'}
          >
            {tick.label}
          </text>
        ))}
      </g>

      <g data-part="axis" data-axis="value" aria-hidden="true">
        {geometry.valueTicks.map((tick) => (
          <text
            key={tick.id}
            data-part="axis-tick-label"
            data-axis="value"
            x={geometry.orientation === 'vertical' ? tick.x - 8 : tick.x}
            y={geometry.orientation === 'vertical' ? tick.y : tick.y + 20}
            textAnchor={geometry.orientation === 'vertical' ? 'end' : 'middle'}
            dominantBaseline={geometry.orientation === 'vertical' ? 'middle' : undefined}
          >
            {tick.label}
          </text>
        ))}
      </g>

      <line
        data-part="baseline"
        aria-hidden="true"
        x1={geometry.orientation === 'vertical' ? geometry.plot.x : geometry.baseline}
        x2={geometry.orientation === 'vertical' ? geometry.plot.x + geometry.plot.width : geometry.baseline}
        y1={geometry.orientation === 'vertical' ? geometry.baseline : geometry.plot.y}
        y2={geometry.orientation === 'vertical' ? geometry.baseline : geometry.plot.y + geometry.plot.height}
      />

      <g data-part="marks">
        {geometry.bars.map((bar) => {
          const paintStyle: ChartPaintStyle = {
            '--ds-chart-mark-color': bar.color ?? 'var(--ds-chart-series-1, var(--ds-color-primary))',
          };
          const accessibleLabel = bar.ariaLabel ?? `${bar.category}: ${bar.valueLabel ?? bar.value}`;

          return (
            <g
              key={bar.id}
              data-part="bar-mark"
              data-datum-id={bar.id}
              aria-label={accessibleLabel}
              style={paintStyle}
            >
              <title>{accessibleLabel}</title>
              <rect
                data-part="bar"
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx={radius}
              />
              {showValues ? (
                <text
                  data-part="value-label"
                  x={bar.valueX}
                  y={bar.valueY}
                  textAnchor={orientation === 'vertical' ? 'middle' : bar.value >= 0 ? 'start' : 'end'}
                  dominantBaseline={orientation === 'horizontal' ? 'middle' : undefined}
                >
                  {bar.valueLabel ?? bar.value}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>
    </ChartRendererSurface>
  );
}
