'use client';

/**
 * @fileoverview RadarChart -- D3-backed multi-series radar (spider) chart. Axes are evenly
 * distributed around a circle using trigonometric positioning (cos/sin), with a -PI/2 offset
 * so the first axis points to 12-o'clock. Concentric grid polygons are drawn at equal
 * `scaleLinear` intervals. Each data series becomes a filled polygon whose vertices are
 * projected along the axis lines at distances proportional to their values.
 *
 * @example
 * <RadarChart
 *   data={[
 *     { axis: 'Speed', value: 8 },
 *     { axis: 'Power', value: 6 },
 *     { axis: 'Range', value: 9 },
 *     { axis: 'Armor', value: 4 },
 *   ]}
 *   levels={4}
 *   maxValue={10}
 *   height={400}
 *   title="Vehicle Stats"
 * />
 */

import { memo, useEffect, useRef } from 'react';
import { max, scaleLinear, select } from 'd3';

import type { ChartBaseProps } from '../Charts.types';
import { useChartDimensions, useChartPersonality } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

/** Props for the {@link RadarChart} component. */
export interface RadarChartProps extends ChartBaseProps {
  data: { axis: string; value: number }[];
  series?: { name: string; data: { axis: string; value: number }[]; color?: string }[];
  maxValue?: number;
  levels?: number;
  showLabels?: boolean;
}

/**
 * Renders a multi-series radar/spider chart with concentric grid levels and axis labels.
 *
 * @param props - See {@link RadarChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table and optional legend.
 */
export const RadarChart = memo(function RadarChart({
  data,
  series,
  maxValue: maxValueProp,
  levels = 5,
  showLabels = true,
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
  colors,
  colorScheme,
  tooltip,
}: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip, colorScheme });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 400;
  const chartHeight = height;
  const allSeries = series ?? [{ name: 'Data', data, color: palette[0] }];
  const summary = {
    caption: title ? `${title} data summary` : 'Radar chart data summary',
    headers: ['Series', 'Axis', 'Value'],
    rows: allSeries.flatMap((currentSeries) =>
      currentSeries.data.map((point) => [currentSeries.name, point.axis, point.value])
    ),
  };
  const legendNode = legend && allSeries.length > 1 ? (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {allSeries.map((s, i) => (
        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: s.color ?? palette[i % palette.length], display: 'inline-block' }} />
          <span style={{ color: 'var(--ds-color-text-secondary)' }}>{s.name}</span>
        </div>
      ))}
    </div>
  ) : null;

  useEffect(() => {
    if (!svgRef.current) return;

    const allSeries = series ?? [{ name: 'Data', data, color: palette[0] }];
    if (allSeries.length === 0) return;

    const axes = allSeries[0].data.map((d) => d.axis);
    const n = axes.length;
    if (n === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = Math.min(chartWidth, chartHeight) / 2 - 40;
    const maxValue = maxValueProp ?? max(allSeries.flatMap((s) => s.data.map((d) => d.value))) ?? 1;
    // Each axis is equally spaced around the circle; the -PI/2 offset in the
    // trigonometry below rotates the first axis to 12-o'clock instead of 3-o'clock.
    const angleSlice = (2 * Math.PI) / n;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('transform', `translate(${chartWidth / 2},${chartHeight / 2})`);

    // rScale maps data values to radial pixel distance from the centre.
    // domain [0, maxValue] ensures zero is always at the centre.
    const rScale = scaleLinear().domain([0, maxValue]).range([0, radius]);

    // Grid levels: concentric polygons (not circles) to visually align with
    // the axis lines and reinforce the polygon aesthetic of radar charts.
    for (let level = 1; level <= levels; level++) {
      const r = (radius / levels) * level;
      const points = axes.map((_, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        return [r * Math.cos(angle), r * Math.sin(angle)] as [number, number];
      });

      g.append('polygon')
        .attr('points', points.map((p) => p.join(',')).join(' '))
        .attr('fill', 'none')
        .attr('stroke', 'var(--ds-color-border-secondary)')
        .attr('stroke-opacity', 0.5);
    }

    // Axis lines
    axes.forEach((_, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', radius * Math.cos(angle))
        .attr('y2', radius * Math.sin(angle))
        .attr('stroke', 'var(--ds-color-border-secondary)')
        .attr('stroke-opacity', 0.5);
    });

    // Axis labels
    if (showLabels) {
      axes.forEach((axis, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const labelR = radius + 18;
        g.append('text')
          .attr('x', labelR * Math.cos(angle))
          .attr('y', labelR * Math.sin(angle))
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('fill', 'var(--ds-color-text-secondary)')
          .style('font-size', '11px')
          .text(axis);
      });
    }

    // Data polygons: each series is a single filled polygon. The 20% fill
    // opacity lets overlapping series remain visible behind each other.
    allSeries.forEach((s, si) => {
      const color = s.color ?? palette[si % palette.length];
      const points = s.data.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = rScale(d.value);
        return [r * Math.cos(angle), r * Math.sin(angle)] as [number, number];
      });

      const polygon = g
        .append('polygon')
        .attr('points', points.map((p) => p.join(',')).join(' '))
        .attr('fill', color)
        .attr('fill-opacity', 0.2)
        .attr('stroke', color)
        .attr('stroke-width', 2);

      if (chartPersonality.animate) {
        polygon
          .attr('opacity', 0)
          .transition()
          .duration(chartPersonality.animationDuration)
          .delay(si * 150)
          .attr('opacity', 1);
      }

      // Vertex dots: small circles at each polygon vertex improve readability
      // and serve as tooltip anchor points for individual axis values.
      s.data.forEach((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = rScale(d.value);
        const dot = g
          .append('circle')
          .attr('cx', r * Math.cos(angle))
          .attr('cy', r * Math.sin(angle))
          .attr('r', 3.5)
          .attr('fill', color)
          .attr('stroke', 'var(--ds-color-bg-primary)')
          .attr('stroke-width', 1.5);

        if (chartPersonality.tooltip) {
          dot.append('title').text(`${d.axis}: ${d.value}`);
        }
      });
    });
  }, [data, series, chartWidth, chartHeight, maxValueProp, levels, showLabels, chartPersonality, palette]);

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
      ariaLabel={title ?? 'Radar chart'}
      ariaDescription={describeChart('Radar chart', summary.rows.length, subtitle, showLabels ? 'Axis labels are visible.' : undefined)}
      summary={summary}
      legend={legendNode}
    />
  );
});
