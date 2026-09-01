'use client';

/**
 * @fileoverview PieChart -- compatibility family for the public PieChart
 * contract. SVG ownership is delegated to the engine's React-owned
 * `SvgPieRenderer` (pure `buildSvgPieGeometry` arcs); this adapter preserves
 * the established family props, scaffold, accessible summary, legend, and the
 * INVALID-DATA fallback overlay.
 *
 * Three feedback semantics coexist (see scaffold JSDoc):
 * - `state='loading'|'empty'|'error'` -- caller-declared lifecycle (typed copy).
 * - `data-fallback` overlay -- the family-computed invalid/zero-data semantic
 *   (negative, NaN, or no positive total): the renderer is not mounted, so no
 *   stale marks paint beneath the message (the `canRender` guard).
 *
 * @example
 * <PieChart
 *   data={[
 *     { label: 'Desktop', value: 60 },
 *     { label: 'Mobile', value: 30 },
 *     { label: 'Tablet', value: 10 },
 *   ]}
 *   donut
 *   showPercentage
 *   height={350}
 *   title="Traffic Sources"
 * />
 */

import { memo, useMemo, useRef } from 'react';

import type {
  ChartBaseProps,
  ChartColorSchemeProps,
  ChartColorsProps,
  ChartCompactProps,
  ChartLegendProps,
  ChartSeriesLabelCompactConfig,
  ChartStateProps,
  DataPoint,
} from '../../contracts';
import { useChartDimensions, useChartPersonality, useChartCompact } from '../../runtime';
import { ChartScaffold, describeChart, resolveChartScaffoldState } from '../../presentation/scaffold';
import {
  buildSvgPieGeometry,
  type SvgPieDatum,
} from '../../runtime/chart-engine/foundation/renderers/geometry';
import { SvgPieRenderer } from '../../runtime/chart-engine/presentation/react/renderers/pie';

/** Own props for the {@link PieChart} component (state copy is composed below). */
interface PieChartOwnProps
  extends ChartBaseProps,
    ChartLegendProps,
    ChartColorsProps,
    ChartColorSchemeProps,
    ChartCompactProps<ChartSeriesLabelCompactConfig> {
  data: DataPoint[];
  donut?: boolean;
  innerRadius?: number;
  showLabels?: boolean;
  showPercentage?: boolean;
}

/** Props for the {@link PieChart} component. */
export type PieChartProps = PieChartOwnProps & ChartStateProps;

/**
 * Renders a pie or donut chart through the engine's pure-geometry pie renderer.
 *
 * @param props - See {@link PieChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped renderer with accessible summary table and optional legend.
 */
export const PieChart = memo(function PieChart({
  data,
  donut = false,
  innerRadius = 0.6,
  showLabels = true,
  showPercentage = false,
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
}: PieChartProps) {
  const scaffoldRef = useRef<HTMLDivElement>(null);
  const legacySvgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip, colorScheme });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const compactState = useChartCompact({ compact, compactMode, autoCompact, compactBreakpoint, containerWidth: dimensions.width });

  const hasInvalidValue = data.some((item) => !Number.isFinite(item.value));
  const hasNegativeValue = data.some((item) => item.value < 0);
  const rawTotal = hasInvalidValue || hasNegativeValue
    ? 0
    : data.reduce((currentTotal, item) => currentTotal + item.value, 0);
  const hasInvalidTotal = !Number.isFinite(rawTotal);
  const total = hasInvalidTotal ? 0 : rawTotal;
  const fallbackMessage = data.length === 0
    ? 'No data to display.'
    : hasInvalidValue
      ? 'Pie charts require finite values.'
      : hasNegativeValue
        ? 'Pie charts cannot represent negative values.'
        : hasInvalidTotal
          ? 'Pie chart values exceed the supported total.'
          : total <= 0
            ? 'Pie chart has no positive values.'
            : null;
  const canRender = fallbackMessage === null;

  const summary = useMemo(() => ({
    caption: title ? `${title} data summary` : 'Pie chart data summary',
    headers: ['Label', 'Value', 'Percentage'],
    rows: data.map((item) => [
      item.label,
      Number.isFinite(item.value) ? item.value : 'Invalid',
      canRender ? `${((item.value / total) * 100).toFixed(1)}%` : '0%',
    ]),
  }), [canRender, data, total, title]);

  // Renderer datum: a category label shown inside slices maps to `valueLabel`
  // when percentages are off, so the pure renderer keeps the historic label
  // choice without owning family copy. Ids are index-scoped to stay unique even
  // when two categories share a display label.
  const rendererData = useMemo<SvgPieDatum[]>(
    () => data.map((item, index) => ({
      id: `pie-slice-${index}`,
      label: item.label,
      value: item.value,
      ...(showPercentage ? {} : { valueLabel: item.label }),
    })),
    [data, showPercentage],
  );

  const showSliceLabels = showLabels && !compactState.hideSeriesLabels;

  const legendNode = legend && canRender ? (
    <div data-part="legend">
      {data.map((d, i) => (
        <div key={`${d.label}-${i}`} data-part="legend-item">
          <span data-part="legend-swatch" data-series-index={i % 10} style={{ backgroundColor: d.color ?? palette[i % palette.length] }} />
          <span data-part="legend-label">{d.label}</span>
        </div>
      ))}
    </div>
  ) : null;

  const resolvedState = resolveChartScaffoldState({
    state,
    loading,
    dataCount: data.length,
    emptyLabel,
  });
  // Rebuild the discriminated state contract from the resolved state so the
  // typed-required copy correlates with the active arm (runtime guarantees the
  // label exists whenever the resolver returns 'empty'/'error').
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

  const description = describeChart(
    'Pie chart',
    data.length,
    subtitle,
    [donut ? 'Rendered as a donut chart.' : null, fallbackMessage].filter(Boolean).join(' ') || undefined,
  );

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={legacySvgRef}
      width={width}
      height={height}
      className={['ds-chart-pie', className].filter(Boolean).join(' ')}
      style={style}
      {...stateProps}
      loadingLabel={chartPersonality.loadingLabel}
      skeleton
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Pie chart'}
      ariaDescription={description}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
      overlay={fallbackMessage ? (
        <div
          data-part="data-fallback"
          role="status"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {fallbackMessage}
        </div>
      ) : null}
      plot={canRender ? (() => (
        <SvgPieRenderer
          data={rendererData}
          ariaLabel={title ?? 'Pie chart'}
          width={typeof width === 'number' ? width : undefined}
          height={compactState.isCompact ? Math.max(height, compactState.minHeight) : height}
          responsive={responsive}
          variant={donut ? 'donut' : 'pie'}
          {...(donut ? { innerRadiusRatio: Number.isFinite(innerRadius) ? Math.min(1, Math.max(0, innerRadius)) : 0.6 } : {})}
          showLabels={showSliceLabels}
          labelPercentageThreshold={0}
        />
      )) : undefined}
    />
  );
});
