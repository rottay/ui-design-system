'use client';

/**
 * @fileoverview BarChart -- compatibility family for the public BarChart
 * contract. SVG ownership is delegated to the engine's React-owned
 * `SvgBarRenderer` (pure `buildSvgBarGeometry` / `buildSvgBarSeriesGeometry`);
 * this adapter preserves the established family props, scaffold, accessible
 * summary, legend, single-series colour order, and the multi-series grouped and
 * stacked modes in both orientations.
 *
 * Single-series: pass `data`. Multi-series: pass `series` (grouped or stacked).
 * The renderer's shared interaction controller provides the hover tooltip and
 * interaction halo; the family declares the interaction only while the tooltip
 * personality is active.
 *
 * @example
 * // Single-series
 * <BarChart data={[{ label: 'Q1', value: 120 }, { label: 'Q2', value: 340 }]} showValues title="Quarterly" />
 *
 * @example
 * // Multi-series stacked
 * <BarChart
 *   series={[
 *     { name: 'Revenue', data: [{ x: 'Jan', y: 100 }, { x: 'Feb', y: 200 }] },
 *     { name: 'Costs', data: [{ x: 'Jan', y: 60 }, { x: 'Feb', y: 90 }] },
 *   ]}
 *   stacked
 *   title="Revenue vs Costs"
 * />
 */

import { memo, useMemo, useRef, type ReactNode } from 'react';
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
  DataPoint,
  Series,
} from '../../contracts';
import { useChartDimensions, useChartPersonality, useChartCompact } from '../../runtime';
import { ChartScaffold, describeChart, resolveChartScaffoldState } from '../../presentation/scaffold';
import { TooltipValue } from '../../presentation/tooltip';
import type { ChartInteraction } from '../../runtime/chart-engine/foundation/interaction';
import type {
  SvgBarDatum,
  SvgBarSeriesInput,
} from '../../runtime/chart-engine/foundation/renderers/geometry';
import { SvgBarRenderer } from '../../runtime/chart-engine/presentation/react/renderers/bar';

const FALLBACK_BAR_COLOR = 'var(--ds-color-primary)';

function resolvePaletteColor(palette: readonly string[], index: number): string {
  const paletteIndex = palette.length > 0 ? index % palette.length : 0;
  return arrayValueAt(palette, paletteIndex) ?? FALLBACK_BAR_COLOR;
}

function isFiniteSeriesPoint(point: Series['data'][number]): boolean {
  if (!Number.isFinite(point.y)) return false;
  if (point.x instanceof Date) return Number.isFinite(point.x.getTime());
  if (typeof point.x === 'number') return Number.isFinite(point.x);
  return true;
}

