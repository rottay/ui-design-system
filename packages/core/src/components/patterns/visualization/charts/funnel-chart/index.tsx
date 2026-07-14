'use client';

/**
 * @fileoverview FunnelChart -- D3-backed funnel visualization rendered as tapering polygons.
 * Each stage is a four-point polygon whose top/bottom (or left/right) widths reflect the ratio
 * of that stage's value to the maximum. No D3 scales are used -- widths are computed manually
 * from value ratios, giving full control over the taper geometry. Supports vertical (top-down)
 * and horizontal (left-to-right) orientations with conversion-rate annotations.
 *
 * @example
 * <FunnelChart
 *   data={[
 *     { label: 'Visitors', value: 5000 },
 *     { label: 'Leads', value: 2500 },
 *     { label: 'Customers', value: 500 },
 *   ]}
 *   showPercentage
 *   showConversion
 *   height={400}
 *   title="Sales Funnel"
 * />
 */

import { memo, useEffect, useRef } from 'react';
import { max, select } from 'd3';

import type { ChartBaseProps, DataPoint } from '../Charts.types';
import { DEFAULT_COLORS, DEFAULT_MARGIN } from '../Charts.types';
import { useChartDimensions, useChartPersonality } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

/** Props for the {@link FunnelChart} component. */
export interface FunnelChartProps extends ChartBaseProps {
  data: DataPoint[];
  showPercentage?: boolean;
  showConversion?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

/**
 * Renders a funnel chart as tapering SVG polygons with optional conversion-rate labels.
 *
 * @param props - See {@link FunnelChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table and optional legend.
 */
export const FunnelChart = memo(function FunnelChart({
  data,
  showPercentage = true,
  showConversion = false,
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
  colors = DEFAULT_COLORS,
  tooltip,
  margin = DEFAULT_MARGIN,
}: FunnelChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = height;
  const maxValue = data.length > 0 ? Math.max(...data.map((item) => item.value)) : 0;
  const summary = {
    caption: title ? `${title} data summary` : 'Funnel chart data summary',
    headers: ['Stage', 'Value', 'Percentage'],
    rows: data.map((item) => [
      item.label,
      item.value,
      maxValue === 0 ? '0%' : `${((item.value / maxValue) * 100).toFixed(1)}%`,
    ]),
  };
  const legendNode = legend ? (
    <div data-part="legend" data-orientation={orientation} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {data.map((d, i) => (
        <div key={d.label} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span data-part="legend-swatch" style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: d.color ?? colors[i % colors.length], display: 'inline-block' }} />
          <span data-part="legend-label" style={{ color: 'var(--ds-color-text-secondary)' }}>{d.label}</span>
        </div>
      ))}
    </div>
  ) : null;

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('data-part', 'plot-area')
      .attr('data-orientation', orientation)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxValue = max(data, (d) => d.value) ?? 1;
    const n = data.length;

