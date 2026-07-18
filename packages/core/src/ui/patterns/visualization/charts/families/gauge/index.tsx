'use client';

/**
 * Compatibility family for the public GaugeChart contract.
 *
 * Geometry and SVG ownership live in the chart-engine `SvgGaugeRenderer`.
 * This adapter deliberately retains the legacy family API, scaffold, legend,
 * compactness and accessibility summary so existing product screens migrate
 * without a consumer rewrite.
 */

import { memo, useMemo, useRef } from 'react';

import type {
  ChartBaseProps,
  ChartCompactCoreConfig,
  ChartCompactProps,
  ChartLegendProps,
} from '../../contracts';
import { useChartCompact, useChartDimensions, useChartPersonality } from '../../runtime';
import { ChartScaffold, describeChart } from '../../presentation/scaffold';
import { SvgGaugeRenderer } from '../../runtime/chart-engine/presentation/react/renderers/gauge';

/** A single threshold segment rendered as a colored arc band on the gauge. */
export interface GaugeSegment {
  /** Start value of this segment. */
  from: number;
  /** End value of this segment. */
  to: number;
  /** Fill color for this arc segment. An empty string remains intentional. */
  color: string;
  /** Optional label for the legend and accessible summary. */
  label?: string;
}

/** Props for the backward-compatible {@link GaugeChart} family adapter. */
export interface GaugeChartProps
  extends ChartBaseProps,
    ChartLegendProps,
    ChartCompactProps<ChartCompactCoreConfig> {
  /** Current value (positioned between min and max). */
  value: number;
  /** Minimum value. Default: 0. */
  min?: number;
  /** Maximum value. Default: 100. */
  max?: number;
  /** Threshold segments with colors. Defaults to semantic low/mid/high bands. */
  segments?: GaugeSegment[];
  /** Show value text in center. Default: true. */
  showValue?: boolean;
  /** Value format function. */
  formatValue?: (value: number) => string;
  /** Label below the value. */
  label?: string;
  /** Arc start angle in degrees. Default: -120. */
  startAngle?: number;
  /** Arc end angle in degrees. Default: 120. */
  endAngle?: number;
  /** Inner radius ratio (0-1). Default: 0.7. */
  innerRadius?: number;
  /** Show needle indicator. Default: true. */
  showNeedle?: boolean;
  /** Needle color. Default: var(--ds-color-text-primary). */
  needleColor?: string;
}

const DEFAULT_SEGMENT_TONES = ['error', 'warning', 'success'] as const;
const DEFAULT_SEGMENT_COLORS = [
  'var(--ds-color-error)',
  'var(--ds-color-warning)',
  'var(--ds-color-success)',
] as const;

function resolveGaugeRange(min: number | undefined, max: number | undefined): readonly [number, number] {
  const finiteMin = Number.isFinite(min) ? min as number : 0;
  const finiteMax = Number.isFinite(max) ? max as number : 100;
  if (finiteMin === finiteMax) return [finiteMin, finiteMin + 1];
  return finiteMin < finiteMax ? [finiteMin, finiteMax] : [finiteMax, finiteMin];
}

function defaultSegments(rangeMin: number, rangeMax: number): readonly Omit<GaugeSegment, 'color'>[] {
  const third = (rangeMax - rangeMin) / 3;
  return [
    { from: rangeMin, to: rangeMin + third, label: 'Low' },
    { from: rangeMin + third, to: rangeMin + third * 2, label: 'Medium' },
    { from: rangeMin + third * 2, to: rangeMax, label: 'High' },
  ];
}

function normalizedSegments(
  providedSegments: GaugeSegment[] | undefined,
  rangeMin: number,
  rangeMax: number,
): ReadonlyArray<Omit<GaugeSegment, 'color'> & { color?: string; toneIndex: number }> {
  return (providedSegments ?? defaultSegments(rangeMin, rangeMax)).flatMap((segment, toneIndex) => {
    if (!Number.isFinite(segment.from) || !Number.isFinite(segment.to)) return [];
    const from = Math.max(rangeMin, segment.from);
    const to = Math.min(rangeMax, segment.to);
    return to > from ? [{ ...segment, from, to, toneIndex }] : [];
  });
}

function segmentTone(
  usesDefaultSegments: boolean,
  index: number,
): 'custom' | (typeof DEFAULT_SEGMENT_TONES)[number] {
  if (!usesDefaultSegments) return 'custom';
  return DEFAULT_SEGMENT_TONES[index % DEFAULT_SEGMENT_TONES.length] ?? 'error';
}

