'use client';

/**
 * @fileoverview LineChart -- compatibility family for the public LineChart
 * contract. SVG ownership is delegated to the engine's React-owned
 * `SvgLineRenderer` (pure `buildSvgLineGeometry` paths/scales); this adapter
 * preserves the established family props, scaffold, accessible summary, legend,
 * and the caller-declared lifecycle states.
 *
 * Live crosshair/tooltip wiring for the migrated renderers lands with the
 * shared interaction controller (Stage C); this migration keeps the idle
 * tooltip element so the tooltip-personality/skin contract is preserved.
 *
 * @example
 * <LineChart
 *   series={[{ name: 'Revenue', data: [{ x: 'Jan', y: 100 }, { x: 'Feb', y: 240 }] }]}
 *   curved
 *   showDots
 *   showArea
 *   height={350}
 *   title="Monthly Revenue"
 * />
 */

import { memo, useMemo, useRef } from 'react';
import { arrayValueAt } from '@/foundation/kernel/collections';

import type {
  ChartBaseProps,
  ChartCartesianCompactConfig,
  ChartColorSchemeProps,
  ChartColorsProps,
  ChartCompactProps,
  ChartLegendProps,
  ChartMarginProps,
  ChartStateProps,
  Series,
} from '../../contracts';
import { useChartDimensions, useChartPersonality, useChartCompact, useChartTooltip } from '../../runtime';
import { ChartScaffold, describeChart, resolveChartScaffoldState } from '../../presentation/scaffold';
import { ChartTooltip } from '../../presentation/tooltip';
import type {
  SvgLineCurve,
  SvgLineSeries,
  SvgLineXType,
  SvgLineXValue,
} from '../../runtime/chart-engine/foundation/renderers/geometry';
import { SvgLineRenderer } from '../../runtime/chart-engine/presentation/react/renderers/line';

type LinePoint = Series['data'][number];
const FALLBACK_LINE_COLOR = 'var(--ds-color-primary)';

function lineColor(palette: readonly string[], index: number): string {
  return arrayValueAt(palette, palette.length > 0 ? index % palette.length : 0) ?? FALLBACK_LINE_COLOR;
}

