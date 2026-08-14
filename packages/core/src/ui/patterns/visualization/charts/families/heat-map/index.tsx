'use client';

/**
 * Compatibility family for the public HeatMap contract.
 *
 * The chart-engine now owns pure band geometry, provider-scoped sequential
 * colour interpolation, and React/SVG cell marks. This adapter intentionally
 * preserves the established family props, scaffold, and accessible summary for
 * existing consumers while delegating all SVG ownership and colour resolution
 * to `SvgHeatMapRenderer`.
 *
 * Colour resolution note (W5 A0 census): the cell fill is a colour-MATH sink
 * (a sequential interpolation between the two caller-visible range stops). It
 * is resolved through `resolveCssColor` inside the renderer and emitted on the
 * `--ds-chart-cell-color` custom property, never as arbitrary categorical
 * paint, so it stays outside the governed `--ds-chart-series-N` channel.
 */

import { memo, useMemo, useRef, type CSSProperties } from 'react';

import type { ChartBaseProps, ChartLegendProps, ChartMarginProps, ChartStateProps } from '../../contracts';
import { ChartScaffold, describeChart, resolveChartScaffoldState } from '../../presentation/scaffold';
import { useChartPersonality } from '../../runtime';
import type { SvgHeatMapDatum } from '../../runtime/chart-engine/foundation/renderers/geometry';
import { SvgHeatMapRenderer } from '../../runtime/chart-engine/presentation/react/renderers/heat-map';

const DEFAULT_HEATMAP_COLOR_RANGE: [string, string] = [
  'var(--ds-color-info-bg)',
  'var(--ds-color-primary-500)',
];
const DEFAULT_HEATMAP_MARGIN = { top: 20, right: 20, bottom: 60, left: 80 };

/** Own props for the {@link HeatMap} component (state copy is composed below). */
interface HeatMapOwnProps extends ChartBaseProps, ChartMarginProps, ChartLegendProps {
  data: { x: string; y: string; value: number }[];
  xLabels?: string[];
  yLabels?: string[];
  colorRange?: [string, string];
  cellRadius?: number;
}

/** Props for the {@link HeatMap} component. */
export type HeatMapProps = HeatMapOwnProps & ChartStateProps;

/**
 * Public HeatMap compatibility adapter. SVG ownership, band geometry, and
 * provider-scoped colour interpolation are delegated to `SvgHeatMapRenderer`,
 * while the family contract, scaffold shell, and accessible summary table
 * remain unchanged.
 *
 * @param props - See {@link HeatMapProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped React renderer with accessible summary table.
 */
export const HeatMap = memo(function HeatMap({
  data,
  xLabels,
  yLabels,
  colorRange = DEFAULT_HEATMAP_COLOR_RANGE,
  cellRadius = 2,
  legend = false,
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
  animate = true,
  responsive = true,
  tooltip = true,
  margin = DEFAULT_HEATMAP_MARGIN,
}: HeatMapProps) {
  const scaffoldRef = useRef<HTMLDivElement>(null);
  const legacySvgRef = useRef<SVGSVGElement>(null);
  // The renderer governs motion and native cell titles from the resolved
  // personality; the family retains `animate`/`tooltip` in its contract and
  // sources only the loading label from the personality hook.
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const finiteData = useMemo(
    () => data.filter((item) => Number.isFinite(item.value)),
    [data],
  );
  const rendererData = useMemo<SvgHeatMapDatum[]>(
    () => finiteData.map((item, index) => ({
      // Positional id: unique by construction, so distinct column/row pairs
      // never false-collide. The geometry independently enforces coordinate
      // uniqueness, so a genuine duplicate cell is still rejected upstream.
      id: String(index),
      column: item.x,
      row: item.y,
      value: item.value,
    })),
    [finiteData],
  );
  const summary = useMemo(() => ({
    caption: title ? `${title} data summary` : 'Heatmap data summary',
    headers: ['X', 'Y', 'Value'],
    rows: finiteData.map((item) => [item.x, item.y, item.value]),
  }), [finiteData, title]);

  const resolvedState = resolveChartScaffoldState({
    state,
    loading,
    dataCount: finiteData.length,
    emptyLabel,
  });

  // Threshold-labelled ramp legend (opt-in `legend` prop). The ramp bridges
  // the same governed color range the renderer quantizes for its cells, via
  // private runtime stops; the numeric extent labels keep the scale
  // readable without color. Visible copy is numbers only, so no new catalog
  // keys are required.
  const valueExtent = useMemo<readonly [number, number] | null>(() => {
    if (finiteData.length === 0) return null;
    let minimum = Number.POSITIVE_INFINITY;
    let maximum = Number.NEGATIVE_INFINITY;
    for (const item of finiteData) {
      if (item.value < minimum) minimum = item.value;
      if (item.value > maximum) maximum = item.value;
    }
    return [minimum, maximum];
  }, [finiteData]);

  const legendNode = legend && valueExtent ? (
    <div
      data-part="legend"
      style={{
        // Private family bridge: the stops are runtime caller paint, the
        // skin owns the ramp structure. This is intentionally not a public
        // tenant-theme channel.
        ['--_ds-heatmap-ramp-low' as never]: colorRange[0],
        ['--_ds-heatmap-ramp-high' as never]: colorRange[1],
      } as CSSProperties}
    >
      <span data-part="legend-threshold" data-bound="min">{valueExtent[0]}</span>
      <span data-part="legend-ramp" aria-hidden="true" />
      <span data-part="legend-threshold" data-bound="max">{valueExtent[1]}</span>
    </div>
  ) : null;

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

  return (
    <ChartScaffold
      containerRef={scaffoldRef}
      svgRef={legacySvgRef}
      width={width}
      height={height}
      className={['ds-chart-heatmap', className].filter(Boolean).join(' ')}
      style={style}
      {...stateProps}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Heatmap'}
      ariaDescription={describeChart('Heatmap', finiteData.length, subtitle)}
      summary={summary}
      legend={legendNode}
      plot={({ descriptionId }) => (
        <SvgHeatMapRenderer
          data={rendererData}
          ariaLabel={title ?? 'Heatmap'}
          ariaDescribedBy={descriptionId}
          width={typeof width === 'number' ? width : undefined}
          height={height}
          responsive={responsive}
          xLabels={xLabels}
          yLabels={yLabels}
          colorRange={colorRange}
          cellRadius={cellRadius}
          insets={margin}
          // The caller's style carries any provider colour variables the
          // sequential range resolves against. Placing it on the renderer's own
          // owner keeps resolution correct even where a host cannot resolve an
          // inherited custom property from an ancestor scope.
          style={style}
        />
      )}
    />
  );
});
