'use client';

/**
 * @fileoverview GaugeChart -- D3-backed gauge/dial chart using `d3.arc()` for
 * segmented arcs and an animated needle that points to the current value.
 * Supports configurable value ranges, threshold segments with semantic colors,
 * custom arc angles, inner radius, and a center value display.
 *
 * @example
 * <GaugeChart
 *   value={72}
 *   title="System Health"
 *   label="Score"
 *   segments={[
 *     { from: 0, to: 33, color: 'var(--ds-color-error)', label: 'Poor' },
 *     { from: 33, to: 66, color: 'var(--ds-color-warning)', label: 'Fair' },
 *     { from: 66, to: 100, color: 'var(--ds-color-success)', label: 'Good' },
 *   ]}
 *   height={300}
 * />
 */

import { memo, useEffect, useRef, useMemo } from 'react';
import { arc, interpolate, select } from 'd3';

import type { ChartBaseProps } from '../Charts.types';
import { useChartDimensions, useChartPersonality, useChartCompact } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

/** A single threshold segment rendered as a colored arc band on the gauge. */
export interface GaugeSegment {
  /** Start value of this segment */
  from: number;
  /** End value of this segment */
  to: number;
  /** Fill color for this arc segment */
  color: string;
  /** Optional label for this segment (used in legend and ARIA summary) */
  label?: string;
}

/** Props for the {@link GaugeChart} component. */
export interface GaugeChartProps extends ChartBaseProps {
  /** Current value (positioned between min and max) */
  value: number;
  /** Minimum value. Default: 0 */
  min?: number;
  /** Maximum value. Default: 100 */
  max?: number;
  /** Threshold segments with colors. Defaults to red/yellow/green thirds. */
  segments?: GaugeSegment[];
  /** Show value text in center. Default: true */
  showValue?: boolean;
  /** Value format function */
  formatValue?: (value: number) => string;
  /** Label below the value */
  label?: string;
  /** Arc start angle in degrees. Default: -120 */
  startAngle?: number;
  /** Arc end angle in degrees. Default: 120 */
  endAngle?: number;
  /** Inner radius ratio (0-1). Default: 0.7 */
  innerRadius?: number;
  /** Show needle indicator. Default: true */
  showNeedle?: boolean;
  /** Needle color. Default: var(--ds-color-text-primary) */
  needleColor?: string;
}

/** Converts degrees to radians for D3 arc generators. */
function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Default segment configuration: red (0-33), yellow (34-66), green (67-100). */
const DEFAULT_SEGMENTS: Array<Omit<GaugeSegment, 'color'>> = [
  { from: 0, to: 33, label: 'Low' },
  { from: 33, to: 66, label: 'Medium' },
  { from: 66, to: 100, label: 'High' },
];

const DEFAULT_SEGMENT_TONES = ['error', 'warning', 'success'] as const;
const DEFAULT_SEGMENT_COLORS = [
  'var(--ds-color-error)',
  'var(--ds-color-warning)',
  'var(--ds-color-success)',
] as const;

function segmentTone(usesDefaultSegments: boolean, index: number): 'custom' | (typeof DEFAULT_SEGMENT_TONES)[number] {
  if (!usesDefaultSegments) return 'custom';
  return DEFAULT_SEGMENT_TONES[index % DEFAULT_SEGMENT_TONES.length] ?? 'error';
}

/**
 * Renders a gauge/dial chart with a segmented arc background and an animated
 * needle indicator pointing to the current value.
 *
 * The gauge arc spans from `startAngle` to `endAngle` (in degrees), with the
 * value mapped linearly across that range. Each segment is rendered as a
 * separate arc band with its own fill color. An optional needle rotates to
 * the current value position, and a center label displays the formatted value.
 *
 * @param props - See {@link GaugeChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary and legend.
 */
