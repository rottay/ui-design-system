'use client';

import { useMemo, type CSSProperties } from 'react';

import { useChartDimensions } from '../../../../runtime/dimensions';
import {
  buildSvgWaterfallGeometry,
  type ChartGeometryInsets,
  type SvgWaterfallDatum,
  type SvgWaterfallType,
} from '../../../../foundation/renderers/geometry';
import { ChartRendererSurface } from '..';

export interface SvgWaterfallRendererProps {
  readonly data: readonly SvgWaterfallDatum[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly ariaDescribedBy?: string;
  readonly width?: number;
  readonly height?: number;
  /** Recompute geometry from the container width. Defaults to true. */
  readonly responsive?: boolean;
  readonly orientation?: 'vertical' | 'horizontal';
  /** Increase-bar paint (semantic status token, not the categorical palette). */
  readonly increaseColor?: string;
  readonly decreaseColor?: string;
  readonly totalColor?: string;
  readonly showConnectors?: boolean;
  readonly showValues?: boolean;
  readonly formatValue?: (value: number) => string;
  readonly barRadius?: number;
  readonly insets?: ChartGeometryInsets;
  readonly maxTicks?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
}

const DEFAULT_INCREASE_PAINT = 'var(--ds-color-success)';
const DEFAULT_DECREASE_PAINT = 'var(--ds-color-error)';
const DEFAULT_TOTAL_PAINT = 'var(--ds-color-primary)';

/**
 * React-owned semantic SVG waterfall renderer. Bars reuse the shared bar
 * anatomy; each bar's tone is a semantic status token driven by its
 * increase/decrease/total type rather than the categorical palette (the
 * sanctioned exception to the categories-never-borrow-status law). The running
 * total math lives in the pure geometry builder.
 */
export function SvgWaterfallRenderer({
  data,
  ariaLabel,
  ariaDescription,
  ariaDescribedBy,
  width = 640,
  height = 360,
  responsive = true,
  orientation = 'vertical',
  increaseColor = DEFAULT_INCREASE_PAINT,
  decreaseColor = DEFAULT_DECREASE_PAINT,
  totalColor = DEFAULT_TOTAL_PAINT,
  showConnectors = true,
  showValues = true,
  formatValue,
  barRadius = 2,
  insets,
  maxTicks,
  className,
  style,
}: SvgWaterfallRendererProps): React.ReactElement {
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive ? dimensions.width : width;
  const geometry = useMemo(
    () => buildSvgWaterfallGeometry({
      data,
      width: geometryWidth,
      height,
      orientation,
      insets,
      maxTicks,
    }),
    [data, geometryWidth, height, insets, maxTicks, orientation],
  );
  const radius = Number.isFinite(barRadius) ? Math.max(0, barRadius) : 2;
  const formatVal = (value: number): string => (formatValue ? formatValue(value) : String(value));
  const paintForType = (type: SvgWaterfallType): string => {
    if (type === 'increase') return increaseColor;
    if (type === 'decrease') return decreaseColor;
    return totalColor;
  };

  return (
    <ChartRendererSurface
      rendererId="svg.waterfall"
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      ariaDescribedBy={ariaDescribedBy}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.bars.length === 0}
      className={['ds-chart-renderer-waterfall', 'ds-chart-renderer-bar', className].filter(Boolean).join(' ')}
      style={style}
      ownerRef={containerRef}
    >
      <g data-part="plot-area" data-orientation={orientation}>
      <g data-part="grid" aria-hidden="true">
        {geometry.valueTicks.map((tick) => (
          <line
            key={tick.id}
            data-part="grid-line"
            x1={orientation === 'vertical' ? geometry.plot.x : tick.x}
            x2={orientation === 'vertical' ? geometry.plot.x + geometry.plot.width : tick.x}
            y1={orientation === 'vertical' ? tick.y : geometry.plot.y}
            y2={orientation === 'vertical' ? tick.y : geometry.plot.y + geometry.plot.height}
          />
        ))}
      </g>

      <g data-part="axis" data-axis="category" aria-hidden="true">
        {geometry.categoryTicks.map((tick) => (
          <text
            key={tick.id}
            data-part="axis-tick-label"
            data-axis="category"
            x={orientation === 'vertical' ? tick.x : tick.x - 8}
            y={orientation === 'vertical' ? tick.y + 20 : tick.y}
            textAnchor={orientation === 'vertical' ? 'middle' : 'end'}
            dominantBaseline={orientation === 'vertical' ? undefined : 'middle'}
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
            x={orientation === 'vertical' ? tick.x - 8 : tick.x}
            y={orientation === 'vertical' ? tick.y : tick.y + 20}
            textAnchor={orientation === 'vertical' ? 'end' : 'middle'}
            dominantBaseline={orientation === 'vertical' ? 'middle' : undefined}
          >
            {tick.label}
          </text>
        ))}
      </g>

      {showConnectors ? (
        <g data-part="connectors" aria-hidden="true">
          {geometry.connectors.map((connector) => (
            <line
              key={connector.id}
              data-part="connector"
              x1={connector.x1}
              y1={connector.y1}
              x2={connector.x2}
              y2={connector.y2}
              stroke="var(--ds-chart-connector-color, var(--ds-color-border))"
              strokeWidth={1}
              strokeDasharray="4,3"
            />
          ))}
        </g>
      ) : null}

      <g data-part="marks">
        {geometry.bars.map((bar) => {
          const accessibleLabel = `${bar.label}: ${formatVal(bar.value)} (${bar.type})`;
          return (
            <g
              key={bar.key}
              data-part="bar-mark"
              data-datum-id={bar.key}
              data-status={bar.type}
              aria-label={accessibleLabel}
            >
              <rect
                data-part="bar"
                data-status={bar.type}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx={radius}
                ry={radius}
                fill={paintForType(bar.type)}
              />
              {showValues ? (
                <text
                  data-part="value-label"
                  x={bar.valueX}
                  y={bar.valueY}
                  textAnchor={bar.valueAnchor}
                  dominantBaseline={bar.valueBaseline}
                >
                  {formatVal(bar.value)}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>
      </g>
    </ChartRendererSurface>
  );
}
