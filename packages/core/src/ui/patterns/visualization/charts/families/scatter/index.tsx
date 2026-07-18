'use client';

/**
 * Compatibility family for the public ScatterChart contract.
 *
 * The chart-engine now owns pure Cartesian geometry (including the least-squares
 * trend segment), React/SVG point marks, grid, axis labels, and the governed
 * series palette. This adapter preserves the established family props, scaffold,
 * accessible summary, legend, compact behaviour, and the idle tooltip element
 * for existing consumers while delegating all SVG ownership and colour
 * resolution to `SvgScatterRenderer`.
 *
 * Colour governance note (W5 Class-R migration): per-point `color` and the
 * `colors[]` prop were arbitrary hex sinks. They are DROPPED here — every mark
 * now paints through the governed `--ds-chart-paint-N` channel keyed on its
 * series index (mirrored by the legend swatch through the identical personality
 * palette chain), so tenant palettes reach scatter plots without a family edit.
 * The whitelabel-torture fixture re-baselines this governance change at W8.
 */

import { memo, useMemo, useRef } from 'react';

import type {
  ChartBaseProps,
  ChartCartesianCompactConfig,
  ChartColorsProps,
  ChartCompactProps,
  ChartLegendProps,
  ChartMarginProps,
} from '../../contracts';
import { DEFAULT_MARGIN } from '../../foundation/geometry';
import { useChartCompact, useChartDimensions, useChartPersonality, useChartTooltip } from '../../runtime';
import { ChartScaffold, describeChart } from '../../presentation/scaffold';
import { ChartTooltip } from '../../presentation/tooltip';
import type {
  SvgScatterDatum,
  SvgScatterVariant,
} from '../../runtime/chart-engine/foundation/renderers/geometry';
import { SvgScatterRenderer } from '../../runtime/chart-engine/presentation/react/renderers/scatter';

const DEFAULT_SCATTER_SIZE_RANGE: [number, number] = [4, 30];
const MAX_SCATTER_COORDINATE = Number.MAX_VALUE / 4;

/** Clamp coordinates so an extreme magnitude cannot overflow the scale domain. */
function clampCoordinate(value: number): number {
  return Math.max(-MAX_SCATTER_COORDINATE, Math.min(MAX_SCATTER_COORDINATE, value));
}

/** A single data point in the scatter plot. */
export interface ScatterDataPoint {
  /** Horizontal axis value */
  x: number;
  /** Vertical axis value */
  y: number;
  /** Optional bubble size (used when bubble mode is enabled) */
  size?: number;
  /** Optional color override for this point */
  color?: string;
  /** Optional label shown in tooltip */
  label?: string;
  /** Additional custom properties accessible in render callbacks */
  [key: string]: unknown;
}

/** Props for the {@link ScatterChart} component. */
export interface ScatterChartProps
  extends ChartBaseProps,
    ChartLegendProps,
    ChartColorsProps,
    ChartMarginProps,
    ChartCompactProps<ChartCartesianCompactConfig> {
  data: ScatterDataPoint[];
  /** X axis label */
  xLabel?: string;
  /** Y axis label */
  yLabel?: string;
  /** Default point radius. Default: 5 */
  pointRadius?: number;
  /** Enable bubble mode (radius mapped from data.size). Default: false */
  bubble?: boolean;
  /** Radius range for bubble mode [min, max]. Default: [4, 30] */
  sizeRange?: [number, number];
  /** Show grid lines. Default: true */
  grid?: boolean;
  /** Point fill opacity. Default: 0.7 */
  opacity?: number;
  /** Show linear trend line (least squares). Default: false */
  trendLine?: boolean;
}

/**
 * Public ScatterChart compatibility adapter. SVG ownership, Cartesian geometry,
 * the trend segment, and the governed series palette are delegated to
 * `SvgScatterRenderer`; the family contract, scaffold shell, accessible summary,
 * legend, and compact behaviour remain unchanged.
 *
 * @param props - See {@link ScatterChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped React renderer with accessible summary table.
 */
