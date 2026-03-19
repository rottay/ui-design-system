'use client';

/**
 * @fileoverview PieChart -- D3-backed pie/donut chart using `d3.pie()` and `d3.arc()` generators.
 * Supports donut mode via configurable inner radius ratio, percentage or label display inside
 * slices, and a clockwise "unfurl" animation powered by `d3.interpolate` on arc angles.
 * Slice order is preserved (not sorted by value) for predictable colour assignment.
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

import { memo, useEffect, useRef } from 'react';
import { arc, interpolate, pie, select, sum, type PieArcDatum } from 'd3';

import type { ChartBaseProps, DataPoint } from '../Charts.types';
import { DEFAULT_COLORS } from '../Charts.types';
import { useChartDimensions, useChartPersonality, useChartCompact } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

/** Props for the {@link PieChart} component. */
export interface PieChartProps extends ChartBaseProps {
  data: DataPoint[];
  donut?: boolean;
  innerRadius?: number;
  showLabels?: boolean;
  showPercentage?: boolean;
}

/**
 * Renders a pie or donut chart using D3's `pie()` + `arc()` generators.
 *
 * @param props - See {@link PieChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table and optional legend.
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
  title,
  subtitle,
  legend = true,
  animate,
  responsive = true,
  colors = DEFAULT_COLORS,
  tooltip,
  compact,
  autoCompact,
  compactBreakpoint,
}: PieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const compactState = useChartCompact({ compact, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 400;
  const chartHeight = compactState.isCompact ? Math.max(height, compactState.minHeight) : height;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const summary = {
    caption: title ? `${title} data summary` : 'Pie chart data summary',
    headers: ['Label', 'Value', 'Percentage'],
    rows: data.map((item) => [item.label, item.value, total === 0 ? '0%' : `${((item.value / total) * 100).toFixed(1)}%`]),
  };
  const legendNode = legend ? (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {data.map((d, i) => (
        <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: d.color ?? colors[i % colors.length], display: 'inline-block' }} />
          <span style={{ color: 'var(--ds-color-text-secondary)' }}>{d.label}</span>
        </div>
      ))}
    </div>
  ) : null;

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    // The outer radius is derived from the smallest dimension so the chart
    // stays circular even in non-square containers; 20px padding prevents clipping.
    const radius = Math.min(chartWidth, chartHeight) / 2 - 20;
    // When donut mode is off, inner=0 produces a full pie. In donut mode the
    // innerRadius prop is a ratio (0-1) of the outer radius.
    const inner = donut ? radius * innerRadius : 0;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('transform', `translate(${chartWidth / 2},${chartHeight / 2})`);

    // sort(null) preserves the data's original order rather than sorting by
    // value, which keeps the slice arrangement predictable for the consumer.
    const pieGenerator = pie<DataPoint>()
      .value((d) => d.value)
      .sort(null);

    const arcGenerator = arc<PieArcDatum<DataPoint>>()
      .innerRadius(inner)
      .outerRadius(radius);

    // labelArc uses a collapsed radius (inner == outer) at 70% of the full
    // radius so `.centroid()` returns the midpoint along that ring -- this
    // places text labels at a readable position inside or over the slices.
    const labelArc = arc<PieArcDatum<DataPoint>>()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    const total = sum(data, (d) => d.value);

    const slices = g
      .selectAll('.slice')
      .data(pieGenerator(data))
      .enter()
      .append('g')
      .attr('class', 'slice');

    const paths = slices
      .append('path')
      .attr('fill', (d, i) => d.data.color ?? colors[i % colors.length])
      .attr('stroke', 'var(--ds-color-bg-primary)')
      .attr('stroke-width', 2);

    if (chartPersonality.tooltip) {
      paths.append('title').text((d) => {
        if (compactState.compactTooltip) {
          return String(d.data.value);
        }
        const pct = ((d.data.value / total) * 100).toFixed(1);
        return `${d.data.label}: ${d.data.value} (${pct}%)`;
      });
    }

    // attrTween interpolates from a zero-area arc (0,0) to each slice's final
    // angles, producing a clockwise "unfurl" animation around the centre.
    if (chartPersonality.animate) {
      paths
        .transition()
        .duration(chartPersonality.animationDuration)
        .attrTween('d', (d) => {
          const interpolateArc = interpolate({ startAngle: 0, endAngle: 0 }, d);
          return (t) => arcGenerator(interpolateArc(t) as PieArcDatum<DataPoint>) ?? '';
        });
    } else {
      paths.attr('d', arcGenerator);
    }

    // Labels (hidden when compact mode has hideSeriesLabels active)
    if (showLabels && !compactState.hideSeriesLabels) {
      slices
        .append('text')
        .attr('transform', (d) => `translate(${labelArc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('fill', 'var(--ds-color-text-primary)')
        .style('font-size', '11px')
        .style('pointer-events', 'none')
        .text((d) => {
          if (showPercentage) {
            return `${((d.data.value / total) * 100).toFixed(0)}%`;
          }
          return d.data.label;
        });
    }
  }, [data, chartWidth, chartHeight, donut, innerRadius, showLabels, showPercentage, chartPersonality, colors, compactState.compactTooltip, compactState.hideSeriesLabels]);

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={height}
      className={className}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Pie chart'}
      ariaDescription={describeChart('Pie chart', data.length, subtitle, donut ? 'Rendered as a donut chart.' : undefined)}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
    />
  );
});
