'use client';

/**
 * @fileoverview BulletChart -- D3-backed bullet chart for KPI target vs actual
 * visualization. Based on Stephen Few's bullet graph specification: each item
 * renders background range bands (poor/satisfactory/good), a narrow value bar
 * overlaid on the ranges, and a vertical target marker. Supports single or
 * multiple stacked items, horizontal/vertical orientation, and slide-in
 * animation on mount.
 *
 * @example
 * <BulletChart
 *   data={[
 *     { label: 'Revenue', value: 275, target: 250, ranges: [150, 200, 300] },
 *     { label: 'Profit',  value: 22,  target: 25,  ranges: [10, 18, 30] },
 *     { label: 'Orders',  value: 140, target: 160, ranges: [80, 120, 200] },
 *   ]}
 *   title="Q2 KPI Dashboard"
 *   showLabels
 *   height={200}
 * />
 */

import { memo, useEffect, useRef, useMemo } from 'react';
import { scaleLinear, select } from 'd3';

import type { ChartBaseProps } from '../Charts.types';
import { useChartDimensions, useChartPersonality, useChartCompact } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

/** A single KPI data point rendered as one bullet item. */
export interface BulletDataPoint {
  /** KPI label displayed on the left side */
  label: string;
  /** Actual value */
  value: number;
  /** Target/goal value */
  target: number;
  /** Range bands [poor, satisfactory, good] -- upper bounds for each band */
  ranges?: [number, number, number];
  /** Max scale value. Default: auto from ranges/target */
  max?: number;
}

/** Props for the {@link BulletChart} component. */
export interface BulletChartProps extends ChartBaseProps {
  /** Single or multiple bullet items */
  data: BulletDataPoint | BulletDataPoint[];
  /** Orientation. Default: 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** Bar height per bullet (horizontal). Default: 28 */
  barHeight?: number;
  /** Gap between bullets. Default: 16 */
  gap?: number;
  /** Show value labels. Default: true */
  showLabels?: boolean;
  /** Format values */
  formatValue?: (value: number) => string;
  /** Range colors [poor, satisfactory, good]. Default: decreasing opacity of --ds-color-primary */
  rangeColors?: [string, string, string];
  /** Value bar color. Default: var(--ds-color-text-primary) */
  valueColor?: string;
  /** Target marker color. Default: var(--ds-color-error) */
  targetColor?: string;
}

/** Label column width in pixels for horizontal orientation. */
const LABEL_WIDTH = 100;

/** Right margin for value text in horizontal orientation. */
const VALUE_TEXT_MARGIN = 60;

/**
 * Resolves the maximum scale value for a bullet item. Falls back to the
 * largest of (highest range band, target, value) * 1.1 for visual headroom.
 */
function resolveMax(item: BulletDataPoint): number {
  if (item.max != null) return item.max;
  const rangeMax = item.ranges ? item.ranges[2] : 0;
  return Math.max(rangeMax, item.target, item.value) * 1.1;
}

/**
 * Resolves range bands for a bullet item. If ranges are not provided, derives
 * them from the target value: [50%, 75%, max].
 */
function resolveRanges(item: BulletDataPoint): [number, number, number] {
  if (item.ranges) return item.ranges;
  const maxVal = resolveMax(item);
  return [item.target * 0.5, item.target * 0.75, maxVal];
}

/**
 * Renders a bullet chart powered by D3's `scaleLinear`. Each KPI is rendered
 * as a horizontal bar with three background range bands, a narrow value bar,
 * and a vertical target marker. Multiple items are stacked vertically with
 * labels on the left.
 *
 * @param props - See {@link BulletChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table and optional legend.
 */
