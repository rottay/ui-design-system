'use client';

/**
 * @fileoverview WaterfallChart -- shows how sequential positive and negative
 * values contribute to a running total. Each bar starts where the previous one
 * ended (running total), except 'total' bars which anchor to zero. Dashed
 * connectors link adjacent bars. Bars are toned by type (increase/decrease/
 * total) using semantic status tokens. The running-total math lives in the pure
 * `buildSvgWaterfallGeometry` builder; SVG ownership is delegated to the engine
 * `SvgWaterfallRenderer`. This adapter owns no D3.
 *
 * @example
 * <WaterfallChart
 *   data={[
 *     { label: 'Revenue', value: 420 },
 *     { label: 'COGS', value: -200 },
 *     { label: 'Expenses', value: -80 },
 *     { label: 'Net Profit', value: 140, type: 'total' },
 *   ]}
 *   showValues
 *   showConnectors
 *   height={400}
 *   title="Profit Waterfall"
 * />
 */

import { memo, useMemo, useRef } from 'react';

import type {
  ChartBaseProps,
  ChartCartesianCompactConfig,
  ChartCompactProps,
  ChartLegendProps,
  ChartMarginProps,
  ChartStateProps,
} from '../../contracts';
import { useChartDimensions, useChartPersonality, useChartCompact } from '../../runtime';
import { ChartScaffold, describeChart, resolveChartScaffoldState } from '../../presentation/scaffold';
import { TooltipValue } from '../../presentation/tooltip';
import type { ChartInteraction } from '../../runtime/chart-engine/foundation/interaction';
import { buildSvgWaterfallGeometry } from '../../runtime/chart-engine/foundation/renderers/geometry';
import {
  SvgWaterfallRenderer,
  type SvgWaterfallBarDatum,
} from '../../runtime/chart-engine/presentation/react/renderers/waterfall';

/** A single data point in the waterfall series. */
export interface WaterfallDataPoint {
  /** Category label displayed on the axis */
  label: string;
  /** Numeric value (positive = increase, negative = decrease) */
  value: number;
  /** Bar type. Default: inferred from value sign. 'total' bars start from zero. */
  type?: 'increase' | 'decrease' | 'total';
}

/** Own props for the {@link WaterfallChart} component (state copy is composed below). */
interface WaterfallChartOwnProps
  extends ChartBaseProps,
    ChartLegendProps,
    ChartMarginProps,
    ChartCompactProps<ChartCartesianCompactConfig> {
  data: WaterfallDataPoint[];
  /** Color for increase bars. Default: var(--ds-color-success) */
  increaseColor?: string;
  /** Color for decrease bars. Default: var(--ds-color-error) */
  decreaseColor?: string;
  /** Color for total bars. Default: var(--ds-color-primary) */
  totalColor?: string;
  /** Show dashed connector lines between bars. Default: true */
  showConnectors?: boolean;
  /** Show value labels on bars. Default: true */
  showValues?: boolean;
  /** Format value display. Default: String(value) */
  formatValue?: (value: number) => string;
  /** Orientation. Default: 'vertical' */
  orientation?: 'vertical' | 'horizontal';
  /** Render the loading state as a structural placeholder instead of a centered label. */
  skeleton?: boolean;
}

/** Props for the {@link WaterfallChart} component. */
export type WaterfallChartProps = WaterfallChartOwnProps & ChartStateProps;

function defaultFormatValue(value: number): string {
  return String(value);
}

/**
 * Renders a waterfall chart with running totals, toned by increase/decrease/total type.
 *
 * @param props - See {@link WaterfallChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table and optional legend.
 */
