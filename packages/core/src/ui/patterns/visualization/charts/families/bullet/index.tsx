'use client';

/**
 * Compatibility family for the public BulletChart contract.
 *
 * The chart-engine now owns pure linear-bullet geometry and React/SVG marks.
 * This adapter preserves the established family props, scaffold, accessible
 * summary, legend, and invalid-data fallback overlay for existing consumers.
 * Based on Stephen Few's bullet graph: background range bands, a narrow value
 * bar, and a target marker per KPI.
 */

import { memo, useMemo, useRef } from 'react';

import type {
  ChartBaseProps,
  ChartCompactCoreConfig,
  ChartCompactProps,
  ChartLegendProps,
} from '../../contracts';
import { ChartScaffold, describeChart } from '../../presentation/scaffold';
import { useChartPersonality, useChartCompact, useChartDimensions } from '../../runtime';
import {
  buildSvgBulletGeometry,
  type SvgBulletDatum,
} from '../../runtime/chart-engine/foundation/renderers/geometry';
import { SvgBulletRenderer } from '../../runtime/chart-engine/presentation/react/renderers/bullet';

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
export interface BulletChartProps
  extends ChartBaseProps,
    ChartLegendProps,
    ChartCompactProps<ChartCompactCoreConfig> {
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

function defaultFormatValue(value: number): string {
  return String(value);
}

/**
 * Public BulletChart compatibility adapter. All SVG ownership is delegated to
 * {@link SvgBulletRenderer}; the family contract remains unchanged.
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
  compactMode,
  autoCompact,
  compactBreakpoint,
}: BulletChartProps) {
  const legacySvgRef = useRef<SVGSVGElement>(null);
  const items: BulletDataPoint[] = useMemo(
    () => (Array.isArray(data) ? data : [data]),
    [data],
  );

  const defaultHeight = useMemo(() => {
    const totalItems = Math.max(items.length, 1);
    const topPadding = 12;
    const bottomPadding = 12;
    return topPadding + totalItems * barHeight + (totalItems - 1) * gap + bottomPadding;
  }, [items.length, barHeight, gap]);
  const height = heightProp ?? defaultHeight;

  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const compactState = useChartCompact({
    compact,
    compactMode,
    autoCompact,
    compactBreakpoint,
    containerWidth: dimensions.width,
  });
  const chartHeight = compactState.isCompact ? Math.max(height, compactState.minHeight) : height;

  const formatVal = formatValue ?? defaultFormatValue;
  const resolvedRangeColors = useMemo<[string, string, string]>(
    () => rangeColors ?? [
      'var(--ds-color-primary-200)',
      'var(--ds-color-primary-100)',
      'var(--ds-color-primary-50)',
    ],
    [rangeColors],
  );

  // Validation is resolved from the same pure engine as the visible renderer.
  const rendererData = useMemo<SvgBulletDatum[]>(
    () => items.map((item, index) => ({
      id: `bullet-${index}`,
      label: item.label,
      value: item.value,
      target: item.target,
      ...(item.ranges === undefined ? {} : { ranges: item.ranges }),
      ...(item.max === undefined ? {} : { max: item.max }),
    })),
    [items],
  );
  const model = useMemo(
    () => buildSvgBulletGeometry({
      data: rendererData,
      width: 600,
      height: chartHeight,
      orientation,
      barThickness: barHeight,
      gap,
      showLabels,
    }),
    [barHeight, chartHeight, gap, orientation, rendererData, showLabels],
  );
  const fallbackMessage = model.fallbackMessage;
  const canRender = fallbackMessage === null;

  const summary = useMemo(() => ({
    caption: title ? `${title} data summary` : 'Bullet chart data summary',
    headers: ['KPI', 'Actual', 'Target', 'Status'],
    rows: items.map((item) => {
      const valid = Number.isFinite(item.value) && Number.isFinite(item.target);
      return [
        item.label,
        Number.isFinite(item.value) ? formatVal(item.value) : 'Invalid',
        Number.isFinite(item.target) ? formatVal(item.target) : 'Invalid',
        valid ? (item.value >= item.target ? 'Met' : 'Below target') : 'Invalid',
      ];
    }),
  }), [title, items, formatVal]);

  const legendNode = legend && canRender ? (
    <div data-part="legend" style={{ display: 'flex', gap: 'var(--ds-chart-legend-gap, 16px)', flexWrap: 'wrap', marginTop: 'var(--ds-chart-legend-margin-top, 8px)', justifyContent: 'center' }}>
      {[
        { label: 'Poor', color: resolvedRangeColors[0] },
        { label: 'Satisfactory', color: resolvedRangeColors[1] },
        { label: 'Good', color: resolvedRangeColors[2] },
        { label: 'Actual', color: valueColor },
        { label: 'Target', color: targetColor },
      ].map((item) => (
        <div key={item.label} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-chart-legend-item-gap, 6px)', fontSize: 'var(--ds-chart-legend-font-size, 12px)' }}>
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

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={legacySvgRef}
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
        [
          `${orientation === 'vertical' ? 'Vertical' : 'Horizontal'} orientation. Shows actual vs target values.`,
          fallbackMessage,
        ].filter(Boolean).join(' '),
      )}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
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
      plot={({ descriptionId }) => (
        <SvgBulletRenderer
          data={rendererData}
          ariaLabel={title ?? 'Bullet chart'}
          ariaDescribedBy={descriptionId}
          width={width}
          height={chartHeight}
          responsive={responsive}
          animate={chartPersonality.animate}
          orientation={orientation}
          barThickness={barHeight}
          gap={gap}
          showLabels={showLabels}
          formatValue={formatVal}
          rangeColors={resolvedRangeColors}
          valueColor={valueColor}
          targetColor={targetColor}
          showTitles={chartPersonality.tooltip}
          compactTooltip={compactState.compactTooltip}
        />
      )}
    />
  );
});
