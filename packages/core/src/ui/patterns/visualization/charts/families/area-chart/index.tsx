'use client';

/**
 * Compatibility family for the public AreaChart contract.
 *
 * SVG ownership is delegated to the engine `SvgAreaRenderer` (pure geometry +
 * React-owned marks); this adapter preserves the established family props,
 * scaffold, accessible summary, legend, and the numeric-overflow fallback
 * overlay for existing consumers. Diverging stacking now lives in the pure
 * `buildSvgAreaGeometry` builder rather than an imperative D3 effect.
 *
 * @example
 * <AreaChart
 *   series={[
 *     { name: 'Desktop', data: [{ x: 'Jan', y: 80 }, { x: 'Feb', y: 120 }] },
 *     { name: 'Mobile', data: [{ x: 'Jan', y: 40 }, { x: 'Feb', y: 90 }] },
 *   ]}
 *   stacked
 *   curved
 *   height={350}
 *   title="Traffic by Device"
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
  Series,
} from '../../contracts';
import { DEFAULT_MARGIN } from '../../foundation/geometry';
import { useChartDimensions, useChartPersonality, useChartCompact, useChartTooltip } from '../../runtime';
import { ChartScaffold, describeChart } from '../../presentation/scaffold';
import { ChartTooltip } from '../../presentation/tooltip';
import type { SvgAreaSeries, SvgLineCurve } from '../../runtime/chart-engine/foundation/renderers/geometry';
import { SvgAreaRenderer } from '../../runtime/chart-engine/presentation/react/renderers/area';

type AreaPoint = Series['data'][number];
const FALLBACK_AREA_COLOR = 'var(--ds-color-primary)';

function areaColor(palette: readonly string[], index: number): string {
  return arrayValueAt(palette, palette.length > 0 ? index % palette.length : 0) ?? FALLBACK_AREA_COLOR;
}

function validPoint(point: AreaPoint): boolean {
  if (!Number.isFinite(point.y)) return false;
  if (point.x instanceof Date) return Number.isFinite(point.x.getTime());
  if (typeof point.x === 'number') return Number.isFinite(point.x);
  return typeof point.x === 'string';
}

/** Props for the {@link AreaChart} component. */
export interface AreaChartProps
  extends ChartBaseProps,
    ChartLegendProps,
    ChartColorsProps,
    ChartColorSchemeProps,
    ChartMarginProps,
    ChartCompactProps<ChartCartesianCompactConfig> {
  series: Series[];
  curved?: boolean;
  stacked?: boolean;
  opacity?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

/**
 * Renders a multi-series area chart with optional stacking and gradient fills.
 *
 * @param props - See {@link AreaChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table and optional legend.
 */
export const AreaChart = memo(function AreaChart({
  series,
  curved,
  stacked = false,
  opacity = 0.3,
  xAxisLabel,
  yAxisLabel,
  width,
  height = 400,
  className,
  style,
  loading = false,
  title,
  subtitle,
  legend = true,
  animate,
  responsive = true,
  colors,
  colorScheme,
  tooltip,
  margin = DEFAULT_MARGIN,
  compact,
  compactMode,
  autoCompact,
  compactBreakpoint,
}: AreaChartProps) {
  const scaffoldRef = useRef<HTMLDivElement>(null);
  const legacySvgRef = useRef<SVGSVGElement>(null);
  const { dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, curved, tooltip, colorScheme });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const compactState = useChartCompact({ compact, compactMode, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  // The idle tooltip element preserves the tooltip-personality/skin contract.
  // Live crosshair wiring for the migrated renderers lands with the shared
  // interaction controller (Stage C), not this migration.
  const { tooltipProps } = useChartTooltip();
  const resolvedOpacity = Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : 0.3;
  const finiteSeries = useMemo(() => series.map((currentSeries) => ({
    ...currentSeries,
    data: currentSeries.data.filter(validPoint),
  })), [series]);
  const stackOverflow = useMemo(() => {
    if (!stacked) return false;
    const totals = new Map<string, { positive: number; negative: number }>();
    for (const currentSeries of finiteSeries) {
      const seenCategories = new Set<string>();
      for (const point of currentSeries.data) {
        const category = String(point.x);
        if (seenCategories.has(category)) continue;
        seenCategories.add(category);
        const current = totals.get(category) ?? { positive: 0, negative: 0 };
        const key = point.y < 0 ? 'negative' : 'positive';
        const next = current[key] + point.y;
        if (!Number.isFinite(next)) return true;
        current[key] = next;
        totals.set(category, current);
      }
    }
    return false;
  }, [finiteSeries, stacked]);
  const canRender = !stackOverflow;
  const pointCount = finiteSeries.reduce((count, currentSeries) => count + currentSeries.data.length, 0);
  const resolvedCurve: SvgLineCurve = chartPersonality.curved
    ? 'smooth'
    : chartPersonality.lineMode === 'step'
      ? 'step'
      : 'linear';
  const rendererSeries = useMemo<SvgAreaSeries[]>(() => finiteSeries.map((currentSeries, seriesIndex) => ({
    id: `series-${seriesIndex}`,
    label: currentSeries.name,
    color: currentSeries.color ?? areaColor(palette, seriesIndex),
    points: currentSeries.data.map((point, pointIndex) => ({
      id: `point-${pointIndex}`,
      x: String(point.x),
      value: point.y,
    })),
  })), [finiteSeries, palette]);
  const summary = {
    caption: title ? `${title} data summary` : 'Area chart data summary',
    headers: ['Series', 'X', 'Y'],
    rows: finiteSeries.flatMap((currentSeries) =>
      currentSeries.data.map((point) => [currentSeries.name, String(point.x), point.y])
    ),
  };
  const description = describeChart('Area chart', pointCount, subtitle, [
    stacked ? 'Stacked series.' : 'Independent series.',
    stackOverflow ? 'Stacked values exceed the finite numeric range.' : null,
    xAxisLabel ? `X axis: ${xAxisLabel}.` : null,
    yAxisLabel ? `Y axis: ${yAxisLabel}.` : null,
  ].filter(Boolean).join(' '));
  const legendNode = legend ? (
    <div data-part="legend" style={{ display: 'flex', gap: 'var(--ds-chart-legend-gap, 16px)', flexWrap: 'wrap', marginTop: 'var(--ds-chart-legend-margin-top, 8px)', justifyContent: 'center' }}>
      {finiteSeries.map((currentSeries, seriesIndex) => (
        <div key={`${currentSeries.name}-${seriesIndex}`} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-chart-legend-item-gap, 6px)', fontSize: 'var(--ds-chart-legend-font-size, 12px)' }}>
          <span data-part="legend-swatch" style={{ width: 12, height: 12, backgroundColor: currentSeries.color ?? areaColor(palette, seriesIndex), opacity: resolvedOpacity, display: 'inline-block' }} />
          <span data-part="legend-label">{currentSeries.name}</span>
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
      className={['ds-chart-area', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Area chart'}
      ariaDescription={description}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
      overlay={(
        <>
          {stackOverflow ? (
            <div
              data-part="data-fallback"
              data-error-code="NUMERIC_OVERFLOW"
              role="status"
              style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center', pointerEvents: 'none' }}
            >
              Stacked values exceed the finite numeric range.
            </div>
          ) : null}
          <ChartTooltip {...tooltipProps} variant={chartPersonality.tooltipStyle} />
        </>
      )}
      plot={({ descriptionId }) => (canRender ? (
        <SvgAreaRenderer
          series={rendererSeries}
          ariaLabel={title ?? 'Area chart'}
          ariaDescribedBy={descriptionId}
          width={typeof width === 'number' ? width : undefined}
          height={height}
          responsive={responsive}
          curve={resolvedCurve}
          stacked={stacked}
          opacity={resolvedOpacity}
          showDots={false}
          xLabel={xAxisLabel}
          yLabel={yAxisLabel}
        />
      ) : null)}
    />
  );
});