export const BulletChart = memo(function BulletChart({
  data,
  orientation = 'horizontal',
  barHeight = 28,
  gap = 16,
  showLabels = true,
  formatValue,
  rangeColors,
  valueColor = 'var(--ds-color-text-primary)',
  targetColor = 'var(--ds-color-error)',
  width,
  height: heightProp,
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
}: BulletChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Normalise single item to array
  const items: BulletDataPoint[] = useMemo(
    () => (Array.isArray(data) ? data : [data]),
    [data],
  );

  // Compute default height from item count if not provided
  const defaultHeight = useMemo(() => {
    const totalItems = items.length;
    const topPadding = 12;
    const bottomPadding = 12;
    return topPadding + totalItems * barHeight + (totalItems - 1) * gap + bottomPadding;
  }, [items.length, barHeight, gap]);

  const height = heightProp ?? defaultHeight;

  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const compactState = useChartCompact({ compact, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = compactState.isCompact ? Math.max(height, compactState.minHeight) : height;

  const formatVal = formatValue ?? ((v: number) => String(v));

  // Default range colors: decreasing opacity of primary
  const resolvedRangeColors: [string, string, string] = rangeColors ?? [
    'var(--ds-color-primary-200)',
    'var(--ds-color-primary-100)',
    'var(--ds-color-primary-50)',
  ];

  // Accessible summary table
  const summary = useMemo(() => ({
    caption: title ? `${title} data summary` : 'Bullet chart data summary',
    headers: ['KPI', 'Actual', 'Target', 'Status'],
    rows: items.map((item) => [
      item.label,
      formatVal(item.value),
      formatVal(item.target),
      item.value >= item.target ? 'Met' : 'Below target',
    ]),
  }), [title, items, formatVal]);

  // Legend node
  const legendNode = legend ? (
    <div data-part="legend" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {[
        { label: 'Poor', color: resolvedRangeColors[0] },
        { label: 'Satisfactory', color: resolvedRangeColors[1] },
        { label: 'Good', color: resolvedRangeColors[2] },
        { label: 'Actual', color: valueColor },
        { label: 'Target', color: targetColor },
      ].map((item) => (
        <div key={item.label} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span data-part="legend-swatch" data-variant={item.label === 'Target' ? 'target' : 'range'} style={{
            width: item.label === 'Target' ? 2 : 12,
            height: 12,
            backgroundColor: item.color,
            display: 'inline-block',
          }} />
          <span data-part="legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  ) : null;

  useEffect(() => {
    if (!svgRef.current || items.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', chartWidth)
      .attr('height', chartHeight);

    if (orientation === 'horizontal') {
      // ── Horizontal orientation ──────────────────────────────────────
      const labelW = showLabels ? LABEL_WIDTH : 0;
      const valueW = showLabels ? VALUE_TEXT_MARGIN : 0;
      const barAreaWidth = chartWidth - labelW - valueW;

      items.forEach((item, i) => {
        const maxVal = resolveMax(item);
        const ranges = resolveRanges(item);
        const yOffset = 12 + i * (barHeight + gap);

        const x = scaleLinear().domain([0, maxVal]).range([0, barAreaWidth]).clamp(true);

        const g = svg.append('g')
          .attr('data-part', 'item')
          .attr('data-orientation', 'horizontal')
          .attr('transform', `translate(${labelW},${yOffset})`);

        // ── Range bands (drawn from widest to narrowest = good, satisfactory, poor) ──
        const rangeBands = [
          { upper: ranges[2], color: resolvedRangeColors[2] },
          { upper: ranges[1], color: resolvedRangeColors[1] },
          { upper: ranges[0], color: resolvedRangeColors[0] },
        ];

        rangeBands.forEach((band, bandIndex) => {
          const rect = g.append('rect')
            .attr('data-part', 'range-band')
            .attr('x', 0)
            .attr('y', 0)
            .attr('height', barHeight)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('fill', band.color);

          if (chartPersonality.animate) {
            rect
              .attr('width', 0)
              .transition()
              .duration(chartPersonality.animationDuration * 0.5)
              .delay(i * 80 + bandIndex * 30)
              .attr('width', x(band.upper));
          } else {
            rect.attr('width', x(band.upper));
          }
        });

        // ── Value bar (narrow bar, 40% of barHeight, centered) ──
        const valueBarHeight = barHeight * 0.4;
        const valueBarY = (barHeight - valueBarHeight) / 2;

        const valueRect = g.append('rect')
          .attr('data-part', 'value-bar')
          .attr('x', 0)
          .attr('y', valueBarY)
          .attr('height', valueBarHeight)
          .attr('rx', 1)
          .attr('ry', 1)
          .attr('fill', valueColor);

        if (chartPersonality.animate) {
          valueRect
            .attr('width', 0)
            .transition()
            .duration(chartPersonality.animationDuration * 0.7)
            .delay(i * 80 + 100)
            .attr('width', x(item.value));
        } else {
          valueRect.attr('width', x(item.value));
        }

        // ── Target marker (vertical line) ──
        const targetX = x(item.target);
        const markerHeight = barHeight * 0.7;
        const markerY = (barHeight - markerHeight) / 2;

        const targetLine = g.append('rect')
          .attr('data-part', 'target-marker')
          .attr('x', targetX - 1.5)
          .attr('y', markerY)
          .attr('width', 3)
          .attr('height', markerHeight)
          .attr('rx', 1)
          .attr('fill', targetColor);

        if (chartPersonality.animate) {
          targetLine
            .attr('opacity', 0)
            .transition()
            .duration(chartPersonality.animationDuration * 0.3)
            .delay(i * 80 + chartPersonality.animationDuration * 0.5)
            .attr('opacity', 1);
        }

        // ── Tooltip on value bar ──
        if (chartPersonality.tooltip) {
          valueRect.append('title').text(
            compactState.compactTooltip
              ? formatVal(item.value)
              : `${item.label}: ${formatVal(item.value)} / ${formatVal(item.target)} target`,
          );
        }

        // ── Label on left ──
        if (showLabels) {
          const labelText = svg.append('text')
            .attr('data-part', 'item-label')
            .attr('x', labelW - 8)
            .attr('y', yOffset + barHeight / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .style('font-size', '12px')
            .style('font-weight', '500')
            .text(item.label);

          if (chartPersonality.animate) {
            labelText
              .style('opacity', '0')
              .transition()
              .duration(chartPersonality.animationDuration * 0.4)
              .delay(i * 80)
              .style('opacity', '1');
          }
        }

        // ── Value text on right ──
        if (showLabels) {
          const valueText = svg.append('text')
            .attr('data-part', 'value-label')
            .attr('x', labelW + barAreaWidth + 8)
            .attr('y', yOffset + barHeight / 2)
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'middle')
            .style('font-size', '11px')
            .text(formatVal(item.value));

          if (chartPersonality.animate) {
            valueText
              .style('opacity', '0')
              .transition()
              .duration(chartPersonality.animationDuration * 0.4)
              .delay(i * 80 + chartPersonality.animationDuration * 0.5)
              .style('opacity', '1');
          }
        }
      });
    } else {
      // ── Vertical orientation ────────────────────────────────────────
      const labelH = showLabels ? 24 : 0;
      const valueH = showLabels ? 20 : 0;
      const barAreaHeight = chartHeight - labelH - valueH - 24;
      const barWidth = barHeight; // reuse barHeight prop as bar width in vertical mode
      const totalWidth = items.length * barWidth + (items.length - 1) * gap;
      const startX = (chartWidth - totalWidth) / 2;

      items.forEach((item, i) => {
        const maxVal = resolveMax(item);
        const ranges = resolveRanges(item);
        const xOffset = startX + i * (barWidth + gap);

        const y = scaleLinear().domain([0, maxVal]).range([barAreaHeight, 0]).clamp(true);
        const barTop = labelH;

        const g = svg.append('g')
          .attr('data-part', 'item')
          .attr('data-orientation', 'vertical')
          .attr('transform', `translate(${xOffset},${barTop})`);

        // ── Range bands (drawn from tallest to shortest) ──
        const rangeBands = [
          { upper: ranges[2], color: resolvedRangeColors[2] },
          { upper: ranges[1], color: resolvedRangeColors[1] },
          { upper: ranges[0], color: resolvedRangeColors[0] },
        ];

        rangeBands.forEach((band, bandIndex) => {
          const bandHeight = barAreaHeight - y(band.upper);
          const bandY = y(band.upper);

          const rect = g.append('rect')
            .attr('data-part', 'range-band')
            .attr('x', 0)
            .attr('y', bandY)
            .attr('width', barWidth)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('fill', band.color);

          if (chartPersonality.animate) {
            rect
              .attr('height', 0)
              .attr('y', barAreaHeight)
              .transition()
              .duration(chartPersonality.animationDuration * 0.5)
              .delay(i * 80 + bandIndex * 30)
              .attr('y', bandY)
              .attr('height', bandHeight);
          } else {
            rect.attr('height', bandHeight);
          }
        });

        // ── Value bar (narrow, 40% of barWidth, centered) ──
        const valueBarWidth = barWidth * 0.4;
        const valueBarX = (barWidth - valueBarWidth) / 2;
        const valueBarTop = y(item.value);
        const valueBarH = barAreaHeight - valueBarTop;

        const valueRect = g.append('rect')
          .attr('data-part', 'value-bar')
          .attr('x', valueBarX)
          .attr('width', valueBarWidth)
          .attr('rx', 1)
          .attr('ry', 1)
          .attr('fill', valueColor);

        if (chartPersonality.animate) {
          valueRect
            .attr('y', barAreaHeight)
            .attr('height', 0)
            .transition()
            .duration(chartPersonality.animationDuration * 0.7)
            .delay(i * 80 + 100)
            .attr('y', valueBarTop)
            .attr('height', valueBarH);
        } else {
          valueRect
            .attr('y', valueBarTop)
            .attr('height', valueBarH);
        }

        // ── Target marker (horizontal line) ──
        const targetY = y(item.target);
        const markerWidth = barWidth * 0.7;
        const markerX = (barWidth - markerWidth) / 2;

        const targetLine = g.append('rect')
          .attr('data-part', 'target-marker')
          .attr('x', markerX)
          .attr('y', targetY - 1.5)
          .attr('width', markerWidth)
          .attr('height', 3)
          .attr('rx', 1)
          .attr('fill', targetColor);

        if (chartPersonality.animate) {
          targetLine
            .attr('opacity', 0)
            .transition()
            .duration(chartPersonality.animationDuration * 0.3)
            .delay(i * 80 + chartPersonality.animationDuration * 0.5)
            .attr('opacity', 1);
        }

        // ── Tooltip ──
        if (chartPersonality.tooltip) {
          valueRect.append('title').text(
            compactState.compactTooltip
              ? formatVal(item.value)
              : `${item.label}: ${formatVal(item.value)} / ${formatVal(item.target)} target`,
          );
        }

        // ── Label below ──
        if (showLabels) {
          const labelText = svg.append('text')
            .attr('data-part', 'item-label')
            .attr('x', xOffset + barWidth / 2)
            .attr('y', barTop + barAreaHeight + 16)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('font-size', '12px')
            .style('font-weight', '500')
            .text(item.label);

          if (chartPersonality.animate) {
            labelText
              .style('opacity', '0')
              .transition()
              .duration(chartPersonality.animationDuration * 0.4)
              .delay(i * 80)
              .style('opacity', '1');
          }
        }

        // ── Value text above ──
        if (showLabels) {
          const valueText = svg.append('text')
            .attr('data-part', 'value-label')
            .attr('x', xOffset + barWidth / 2)
            .attr('y', barTop - 8)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('font-size', '11px')
            .text(formatVal(item.value));

          if (chartPersonality.animate) {
            valueText
              .style('opacity', '0')
              .transition()
              .duration(chartPersonality.animationDuration * 0.4)
              .delay(i * 80 + chartPersonality.animationDuration * 0.5)
              .style('opacity', '1');
          }
        }
      });
    }
  }, [
    items, chartWidth, chartHeight, orientation, barHeight, gap, showLabels,
    formatVal, resolvedRangeColors, valueColor, targetColor,
    chartPersonality, compactState.compactTooltip,
  ]);

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={height}
      className={['ds-chart-bullet', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Bullet chart'}
      ariaDescription={describeChart(
        'Bullet chart',
        items.length,
        subtitle,
        `${orientation === 'vertical' ? 'Vertical' : 'Horizontal'} orientation. Shows actual vs target values.`,
      )}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
    />
  );
});
