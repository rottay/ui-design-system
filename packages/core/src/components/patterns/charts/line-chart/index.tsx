'use client';

import { memo, useEffect, useRef } from 'react';
import {
  area,
  axisBottom,
  axisLeft,
  curveLinear,
  curveMonotoneX,
  curveStepAfter,
  extent,
  line,
  max,
  scaleLinear,
  scalePoint,
  scaleTime,
  select,
  type ScaleLinear,
  type ScalePoint,
  type ScaleTime,
} from 'd3';

import type { ChartBaseProps, Series } from '../types';
import { DEFAULT_COLORS, DEFAULT_MARGIN } from '../types';
import { useChartDimensions, useChartPersonality } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

export interface LineChartProps extends ChartBaseProps {
  series: Series[];
  curved?: boolean;
  showDots?: boolean;
  showArea?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xType?: 'category' | 'time' | 'linear';
}

export const LineChart = memo(function LineChart({
  series,
  curved,
  showDots,
  showArea = false,
  xAxisLabel,
  yAxisLabel,
  xType = 'category',
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
  margin = DEFAULT_MARGIN,
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, curved, showDots, tooltip });
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = height;
  const pointCount = series.reduce((count, currentSeries) => count + currentSeries.data.length, 0);
  const summary = {
    caption: title ? `${title} data summary` : 'Line chart data summary',
    headers: ['Series', 'X', 'Y'],
    rows: series.flatMap((currentSeries) =>
      currentSeries.data.map((point) => [currentSeries.name, String(point.x), point.y])
    ),
  };
  const legendNode = legend ? (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {series.map((s, i) => (
        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span style={{ width: 12, height: 3, backgroundColor: s.color ?? colors[i % colors.length], display: 'inline-block', borderRadius: 1 }} />
          <span style={{ color: 'var(--ds-color-text-secondary)' }}>{s.name}</span>
        </div>
      ))}
    </div>
  ) : null;

  useEffect(() => {
    if (!svgRef.current || !series || series.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const allPoints = series.flatMap((s) => s.data);

    // X scale
    let x: ScalePoint<string> | ScaleTime<number, number> | ScaleLinear<number, number>;

    if (xType === 'time') {
      x = scaleTime()
        .domain(extent(allPoints, (d) => new Date(d.x as string | number | Date)) as [Date, Date])
        .range([0, innerWidth]);
    } else if (xType === 'linear') {
      x = scaleLinear()
        .domain(extent(allPoints, (d) => d.x as number) as [number, number])
        .range([0, innerWidth]);
    } else {
      const categories = [...new Set(allPoints.map((d) => String(d.x)))];
      x = scalePoint().domain(categories).range([0, innerWidth]);
    }

    const y = scaleLinear()
      .domain([0, max(allPoints, (d) => d.y) ?? 0])
      .nice()
      .range([innerHeight, 0]);

    // Grid
    g.append('g')
      .call(axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
      .style('stroke', 'var(--ds-color-border-secondary)')
      .style('stroke-opacity', 0.5);
    const domainEl = g.selectAll('.domain').node();
    if (domainEl) select(domainEl).remove();

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(x as any).ticks(6))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '12px');

    g.append('g')
      .call(axisLeft(y).ticks(5))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '12px');

    const getX = (d: (typeof allPoints)[0]): number => {
      if (xType === 'time') return (x as ScaleTime<number, number>)(new Date(d.x as string | number | Date));
      if (xType === 'linear') return (x as ScaleLinear<number, number>)(d.x as number);
      return (x as ScalePoint<string>)(String(d.x)) ?? 0;
    };

    const curveType =
      chartPersonality.lineMode === 'step'
        ? curveStepAfter
        : chartPersonality.curved
          ? curveMonotoneX
          : curveLinear;

    series.forEach((s, i) => {
      const color = s.color ?? colors[i % colors.length];
      const gradientId = `line-chart-area-${i}`;

      // Area
      if (showArea) {
        if (chartPersonality.useGradientFill) {
          const gradient = svg
            .append('defs')
            .append('linearGradient')
            .attr('id', gradientId)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

          gradient
            .append('stop')
            .attr('offset', '0%')
            .attr('stop-color', color)
            .attr('stop-opacity', 0.32);

          gradient
            .append('stop')
            .attr('offset', '100%')
            .attr('stop-color', color)
            .attr('stop-opacity', 0.04);
        }

        const lineArea = area<(typeof s.data)[0]>()
          .x((d) => getX(d))
          .y0(innerHeight)
          .y1((d) => y(d.y))
          .curve(curveType);

        g.append('path')
          .datum(s.data)
          .attr('fill', chartPersonality.useGradientFill ? `url(#${gradientId})` : color)
          .attr('fill-opacity', chartPersonality.useGradientFill ? 1 : 0.15)
          .attr('d', lineArea);
      }

      // Line
      const linePath = line<(typeof s.data)[0]>()
        .x((d) => getX(d))
        .y((d) => y(d.y))
        .curve(curveType);

      const path = g
        .append('path')
        .datum(s.data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', linePath);

      if (chartPersonality.animate) {
        const pathNode = path.node() as SVGPathElement | null;
        const totalLength =
          pathNode && typeof pathNode.getTotalLength === 'function'
            ? pathNode.getTotalLength()
            : 0;

        if (totalLength > 0) {
          path
            .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(chartPersonality.animationDuration)
            .attr('stroke-dashoffset', 0);
        }
      }

      // Dots
      if (chartPersonality.showDots) {
        const dots = g
          .selectAll(`.dot-${i}`)
          .data(s.data)
          .enter()
          .append('circle')
          .attr('cx', (d) => getX(d))
          .attr('cy', (d) => y(d.y))
          .attr('r', 4)
          .attr('fill', color)
          .attr('stroke', 'var(--ds-color-bg-primary)')
          .attr('stroke-width', 2);

        if (chartPersonality.tooltip) {
          dots.append('title').text((d) => `${s.name}: ${d.y}`);
        }
      }
    });

    // Axis labels
    if (xAxisLabel) {
      svg
        .append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight - 4)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--ds-color-text-secondary)')
        .style('font-size', '12px')
        .text(xAxisLabel);
    }

    if (yAxisLabel) {
      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', 14)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--ds-color-text-secondary)')
        .style('font-size', '12px')
        .text(yAxisLabel);
    }

    svg.selectAll('.domain').style('stroke', 'var(--ds-color-border-primary)');
    svg.selectAll('.tick line').style('stroke', 'var(--ds-color-border-primary)');
  }, [series, chartWidth, chartHeight, showArea, xType, chartPersonality, colors, margin, xAxisLabel, yAxisLabel]);

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
      ariaLabel={title ?? 'Line chart'}
      ariaDescription={describeChart('Line chart', pointCount, subtitle, [
        xAxisLabel ? `X axis: ${xAxisLabel}.` : null,
        yAxisLabel ? `Y axis: ${yAxisLabel}.` : null,
      ].filter(Boolean).join(' '))}
      summary={summary}
      legend={legendNode}
    />
  );
});
