'use client';

/**
 * @fileoverview Histogram -- distribution chart that bins raw numeric values and
 * renders contiguous bars representing frequency (or density). Binning uses
 * `d3.bin` as layout math inside the pure `buildSvgHistogramGeometry` builder;
 * this adapter owns no D3. Supports an optional cumulative distribution line,
 * density normalization, and value labels. SVG ownership is delegated to the
 * engine `SvgHistogramRenderer`.
 *
 * @example
 * <Histogram
 *   values={[12, 15, 22, 28, 28, 31, 35, 42, 42, 42, 55, 60]}
 *   bins={8}
 *   xLabel="Response Time (ms)"
 *   showLabels
 *   cumulativeLine
 *   height={400}
 *   title="Response Time Distribution"
 * />
 */

import { memo, useMemo, useRef } from 'react';

import type {
  ChartBaseProps,
  ChartCartesianCompactConfig,
  ChartCompactProps,
  ChartLegendProps,
  ChartMarginProps,
} from '../../contracts';
import { useChartDimensions, useChartPersonality, useChartCompact } from '../../runtime';
import { ChartScaffold, describeChart } from '../../presentation/scaffold';
import { buildSvgHistogramGeometry } from '../../runtime/chart-engine/foundation/renderers/geometry';
import { SvgHistogramRenderer } from '../../runtime/chart-engine/presentation/react/renderers/histogram';

/** Props for the {@link Histogram} component. */
export interface HistogramProps
  extends ChartBaseProps,
    ChartLegendProps,
    ChartMarginProps,
    ChartCompactProps<ChartCartesianCompactConfig> {
  /** Raw numeric values to bin */
  values: number[];
  /** Number of bins. Default: auto (Sturges' formula) */
  bins?: number;
  /** Custom bin thresholds */
  thresholds?: number[];
  /** X axis label */
  xLabel?: string;
  /** Y axis label. Default: 'Frequency' */
  yLabel?: string;
  /** Bar color. Default: var(--ds-color-primary) */
  color?: string;
  /** Show frequency labels on bars. Default: false */
  showLabels?: boolean;
  /** Show cumulative line overlay. Default: false */
  cumulativeLine?: boolean;
  /** Cumulative line color. Default: var(--ds-color-info) */
  cumulativeColor?: string;
  /** Format x-axis values */
  formatValue?: (value: number) => string;
  /** Density mode (normalize to 0-1). Default: false */
  density?: boolean;
}

function defaultFormatValue(value: number): string {
  return String(value);
}

/**
 * Renders a histogram (distribution chart).
 *
 * @param props - See {@link HistogramProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table.
 */
export const Histogram = memo(function Histogram({
  values,
  bins: binCount,
  thresholds,
  xLabel,
  yLabel = 'Frequency',
  color = 'var(--ds-color-primary)',
  showLabels = false,
  cumulativeLine = false,
  cumulativeColor = 'var(--ds-color-info)',
  formatValue,
  density = false,
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
  compact,
  compactMode,
  autoCompact,
  compactBreakpoint,
}: HistogramProps) {
  const scaffoldRef = useRef<HTMLDivElement>(null);
  const legacySvgRef = useRef<SVGSVGElement>(null);
  const { dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const compactState = useChartCompact({ compact, compactMode, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  const fmtVal = formatValue ?? defaultFormatValue;

  // The pure geometry builder is the single binning authority; the family reads
  // it for the accessible summary and the renderer recomputes it for marks.
  const summaryGeometry = useMemo(
    () => buildSvgHistogramGeometry({
      values,
      width: 600,
      height,
      bins: binCount,
      thresholds,
      density,
      cumulative: cumulativeLine,
    }),
    [binCount, cumulativeLine, density, height, thresholds, values],
  );
  const summary = {
    caption: title ? `${title} data summary` : 'Histogram data summary',
    headers: ['Bin Range', density ? 'Density' : 'Frequency'],
    rows: summaryGeometry.bins.map((bin) => [
      `${fmtVal(bin.x0)} - ${fmtVal(bin.x1)}`,
      density ? bin.densityValue.toFixed(4) : bin.count,
    ] as Array<string | number>),
  };
  const finiteCount = values.filter(Number.isFinite).length;

  const legendNode = legend ? (
    <div data-part="legend" data-variant={density ? 'density' : 'frequency'} style={{ display: 'flex', gap: 'var(--ds-chart-legend-gap, 16px)', flexWrap: 'wrap', marginTop: 'var(--ds-chart-legend-margin-top, 8px)', justifyContent: 'center' }}>
      <div data-part="legend-item" data-series="histogram" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-chart-legend-item-gap, 6px)', fontSize: 'var(--ds-chart-legend-font-size, 12px)' }}>
        <span data-part="legend-swatch" style={{ width: 12, height: 12, backgroundColor: color, display: 'inline-block' }} />
        <span data-part="legend-label">{density ? 'Density' : 'Frequency'}</span>
      </div>
      {cumulativeLine ? (
        <div data-part="legend-item" data-series="cumulative" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-chart-legend-item-gap, 6px)', fontSize: 'var(--ds-chart-legend-font-size, 12px)' }}>
          <span data-part="legend-swatch" style={{ width: 12, height: 2, backgroundColor: cumulativeColor, display: 'inline-block' }} />
          <span data-part="legend-label">Cumulative</span>
        </div>
      ) : null}
    </div>
  ) : null;

  const description = describeChart('Histogram', summaryGeometry.bins.length, subtitle, [
    `${finiteCount} data points across ${summaryGeometry.bins.length} bins.`,
    density ? 'Density normalization enabled.' : null,
    cumulativeLine ? 'Cumulative distribution line shown.' : null,
    xLabel ? `X axis: ${xLabel}.` : null,
    yLabel ? `Y axis: ${yLabel}.` : null,
  ].filter(Boolean).join(' '));

  return (
    <ChartScaffold
      containerRef={scaffoldRef}
      svgRef={legacySvgRef}
      width={width}
      height={height}
      className={['ds-chart-histogram', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Histogram'}
      ariaDescription={description}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
      plot={({ descriptionId }) => (
        <SvgHistogramRenderer
          values={values}
          ariaLabel={title ?? 'Histogram'}
          ariaDescribedBy={descriptionId}
          width={typeof width === 'number' ? width : undefined}
          height={height}
          responsive={responsive}
          bins={binCount}
          thresholds={thresholds}
          density={density}
          cumulative={cumulativeLine}
          showLabels={showLabels}
          color={color}
          cumulativeColor={cumulativeColor}
          formatValue={formatValue}
          xLabel={xLabel}
          yLabel={yLabel}
        />
      )}
    />
  );
});
