'use client';

/**
 * Compatibility family for the public FunnelChart contract.
 *
 * The chart-engine now owns pure taper geometry and React/SVG marks. This
 * adapter intentionally preserves the established family props, scaffold,
 * accessible summary, legend, and fallback overlay for existing consumers.
 */

import { memo, useMemo, useRef } from 'react';

import type {
  ChartBaseProps,
  ChartColorsProps,
  ChartLegendProps,
  ChartMarginProps,
  DataPoint,
} from '../../contracts';
import { DEFAULT_MARGIN } from '../../foundation/geometry';
import { ChartScaffold, describeChart } from '../../presentation/scaffold';
import { useChartPersonality } from '../../runtime';
import { buildSvgFunnelGeometry } from '../../runtime/chart-engine/foundation/renderers/geometry';
import { SvgFunnelRenderer } from '../../runtime/chart-engine/presentation/react/renderers/funnel';

/** Props for the backward-compatible {@link FunnelChart} family adapter. */
export interface FunnelChartProps
  extends ChartBaseProps, ChartLegendProps, ChartColorsProps, ChartMarginProps {
  data: DataPoint[];
  showPercentage?: boolean;
  showConversion?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

/**
 * Public FunnelChart compatibility adapter. All SVG ownership is delegated to
 * `SvgFunnelRenderer`, while the family contract remains unchanged.
 */
export const FunnelChart = memo(function FunnelChart({
  data,
  showPercentage = true,
  showConversion = false,
  orientation = 'vertical',
  width,
  height = 400,
  className,
  style,
  loading = false,
  title,
  subtitle,
  legend = false,
  animate,
  responsive = true,
  colors,
  tooltip,
  margin = DEFAULT_MARGIN,
}: FunnelChartProps) {
  const scaffoldRef = useRef<HTMLDivElement>(null);
  const legacySvgRef = useRef<SVGSVGElement>(null);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  // Validation and legend colors are resolved from the same pure engine as
  // the visible renderer. This fixed layout does not own responsive sizing;
  // the renderer remains the sole normal ResizeObserver owner.
  const model = useMemo(
    () => buildSvgFunnelGeometry({
      data,
      width: 600,
      height: 400,
      orientation,
      colors: palette,
      margin,
    }),
    [data, margin, orientation, palette],
  );
  const fallbackMessage = model.fallbackMessage;
  const canRender = fallbackMessage === null;
  const summary = useMemo(() => ({
    caption: title ? `${title} data summary` : 'Funnel chart data summary',
    headers: ['Stage', 'Value', 'Percentage'],
    rows: data.map((item) => [
      item.label,
      Number.isFinite(item.value) ? item.value : 'Invalid',
      canRender ? `${((item.value / model.maxValue) * 100).toFixed(1)}%` : '0%',
    ]),
  }), [canRender, data, model.maxValue, title]);
  const description = describeChart(
    'Funnel chart',
    data.length,
    subtitle,
    [orientation === 'horizontal' ? 'Horizontal orientation.' : 'Vertical orientation.', fallbackMessage]
      .filter(Boolean)
      .join(' '),
  );
  const legendNode = legend && canRender ? (
    <div
      data-part="legend"
      data-orientation={orientation}
      style={{
        display: 'flex',
        gap: 'var(--ds-chart-legend-gap, 16px)',
        flexWrap: 'wrap',
        marginTop: 'var(--ds-chart-legend-margin-top, 8px)',
        justifyContent: 'center',
      }}
    >
      {model.segments.map((segment) => (
        <div
          key={segment.id}
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
            data-color-source={segment.colorSource}
            style={{
              width: 12,
              height: 12,
              backgroundColor: segment.color,
              display: 'inline-block',
            }}
          />
          <span data-part="legend-label">{segment.label}</span>
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
      className={['ds-chart-funnel', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Funnel chart'}
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
        <SvgFunnelRenderer
          data={data}
          ariaLabel={title ?? 'Funnel chart'}
          ariaDescribedBy={descriptionId}
          width={width}
          height={height}
          responsive={responsive}
          animate={chartPersonality.animate}
          orientation={orientation}
          showPercentage={showPercentage}
          showConversion={showConversion}
          colors={palette}
          margin={margin}
          showSegmentTitles={chartPersonality.tooltip}
        />
      )}
    />
  );
});