export const ScatterChart = memo(function ScatterChart({
  data,
  xLabel,
  yLabel,
  pointRadius = 5,
  bubble = false,
  sizeRange = DEFAULT_SCATTER_SIZE_RANGE,
  grid = true,
  opacity = 0.7,
  trendLine = false,
  width,
  height = 400,
  className,
  style,
  loading = false,
  title,
  subtitle,
  legend = false,
  animate,
  responsive = true,
  tooltip,
  margin = DEFAULT_MARGIN,
  compact,
  compactMode,
  autoCompact,
  compactBreakpoint,
}: ScatterChartProps) {
  const scaffoldRef = useRef<HTMLDivElement>(null);
  const legacySvgRef = useRef<SVGSVGElement>(null);
  const { dimensions } = useChartDimensions(width, height);
  // The renderer governs motion and native point titles from the resolved
  // personality; the family retains `animate`/`tooltip` in its contract and
  // sources the loading label and the governed palette from the hook.
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const palette = chartPersonality.colors;
  const compactState = useChartCompact({ compact, compactMode, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  // The idle tooltip element preserves the tooltip-personality/skin contract.
  // Live crosshair wiring for the migrated renderer lands with the shared
  // interaction controller (Stage C), not this migration.
  const { tooltipProps } = useChartTooltip();
  const variant: SvgScatterVariant = bubble ? 'bubble' : 'scatter';
  const resolvedSizeRange = useMemo<[number, number]>(() => {
    const first = Number.isFinite(sizeRange[0]) && sizeRange[0] >= 0 ? sizeRange[0] : 4;
    const second = Number.isFinite(sizeRange[1]) && sizeRange[1] >= 0 ? sizeRange[1] : 30;
    return first <= second ? [first, second] : [second, first];
  }, [sizeRange]);
  const resolvedOpacity = Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : 0.7;

  const finiteData = useMemo(
    () => data.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y)),
    [data],
  );

  // Each point is its own governed series so the migrated plot preserves the
  // legacy per-point colour distinction, now sourced from the tenant-governed
  // `--ds-chart-paint-N` channel instead of arbitrary per-point hex. Coordinates
  // are clamped so an extreme magnitude cannot overflow the scale domain to NaN.
  const rendererData = useMemo<SvgScatterDatum[]>(
    () => finiteData.map((point, index) => ({
      id: String(index),
      label: point.label ?? `Point ${index + 1}`,
      x: clampCoordinate(point.x),
      y: clampCoordinate(point.y),
      series: String(index),
      ...(bubble && point.size != null && Number.isFinite(point.size) && point.size >= 0
        ? { size: point.size }
        : {}),
    })),
    [bubble, finiteData],
  );

  const summary = useMemo(() => ({
    caption: title ? `${title} data summary` : 'Scatter chart data summary',
    headers: ['Label', 'X', 'Y', ...(bubble ? ['Size'] : [])],
    rows: finiteData.map((point) => [
      point.label ?? '-',
      point.x,
      point.y,
      ...(bubble ? [point.size ?? '-'] : []),
    ]),
  }), [bubble, finiteData, title]);

  const legendNode = legend ? (
    <div
      data-part="legend"
      data-variant={variant}
      style={{
        display: 'flex',
        gap: 'var(--ds-chart-legend-gap, 16px)',
        flexWrap: 'wrap',
        marginTop: 'var(--ds-chart-legend-margin-top, 8px)',
        justifyContent: 'center',
      }}
    >
      {finiteData
        .map((point, index) => ({ point, index }))
        .filter(({ point }) => point.label)
        .slice(0, 10)
        .map(({ point, index }) => (
          <div
            key={point.label ?? index}
            data-part="legend-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-chart-legend-item-gap, 6px)',
              fontSize: 'var(--ds-chart-legend-font-size, 12px)',
            }}
          >
            <span
              data-part="legend-swatch"
              data-series-index={index % 10}
              style={{
                width: 10,
                height: 10,
                backgroundColor: palette[index % palette.length] ?? 'var(--ds-color-primary)',
                display: 'inline-block',
              }}
            />
            <span data-part="legend-label">{point.label}</span>
          </div>
        ))}
    </div>
  ) : null;

  return (
    <ChartScaffold
      containerRef={scaffoldRef}
      svgRef={legacySvgRef}
      width={width}
      height={height}
      className={['ds-chart-scatter', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Scatter chart'}
      ariaDescription={describeChart('Scatter chart', finiteData.length, subtitle, [
        bubble ? 'Bubble mode enabled.' : null,
        trendLine ? 'Trend line shown.' : null,
        grid ? 'Grid lines visible.' : null,
        xLabel ? `X axis: ${xLabel}.` : null,
        yLabel ? `Y axis: ${yLabel}.` : null,
      ].filter(Boolean).join(' '))}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
      overlay={<ChartTooltip {...tooltipProps} variant={chartPersonality.tooltipStyle} />}
      plot={({ descriptionId }) => (
        <SvgScatterRenderer
          data={rendererData}
          ariaLabel={title ?? 'Scatter chart'}
          ariaDescribedBy={descriptionId}
          width={typeof width === 'number' ? width : undefined}
          height={height}
          responsive={responsive}
          variant={variant}
          insets={margin}
          pointRadius={pointRadius}
          bubbleRadiusRange={resolvedSizeRange}
          grid={grid}
          pointOpacity={resolvedOpacity}
          {...(xLabel ? { xLabel } : {})}
          {...(yLabel ? { yLabel } : {})}
          trendLine={trendLine}
          // The caller's style carries any provider palette variables the
          // governed series channel resolves against. Placing it on the
          // renderer's own owner keeps resolution correct even where a host
          // cannot resolve an inherited custom property from an ancestor scope.
          style={style}
        />
      )}
    />
  );
});
