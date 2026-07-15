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

import { memo, useEffect, useMemo, useRef } from 'react';
import { scaleLinear, select } from 'd3';

import type {
  ChartBaseProps,
  ChartColorSchemeProps,
  ChartColorsProps,
  ChartLegendProps,
} from '../Charts.types';
import { useChartDimensions, useChartPersonality } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

/** Props for the {@link RadarChart} component. */
export interface RadarChartProps
  extends ChartBaseProps, ChartLegendProps, ChartColorsProps, ChartColorSchemeProps {
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
  const allSeries = useMemo(
    () => series ?? [{ name: 'Data', data, color: palette[0] }],
    [data, palette, series],
  );
  const referenceAxes = useMemo(
    () => allSeries.at(0)?.data.map((point) => point.axis) ?? [],
    [allSeries],
  );
  const allValues = useMemo(
    () => allSeries.flatMap((currentSeries) =>
      currentSeries.data.map((point) => point.value),
    ),
    [allSeries],
  );
  const hasInvalidValue = allValues.some((value) => !Number.isFinite(value));
  const hasNegativeValue = allValues.some((value) => value < 0);
  const hasAlignedAxes = allSeries.every((currentSeries) =>
    currentSeries.data.length === referenceAxes.length &&
    currentSeries.data.every((point, index) => point.axis === referenceAxes.at(index)),
  );
  const fallbackMessage = allSeries.length === 0 || referenceAxes.length === 0
    ? 'No data to display.'
    : referenceAxes.length < 3
      ? 'Radar charts require at least three axes.'
      : hasInvalidValue
        ? 'Radar charts require finite values.'
        : hasNegativeValue
          ? 'Radar charts cannot represent negative values.'
          : !hasAlignedAxes
            ? 'Radar chart series must use the same axes.'
            : null;
  const canRender = fallbackMessage === null;
  const observedMax = canRender
    ? allValues.reduce((currentMax, value) => Math.max(currentMax, value), 0)
    : 0;
  const requestedMax = Number.isFinite(maxValueProp) && (maxValueProp ?? 0) > 0
    ? maxValueProp ?? 1
    : 1;
  const domainMax = Math.max(1, observedMax, requestedMax);
  const safeLevels = Number.isFinite(levels) ? Math.max(1, Math.floor(levels)) : 5;
  const summary = {
    caption: title ? `${title} data summary` : 'Radar chart data summary',
    headers: ['Series', 'Axis', 'Value'],
    rows: allSeries.flatMap((currentSeries) =>
      currentSeries.data.map((point) => [
        currentSeries.name,
        point.axis,
        Number.isFinite(point.value) ? point.value : 'Invalid',
      ])
    ),
  };
  const legendNode = legend && canRender && allSeries.length > 1 ? (
    <div data-part="legend" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {allSeries.map((s, i) => (
        <div key={s.name} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span data-part="legend-swatch" style={{ width: 12, height: 12, backgroundColor: s.color ?? palette[i % palette.length], display: 'inline-block' }} />
          <span data-part="legend-label">{s.name}</span>
        </div>
      ))}
    </div>
  ) : null;

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').interrupt();
    svg.selectAll('*').remove();
    svg.attr('width', chartWidth).attr('height', chartHeight);

    if (!canRender) {
      return () => {
        svg.selectAll('*').interrupt();
      };
    }

    const axes = referenceAxes;
    const n = axes.length;
    const radius = Math.max(1, Math.min(chartWidth, chartHeight) / 2 - 40);
    // Each axis is equally spaced around the circle; the -PI/2 offset in the
    // trigonometry below rotates the first axis to 12-o'clock instead of 3-o'clock.
    const angleSlice = (2 * Math.PI) / n;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('data-part', 'plot-area')
      .attr('transform', `translate(${chartWidth / 2},${chartHeight / 2})`);

    // rScale maps data values to radial pixel distance from the centre.
    // domain [0, maxValue] ensures zero is always at the centre.
    const rScale = scaleLinear().domain([0, domainMax]).range([0, radius]).clamp(true);

    // Grid levels: concentric polygons (not circles) to visually align with
    // the axis lines and reinforce the polygon aesthetic of radar charts.
    for (let level = 1; level <= safeLevels; level++) {
      const r = (radius / safeLevels) * level;
      const points = axes.map((_, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        return [r * Math.cos(angle), r * Math.sin(angle)] as [number, number];
      });

      g.append('polygon')
        .attr('data-part', 'grid-level')
        .attr('points', points.map((p) => p.join(',')).join(' '))
        .attr('fill', 'none')
        .attr('stroke-opacity', 0.5);
    }

    // Axis lines
    axes.forEach((_, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      g.append('line')
        .attr('data-part', 'axis-line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', radius * Math.cos(angle))
        .attr('y2', radius * Math.sin(angle))
        .attr('stroke-opacity', 0.5);
    });

    // Axis labels
    if (showLabels) {
      axes.forEach((axis, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const labelR = radius + 18;
        g.append('text')
          .attr('data-part', 'axis-label')
          .attr('x', labelR * Math.cos(angle))
          .attr('y', labelR * Math.sin(angle))
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '11px')
          .text(axis);
      });
    }

    // Data polygons: each series is a single filled polygon. The 20% fill
    // opacity lets overlapping series remain visible behind each other.
    allSeries.forEach((s, si) => {
      const color = s.color ?? palette[si % palette.length];
      const isZeroSeries = s.data.every((point) => point.value === 0);
      const points = s.data.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = rScale(d.value);
        return [r * Math.cos(angle), r * Math.sin(angle)] as [number, number];
      });

      const polygon = g
        .append('polygon')
        .attr('data-part', 'series-area')
        .attr('data-state', isZeroSeries ? 'zero-baseline' : 'value')
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

      // Keep zero data at the truthful origin. A dedicated centre marker makes
      // the state visible without projecting zero values to a fake magnitude.
      if (isZeroSeries) {
        g.append('circle')
          .attr('data-part', 'zero-baseline')
          .attr('data-series', s.name)
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', 6)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 2);
      }

      // Vertex dots: small circles at each polygon vertex improve readability
      // and serve as tooltip anchor points for individual axis values.
      s.data.forEach((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = rScale(d.value);
        const dot = g
          .append('circle')
          .attr('data-part', 'series-point')
          .attr('cx', r * Math.cos(angle))
          .attr('cy', r * Math.sin(angle))
          .attr('r', 3.5)
          .attr('fill', color)
          .attr('stroke-width', 1.5);

        if (chartPersonality.tooltip) {
          dot.append('title').text(`${d.axis}: ${d.value}`);
        }
      });
    });

    return () => {
      svg.selectAll('*').interrupt();
    };
  }, [allSeries, chartWidth, chartHeight, showLabels, chartPersonality, palette, canRender, referenceAxes, domainMax, safeLevels]);

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={height}
      className={['ds-chart-radar', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Radar chart'}
      ariaDescription={describeChart(
        'Radar chart',
        summary.rows.length,
        subtitle,
        [showLabels ? 'Axis labels are visible.' : null, fallbackMessage].filter(Boolean).join(' ') || undefined,
      )}
      summary={summary}
      legend={legendNode}
      overlay={fallbackMessage ? (
        <div
          data-part="data-fallback"
          role="status"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {fallbackMessage}
        </div>
      ) : null}
    />
  );
});
