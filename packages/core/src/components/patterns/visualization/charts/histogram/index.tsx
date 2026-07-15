'use client';

/**
 * @fileoverview Histogram -- D3-backed distribution chart that bins raw numeric values
 * and renders contiguous bars representing frequency (or density). Uses `d3.bin()` to
 * compute bins from raw data, with automatic bin count via Sturges' formula or explicit
 * thresholds. Supports an optional cumulative distribution line overlay, density
 * normalization, value labels, and staggered mount animation.
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

import { memo, useEffect, useRef } from 'react';
import { arrayValueAt } from '@/_internal/utils/collections';
import {
  axisBottom,
  axisLeft,
  bin,
  line as d3Line,
  max,
  scaleLinear,
  select,
  sum,
} from 'd3';

import type { ChartBaseProps } from '../Charts.types';
import { DEFAULT_MARGIN } from '../Charts.types';
import { useChartDimensions, useChartPersonality, useChartCompact } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

/** Props for the {@link Histogram} component. */
export interface HistogramProps extends ChartBaseProps {
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

/**
 * Computes bin count using Sturges' formula: ceil(log2(n) + 1).
 * Falls back to 1 when n <= 0.
 */
function sturgesBinCount(n: number): number {
  if (n <= 0) return 1;
  return Math.ceil(Math.log2(n) + 1);
}

/**
 * Renders a histogram (distribution chart) powered by D3's `bin()` generator
 * and `scaleLinear` for both axes. Bars are contiguous (no gap) to convey
 * continuous distribution. Optional cumulative line, density mode, value labels,
 * and staggered animation.
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
  margin = DEFAULT_MARGIN,
  compact,
  autoCompact,
  compactBreakpoint,
}: HistogramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const compactState = useChartCompact({ compact, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = compactState.isCompact ? Math.max(height, compactState.minHeight) : height;
  const tickCount = compactState.isCompact ? compactState.maxTicks : 5;

  // Compute bins outside useEffect so they can feed the summary table
  const resolvedBinCount = binCount ?? sturgesBinCount(values.length);

  const binGenerator = bin<number, number>().value((d) => d);

  if (thresholds) {
    binGenerator.thresholds(thresholds);
  } else {
    binGenerator.thresholds(resolvedBinCount);
  }

  const histogramBins = values.length > 0 ? binGenerator(values) : [];

  // Build the accessible summary table from computed bins
  const fmtVal = formatValue ?? ((v: number) => String(v));
  const summary = {
    caption: title ? `${title} data summary` : 'Histogram data summary',
    headers: ['Bin Range', density ? 'Density' : 'Frequency'],
    rows: histogramBins.map((b) => {
      const x0 = b.x0 ?? 0;
      const x1 = b.x1 ?? 0;
      const count = b.length;
      const totalWidth = x1 - x0;
      const densityVal = values.length > 0 && totalWidth > 0
        ? count / (values.length * totalWidth)
        : 0;
      return [
        `${fmtVal(x0)} - ${fmtVal(x1)}`,
        density ? densityVal.toFixed(4) : count,
      ];
    }),
  };

  // Legend node for cumulative line
  const legendNode = legend ? (
    <div data-part="legend" data-variant={density ? 'density' : 'frequency'} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      <div data-part="legend-item" data-series="histogram" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
        <span data-part="legend-swatch" style={{ width: 12, height: 12, backgroundColor: color, display: 'inline-block' }} />
        <span data-part="legend-label">{density ? 'Density' : 'Frequency'}</span>
      </div>
      {cumulativeLine ? (
        <div data-part="legend-item" data-series="cumulative" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span data-part="legend-swatch" style={{ width: 12, height: 2, backgroundColor: cumulativeColor, display: 'inline-block' }} />
          <span data-part="legend-label">Cumulative</span>
        </div>
      ) : null}
    </div>
  ) : null;

  useEffect(() => {
    if (!svgRef.current || values.length === 0 || histogramBins.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('data-part', 'plot-area')
      .attr('data-variant', density ? 'density' : 'frequency')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale: continuous, spanning the full value range
    const firstBin = arrayValueAt(histogramBins, 0);
    const lastBin = arrayValueAt(histogramBins, histogramBins.length - 1);
    const xMin = firstBin?.x0 ?? 0;
    const xMax = lastBin?.x1 ?? 0;
    const x = scaleLinear().domain([xMin, xMax]).range([0, innerWidth]);

    // Y scale: frequency or density
    let yValues: number[];

    if (density) {
      yValues = histogramBins.map((b) => {
        const binWidth = (b.x1 ?? 0) - (b.x0 ?? 0);
        return binWidth > 0 ? b.length / (values.length * binWidth) : 0;
      });
    } else {
      yValues = histogramBins.map((b) => b.length);
    }
    const getYValue = (index: number): number => arrayValueAt(yValues, index) ?? 0;

    const y = scaleLinear()
      .domain([0, max(yValues) ?? 0])
      .nice()
      .range([innerHeight, 0]);

    // X axis
    const xAxis = axisBottom(x).ticks(tickCount);
    if (formatValue) {
      xAxis.tickFormat((d) => formatValue(d as number));
    }

    g.append('g')
      .attr('data-part', 'axis')
      .attr('data-axis', 'x')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('data-part', 'axis-tick-label')
      .style('font-size', '12px');

    // Y axis
    g.append('g')
      .attr('data-part', 'axis')
      .attr('data-axis', 'y')
      .call(axisLeft(y).ticks(tickCount))
      .selectAll('text')
      .attr('data-part', 'axis-tick-label')
      .style('font-size', '12px');

    // Horizontal grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('data-part', 'grid')
      .attr('data-axis', 'y')
      .call(axisLeft(y).ticks(tickCount).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
      .attr('data-part', 'grid-line')
      .style('stroke-opacity', 0.5);

    g.selectAll('.grid .domain').remove();

    // Histogram bars (contiguous -- no gap between bins)
    const bars = g
      .selectAll('.histogram-bar')
      .data(histogramBins)
      .enter()
      .append('rect')
      .attr('class', 'histogram-bar')
      .attr('data-part', 'bar')
      .attr('data-series', 'histogram')
      .attr('data-state', 'idle')
      .attr('x', (d) => x(d.x0 ?? 0) + 1)
      .attr('width', (d) => Math.max(0, x(d.x1 ?? 0) - x(d.x0 ?? 0) - 1))
      .attr('fill', color)
      .attr('fill-opacity', 0.85);

    // Tooltips
    if (chartPersonality.tooltip) {
      bars.append('title').text((d, i) => {
        const x0 = d.x0 ?? 0;
        const x1 = d.x1 ?? 0;
        const count = d.length;
        const range = `${fmtVal(x0)} - ${fmtVal(x1)}`;
        if (compactState.compactTooltip) {
          return density ? getYValue(i).toFixed(4) : String(count);
        }
        return density
          ? `${range}: ${getYValue(i).toFixed(4)}`
          : `${range}: ${count}`;
      });
    }

    // Stagger animation: bars grow upward from baseline
    if (chartPersonality.animate) {
      bars
        .attr('y', innerHeight)
        .attr('height', 0)
        .transition()
        .duration(chartPersonality.animationDuration)
        .delay((_, i) => i * 50)
        .attr('y', (_, i) => y(getYValue(i)))
        .attr('height', (_, i) => innerHeight - y(getYValue(i)));
    } else {
      bars
        .attr('y', (_, i) => y(getYValue(i)))
        .attr('height', (_, i) => innerHeight - y(getYValue(i)));
    }

    // Frequency labels on bars
    if (showLabels) {
      const labels = g
        .selectAll('.histogram-label')
        .data(histogramBins)
        .enter()
        .append('text')
        .attr('class', 'histogram-label')
        .attr('data-part', 'value-label')
        .attr('data-series', 'histogram')
        .attr('x', (d) => (x(d.x0 ?? 0) + x(d.x1 ?? 0)) / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .text((_, i) => density ? getYValue(i).toFixed(2) : getYValue(i));

      if (chartPersonality.animate) {
        labels
          .attr('y', innerHeight)
          .attr('opacity', 0)
          .transition()
          .duration(chartPersonality.animationDuration)
          .delay((_, i) => i * 50)
          .attr('y', (_, i) => y(getYValue(i)) - 5)
          .attr('opacity', 1);
      } else {
        labels.attr('y', (_, i) => y(getYValue(i)) - 5);
      }
    }

    // Cumulative distribution line overlay
    if (cumulativeLine) {
      const totalCount = sum(yValues);
      if (totalCount > 0) {
        // Build cumulative points: one at the right edge of each bin
        let cumulative = 0;
        const cumulativeData: Array<{ cx: number; cy: number }> = [];

        // Start point at the left edge of the first bin at zero
        cumulativeData.push({ cx: firstBin?.x0 ?? 0, cy: 0 });

        for (let i = 0; i < histogramBins.length; i++) {
          const currentBin = arrayValueAt(histogramBins, i);
          if (!currentBin) continue;
          cumulative += getYValue(i);
          cumulativeData.push({
            cx: currentBin.x1 ?? 0,
            cy: cumulative / totalCount,
          });
        }

        // Secondary y-axis for cumulative (0 to 1, right side)
        const yCumulative = scaleLinear().domain([0, 1]).range([innerHeight, 0]);

        // Right y-axis
        const rightAxis = g
          .append('g')
          .attr('data-part', 'axis')
          .attr('data-axis', 'cumulative')
          .attr('transform', `translate(${innerWidth},0)`)
          .call(
            axisLeft(yCumulative)
              .ticks(tickCount)
              .tickSize(0)
              .tickFormat((d) => `${Math.round((d as number) * 100)}%`)
          );

        rightAxis
          .selectAll('text')
          .attr('data-part', 'axis-tick-label')
          .style('fill', cumulativeColor)
          .style('font-size', '11px')
          .attr('text-anchor', 'start')
          .attr('dx', 6);

        // Keep the caller-derived site as a presentation attribute. The chart
        // skin deliberately wins over it to preserve the pre-migration output:
        // the later global domain pass historically overwrote this colour.
        rightAxis.select('.domain').attr('stroke', cumulativeColor).style('stroke-opacity', 0.4);

        // Line path
        const lineGenerator = d3Line<{ cx: number; cy: number }>()
          .x((d) => x(d.cx))
          .y((d) => yCumulative(d.cy));

        const path = g
          .append('path')
          .datum(cumulativeData)
          .attr('data-part', 'cumulative-line')
          .attr('fill', 'none')
          .attr('stroke', cumulativeColor)
          .attr('stroke-width', 2)
          .attr('d', lineGenerator);

        // Dots at each cumulative point
        const dots = g
          .selectAll('.cumulative-dot')
          .data(cumulativeData)
          .enter()
          .append('circle')
          .attr('class', 'cumulative-dot')
          .attr('data-part', 'cumulative-point')
          .attr('data-series', 'cumulative')
          .attr('cx', (d) => x(d.cx))
          .attr('cy', (d) => yCumulative(d.cy))
          .attr('r', 3)
          .attr('fill', cumulativeColor);

        // Animate the cumulative line via stroke-dashoffset drawing trick
        if (chartPersonality.animate) {
          const pathNode = path.node();
          if (pathNode) {
            const totalLength = pathNode.getTotalLength();
            path
              .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
              .attr('stroke-dashoffset', totalLength)
              .transition()
              .duration(chartPersonality.animationDuration)
              .delay(histogramBins.length * 50)
              .attr('stroke-dashoffset', 0);
          }

          dots
            .attr('opacity', 0)
            .attr('r', 0)
            .transition()
            .duration(chartPersonality.animationDuration * 0.4)
            .delay((_, i) => histogramBins.length * 50 + i * 30)
            .attr('opacity', 1)
            .attr('r', 3);
        }
      }
    }

    // Axis labels
    if (xLabel) {
      svg
        .append('text')
        .attr('data-part', 'axis-label')
        .attr('data-axis', 'x')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight - 4)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(xLabel);
    }

    if (yLabel) {
      svg
        .append('text')
        .attr('data-part', 'axis-label')
        .attr('data-axis', 'y')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', 14)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(yLabel);
    }

    // Style axis lines
    svg.selectAll('.domain').attr('data-part', 'axis-domain');
    svg.selectAll('.tick line:not([data-part])').attr('data-part', 'axis-tick');
  }, [
    values,
    histogramBins,
    yLabel,
    xLabel,
    color,
    showLabels,
    cumulativeLine,
    cumulativeColor,
    formatValue,
    density,
    chartWidth,
    chartHeight,
    margin,
    chartPersonality,
    tickCount,
    compactState.compactTooltip,
    fmtVal,
  ]);

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={height}
      className={['ds-chart-histogram', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Histogram'}
      ariaDescription={describeChart('Histogram', histogramBins.length, subtitle, [
        `${values.length} data points across ${histogramBins.length} bins.`,
        density ? 'Density normalization enabled.' : null,
        cumulativeLine ? 'Cumulative distribution line shown.' : null,
        xLabel ? `X axis: ${xLabel}.` : null,
        yLabel ? `Y axis: ${yLabel}.` : null,
      ].filter(Boolean).join(' '))}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
    />
  );
});