function timeValue(value: LinePoint['x']): number | null {
  const timestamp = value instanceof Date
    ? value.getTime()
    : new Date(value as string | number).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function validPoint(point: LinePoint, xType: SvgLineXType): boolean {
  if (!Number.isFinite(point.y)) return false;
  if (xType === 'time') return timeValue(point.x) !== null;
  if (xType === 'linear') return typeof point.x === 'number' && Number.isFinite(point.x);
  if (point.x instanceof Date) return Number.isFinite(point.x.getTime());
  if (typeof point.x === 'number') return Number.isFinite(point.x);
  return typeof point.x === 'string';
}

/**
 * Renderer x-values are `string | number`; a category label is stringified, a
 * time value collapses a `Date` to its epoch millis (the pure geometry parses
 * epoch numbers and ISO strings), and a linear value stays numeric.
 */
function rendererX(value: LinePoint['x'], xType: SvgLineXType): SvgLineXValue {
  if (xType === 'time') return value instanceof Date ? value.getTime() : (value as string | number);
  if (xType === 'linear') return typeof value === 'number' ? value : Number(value);
  return String(value);
}

/** Own props for the {@link LineChart} component (state copy is composed below). */
interface LineChartOwnProps
  extends ChartBaseProps,
    ChartLegendProps,
    ChartColorsProps,
    ChartColorSchemeProps,
    ChartMarginProps,
    ChartCompactProps<ChartCartesianCompactConfig> {
  series: Series[];
  curved?: boolean;
  showDots?: boolean;
  showArea?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xType?: SvgLineXType;
}

/** Props for the {@link LineChart} component. */
export type LineChartProps = LineChartOwnProps & ChartStateProps;

/**
 * Renders a multi-series line chart through the engine's pure-geometry line
 * renderer, with optional area fill and data-point markers.
 *
 * @param props - See {@link LineChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped renderer with accessible summary table and optional legend.
 */
export const LineChart = memo(function LineChart({
  series,
  curved,
  showDots,
  showArea = false,
  xAxisLabel,
  yAxisLabel,
  xType = 'category',
  width,
  height = 400,
  className,
  style,
  loading = false,
  state,
  emptyLabel,
  emptyDescription,
  emptyAction,
  errorLabel,
  errorDescription,
  errorAction,
  title,
  subtitle,
  legend = true,
  animate,
  responsive = true,
  colors,
  colorScheme,
  tooltip,
  compact,
  compactMode,
  autoCompact,
  compactBreakpoint,
}: LineChartProps) {
  const scaffoldRef = useRef<HTMLDivElement>(null);
  const legacySvgRef = useRef<SVGSVGElement>(null);
  const { dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, curved, showDots, tooltip, colorScheme });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const compactState = useChartCompact({ compact, compactMode, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  // The idle tooltip element preserves the tooltip-personality/skin contract.
  // Live crosshair wiring for the migrated renderers lands with the shared
  // interaction controller (Stage C), not this migration.
  const { tooltipProps } = useChartTooltip();

  const finiteSeries = useMemo(() => series.map((currentSeries) => ({
    ...currentSeries,
    data: currentSeries.data.filter((point) => validPoint(point, xType)),
  })), [series, xType]);
  const pointCount = finiteSeries.reduce((count, currentSeries) => count + currentSeries.data.length, 0);

  const resolvedCurve: SvgLineCurve = chartPersonality.lineMode === 'step'
    ? 'step'
    : chartPersonality.curved
      ? 'smooth'
      : 'linear';

  const rendererSeries = useMemo<SvgLineSeries[]>(() => finiteSeries.map((currentSeries, seriesIndex) => ({
    id: `series-${seriesIndex}`,
    label: currentSeries.name,
    color: currentSeries.color ?? lineColor(palette, seriesIndex),
    points: currentSeries.data.map((point, pointIndex) => ({
      id: `point-${pointIndex}`,
      x: rendererX(point.x, xType),
      value: point.y,
      xLabel: String(point.x),
    })),
  })), [finiteSeries, palette, xType]);

  const summary = {
    caption: title ? `${title} data summary` : 'Line chart data summary',
    headers: ['Series', 'X', 'Y'],
    rows: finiteSeries.flatMap((currentSeries) =>
      currentSeries.data.map((point) => [currentSeries.name, String(point.x), point.y])
    ),
  };

  const legendNode = legend ? (
    <div data-part="legend" style={{ display: 'flex', gap: 'var(--ds-chart-legend-gap, 16px)', flexWrap: 'wrap', marginTop: 'var(--ds-chart-legend-margin-top, 8px)', justifyContent: 'center' }}>
      {finiteSeries.map((s, i) => (
        <div key={`${s.name}-${i}`} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-chart-legend-item-gap, 6px)', fontSize: 'var(--ds-chart-legend-font-size, 12px)' }}>
          <span data-part="legend-swatch" style={{ width: 12, height: 3, backgroundColor: s.color ?? lineColor(palette, i), display: 'inline-block' }} />
          <span data-part="legend-label">{s.name}</span>
        </div>
      ))}
    </div>
  ) : null;

  const resolvedState = resolveChartScaffoldState({
    state,
    loading,
    dataCount: pointCount,
    emptyLabel,
  });
  // Rebuild the discriminated state contract from the resolved state so the
  // typed-required copy correlates with the active arm.
  const stateProps: ChartStateProps = resolvedState === 'error'
    ? {
      state: 'error',
      errorLabel: errorLabel ?? '',
      ...(errorDescription === undefined ? {} : { errorDescription }),
      ...(errorAction === undefined ? {} : { errorAction }),
    }
    : resolvedState === 'empty'
      ? {
        state: 'empty',
        emptyLabel: emptyLabel ?? '',
        ...(emptyDescription === undefined ? {} : { emptyDescription }),
        ...(emptyAction === undefined ? {} : { emptyAction }),
      }
      : {
        state: resolvedState,
        ...(emptyLabel === undefined ? {} : { emptyLabel }),
        ...(emptyDescription === undefined ? {} : { emptyDescription }),
        ...(emptyAction === undefined ? {} : { emptyAction }),
      };

  const description = describeChart('Line chart', pointCount, subtitle, [
    xAxisLabel ? `X axis: ${xAxisLabel}.` : null,
    yAxisLabel ? `Y axis: ${yAxisLabel}.` : null,
  ].filter(Boolean).join(' '));

  return (
    <ChartScaffold
      containerRef={scaffoldRef}
      svgRef={legacySvgRef}
      width={width}
      height={height}
      className={['ds-chart-line', className].filter(Boolean).join(' ')}
      style={style}
      {...stateProps}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Line chart'}
      ariaDescription={description}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
      overlay={<ChartTooltip {...tooltipProps} variant={chartPersonality.tooltipStyle} />}
      plot={({ descriptionId }) => (
        <SvgLineRenderer
          series={rendererSeries}
          ariaLabel={title ?? 'Line chart'}
          ariaDescribedBy={descriptionId}
          width={typeof width === 'number' ? width : undefined}
          height={height}
          responsive={responsive}
          xType={xType}
          curve={resolvedCurve}
          showArea={showArea}
          showDots={chartPersonality.showDots}
          {...(xAxisLabel === undefined ? {} : { xLabel: xAxisLabel })}
          {...(yAxisLabel === undefined ? {} : { yLabel: yAxisLabel })}
        />
      )}
    />
  );
});