/**
 * Public GaugeChart compatibility adapter. The component preserves the former
 * family contract while delegating every SVG mark to the modern React-owned
 * renderer. No D3 selection, append, transition, or DOM mutation remains here.
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
  compactMode,
  autoCompact,
  compactBreakpoint,
}: GaugeChartProps) {
  // The modern renderer owns the normal responsive observer. This lightweight
  // measurement only activates for the legacy `autoCompact` API, which needs
  // the outer family width to decide whether its legend can collapse.
  const { containerRef: scaffoldRef, dimensions: scaffoldDimensions } = useChartDimensions(
    width,
    height,
    Boolean(autoCompact),
  );
  const legacySvgRef = useRef<SVGSVGElement>(null);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const compactState = useChartCompact({
    compact,
    compactMode,
    autoCompact,
    compactBreakpoint,
    containerWidth: autoCompact ? scaffoldDimensions.width : undefined,
  });
  const chartHeight = compactState.isCompact
    ? Math.max(height, compactState.minHeight)
    : height;
  const [rangeMin, rangeMax] = useMemo(
    () => resolveGaugeRange(min, max),
    [max, min],
  );
  const usesDefaultSegments = providedSegments === undefined;
  const resolvedSegments = useMemo(
    () => normalizedSegments(providedSegments, rangeMin, rangeMax),
    [providedSegments, rangeMax, rangeMin],
  );
  const clampedValue = Number.isFinite(value)
    ? Math.max(rangeMin, Math.min(rangeMax, value))
    : rangeMin;
  const displayValue = useMemo(
    () => formatValue ? formatValue(clampedValue) : String(clampedValue),
    [clampedValue, formatValue],
  );
  const activeSegment = useMemo(
    () => resolvedSegments.find((segment) => (
      clampedValue >= segment.from && clampedValue <= segment.to
    )),
    [clampedValue, resolvedSegments],
  );
  const summary = useMemo(() => ({
    caption: title ? `${title} data summary` : 'Gauge chart data summary',
    headers: ['Metric', 'Value'],
    rows: [
      ['Current value', displayValue],
      ['Range', `${rangeMin} - ${rangeMax}`],
      ...(activeSegment?.label ? [['Status', activeSegment.label] as [string, string]] : []),
      ...resolvedSegments.map((segment) => [
        segment.label ?? `${segment.from}-${segment.to}`,
        `${segment.from} to ${segment.to}`,
      ] as [string, string]),
    ],
  }), [activeSegment, displayValue, rangeMax, rangeMin, resolvedSegments, title]);
  const legendNode = legend ? (
    <div
      data-part="legend"
      data-variant="gauge"
      style={{
        display: 'flex',
        gap: 'var(--ds-chart-legend-gap, 16px)',
        flexWrap: 'wrap',
        marginTop: 'var(--ds-chart-legend-margin-top, 8px)',
        justifyContent: 'center',
      }}
    >
      {resolvedSegments.map((segment) => (
        <div
          key={`${segment.from}-${segment.to}`}
          data-part="legend-item"
          data-state={segment === activeSegment ? 'active' : 'inactive'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-chart-legend-item-gap, 6px)',
            fontSize: 'var(--ds-chart-legend-font-size, 12px)',
          }}
        >
          <span
            data-part="legend-swatch"
            data-color-source={usesDefaultSegments ? 'default' : 'custom'}
            data-tone={segmentTone(usesDefaultSegments, segment.toneIndex)}
            style={{
              width: 12,
              height: 12,
              backgroundColor: usesDefaultSegments
                ? DEFAULT_SEGMENT_COLORS[segment.toneIndex]
                : segment.color,
              display: 'inline-block',
            }}
          />
          <span data-part="legend-label">
            {segment.label ?? `${segment.from}-${segment.to}`}
          </span>
        </div>
      ))}
    </div>
  ) : null;

  return (
    <ChartScaffold
      containerRef={scaffoldRef}
      svgRef={legacySvgRef}
      width={width}
      height={chartHeight}
      className={['ds-chart-gauge', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? `Gauge chart showing ${displayValue}`}
      ariaDescription={describeChart(
        'Gauge chart',
        resolvedSegments.length,
        subtitle,
        `Current value: ${displayValue}${activeSegment?.label ? ` (${activeSegment.label})` : ''}. Range: ${rangeMin} to ${rangeMax}.`,
      )}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
      plot={({ descriptionId }) => (
        <SvgGaugeRenderer
          value={value}
          ariaLabel={title ?? `Gauge chart showing ${displayValue}`}
          ariaDescription={describeChart(
            'Gauge chart',
            resolvedSegments.length,
            subtitle,
            `Current value: ${displayValue}${activeSegment?.label ? ` (${activeSegment.label})` : ''}. Range: ${rangeMin} to ${rangeMax}.`,
          )}
          ariaDescribedBy={descriptionId}
          width={width}
          height={chartHeight}
          responsive={responsive}
          animate={chartPersonality.animate}
          min={min}
          max={max}
          segments={providedSegments}
          showValue={showValue}
          formatValue={formatValue}
          label={label}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={innerRadius}
          showNeedle={showNeedle}
          needleColor={needleColor}
          trackCornerRadius={2}
          segmentCornerRadius={1}
          showSegmentTitles={chartPersonality.tooltip}
        />
      )}
    />
  );
});