    if (orientation === 'vertical') {
      // Each segment occupies an equal vertical slice; the 2px gap prevents
      // anti-aliasing bleed between adjacent polygon edges.
      const segmentHeight = innerHeight / n;
      const gap = 2;

      data.forEach((d, i) => {
        // widthRatio maps the segment's value to a proportion of innerWidth.
        const widthRatio = d.value / maxValue;
        // The bottom edge of the last segment tapers to 80% of its own width
        // to maintain the funnel visual, since there is no next segment to derive from.
        const nextRatio = i < n - 1 ? data[i + 1].value / maxValue : widthRatio * 0.8;
        const topWidth = innerWidth * widthRatio;
        const bottomWidth = innerWidth * nextRatio;
        const topX = (innerWidth - topWidth) / 2;
        const bottomX = (innerWidth - bottomWidth) / 2;
        const yPos = i * segmentHeight;
        const color = d.color ?? colors[i % colors.length];

        const points = [
          [topX, yPos + gap],
          [topX + topWidth, yPos + gap],
          [bottomX + bottomWidth, yPos + segmentHeight - gap],
          [bottomX, yPos + segmentHeight - gap],
        ];

        const polygon = g
          .append('polygon')
          .attr('data-part', 'segment')
          .attr('data-state', 'idle')
          .attr('data-position', i === 0 ? 'first' : i === n - 1 ? 'last' : 'middle')
          .attr('points', points.map((p) => p.join(',')).join(' '))
          .attr('fill', color);

        if (chartPersonality.animate) {
          polygon
            .attr('opacity', 0)
            .transition()
            .duration(chartPersonality.animationDuration)
            .delay(i * 100)
            .attr('opacity', 1);
        }

        if (chartPersonality.tooltip) {
          polygon.append('title').text(`${d.label}: ${d.value}`);
        }

        // Label
        const centerY = yPos + segmentHeight / 2;
        g.append('text')
          .attr('data-part', 'segment-label')
          .attr('x', innerWidth / 2)
          .attr('y', centerY - 6)
          .attr('text-anchor', 'middle')
          .style('fill', 'var(--ds-color-text-on-primary)')
          .style('font-size', '13px')
          .style('font-weight', '600')
          .style('pointer-events', 'none')
          .text(d.label);

        // Value / percentage
        const pct = ((d.value / maxValue) * 100).toFixed(0);
        const valueText = showPercentage ? `${d.value} (${pct}%)` : String(d.value);
        g.append('text')
          .attr('data-part', 'segment-value')
          .attr('x', innerWidth / 2)
          .attr('y', centerY + 10)
          .attr('text-anchor', 'middle')
          .style('fill', 'color-mix(in srgb, var(--ds-color-text-on-primary) 80%, transparent)')
          .style('font-size', '11px')
          .style('pointer-events', 'none')
          .text(valueText);

        // Conversion rate
        if (showConversion && i > 0) {
          const rate = ((d.value / data[i - 1].value) * 100).toFixed(1);
          g.append('text')
            .attr('data-part', 'conversion-label')
            .attr('x', innerWidth + 8)
            .attr('y', yPos + 4)
            .attr('dominant-baseline', 'middle')
            .style('fill', 'var(--ds-color-text-secondary)')
            .style('font-size', '10px')
            .text(`${rate}%`);
        }
      });
    } else {
      // Horizontal: the taper logic mirrors the vertical case but operates on
      // height rather than width, flowing left-to-right through stages.
      const segmentWidth = innerWidth / n;
      const gap = 2;

      data.forEach((d, i) => {
        const heightRatio = d.value / maxValue;
        const nextRatio = i < n - 1 ? data[i + 1].value / maxValue : heightRatio * 0.8;
        const leftHeight = innerHeight * heightRatio;
        const rightHeight = innerHeight * nextRatio;
        const leftY = (innerHeight - leftHeight) / 2;
        const rightY = (innerHeight - rightHeight) / 2;
        const xPos = i * segmentWidth;
        const color = d.color ?? colors[i % colors.length];

        const points = [
          [xPos + gap, leftY],
          [xPos + segmentWidth - gap, rightY],
          [xPos + segmentWidth - gap, rightY + rightHeight],
          [xPos + gap, leftY + leftHeight],
        ];

        const polygon = g
          .append('polygon')
          .attr('data-part', 'segment')
          .attr('data-state', 'idle')
          .attr('data-position', i === 0 ? 'first' : i === n - 1 ? 'last' : 'middle')
          .attr('points', points.map((p) => p.join(',')).join(' '))
          .attr('fill', color);

        if (chartPersonality.animate) {
          polygon
            .attr('opacity', 0)
            .transition()
            .duration(chartPersonality.animationDuration)
            .delay(i * 100)
            .attr('opacity', 1);
        }

        if (chartPersonality.tooltip) {
          polygon.append('title').text(`${d.label}: ${d.value}`);
        }

        g.append('text')
          .attr('data-part', 'segment-label')
          .attr('x', xPos + segmentWidth / 2)
          .attr('y', innerHeight / 2)
          .attr('text-anchor', 'middle')
          .style('fill', 'var(--ds-color-text-on-primary)')
          .style('font-size', '12px')
          .style('font-weight', '600')
          .style('pointer-events', 'none')
          .text(d.label);
      });
    }
  }, [data, chartWidth, chartHeight, orientation, showPercentage, showConversion, chartPersonality, colors, margin]);

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={height}
      className={['ds-chart-funnel', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Funnel chart'}
      ariaDescription={describeChart('Funnel chart', data.length, subtitle, orientation === 'horizontal' ? 'Horizontal orientation.' : 'Vertical orientation.')}
      summary={summary}
      legend={legendNode}
    />
  );
});