export const WaterfallChart = memo(function WaterfallChart({
  data,
  increaseColor = 'var(--ds-color-success)',
  decreaseColor = 'var(--ds-color-error)',
  totalColor = 'var(--ds-color-primary)',
  showConnectors = true,
  showValues = true,
  formatValue,
  orientation = 'vertical',
  skeleton,
  width,
  height = 400,
  className,
  style,
  loading = false,
  state,
  emptyLabel,
  emptyDescription,
  emptyAction,
  errorLabel,
  errorDescription,
  errorAction,
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
}: WaterfallChartProps) {
  const scaffoldRef = useRef<HTMLDivElement>(null);
  const legacySvgRef = useRef<SVGSVGElement>(null);
  const { dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const compactState = useChartCompact({ compact, compactMode, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  const formatVal = formatValue ?? defaultFormatValue;

  // The pure geometry builder is the single running-total authority; the family
  // reads it for the accessible summary and the renderer recomputes it for marks.
  const summaryGeometry = useMemo(
    () => buildSvgWaterfallGeometry({ data, width: 600, height, orientation }),
    [data, height, orientation],
  );
  const summary = {
    caption: title ? `${title} data summary` : 'Waterfall chart data summary',
    headers: ['Label', 'Value', 'Type'],
    rows: summaryGeometry.bars.map((bar) => [bar.label, bar.value, bar.type] as Array<string | number>),
  };

  const legendNode = legend ? (
    <div data-part="legend" style={{ display: 'flex', gap: 'var(--ds-chart-legend-gap, 16px)', flexWrap: 'wrap', marginTop: 'var(--ds-chart-legend-margin-top, 8px)', justifyContent: 'center' }}>
      {[
        { label: 'Increase', color: increaseColor },
        { label: 'Decrease', color: decreaseColor },
        { label: 'Total', color: totalColor },
      ].map((item) => (
        <div key={item.label} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-chart-legend-item-gap, 6px)', fontSize: 'var(--ds-chart-legend-font-size, 12px)' }}>
          <span data-part="legend-swatch" data-status={item.label.toLowerCase()} style={{ width: 12, height: 12, backgroundColor: item.color, display: 'inline-block' }} />
          <span data-part="legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  ) : null;

  const resolvedState = resolveChartScaffoldState({
    state,
    loading,
    dataCount: summaryGeometry.bars.length,
    emptyLabel,
  });
  // Rebuild the discriminated state contract from the resolved state so the
  // typed-required copy correlates with the active arm.
  const stateProps: ChartStateProps = resolvedState === 'error'
    ? {
      state: 'error',
      errorLabel: errorLabel ?? '',
      ...(errorDescription === undefined ? {} : { errorDescription }),
      ...(errorAction === undefined ? {} : { errorAction }),
    }
    : resolvedState === 'empty'
      ? {
        state: 'empty',
        emptyLabel: emptyLabel ?? '',
        ...(emptyDescription === undefined ? {} : { emptyDescription }),
        ...(emptyAction === undefined ? {} : { emptyAction }),
      }
      : {
        state: resolvedState,
        ...(emptyLabel === undefined ? {} : { emptyLabel }),
        ...(emptyDescription === undefined ? {} : { emptyDescription }),
        ...(emptyAction === undefined ? {} : { emptyAction }),
      };

  const description = describeChart('Waterfall chart', summaryGeometry.bars.length, subtitle, [
    orientation === 'horizontal' ? 'Horizontal orientation.' : 'Vertical orientation.',
    showConnectors ? 'Connector lines shown between bars.' : null,
  ].filter(Boolean).join(' '));

  // The family declares the explore interaction only while the tooltip
  // personality is active; the renderer's shared controller owns hover, focus,
  // and keyboard cycling across bars.
  const interaction: ChartInteraction<SvgWaterfallBarDatum> | undefined = chartPersonality.tooltip
    ? {
      mode: 'explore',
      renderTooltip: (active) => (
        <TooltipValue
          label={`${active.datum.label} (${active.datum.type})`}
          value={`${formatVal(active.datum.value)} → ${formatVal(active.datum.end)}`}
          color={active.datum.paint}
        />
      ),
    }
    : undefined;

  return (
    <ChartScaffold
      containerRef={scaffoldRef}
      svgRef={legacySvgRef}
      width={width}
      height={height}
      className={['ds-chart-waterfall', className].filter(Boolean).join(' ')}
      style={style}
      {...stateProps}
      loadingLabel={chartPersonality.loadingLabel}
      skeleton={skeleton}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Waterfall chart'}
      ariaDescription={description}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
      plot={({ descriptionId }) => (
        <SvgWaterfallRenderer
          data={data}
          ariaLabel={title ?? 'Waterfall chart'}
          ariaDescribedBy={descriptionId}
          width={typeof width === 'number' ? width : undefined}
          height={height}
          responsive={responsive}
          orientation={orientation}
          increaseColor={increaseColor}
          decreaseColor={decreaseColor}
          totalColor={totalColor}
          showConnectors={showConnectors}
          showValues={showValues}
          formatValue={formatVal}
          {...(interaction === undefined ? {} : { interaction })}
        />
      )}
    />
  );
});
