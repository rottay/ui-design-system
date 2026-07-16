'use client';

import { useId, useMemo, type CSSProperties } from 'react';

import { useResolvedChartPersonality } from '@/runtime/personality';
import { ChartInsightLayer } from '../insight/InsightLayer';
import type { ChartInteraction } from '../interaction/ChartInteraction';
import { useChartInteraction } from '../interaction/useChartInteraction';
import type { ChartInsightSpec } from '../spec';
import { useChartDimensions } from '../../hooks/use-chart-dimensions';
import {
  buildSvgLineGeometry,
  type ChartGeometryInsets,
  type SvgLineCurve,
  type SvgLinePoint,
  type SvgLineSeries,
  type SvgLineXType,
} from './ChartGeometry';
import { ChartRendererSurface } from './ChartRendererSurface';
import { createSvgLineDatumKey } from './SvgLineDatumKey';

type ChartPaintStyle = CSSProperties & {
  '--ds-chart-mark-color'?: string;
};

export interface SvgLineInteractionDatum {
  readonly series: {
    readonly id: string;
    readonly label: string;
    readonly color?: string;
  };
  readonly point: SvgLinePoint;
}

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
  /** Static, app-authored annotation specs. */
  readonly insights?: readonly ChartInsightSpec[];
  readonly interaction?: ChartInteraction<SvgLineInteractionDatum>;
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
  curve,
  showArea,
  showDots,
  insets,
  maxTicks,
  insights,
  interaction,
  className,
  style,
}: SvgLineRendererProps): React.ReactElement {
  const chartPersonality = useResolvedChartPersonality();
  const resolvedCurve: SvgLineCurve = curve
    ?? (chartPersonality.lineStyle === 'sharp' ? 'linear' : chartPersonality.lineStyle);
  const resolvedShowArea = showArea ?? chartPersonality.useGradientFill;
  const resolvedShowDots = showDots ?? chartPersonality.showDots;
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive ? dimensions.width : width;
  const geometry = useMemo(
    () => buildSvgLineGeometry({
      series,
      width: geometryWidth,
      height,
      xType,
      curve: resolvedCurve,
      showArea: resolvedShowArea,
      insets,
      maxTicks,
    }),
    [geometryWidth, height, insets, maxTicks, resolvedCurve, resolvedShowArea, series, xType],
  );
  const interactionItems = useMemo(() => {
    const visualColumns = new Map(
      [...new Set(
        geometry.series.flatMap((currentSeries) =>
          currentSeries.points.map((point) => point.xPosition)),
      )]
        .sort((left, right) => left - right)
        .map((position, column) => [position, column] as const),
    );

    return geometry.series.flatMap((currentSeries, row) =>
      currentSeries.points.map((point, column) => {
        const key = createSvgLineDatumKey(currentSeries.id, point.id);
        const label = point.ariaLabel
          ?? `${currentSeries.label}, ${point.xLabel ?? point.x}: ${point.valueLabel ?? point.value}`;
        const datum: SvgLineInteractionDatum = {
          series: {
            id: currentSeries.id,
            label: currentSeries.label,
            ...(currentSeries.seriesColor === undefined ? {} : { color: currentSeries.seriesColor }),
          },
          point: {
            id: point.id,
            x: point.x,
            value: point.value,
            ...(point.xLabel === undefined ? {} : { xLabel: point.xLabel }),
            ...(point.valueLabel === undefined ? {} : { valueLabel: point.valueLabel }),
            ...(point.ariaLabel === undefined ? {} : { ariaLabel: point.ariaLabel }),
          },
        };
        return {
          key,
          label,
          datum,
          x: point.xPosition,
          y: point.yPosition,
          row,
          column: visualColumns.get(point.xPosition) ?? column,
        };
      }));
  }, [geometry.series]);
  const insightCoordinates = useMemo(() => {
    const points = geometry.series.flatMap((currentSeries) => currentSeries.points);
    const numericX = (value: string | number): number | null => {
      if (xType === 'category' || xType === 'linear') {
        return typeof value === 'number' && Number.isFinite(value) ? value : null;
      }
      const parsed = typeof value === 'number'
        ? value
        : /^\d{4}-\d{2}-\d{2}$/.test(value)
          ? Date.parse(`${value}T00:00:00.000Z`)
          : /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)
            ? Date.parse(value)
            : Number.NaN;
      return Number.isFinite(parsed) ? parsed : null;
    };
    return {
      valueAxis: 'y' as const,
      valueAnchors: [
        { value: 0, position: geometry.baseline },
        ...points.map((point) => ({ value: point.value, position: point.yPosition })),
      ],
      numericEventAxis: 'x' as const,
      numericEventAnchors: points.flatMap((point) => {
        const value = numericX(point.x);
        return value === null ? [] : [{ value, position: point.xPosition }];
      }),
      categoricalEventAxis: 'x' as const,
      categoricalEventAnchors: points.map((point) => ({
        key: point.x,
        position: point.xPosition,
      })),
      datumAnchors: points.map((point) => ({
        id: point.id,
        x: point.xPosition,
        y: point.yPosition,
      })),
    };
  }, [geometry, xType]);
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
      interactionMode={interactionState.mode}
      interactionRootProps={interactionState.rootProps}
      tooltip={tooltip}
      tooltipId={tooltipId}
      tooltipKey={interactionState.activeKey ?? undefined}
      tooltipAnchor={activePoint ? { x: activePoint.x, y: activePoint.y } : undefined}
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
              data-series-index={seriesIndex % 5}
              aria-label={currentSeries.label}
              style={paintStyle}
            >
              {resolvedShowArea && currentSeries.areaPath ? (
                <path data-part="area" d={currentSeries.areaPath} aria-hidden="true" />
              ) : null}
              <path data-part="line" d={currentSeries.path} aria-hidden="true" />
              {resolvedShowDots || interactionState.mode !== 'static' ? currentSeries.points.map((point) => {
                const accessibleLabel = point.ariaLabel
                  ?? `${currentSeries.label}, ${point.xLabel ?? point.x}: ${point.valueLabel ?? point.value}`;
                const datumKey = createSvgLineDatumKey(currentSeries.id, point.id);
                const datumProps = interactionState.getDatumProps(datumKey);
                const interactive = interactionState.mode !== 'static';
                const actionable = interactionState.mode === 'select' || interactionState.mode === 'drill';
                const markLabel = actionable && interaction && interaction.mode !== 'static'
                  ? `${accessibleLabel}. ${interaction.actionLabel}`
                  : accessibleLabel;

                if (!interactive) {
                  return (
                    <circle
                      key={datumKey}
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
                }

                return (
                  <g
                    key={datumKey}
                    data-part="line-point-mark"
                    data-datum-id={point.id}
                    data-series-id={currentSeries.id}
                    {...datumProps}
                    role={actionable ? 'button' : 'img'}
                    aria-label={markLabel}
                    aria-describedby={datumProps['data-active'] && tooltip !== undefined && tooltip !== null && tooltip !== false ? tooltipId : undefined}
                  >
                    <circle
                      data-part="interaction-target"
                      cx={point.xPosition}
                      cy={point.yPosition}
                      r={12}
                      fill="transparent"
                      pointerEvents="all"
                      aria-hidden="true"
                    />
                    <circle
                      data-part="interaction-halo"
                      cx={point.xPosition}
                      cy={point.yPosition}
                      r={8}
                      aria-hidden="true"
                    />
                    {resolvedShowDots ? (
                      <circle
                        data-part="point"
                        data-datum-id={point.id}
                        cx={point.xPosition}
                        cy={point.yPosition}
                        r={4}
                        aria-hidden="true"
                      />
                    ) : null}
                  </g>
                );
              }) : null}
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
