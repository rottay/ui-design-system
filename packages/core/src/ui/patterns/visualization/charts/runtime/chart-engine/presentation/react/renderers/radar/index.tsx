'use client';

import { useId, useMemo, type CSSProperties } from 'react';

import { useReducedMotion } from '@/graphics/motion/react/runtime';
import { useResolvedChartPersonality } from '@/infrastructure/runtime/personality';
import type { ChartInteraction } from '../../../../foundation/interaction';
import {
  buildSvgRadarGeometry,
  type SvgRadarDatum,
  type SvgRadarSeries,
} from '../../../../foundation/renderers/geometry';
import { useChartInteraction } from '../../../../runtime/interaction/controller';
import { useChartDimensions } from '../../../../runtime/dimensions';
import { useResolvedChartGrammar } from '../../../../runtime/grammar';
import { ChartRendererSurface } from '..';

/** The application datum exposed when a radar vertex becomes interactive. */
export interface SvgRadarInteractionDatum {
  readonly series: {
    readonly id: string;
    readonly name: string;
    readonly color: string;
  };
  readonly point: SvgRadarDatum;
}

export interface SvgRadarRendererProps {
  readonly data: readonly SvgRadarDatum[];
  readonly series?: readonly SvgRadarSeries[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly ariaDescribedBy?: string;
  readonly width?: number | string;
  readonly height?: number;
  /** Recompute the radial geometry from the renderer container. Defaults to true. */
  readonly responsive?: boolean;
  /** Uses the resolved tenant personality unless explicitly overridden. */
  readonly animate?: boolean;
  readonly maxValue?: number;
  readonly levels?: number;
  readonly showLabels?: boolean;
  /** Optional palette; individual series colors still take precedence. */
  readonly colors?: readonly string[];
  /** Retains native per-point titles for non-interactive compatibility views. */
  readonly showPointTitles?: boolean;
  readonly interaction?: ChartInteraction<SvgRadarInteractionDatum>;
  readonly className?: string;
  readonly style?: CSSProperties;
}

function grammarPointRadius(marks: string): number {
  if (marks === 'human-rounded') return 4;
  if (marks === 'technical-sharp') return 3;
  return 3.5;
}

function staticPointLabel(
  axis: string,
  value: number,
): string {
  return `${axis}: ${value}`;
}

function accessiblePointLabel(
  seriesName: string,
  seriesCount: number,
  axis: string,
  value: number,
): string {
  const point = staticPointLabel(axis, value);
  return seriesCount > 1 ? `${seriesName}, ${point}` : point;
}

/**
 * React-owned radar/spider chart renderer. Geometry is immutable and pure;
 * SVG ownership, interaction, motion, and accessibility stay in React.
 */
export function SvgRadarRenderer({
  data,
  series,
  ariaLabel,
  ariaDescription,
  ariaDescribedBy,
  width = 400,
  height = 400,
  responsive = true,
  animate,
  maxValue,
  levels,
  showLabels = true,
  colors,
  showPointTitles = true,
  interaction,
  className,
  style,
}: SvgRadarRendererProps): React.ReactElement {
  const grammar = useResolvedChartGrammar();
  const chartPersonality = useResolvedChartPersonality();
  const reducedMotion = useReducedMotion();
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive
    ? dimensions.width
    : typeof width === 'number'
      ? width
      : 400;
  const animationDuration = Number.isFinite(chartPersonality.mountDuration)
    ? Math.max(0, chartPersonality.mountDuration)
    : 0;
  const shouldAnimate = !reducedMotion
    && (animate ?? chartPersonality.animateOnMount)
    && animationDuration > 0;
  const geometry = useMemo(
    () => buildSvgRadarGeometry({
      data,
      series,
      colors,
      width: geometryWidth,
      height,
      maxValue,
      levels,
    }),
    [colors, data, geometryWidth, height, levels, maxValue, series],
  );
  const interactionItems = useMemo(
    () => geometry.series.flatMap((currentSeries, seriesIndex) => (
      currentSeries.points.map((point, axisIndex) => ({
        key: point.id,
        label: accessiblePointLabel(
          currentSeries.name,
          geometry.series.length,
          point.axis,
          point.value,
        ),
        datum: {
          series: {
            id: currentSeries.id,
            name: currentSeries.name,
            color: currentSeries.color,
          },
          point: {
            axis: point.axis,
            value: point.value,
          },
        },
        x: geometry.centerX + point.x,
        y: geometry.centerY + point.y,
        row: seriesIndex,
        column: axisIndex,
      }))
    )),
    [geometry],
  );
  const interactionState = useChartInteraction({
    items: interactionItems,
    interaction,
    navigation: 'grid',
  });
  const tooltipId = useId();
  const activePoint = interactionState.activeKey
    ? interactionItems.find((item) => item.key === interactionState.activeKey)
    : undefined;
  const tooltip = interactionState.activeDatum && interaction && interaction.mode !== 'static'
    ? interaction.renderTooltip?.(interactionState.activeDatum)
    : undefined;
  const pointRadius = grammarPointRadius(grammar.marks);
  const surfaceStyle: CSSProperties = {
    ...(typeof width === 'string' ? { width } : {}),
    ...style,
  };
  const description = ariaDescription
    ?? (geometry.fallbackMessage
      ? geometry.fallbackMessage
      : `Radar chart with ${geometry.axes.length} axes and ${geometry.series.length} series.`);

  return (
    <ChartRendererSurface
      rendererId="svg.radar"
      ariaLabel={ariaLabel}
      ariaDescription={description}
      ariaDescribedBy={ariaDescribedBy}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.fallbackMessage !== null}
      className={['ds-chart-renderer-radar', className].filter(Boolean).join(' ')}
      style={surfaceStyle}
      ownerRef={containerRef}
      interactionMode={interactionState.mode}
      interactionRootProps={interactionState.rootProps}
      tooltip={tooltip}
      tooltipId={tooltipId}
      tooltipKey={interactionState.activeKey ?? undefined}
      tooltipAnchor={activePoint ? {
        x: activePoint.x,
        y: activePoint.y,
      } : undefined}
    >
      <g
        data-part="plot-area"
        data-variant="radar"
        data-domain-max={geometry.domainMax}
        transform={`translate(${geometry.centerX},${geometry.centerY})`}
      >
        <g data-part="radar-motion" data-animate={shouldAnimate ? 'true' : 'false'}>
          <g data-part="radar-grid" aria-hidden="true">
            {geometry.gridLevels.map((level) => (
              <polygon
                key={level.id}
                data-part="grid-level"
                data-level={level.level}
                points={level.points}
                fill="none"
                strokeOpacity={0.5}
              />
            ))}
          </g>
          <g data-part="radar-axes" aria-hidden="true">
            {geometry.axes.map((axis) => (
              <line
                key={axis.id}
                data-part="axis-line"
                x1={0}
                y1={0}
                x2={axis.lineX}
                y2={axis.lineY}
                strokeOpacity={0.5}
              />
            ))}
            {showLabels ? geometry.axes.map((axis) => (
              <text
                key={axis.id}
                data-part="axis-label"
                x={axis.labelX}
                y={axis.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '11px' }}
              >
                {axis.axis}
              </text>
            )) : null}
          </g>
          {geometry.series.map((currentSeries, seriesIndex) => (
            <g
              key={currentSeries.id}
              data-part="series"
              data-series={currentSeries.name}
              data-series-index={seriesIndex}
              data-color-source={currentSeries.colorSource}
            >
              {shouldAnimate ? (
                <animate
                  attributeName="opacity"
                  from="0"
                  to="1"
                  begin={`${Math.round(seriesIndex * animationDuration * 0.12)}ms`}
                  dur={`${Math.round(animationDuration * 0.6)}ms`}
                  fill="freeze"
                />
              ) : null}
              <polygon
                data-part="series-area"
                data-state={currentSeries.zeroBaseline ? 'zero-baseline' : 'value'}
                data-series={currentSeries.name}
                points={currentSeries.polygonPoints}
                fill={currentSeries.color}
                fillOpacity={0.2}
                stroke={currentSeries.color}
                strokeWidth={2}
                aria-hidden="true"
              />
              {currentSeries.zeroBaseline ? (
                <circle
                  data-part="zero-baseline"
                  data-series={currentSeries.name}
                  cx={0}
                  cy={0}
                  r={6}
                  fill="none"
                  stroke={currentSeries.color}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              ) : null}
              {currentSeries.points.map((point) => {
                const datumProps = interactionState.getDatumProps(point.id);
                const interactive = interactionState.mode !== 'static';
                const actionable = interactionState.mode === 'select' || interactionState.mode === 'drill';
                const staticLabel = staticPointLabel(point.axis, point.value);
                const accessibleLabel = accessiblePointLabel(
                  currentSeries.name,
                  geometry.series.length,
                  point.axis,
                  point.value,
                );
                const markLabel = actionable && interaction && interaction.mode !== 'static'
                  ? `${accessibleLabel}. ${interaction.actionLabel}`
                  : accessibleLabel;

                return (
                  <g
                    key={point.id}
                    data-part="radar-point-mark"
                    data-datum-id={point.id}
                    data-chart-datum-key={datumProps['data-chart-datum-key']}
                    data-active={datumProps['data-active']}
                    data-focused={datumProps['data-focused']}
                    data-hovered={datumProps['data-hovered']}
                    data-pinned={datumProps['data-pinned']}
                    tabIndex={datumProps.tabIndex}
                    role={interactive ? actionable ? 'button' : 'img' : undefined}
                    aria-label={interactive ? markLabel : undefined}
                    aria-describedby={
                      datumProps['data-active'] && tooltip !== undefined && tooltip !== null && tooltip !== false
                        ? tooltipId
                        : undefined
                    }
                  >
                    {!interactive && showPointTitles ? <title>{staticLabel}</title> : null}
                    {interactive ? (
                      <>
                        <circle
                          data-part="interaction-target"
                          cx={point.x}
                          cy={point.y}
                          r={Math.max(12, pointRadius * 3)}
                          aria-hidden="true"
                        />
                        <circle
                          data-part="interaction-halo"
                          cx={point.x}
                          cy={point.y}
                          r={pointRadius + 3}
                          aria-hidden="true"
                        />
                      </>
                    ) : null}
                    <circle
                      data-part="series-point"
                      cx={point.x}
                      cy={point.y}
                      r={pointRadius}
                      fill={currentSeries.color}
                      strokeWidth={1.5}
                      aria-hidden={interactive ? true : undefined}
                    />
                  </g>
                );
              })}
            </g>
          ))}
        </g>
      </g>
    </ChartRendererSurface>
  );
}
