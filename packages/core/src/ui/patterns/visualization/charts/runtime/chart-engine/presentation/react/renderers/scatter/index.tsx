'use client';

import { useId, useMemo, type CSSProperties } from 'react';

import { useResolvedChartGrammar } from '../../../../runtime/grammar';
import { ChartInsightLayer } from '../../../../runtime/insight/layer';
import type { ChartInteraction } from '../../../../foundation/interaction';
import { useChartInteraction } from '../../../../runtime/interaction/controller';
import type { ChartInsightSpec } from '@ui/patterns/visualization/charts/runtime/chart-engine/foundation/spec';
import { useChartDimensions } from '../../../../runtime/dimensions';
import {
  buildSvgScatterGeometry,
  type ChartGeometryInsets,
  type SvgScatterDatum,
  type SvgScatterVariant,
} from '../../../../foundation/renderers/geometry';
import { ChartRendererSurface } from '..';

export interface SvgScatterRendererProps {
  readonly data: readonly SvgScatterDatum[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly width?: number;
  readonly height?: number;
  /** Recompute Cartesian geometry from the container width. Defaults to true. */
  readonly responsive?: boolean;
  readonly variant?: SvgScatterVariant;
  readonly insets?: ChartGeometryInsets;
  readonly maxTicks?: number;
  readonly pointRadius?: number;
  readonly bubbleRadiusRange?: readonly [number, number];
  readonly showLabels?: boolean;
  /** Static, app-authored annotation specs. */
  readonly insights?: readonly ChartInsightSpec[];
  readonly interaction?: ChartInteraction<SvgScatterDatum>;
  readonly className?: string;
  readonly style?: CSSProperties;
}

function accessiblePointLabel(
  point: SvgScatterDatum,
  variant: SvgScatterVariant,
): string {
  if (point.ariaLabel) return point.ariaLabel;
  const series = point.series ? `${point.series}, ` : '';
  const coordinates = `x ${point.xLabel ?? point.x}, y ${point.yLabel ?? point.y}`;
  const magnitude = variant === 'bubble'
    ? `, size ${point.sizeLabel ?? point.size ?? 1}`
    : '';
  return `${series}${point.label}: ${coordinates}${magnitude}`;
}

/** React-owned semantic SVG scatter/bubble renderer. D3 only calculates scales. */
export function SvgScatterRenderer({
  data,
  ariaLabel,
  ariaDescription,
  width = 640,
  height = 360,
  responsive = true,
  variant = 'scatter',
  insets,
  maxTicks,
  pointRadius,
  bubbleRadiusRange,
  showLabels = false,
  insights,
  interaction,
  className,
  style,
}: SvgScatterRendererProps): React.ReactElement {
  const grammar = useResolvedChartGrammar();
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive ? dimensions.width : width;
  const grammarRadius = grammar.marks === 'human-rounded'
    ? 6
    : grammar.marks === 'tactile-temporal'
      ? 5
      : 4;
  const geometry = useMemo(
    () => buildSvgScatterGeometry({
      data,
      width: geometryWidth,
      height,
      variant,
      insets,
      maxTicks,
      pointRadius: pointRadius ?? grammarRadius,
      bubbleRadiusRange,
    }),
    [
      bubbleRadiusRange,
      data,
      geometryWidth,
      grammarRadius,
      height,
      insets,
      maxTicks,
      pointRadius,
      variant,
    ],
  );
  const sourceById = useMemo(
    () => new Map(data.map((datum) => [datum.id, datum])),
    [data],
  );
  const interactionItems = useMemo(
    () => geometry.points.map((point) => ({
      key: point.id,
      label: accessiblePointLabel(point, geometry.variant),
      datum: sourceById.get(point.id) ?? point,
      x: point.xPosition,
      y: point.yPosition,
    })),
    [geometry.points, geometry.variant, sourceById],
  );
  const insightCoordinates = useMemo(() => ({
    valueAxis: 'y' as const,
    valueAnchors: [
      { value: geometry.yDomain[0], position: geometry.plot.y + geometry.plot.height },
      { value: geometry.yDomain[1], position: geometry.plot.y },
    ],
    numericEventAxis: 'x' as const,
    numericEventAnchors: [
      { value: geometry.xDomain[0], position: geometry.plot.x },
      { value: geometry.xDomain[1], position: geometry.plot.x + geometry.plot.width },
    ],
    categoricalEventAxis: 'x' as const,
    categoricalEventAnchors: geometry.points.map((point) => ({
      key: point.label,
      position: point.xPosition,
    })),
    datumAnchors: geometry.points.map((point) => ({
      id: point.id,
      x: point.xPosition,
      y: point.yPosition,
    })),
  }), [geometry]);
  const interactionState = useChartInteraction({
    items: interactionItems,
    interaction,
    navigation: 'grid',
  });
  const tooltipId = useId();
  const activePoint = interactionState.activeKey
    ? geometry.points.find((point) => point.id === interactionState.activeKey)
    : undefined;
  const tooltip = interactionState.activeDatum && interaction && interaction.mode !== 'static'
    ? interaction.renderTooltip?.(interactionState.activeDatum)
    : undefined;

  return (
    <ChartRendererSurface
      rendererId="svg.scatter"
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.points.length === 0}
      className={['ds-chart-renderer-scatter', className].filter(Boolean).join(' ')}
      style={style}
      ownerRef={containerRef}
      interactionMode={interactionState.mode}
      interactionRootProps={interactionState.rootProps}
      tooltip={tooltip}
      tooltipId={tooltipId}
      tooltipKey={interactionState.activeKey ?? undefined}
      tooltipAnchor={activePoint ? {
        x: activePoint.xPosition,
        y: activePoint.yPosition - activePoint.radius,
      } : undefined}
    >
      <g data-part="grid" data-axis="x" aria-hidden="true">
        {geometry.xTicks.map((tick) => (
          <line
            key={tick.id}
            data-part="grid-line"
            x1={tick.x}
            x2={tick.x}
            y1={geometry.plot.y}
            y2={geometry.plot.y + geometry.plot.height}
          />
        ))}
      </g>
      <g data-part="grid" data-axis="y" aria-hidden="true">
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
        data-axis="x"
        aria-hidden="true"
        x1={geometry.plot.x}
        x2={geometry.plot.x + geometry.plot.width}
        y1={geometry.plot.y + geometry.plot.height}
        y2={geometry.plot.y + geometry.plot.height}
      />
      <line
        data-part="baseline"
        data-axis="y"
        aria-hidden="true"
        x1={geometry.plot.x}
        x2={geometry.plot.x}
        y1={geometry.plot.y}
        y2={geometry.plot.y + geometry.plot.height}
      />

      <g data-part="scatter-plot" data-variant={geometry.variant}>
        {geometry.points.map((point, pointIndex) => {
          const accessibleLabel = accessiblePointLabel(point, geometry.variant);
          const datumProps = interactionState.getDatumProps(point.id);
          const interactive = interactionState.mode !== 'static';
          const actionable = interactionState.mode === 'select' || interactionState.mode === 'drill';
          const markLabel = actionable && interaction && interaction.mode !== 'static'
            ? `${accessibleLabel}. ${interaction.actionLabel}`
            : accessibleLabel;
          const targetRadius = Math.max(12, point.radius + 6);

          return (
            <g
              key={point.id}
              data-part="scatter-point-mark"
              data-datum-id={point.id}
              data-series-id={point.series ?? 'default'}
              data-series-index={point.seriesIndex}
              data-mark-index={pointIndex % 5}
              data-chart-datum-key={datumProps['data-chart-datum-key']}
              data-active={datumProps['data-active']}
              data-focused={datumProps['data-focused']}
              data-hovered={datumProps['data-hovered']}
              data-pinned={datumProps['data-pinned']}
              tabIndex={datumProps.tabIndex}
              role={interactive ? actionable ? 'button' : 'img' : undefined}
              aria-label={markLabel}
              aria-describedby={datumProps['data-active'] && tooltip !== undefined && tooltip !== null && tooltip !== false ? tooltipId : undefined}
            >
              {!interactive ? <title>{accessibleLabel}</title> : null}
              {interactive ? (
                <>
                  <circle
                    data-part="interaction-target"
                    cx={point.xPosition}
                    cy={point.yPosition}
                    r={targetRadius}
                    aria-hidden="true"
                  />
                  <circle
                    data-part="interaction-halo"
                    cx={point.xPosition}
                    cy={point.yPosition}
                    r={Math.max(8, point.radius + 4)}
                    aria-hidden="true"
                  />
                </>
              ) : null}
              <circle
                data-part="scatter-point"
                cx={point.xPosition}
                cy={point.yPosition}
                r={point.radius}
                aria-hidden={interactive ? true : undefined}
              />
              {showLabels ? (
                <text
                  data-part="value-label"
                  x={point.xPosition + point.radius + 5}
                  y={point.yPosition}
                  dominantBaseline="middle"
                  aria-hidden="true"
                >
                  {point.label}
                </text>
              ) : (
                <text
                  data-part="forced-color-value-label"
                  display="none"
                  x={point.xPosition + point.radius + 5}
                  y={point.yPosition}
                  dominantBaseline="middle"
                  aria-hidden="true"
                >
                  {point.label}
                </text>
              )}
            </g>
          );
        })}
      </g>
      <ChartInsightLayer
        insights={insights}
        plot={geometry.plot}
        {...insightCoordinates}
      />
    </ChartRendererSurface>
  );
}