export const GaugeChart = memo(function GaugeChart({
  value,
  min = 0,
  max = 100,
  segments: providedSegments,
  showValue = true,
  formatValue,
  label,
  startAngle = -120,
  endAngle = 120,
  innerRadius = 0.7,
  showNeedle = true,
  needleColor = 'var(--ds-color-text-primary)',
  width,
  height = 300,
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
  autoCompact,
  compactBreakpoint,
}: GaugeChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const compactState = useChartCompact({ compact, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 400;
  const chartHeight = compactState.isCompact ? Math.max(height, compactState.minHeight) : height;
  // Only the private defaults move their SVG fill to the finite skin. Every
  // caller-owned array keeps the original fill contract, including an
  // explicitly empty color string.
  const usesDefaultSegments = providedSegments === undefined;
  const segments: ReadonlyArray<Omit<GaugeSegment, 'color'> & { color?: string }> =
    providedSegments ?? DEFAULT_SEGMENTS;

  // Clamp value to [min, max] range
  const clampedValue = Math.max(min, Math.min(max, value));

  // Build the display string
  const displayValue = useMemo(() => {
    if (formatValue) return formatValue(clampedValue);
    return String(clampedValue);
  }, [clampedValue, formatValue]);

  // Find the active segment for the current value (used in ARIA description)
  const activeSegment = useMemo(() => {
    return segments.find((seg) => clampedValue >= seg.from && clampedValue <= seg.to);
  }, [clampedValue, segments]);

  // Accessible summary table
  const summary = useMemo(() => ({
    caption: title ? `${title} data summary` : 'Gauge chart data summary',
    headers: ['Metric', 'Value'],
    rows: [
      ['Current value', displayValue],
      ['Range', `${min} - ${max}`],
      ...(activeSegment?.label ? [['Status', activeSegment.label] as [string, string]] : []),
      ...segments.map((seg) => [
        seg.label ?? `${seg.from}-${seg.to}`,
        `${seg.from} to ${seg.to}`,
      ] as [string, string]),
    ],
  }), [title, displayValue, min, max, activeSegment, segments]);

  // Legend node
  const legendNode = legend ? (
    <div data-part="legend" data-variant="gauge" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {segments.map((seg, index) => (
        <div key={`${seg.from}-${seg.to}`} data-part="legend-item" data-state={seg === activeSegment ? 'active' : 'inactive'} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span
            data-part="legend-swatch"
            data-color-source={usesDefaultSegments ? 'default' : 'custom'}
            data-tone={segmentTone(usesDefaultSegments, index)}
            style={{
              width: 12,
              height: 12,
              backgroundColor: usesDefaultSegments ? DEFAULT_SEGMENT_COLORS[index] : seg.color,
              display: 'inline-block',
            }}
          />
          <span data-part="legend-label">{seg.label ?? `${seg.from}-${seg.to}`}</span>
        </div>
      ))}
    </div>
  ) : null;

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    // Compute radii from the available space. 20px padding prevents clipping.
    const radius = Math.min(chartWidth, chartHeight) / 2 - 20;
    const inner = radius * innerRadius;

    // Convert degree angles to radians for D3 arc generators.
    const startRad = degreesToRadians(startAngle);
    const endRad = degreesToRadians(endAngle);
    const totalAngle = endRad - startRad;

    // The gauge center is offset downward slightly when the arc is less than
    // a full circle, so the visual weight feels balanced.
    const centerY = chartHeight / 2 + (startAngle < 0 && endAngle > 0 ? radius * 0.1 : 0);

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('data-part', 'plot-area')
      .attr('data-variant', 'gauge')
      .attr('transform', `translate(${chartWidth / 2},${centerY})`);

    // Background track: a single muted arc spanning the full gauge range.
    const backgroundArc = arc()
      .innerRadius(inner)
      .outerRadius(radius)
      .startAngle(startRad)
      .endAngle(endRad)
      .cornerRadius(2);

    g.append('path')
      .attr('data-part', 'track')
      .attr('d', backgroundArc({} as any) as string)
      .attr('opacity', 0.4);

    // Render each segment as a separate arc band.
    const range = max - min;
    segments.forEach((seg, index) => {
      const segStartFraction = Math.max(0, (seg.from - min) / range);
      const segEndFraction = Math.min(1, (seg.to - min) / range);
      const segStartAngle = startRad + totalAngle * segStartFraction;
      const segEndAngle = startRad + totalAngle * segEndFraction;

      const segmentArc = arc()
        .innerRadius(inner)
        .outerRadius(radius)
        .startAngle(segStartAngle)
        .endAngle(segEndAngle)
        .cornerRadius(1);

      const segPath = g.append('path')
        .attr('data-part', 'segment')
        .attr('data-state', seg === activeSegment ? 'active' : 'inactive')
        .attr('data-color-source', usesDefaultSegments ? 'default' : 'custom')
        .attr('data-tone', segmentTone(usesDefaultSegments, index))
        .attr('fill', usesDefaultSegments ? null : (seg.color ?? null))
        .attr('opacity', 0.85);

      if (chartPersonality.animate) {
        segPath
          .attr('d', arc()
            .innerRadius(inner)
            .outerRadius(radius)
            .startAngle(segStartAngle)
            .endAngle(segStartAngle)
            .cornerRadius(1)({} as any) as string)
          .transition()
          .duration(chartPersonality.animationDuration * 0.6)
          .attrTween('d', () => {
            const interp = interpolate(segStartAngle, segEndAngle);
            return (t: number) => {
              return arc()
                .innerRadius(inner)
                .outerRadius(radius)
                .startAngle(segStartAngle)
                .endAngle(interp(t))
                .cornerRadius(1)({} as any) as string;
            };
          });
      } else {
        segPath.attr('d', segmentArc({} as any) as string);
      }

      // Tooltip for each segment
      if (chartPersonality.tooltip && seg.label) {
        segPath.append('title').text(
          compactState.compactTooltip
            ? `${seg.from}-${seg.to}`
            : `${seg.label}: ${seg.from} to ${seg.to}`
        );
      }
    });

    // Needle indicator: a thin triangle pointing from the center outward.
    if (showNeedle) {
      const valueFraction = range === 0 ? 0 : (clampedValue - min) / range;
      const needleAngle = startRad + totalAngle * valueFraction;
      const needleLength = radius * 0.88;
      const needleBaseWidth = 4;

      const needleGroup = g.append('g').attr('data-part', 'needle');

      // Needle triangle path: base at center, tip at the needle length.
      const needlePath = [
        `M ${-needleBaseWidth} 0`,
        `L 0 ${-needleLength}`,
        `L ${needleBaseWidth} 0`,
        'Z',
      ].join(' ');

      const needle = needleGroup
        .append('path')
        .attr('data-part', 'needle-mark')
        .attr('d', needlePath)
        .attr('fill', needleColor)
        .attr('stroke', needleColor)
        .attr('stroke-width', 0.5);

      // Center cap circle
      needleGroup
        .append('circle')
        .attr('data-part', 'needle-cap')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', needleBaseWidth + 2)
        .attr('fill', needleColor);

      if (chartPersonality.animate) {
        // Animate needle from the start angle to the target angle.
        // D3 rotation uses degrees, so convert radians back.
        const startDeg = (startRad * 180) / Math.PI;
        const targetDeg = (needleAngle * 180) / Math.PI;

        needleGroup
          .attr('transform', `rotate(${startDeg})`)
          .transition()
          .duration(chartPersonality.animationDuration)
          .delay(chartPersonality.animationDuration * 0.3)
          .attrTween('transform', () => {
            const interp = interpolate(startDeg, targetDeg);
            return (t: number) => `rotate(${interp(t)})`;
          });
      } else {
        const targetDeg = (needleAngle * 180) / Math.PI;
        needleGroup.attr('transform', `rotate(${targetDeg})`);
      }
    }

    // Center value text
    if (showValue) {
      const valueText = g.append('text')
        .attr('data-part', 'value-label')
        .attr('x', 0)
        .attr('y', 8)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', `${Math.max(16, radius * 0.22)}px`)
        .style('font-weight', '600')
        .text(displayValue);

      if (chartPersonality.animate) {
        valueText
          .style('opacity', 0)
          .transition()
          .duration(chartPersonality.animationDuration * 0.4)
          .delay(chartPersonality.animationDuration * 0.6)
          .style('opacity', 1);
      }
    }

    // Label text below the value
    if (label) {
      const labelText = g.append('text')
        .attr('data-part', 'label')
        .attr('x', 0)
        .attr('y', showValue ? 32 : 8)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', `${Math.max(11, radius * 0.11)}px`)
        .text(label);

      if (chartPersonality.animate) {
        labelText
          .style('opacity', 0)
          .transition()
          .duration(chartPersonality.animationDuration * 0.4)
          .delay(chartPersonality.animationDuration * 0.7)
          .style('opacity', 1);
      }
    }
  }, [
    chartWidth, chartHeight, clampedValue, min, max, segments, showValue,
    displayValue, label, startAngle, endAngle, innerRadius, showNeedle,
    needleColor, chartPersonality, compactState.compactTooltip, usesDefaultSegments,
  ]);

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={height}
      className={['ds-chart-gauge', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? `Gauge chart showing ${displayValue}`}
      ariaDescription={describeChart(
        'Gauge chart',
        segments.length,
        subtitle,
        `Current value: ${displayValue}${activeSegment?.label ? ` (${activeSegment.label})` : ''}. Range: ${min} to ${max}.`,
      )}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
    />
  );
});
