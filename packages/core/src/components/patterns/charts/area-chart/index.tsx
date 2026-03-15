'use client';

import { memo, useEffect, useRef } from 'react';
import {
  area,
  axisBottom,
  axisLeft,
  curveLinear,
  curveMonotoneX,
  curveStepAfter,
  line,
  max,
  scaleLinear,
  scalePoint,
  select,
  stack,
  stackOffsetNone,
  stackOrderNone,
  sum,
} from 'd3';

import type { ChartBaseProps, Series } from '../Charts.types';
import { DEFAULT_COLORS, DEFAULT_MARGIN } from '../Charts.types';
import { useChartDimensions, useChartPersonality } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

export interface AreaChartProps extends ChartBaseProps {
  series: Series[];
  curved?: boolean;
  stacked?: boolean;
  opacity?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export const AreaChart = memo(function AreaChart({
  series,
  curved,
  stacked = false,
  opacity = 0.3,
  xAxisLabel,
  yAxisLabel,
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
}: AreaChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, curved, tooltip });
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = height;
  const pointCount = series.reduce((count, currentSeries) => count + currentSeries.data.length, 0);
  const summary = {
    caption: title ? `${title} data summary` : 'Area chart data summary',
    headers: ['Series', 'X', 'Y'],
    rows: series.flatMap((currentSeries) =>
      currentSeries.data.map((point) => [currentSeries.name, String(point.x), point.y])
    ),
  };
  const legendNode = legend ? (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {series.map((s, i) => (
        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: s.color ?? colors[i % colors.length], opacity, display: 'inline-block' }} />
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
    const categories = [...new Set(allPoints.map((d) => String(d.x)))];

    const x = scalePoint().domain(categories).range([0, innerWidth]);

    const yMax = stacked
      ? max(categories, (cat) =>
          sum(series, (s) => {
            const pt = s.data.find((d) => String(d.x) === cat);
            return pt?.y ?? 0;
          }),
        ) ?? 0
      : max(allPoints, (d) => d.y) ?? 0;

    const y = scaleLinear().domain([0, yMax]).nice().range([innerHeight, 0]);

    // Grid
    g.append('g')
      .call(axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
      .style('stroke', 'var(--ds-color-border-secondary)')
      .style('stroke-opacity', 0.5);
    const domainEl = g.selectAll('.grid .domain, g > .domain').node();
    if (domainEl) select(domainEl).remove();

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(x))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '12px');

    g.append('g')
      .call(axisLeft(y).ticks(5))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '12px');

    const curveType =
      chartPersonality.lineMode === 'step'
        ? curveStepAfter
        : chartPersonality.curved
          ? curveMonotoneX
          : curveLinear;

    if (stacked) {
      // Build stacked data
      const stackData = categories.map((cat) => {
        const row: Record<string, number | string> = { x: cat };
        series.forEach((s) => {
          const pt = s.data.find((d) => String(d.x) === cat);
          row[s.name] = pt?.y ?? 0;
        });
        return row;
      });

      const stackedSeries = stack()
        .keys(series.map((s) => s.name))
        .order(stackOrderNone)
        .offset(stackOffsetNone);

      const stacked = stackedSeries(stackData as any);

      stacked.forEach((layer, i) => {
        const color = series[i]?.color ?? colors[i % colors.length];
        const gradientId = `area-chart-stack-${i}`;

        if (chartPersonality.useGradientFill) {
          const gradient = svg
            .append('defs')
            .append('linearGradient')
            .attr('id', gradientId)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

          gradient.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.36);
          gradient.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.08);
        }

        const stackedArea = area<any>()
          .x((d) => x(String(d.data.x)) ?? 0)
          .y0((d) => y(d[0]))
          .y1((d) => y(d[1]))
          .curve(curveType);

        g.append('path')
          .datum(layer)
          .attr('fill', chartPersonality.useGradientFill ? `url(#${gradientId})` : color)
          .attr('fill-opacity', chartPersonality.useGradientFill ? 1 : opacity)
          .attr('stroke', color)
          .attr('stroke-width', 1.5)
          .attr('d', stackedArea);
      });
    } else {
      series.forEach((s, i) => {
        const color = s.color ?? colors[i % colors.length];
        const gradientId = `area-chart-series-${i}`;

        if (chartPersonality.useGradientFill) {
          const gradient = svg
            .append('defs')
            .append('linearGradient')
            .attr('id', gradientId)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

          gradient.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.36);
          gradient.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.08);
        }

        const seriesArea = area<(typeof s.data)[0]>()
          .x((d) => x(String(d.x)) ?? 0)
          .y0(innerHeight)
          .y1((d) => y(d.y))
          .curve(curveType);

        const seriesLine = line<(typeof s.data)[0]>()
          .x((d) => x(String(d.x)) ?? 0)
          .y((d) => y(d.y))
          .curve(curveType);

        g.append('path')
          .datum(s.data)
          .attr('fill', chartPersonality.useGradientFill ? `url(#${gradientId})` : color)
          .attr('fill-opacity', chartPersonality.useGradientFill ? 1 : opacity)
          .attr('d', seriesArea);

        const path = g
          .append('path')
          .datum(s.data)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .attr('d', seriesLine);

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

        if (chartPersonality.tooltip) {
          g.selectAll(`.dot-area-${i}`)
            .data(s.data)
            .enter()
            .append('circle')
            .attr('cx', (d) => x(String(d.x)) ?? 0)
            .attr('cy', (d) => y(d.y))
            .attr('r', 3)
            .attr('fill', color)
            .attr('opacity', 0)
            .append('title')
            .text((d) => `${s.name}: ${d.y}`);
        }
      });
    }

    if (xAxisLabel) {
      svg.append('text').attr('x', chartWidth / 2).attr('y', chartHeight - 4).attr('text-anchor', 'middle').style('fill', 'var(--ds-color-text-secondary)').style('font-size', '12px').text(xAxisLabel);
    }
    if (yAxisLabel) {
      svg.append('text').attr('transform', 'rotate(-90)').attr('x', -chartHeight / 2).attr('y', 14).attr('text-anchor', 'middle').style('fill', 'var(--ds-color-text-secondary)').style('font-size', '12px').text(yAxisLabel);
    }

    svg.selectAll('.domain').style('stroke', 'var(--ds-color-border-primary)');
    svg.selectAll('.tick line').style('stroke', 'var(--ds-color-border-primary)');
  }, [series, chartWidth, chartHeight, stacked, opacity, chartPersonality, colors, margin, xAxisLabel, yAxisLabel]);

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
      ariaLabel={title ?? 'Area chart'}
      ariaDescription={describeChart('Area chart', pointCount, subtitle, [
        stacked ? 'Stacked series.' : 'Independent series.',
        xAxisLabel ? `X axis: ${xAxisLabel}.` : null,
        yAxisLabel ? `Y axis: ${yAxisLabel}.` : null,
      ].filter(Boolean).join(' '))}
      summary={summary}
      legend={legendNode}
    />
  );
});
