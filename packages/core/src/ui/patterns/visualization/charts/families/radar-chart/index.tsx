'use client';

/**
 * Compatibility family for the public RadarChart contract.
 *
 * The chart-engine owns immutable geometry and React/SVG marks through
 * `SvgRadarRenderer`; this adapter retains the established family props,
 * scaffold, accessible summary, legend, and fallback presentation.
 */

import { memo, useMemo, useRef } from 'react';

import type {
  ChartBaseProps,
  ChartColorSchemeProps,
  ChartColorsProps,
  ChartLegendProps,
} from '../../contracts';
import { ChartScaffold, describeChart } from '../../presentation/scaffold';
import { useChartPersonality } from '../../runtime';
import {
  buildSvgRadarGeometry,
} from '../../runtime/chart-engine/foundation/renderers/geometry';
import { SvgRadarRenderer } from '../../runtime/chart-engine/presentation/react/renderers/radar';

/** Props for the backward-compatible {@link RadarChart} family adapter. */
export interface RadarChartProps
  extends ChartBaseProps, ChartLegendProps, ChartColorsProps, ChartColorSchemeProps {
  data: { axis: string; value: number }[];
  series?: { name: string; data: { axis: string; value: number }[]; color?: string }[];
  maxValue?: number;
  levels?: number;
  showLabels?: boolean;
}

/**
 * Public RadarChart compatibility adapter. Existing consumers keep their
 * family-level API while all SVG output is owned by the modern renderer.
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
  const scaffoldRef = useRef<HTMLDivElement>(null);
  const legacySvgRef = useRef<SVGSVGElement>(null);
  const chartPersonality = useChartPersonality({ animate, tooltip, colorScheme });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const allSeries = useMemo(
    () => series ?? [{ name: 'Data', data, color: palette[0] }],
    [data, palette, series],
  );
  // Resolve validation from the same pure engine that produces the visible
  // SVG. The fixed dimensions here are intentionally irrelevant: this pass
  // supplies the legacy overlay/legend contract while the renderer owns its
  // actual responsive layout and its sole normal ResizeObserver.
  const model = useMemo(
    () => buildSvgRadarGeometry({
      data,
      series,
      colors: palette,
      width: 400,
      height: 400,
      maxValue: maxValueProp,
      levels,
    }),
    [data, levels, maxValueProp, palette, series],
  );
  const fallbackMessage = model.fallbackMessage;
  const canRender = fallbackMessage === null;
  const summary = useMemo(() => ({
    caption: title ? `${title} data summary` : 'Radar chart data summary',
    headers: ['Series', 'Axis', 'Value'],
    rows: allSeries.flatMap((currentSeries) => (
      currentSeries.data.map((point) => [
        currentSeries.name,
        point.axis,
        Number.isFinite(point.value) ? point.value : 'Invalid',
      ])
    )),
  }), [allSeries, title]);
  const description = describeChart(
    'Radar chart',
    summary.rows.length,
    subtitle,
    [showLabels ? 'Axis labels are visible.' : null, fallbackMessage].filter(Boolean).join(' ') || undefined,
  );
  const legendNode = legend && canRender && model.series.length > 1 ? (
    <div
      data-part="legend"
      style={{
        display: 'flex',
        gap: 'var(--ds-chart-legend-gap, 16px)',
        flexWrap: 'wrap',
        marginTop: 'var(--ds-chart-legend-margin-top, 8px)',
        justifyContent: 'center',
      }}
    >
      {model.series.map((currentSeries) => (
        <div
          key={currentSeries.id}
          data-part="legend-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-chart-legend-item-gap, 6px)',
            fontSize: 'var(--ds-chart-legend-font-size, 12px)',
          }}
        >
          <span
            data-part="legend-swatch"
            data-color-source={currentSeries.colorSource}
            style={{
              width: 12,
              height: 12,
              backgroundColor: currentSeries.color,
              display: 'inline-block',
            }}
          />
          <span data-part="legend-label">{currentSeries.name}</span>
        </div>
      ))}
    </div>
  ) : null;

  return (
    <ChartScaffold
      containerRef={scaffoldRef}
      svgRef={legacySvgRef}
      width={width}
      height={height}
      className={['ds-chart-radar', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Radar chart'}
      ariaDescription={description}
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
      plot={({ descriptionId }) => (
        <SvgRadarRenderer
          data={data}
          series={series}
          ariaLabel={title ?? 'Radar chart'}
          ariaDescription={description}
          ariaDescribedBy={descriptionId}
          width={width}
          height={height}
          responsive={responsive}
          animate={chartPersonality.animate}
          maxValue={maxValueProp}
          levels={levels}
          showLabels={showLabels}
          colors={palette}
          showPointTitles={chartPersonality.tooltip}
        />
      )}
    />
  );
});