/** Own props for the {@link BarChart} component (state copy is composed below). */
interface BarChartOwnProps
  extends ChartBaseProps,
    ChartLegendProps,
    ChartColorsProps,
    ChartColorSchemeProps,
    ChartMarginProps,
    ChartCompactProps<ChartCartesianCompactConfig> {
  /** Single-series data. Ignored when `series` is provided. */
  data?: DataPoint[];
  orientation?: 'vertical' | 'horizontal';
  /** Stack bars on top of each other (multi-series only). */
  stacked?: boolean;
  /** Multi-series data. When provided, `data` is ignored. */
  series?: Series[];
  barRadius?: number;
  barGap?: number;
  showValues?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

/** Props for the {@link BarChart} component. */
export type BarChartProps = BarChartOwnProps & ChartStateProps;

/**
 * Renders a categorical bar chart through the engine's pure-geometry bar
 * renderer. Supports single-series (`data`), grouped multi-series, and stacked
 * multi-series in vertical and horizontal orientations.
 *
 * @param props - See {@link BarChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped renderer with accessible summary table and optional legend.
 */
export const BarChart = memo(function BarChart({
  data,
  orientation = 'vertical',
  stacked = false,
  series,
  barRadius = 4,
  barGap = 0.2,
  showValues = false,
  xAxisLabel,
  yAxisLabel,
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
  legend = false,
  animate,
  responsive = true,
  colors,
  colorScheme,
  tooltip,
  compact,
  compactMode,
  autoCompact,
  compactBreakpoint,
}: BarChartProps) {
  const scaffoldRef = useRef<HTMLDivElement>(null);
  const legacySvgRef = useRef<SVGSVGElement>(null);
  const { dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip, colorScheme });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const compactState = useChartCompact({ compact, compactMode, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  const resolvedBarRadius = Number.isFinite(barRadius) ? Math.max(0, barRadius) : 4;
  const resolvedBarGap = Number.isFinite(barGap) ? Math.min(0.95, Math.max(0, barGap)) : 0.2;

  const isMultiSeries = series != null && series.length > 0;
  const singleData = useMemo(
    () => (data ?? []).filter((point) => Number.isFinite(point.value)),
    [data],
  );
  const renderSeries = useMemo(
    () => (series ?? []).map((currentSeries) => ({
      ...currentSeries,
      data: currentSeries.data.filter(isFiniteSeriesPoint),
    })),
    [series],
  );

  // Ordered unique category labels across all series (multi-series only).
  const categories = useMemo(() => {
    if (!isMultiSeries) return singleData.map((d) => d.label);
    const seen = new Set<string>();
    const result: string[] = [];
    for (const s of renderSeries) {
      for (const pt of s.data) {
        const key = String(pt.x);
        if (!seen.has(key)) {
          seen.add(key);
          result.push(key);
        }
      }
    }
    return result;
  }, [isMultiSeries, singleData, renderSeries]);

  const seriesColors = useMemo(() => {
    if (!isMultiSeries) return [];
    return renderSeries.map((s, i) => s.color ?? resolvePaletteColor(palette, i));
  }, [isMultiSeries, renderSeries, palette]);

  // Renderer inputs: single-series bars keep the historic per-category colour
  // order; multi-series bars carry a per-series colour so the pure geometry can
  // paint each series consistently across categories.
  const rendererData = useMemo<SvgBarDatum[] | undefined>(() => {
    if (isMultiSeries) return undefined;
    return singleData.map((item, index) => ({
      id: `${index}::${item.label}`,
      category: item.label,
      value: item.value,
      valueLabel: String(item.value),
      color: item.color ?? resolvePaletteColor(palette, index),
    }));
  }, [isMultiSeries, singleData, palette]);
  const rendererSeries = useMemo<SvgBarSeriesInput[] | undefined>(() => {
    if (!isMultiSeries) return undefined;
    return renderSeries.map((currentSeries, seriesIndex) => ({
      id: `series-${seriesIndex}`,
      label: currentSeries.name,
      color: arrayValueAt(seriesColors, seriesIndex) ?? resolvePaletteColor(palette, seriesIndex),
      points: currentSeries.data.map((point) => ({
        category: String(point.x),
        value: point.y,
        valueLabel: String(point.y),
      })),
    }));
  }, [isMultiSeries, renderSeries, seriesColors, palette]);

  const summary = useMemo(() => {
    if (isMultiSeries) {
      return {
        caption: title ? `${title} data summary` : 'Bar chart data summary',
        headers: ['Category', ...renderSeries.map((s) => s.name)],
        rows: categories.map((cat) => {
          const values = renderSeries.map((s) => {
            const pt = s.data.find((d) => String(d.x) === cat);
            return pt ? pt.y : 0;
          });
          return [cat, ...values];
        }),
      };
    }
    return {
      caption: title ? `${title} data summary` : 'Bar chart data summary',
      headers: ['Label', 'Value'],
      rows: singleData.map((item) => [item.label, item.value]),
    };
  }, [isMultiSeries, title, renderSeries, categories, singleData]);

  const legendNode = legend ? (
    isMultiSeries ? (
      <div data-part="legend" style={{ display: 'flex', gap: 'var(--ds-chart-legend-gap, 16px)', flexWrap: 'wrap', marginTop: 'var(--ds-chart-legend-margin-top, 8px)', justifyContent: 'center' }}>
        {renderSeries.map((s, i) => (
          <div key={`${s.name}-${i}`} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-chart-legend-item-gap, 6px)', fontSize: 'var(--ds-chart-legend-font-size, 12px)' }}>
            <span data-part="legend-swatch" style={{ width: 12, height: 12, backgroundColor: arrayValueAt(seriesColors, i), display: 'inline-block' }} />
            <span data-part="legend-label">{s.name}</span>
          </div>
        ))}
      </div>
    ) : (
      <div data-part="legend" style={{ display: 'flex', gap: 'var(--ds-chart-legend-gap, 16px)', flexWrap: 'wrap', marginTop: 'var(--ds-chart-legend-margin-top, 8px)', justifyContent: 'center' }}>
        {singleData.map((d, i) => (
          <div key={`${d.label}-${i}`} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-chart-legend-item-gap, 6px)', fontSize: 'var(--ds-chart-legend-font-size, 12px)' }}>
            <span data-part="legend-swatch" style={{ width: 12, height: 12, backgroundColor: d.color ?? resolvePaletteColor(palette, i), display: 'inline-block' }} />
            <span data-part="legend-label">{d.label}</span>
          </div>
        ))}
      </div>
    )
  ) : null;

  const itemCount = isMultiSeries
    ? renderSeries.reduce((n, s) => n + s.data.length, 0)
    : singleData.length;
  const modeDescriptor = isMultiSeries
    ? stacked ? 'Stacked multi-series.' : 'Grouped multi-series.'
    : '';

  const interaction: ChartInteraction<SvgBarDatum> | undefined = chartPersonality.tooltip
    ? {
      mode: 'explore',
      renderTooltip: (active): ReactNode => {
        const compactTooltip = compactState.compactTooltip;
        const label = active.datum.series && !compactTooltip
          ? `${active.datum.series} — ${active.datum.category}`
          : compactTooltip ? '' : active.datum.category;
        return (
          <TooltipValue
            label={label}
            value={active.datum.valueLabel ?? active.datum.value}
            {...(active.datum.color === undefined ? {} : { color: active.datum.color })}
          />
        );
      },
    }
    : undefined;

  const resolvedState = resolveChartScaffoldState({
    state,
    loading,
    dataCount: itemCount,
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

  const description = describeChart('Bar chart', itemCount, subtitle, [
    orientation === 'horizontal' ? 'Horizontal orientation.' : 'Vertical orientation.',
    modeDescriptor || null,
    xAxisLabel ? `X axis: ${xAxisLabel}.` : null,
    yAxisLabel ? `Y axis: ${yAxisLabel}.` : null,
  ].filter(Boolean).join(' '));

  return (
    <ChartScaffold
      containerRef={scaffoldRef}
      svgRef={legacySvgRef}
      width={width}
      height={height}
      className={['ds-chart-bar', className].filter(Boolean).join(' ')}
      style={style}
      {...stateProps}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Bar chart'}
      ariaDescription={description}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
      plot={({ descriptionId }) => (
        <SvgBarRenderer
          {...(rendererData === undefined ? {} : { data: rendererData })}
          {...(rendererSeries === undefined ? {} : { series: rendererSeries })}
          layout={stacked ? 'stacked' : 'grouped'}
          ariaLabel={title ?? 'Bar chart'}
          ariaDescribedBy={descriptionId}
          width={typeof width === 'number' ? width : undefined}
          height={compactState.isCompact ? Math.max(height, compactState.minHeight) : height}
          responsive={responsive}
          orientation={orientation}
          bandPadding={resolvedBarGap}
          barRadius={resolvedBarRadius}
          showValues={showValues}
          {...(Number.isFinite(compactState.maxTicks)
            ? { maxTicks: compactState.maxTicks }
            : {})}
          {...(xAxisLabel === undefined ? {} : { xLabel: xAxisLabel })}
          {...(yAxisLabel === undefined ? {} : { yLabel: yAxisLabel })}
          {...(interaction === undefined ? {} : { interaction })}
        />
      )}
    />
  );
});
