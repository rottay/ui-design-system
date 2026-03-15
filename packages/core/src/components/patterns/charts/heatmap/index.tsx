'use client';

import { memo, useEffect, useRef } from 'react';
import { axisBottom, axisLeft, extent, interpolateRgb, scaleBand, scaleSequential, select } from 'd3';

import type { ChartBaseProps } from '../Charts.types';
import { DEFAULT_MARGIN } from '../Charts.types';
import { useChartDimensions, useChartPersonality } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

export interface HeatMapProps extends ChartBaseProps {
  data: { x: string; y: string; value: number }[];
  xLabels?: string[];
  yLabels?: string[];
  colorRange?: [string, string];
  cellRadius?: number;
}

export const HeatMap = memo(function HeatMap({
  data,
  xLabels: xLabelsProp,
  yLabels: yLabelsProp,
  colorRange = ['var(--ds-color-info-bg)', 'var(--ds-color-primary-500)'],
  cellRadius = 2,
  width,
  height = 400,
  className,
  style,
  loading = false,
  title,
  subtitle,
  legend = false,
  animate = true,
  responsive = true,
  tooltip = true,
  margin = { top: 20, right: 20, bottom: 60, left: 80 },
}: HeatMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = height;
  const summary = {
    caption: title ? `${title} data summary` : 'Heatmap data summary',
    headers: ['X', 'Y', 'Value'],
    rows: data.map((item) => [item.x, item.y, item.value]),
  };

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const xLabels = xLabelsProp ?? [...new Set(data.map((d) => d.x))];
    const yLabels = yLabelsProp ?? [...new Set(data.map((d) => d.y))];

    const x = scaleBand().domain(xLabels).range([0, innerWidth]).padding(0.05);
    const y = scaleBand().domain(yLabels).range([0, innerHeight]).padding(0.05);

    const [minVal, maxVal] = extent(data, (d) => d.value) as [number, number];
    const colorScale = scaleSequential().domain([minVal, maxVal]).interpolator(interpolateRgb(colorRange[0], colorRange[1]));

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(x))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '11px')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end');

    // Y axis
    g.append('g')
      .call(axisLeft(y))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '11px');

    const cells = g
      .selectAll('.cell')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', (d) => x(d.x) ?? 0)
      .attr('y', (d) => y(d.y) ?? 0)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('rx', cellRadius)
      .attr('fill', (d) => colorScale(d.value));

    if (chartPersonality.animate) {
      cells
        .attr('opacity', 0)
        .transition()
        .duration(chartPersonality.animationDuration)
        .delay((_, i) => i * 10)
        .attr('opacity', 1);
    }

    if (chartPersonality.tooltip) {
      cells.append('title').text((d) => `${d.x}, ${d.y}: ${d.value}`);
    }

    svg.selectAll('.domain').style('stroke', 'var(--ds-color-border-primary)');
    svg.selectAll('.tick line').style('stroke', 'var(--ds-color-border-primary)');
  }, [
    data,
    chartWidth,
    chartHeight,
    xLabelsProp,
    yLabelsProp,
    colorRange,
    cellRadius,
    chartPersonality.animate,
    chartPersonality.animationDuration,
    chartPersonality.tooltip,
    margin,
  ]);

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
      ariaLabel={title ?? 'Heatmap'}
      ariaDescription={describeChart('Heatmap', data.length, subtitle)}
      summary={summary}
    />
  );
});
