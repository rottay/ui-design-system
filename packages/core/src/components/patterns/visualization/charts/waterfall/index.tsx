'use client';

/**
 * @fileoverview WaterfallChart -- D3-backed waterfall visualization showing how sequential
 * positive and negative values contribute to a running total. Uses `scaleBand` for categories
 * and `scaleLinear` for values. Each bar starts where the previous one ended (running total),
 * except 'total' type bars which always start from zero. Dashed connector lines link adjacent
 * bars. Bars are colored by type: increases (green), decreases (red), totals (primary).
 * Supports vertical and horizontal orientations with stagger animation on mount.
 *
 * @example
 * <WaterfallChart
 *   data={[
 *     { label: 'Revenue', value: 420 },
 *     { label: 'COGS', value: -200 },
 *     { label: 'Expenses', value: -80 },
 *     { label: 'Net Profit', value: 140, type: 'total' },
 *   ]}
 *   showValues
 *   showConnectors
 *   height={400}
 *   title="Profit Waterfall"
 * />
 */

import { memo, useEffect, useMemo, useRef } from 'react';
import { axisBottom, axisLeft, max, min, scaleBand, scaleLinear, select } from 'd3';

import type { ChartBaseProps } from '../Charts.types';
import { DEFAULT_MARGIN } from '../Charts.types';
import { useChartDimensions, useChartPersonality, useChartCompact } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

/** A single data point in the waterfall series. */
export interface WaterfallDataPoint {
  /** Category label displayed on the axis */
  label: string;
  /** Numeric value (positive = increase, negative = decrease) */
  value: number;
  /** Bar type. Default: inferred from value sign. 'total' bars start from zero. */
  type?: 'increase' | 'decrease' | 'total';
}

/** Props for the {@link WaterfallChart} component. */
export interface WaterfallChartProps extends ChartBaseProps {
  data: WaterfallDataPoint[];
  /** Color for increase bars. Default: var(--ds-color-success) */
  increaseColor?: string;
  /** Color for decrease bars. Default: var(--ds-color-error) */
  decreaseColor?: string;
  /** Color for total bars. Default: var(--ds-color-primary) */
  totalColor?: string;
  /** Show dashed connector lines between bars. Default: true */
  showConnectors?: boolean;
  /** Show value labels on bars. Default: true */
  showValues?: boolean;
  /** Format value display. Default: String(value) */
  formatValue?: (value: number) => string;
  /** Orientation. Default: 'vertical' */
  orientation?: 'vertical' | 'horizontal';
}

/** Resolves the effective type for a data point, inferring from value sign if not explicit. */
function resolveType(point: WaterfallDataPoint): 'increase' | 'decrease' | 'total' {
  if (point.type) return point.type;
  return point.value >= 0 ? 'increase' : 'decrease';
}

/** Computes running-total positions for each bar in the waterfall. */
interface ComputedBar {
  key: string;
  label: string;
  value: number;
  type: 'increase' | 'decrease' | 'total';
  start: number;
  end: number;
}

function computeBars(data: WaterfallDataPoint[]): ComputedBar[] {
  let runningTotal = 0;
  const bars: ComputedBar[] = [];
  for (const [index, point] of data.entries()) {
    if (!Number.isFinite(point.value)) continue;
    const key = String(index);
    const type = resolveType(point);
    if (type === 'total') {
      // Total bars display their value starting from zero
      bars.push({ key, label: point.label, value: point.value, type, start: 0, end: point.value });
      continue;
    }
    const start = runningTotal;
    const nextTotal = runningTotal + point.value;
    if (!Number.isFinite(nextTotal)) continue;
    runningTotal = nextTotal;
    bars.push({ key, label: point.label, value: point.value, type, start, end: runningTotal });
  }
  return bars;
}

function defaultFormatValue(value: number): string {
  return String(value);
}

/**
 * Renders a waterfall chart powered by D3's `scaleBand` + `scaleLinear`.
 * Bars stack sequentially with running totals, colored by increase/decrease/total type.
 *
 * @param props - See {@link WaterfallChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table and optional legend.
 */
export const WaterfallChart = memo(function WaterfallChart({
  data,
  increaseColor = 'var(--ds-color-success)',
  decreaseColor = 'var(--ds-color-error)',
  totalColor = 'var(--ds-color-primary)',
  showConnectors = true,
  showValues = true,
  formatValue,
  orientation = 'vertical',
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
}: WaterfallChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const compactState = useChartCompact({ compact, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = compactState.isCompact ? Math.max(height, compactState.minHeight) : height;
  const tickCount = compactState.isCompact ? compactState.maxTicks : 5;

  const formatVal = formatValue ?? defaultFormatValue;

  const computedBars = useMemo(() => computeBars(data), [data]);
  const summary = {
    caption: title ? `${title} data summary` : 'Waterfall chart data summary',
    headers: ['Label', 'Value', 'Type'],
    rows: computedBars.map((bar) => [bar.label, bar.value, bar.type]),
  };

  const legendNode = legend ? (
    <div data-part="legend" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {[
        { label: 'Increase', color: increaseColor },
        { label: 'Decrease', color: decreaseColor },
        { label: 'Total', color: totalColor },
      ].map((item) => (
        <div key={item.label} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span data-part="legend-swatch" data-status={item.label.toLowerCase()} style={{ width: 12, height: 12, backgroundColor: item.color, display: 'inline-block' }} />
          <span data-part="legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  ) : null;

  useEffect(() => {
    const svgNode = svgRef.current;
    if (!svgNode) return;

    const svg = select(svgNode);
    svg.selectAll('*').interrupt().remove();
    if (computedBars.length === 0) return;

    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('data-part', 'plot-area')
      .attr('data-orientation', orientation)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const bars = computedBars;

    // Compute value domain from all bar start/end positions
    const allValues = bars.flatMap((b) => [b.start, b.end]);
    const domainMin = min(allValues) ?? 0;
    const domainMax = max(allValues) ?? 0;
    const domain: [number, number] = domainMin === domainMax
      ? [Math.min(0, domainMin), Math.max(1, domainMax)]
      : [Math.min(0, domainMin), Math.max(0, domainMax)];

    function getBarColor(type: 'increase' | 'decrease' | 'total'): string {
      if (type === 'increase') return increaseColor;
      if (type === 'decrease') return decreaseColor;
      return totalColor;
    }

    if (orientation === 'vertical') {
      const x = scaleBand()
        .domain(bars.map((b) => b.key))
        .range([0, innerWidth])
        .padding(0.3);

      const y = scaleLinear()
        .domain(domain)
        .nice()
        .range([innerHeight, 0]);

      // X axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(axisBottom(x).tickFormat((key) => bars.find((bar) => bar.key === key)?.label ?? key))
        .selectAll('text')
        .attr('data-part', 'axis-tick-label')
        .style('font-size', '12px');

      // Y axis
      g.append('g')
        .call(axisLeft(y).ticks(tickCount))
        .selectAll('text')
        .attr('data-part', 'axis-tick-label')
        .style('font-size', '12px');

      // Grid lines
      g.append('g')
        .attr('class', 'grid')
        .call(axisLeft(y).ticks(tickCount).tickSize(-innerWidth).tickFormat(() => ''))
        .selectAll('line')
        .attr('data-part', 'grid-line')
        .style('stroke-opacity', 0.5);

      g.selectAll('.grid .domain').remove();

      // Connector lines between adjacent bars
      if (showConnectors) {
        bars.forEach((bar, i) => {
          if (i < bars.length - 1) {
            const xPos = (x(bar.key) ?? 0) + x.bandwidth();
            const nextXPos = x(bars[i + 1].key) ?? 0;
            const yPos = y(bar.end);

            g.append('line')
              .attr('data-part', 'connector')
              .attr('x1', xPos)
              .attr('x2', nextXPos)
              .attr('y1', yPos)
              .attr('y2', yPos)
              .style('stroke-width', 1)
              .style('stroke-dasharray', '4,3');
          }
        });
      }

      // Bars
      const barSelection = g
        .selectAll('.waterfall-bar')
        .data(bars)
        .enter()
        .append('rect')
        .attr('class', 'waterfall-bar')
        .attr('data-part', 'bar')
        .attr('data-status', (d) => d.type)
        .attr('x', (d) => x(d.key) ?? 0)
        .attr('width', x.bandwidth())
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('fill', (d) => getBarColor(d.type));

      if (chartPersonality.tooltip) {
        barSelection.append('title').text((d) =>
          compactState.compactTooltip
            ? formatVal(d.value)
            : `${d.label}: ${formatVal(d.value)} (${d.type})`
        );
      }

      if (chartPersonality.animate) {
        // Bars grow from the zero baseline
        const zeroY = y(0);
        barSelection
          .attr('y', zeroY)
          .attr('height', 0)
          .transition()
          .duration(chartPersonality.animationDuration)
          .delay((_, i) => i * 60)
          .attr('y', (d) => y(Math.max(d.start, d.end)))
          .attr('height', (d) => Math.abs(y(d.start) - y(d.end)));
      } else {
        barSelection
          .attr('y', (d) => y(Math.max(d.start, d.end)))
          .attr('height', (d) => Math.abs(y(d.start) - y(d.end)));
      }

      // Value labels
      if (showValues) {
        g.selectAll('.waterfall-value')
          .data(bars)
          .enter()
          .append('text')
          .attr('class', 'waterfall-value')
          .attr('data-part', 'value-label')
          .attr('x', (d) => (x(d.key) ?? 0) + x.bandwidth() / 2)
          .attr('y', (d) => {
            const topY = y(Math.max(d.start, d.end));
            return d.value >= 0 ? topY - 5 : y(Math.min(d.start, d.end)) + 14;
          })
          .attr('text-anchor', 'middle')
          .style('font-size', '11px')
          .text((d) => formatVal(d.value));
      }
    } else {
      // Horizontal orientation: categories on Y axis, values on X axis
      const y = scaleBand()
        .domain(bars.map((b) => b.key))
        .range([0, innerHeight])
        .padding(0.3);

      const x = scaleLinear()
        .domain(domain)
        .nice()
        .range([0, innerWidth]);

      // X axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(axisBottom(x).ticks(tickCount))
        .selectAll('text')
        .attr('data-part', 'axis-tick-label')
        .style('font-size', '12px');

      // Y axis
      g.append('g')
        .call(axisLeft(y).tickFormat((key) => bars.find((bar) => bar.key === key)?.label ?? key))
        .selectAll('text')
        .attr('data-part', 'axis-tick-label')
        .style('font-size', '12px');

      // Grid lines
      g.append('g')
        .attr('class', 'grid')
        .call(axisBottom(x).ticks(tickCount).tickSize(-innerHeight).tickFormat(() => ''))
        .selectAll('line')
        .attr('data-part', 'grid-line')
        .style('stroke-opacity', 0.5);

      g.selectAll('.grid .domain').remove();

      // Connector lines
      if (showConnectors) {
        bars.forEach((bar, i) => {
          if (i < bars.length - 1) {
            const yPos = (y(bar.key) ?? 0) + y.bandwidth();
            const nextYPos = y(bars[i + 1].key) ?? 0;
            const xPos = x(bar.end);

            g.append('line')
              .attr('data-part', 'connector')
              .attr('x1', xPos)
              .attr('x2', xPos)
              .attr('y1', yPos)
              .attr('y2', nextYPos)
              .style('stroke-width', 1)
              .style('stroke-dasharray', '4,3');
          }
        });
      }

      // Bars
      const barSelection = g
        .selectAll('.waterfall-bar')
        .data(bars)
        .enter()
        .append('rect')
        .attr('class', 'waterfall-bar')
        .attr('data-part', 'bar')
        .attr('data-status', (d) => d.type)
        .attr('y', (d) => y(d.key) ?? 0)
        .attr('height', y.bandwidth())
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('fill', (d) => getBarColor(d.type));

      if (chartPersonality.tooltip) {
        barSelection.append('title').text((d) =>
          compactState.compactTooltip
            ? formatVal(d.value)
            : `${d.label}: ${formatVal(d.value)} (${d.type})`
        );
      }

      if (chartPersonality.animate) {
        const zeroX = x(0);
        barSelection
          .attr('x', zeroX)
          .attr('width', 0)
          .transition()
          .duration(chartPersonality.animationDuration)
          .delay((_, i) => i * 60)
          .attr('x', (d) => x(Math.min(d.start, d.end)))
          .attr('width', (d) => Math.abs(x(d.end) - x(d.start)));
      } else {
        barSelection
          .attr('x', (d) => x(Math.min(d.start, d.end)))
          .attr('width', (d) => Math.abs(x(d.end) - x(d.start)));
      }

      // Value labels
      if (showValues) {
        g.selectAll('.waterfall-value')
          .data(bars)
          .enter()
          .append('text')
          .attr('class', 'waterfall-value')
          .attr('data-part', 'value-label')
          .attr('y', (d) => (y(d.key) ?? 0) + y.bandwidth() / 2)
          .attr('x', (d) => {
            const rightX = x(Math.max(d.start, d.end));
            return d.value >= 0 ? rightX + 5 : x(Math.min(d.start, d.end)) - 5;
          })
          .attr('dominant-baseline', 'middle')
          .attr('text-anchor', (d) => (d.value >= 0 ? 'start' : 'end'))
          .style('font-size', '11px')
          .text((d) => formatVal(d.value));
      }
    }

    // Style axis lines
    svg.selectAll('.domain').attr('data-part', 'axis-domain');
    svg.selectAll('.tick line:not([data-part])').attr('data-part', 'axis-tick');
    return () => {
      svg.selectAll('*').interrupt();
    };
  }, [computedBars, chartWidth, chartHeight, orientation, increaseColor, decreaseColor, totalColor, showConnectors, showValues, formatVal, chartPersonality, margin, tickCount, compactState.compactTooltip]);

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={height}
      className={['ds-chart-waterfall', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Waterfall chart'}
      ariaDescription={describeChart('Waterfall chart', computedBars.length, subtitle, [
        orientation === 'horizontal' ? 'Horizontal orientation.' : 'Vertical orientation.',
        showConnectors ? 'Connector lines shown between bars.' : null,
      ].filter(Boolean).join(' '))}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
    />
  );
});
