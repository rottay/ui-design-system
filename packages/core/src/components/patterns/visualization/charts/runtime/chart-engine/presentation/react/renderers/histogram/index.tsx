'use client';

import { useId, useMemo, type CSSProperties } from 'react';

import { useChartDimensions } from '../../../../runtime/dimensions';
import type { ChartInteraction } from '../../../../foundation/interaction';
import { useChartInteraction } from '../../../../runtime/interaction/controller';
import {
  buildSvgHistogramGeometry,
  type ChartGeometryInsets,
} from '../../../../foundation/renderers/geometry';
import { ChartRendererSurface } from '..';

/** Tooltip/keyboard datum exposed to the family for each rendered bin. */
export interface SvgHistogramBinDatum {
  readonly x0: number;
  readonly x1: number;
  readonly count: number;
  readonly densityValue: number;
}

export interface SvgHistogramRendererProps {
  readonly values: readonly number[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly ariaDescribedBy?: string;
  readonly width?: number;
  readonly height?: number;
  /** Recompute geometry from the container width. Defaults to true. */
  readonly responsive?: boolean;
  readonly bins?: number;
  readonly thresholds?: readonly number[];
  readonly density?: boolean;
  readonly cumulative?: boolean;
  readonly showLabels?: boolean;
  /** Bar paint. Applied inline because the histogram carries a single explicit
   * colour, not the tenant categorical palette channel. */
  readonly color?: string;
  /** Cumulative overlay paint. */
  readonly cumulativeColor?: string;
  readonly formatValue?: (value: number) => string;
  readonly xLabel?: string;
  readonly yLabel?: string;
  readonly insets?: ChartGeometryInsets;
  readonly maxTicks?: number;
  /** Explore/select interaction contract wired by the owning family. */
  readonly interaction?: ChartInteraction<SvgHistogramBinDatum>;
  readonly className?: string;
  readonly style?: CSSProperties;
}

const DEFAULT_BAR_PAINT = 'var(--ds-color-primary)';
const DEFAULT_CUMULATIVE_PAINT = 'var(--ds-color-info)';

/**
 * React-owned semantic SVG histogram renderer. `d3.bin` stays inside the pure
 * geometry builder; this renderer owns no D3. The single bar colour and the
 * cumulative colour are explicit props (not the categorical palette), so they
 * paint inline while grid, axes, and labels inherit the generic renderer skin.
 */
export function SvgHistogramRenderer({
  values,
  ariaLabel,
  ariaDescription,
  ariaDescribedBy,
  width = 640,
  height = 360,
  responsive = true,
  bins,
  thresholds,
  density = false,
  cumulative = false,
  showLabels = false,
  color = DEFAULT_BAR_PAINT,
  cumulativeColor = DEFAULT_CUMULATIVE_PAINT,
  formatValue,
  xLabel,
  yLabel,
  insets,
  maxTicks,
  interaction,
  className,
  style,
}: SvgHistogramRendererProps): React.ReactElement {
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive ? dimensions.width : width;
  const geometry = useMemo(
    () => buildSvgHistogramGeometry({
      values,
      width: geometryWidth,
      height,
      bins,
      thresholds,
      density,
      cumulative,
      insets,
      maxTicks,
    }),
    [bins, cumulative, density, geometryWidth, height, insets, maxTicks, thresholds, values],
  );
  const formatBinLabel = (value: number): string => (formatValue ? formatValue(value) : String(value));
  const interactionItems = useMemo(
    () => geometry.bins.map((bin) => ({
      key: bin.id,
      label: `${formatBinLabel(bin.x0)} - ${formatBinLabel(bin.x1)}: ${density ? bin.densityValue : bin.count}`,
      datum: {
        x0: bin.x0,
        x1: bin.x1,
        count: bin.count,
        densityValue: bin.densityValue,
      },
      x: bin.labelX,
      y: bin.y,
    })),
    // formatBinLabel is a pure function of formatValue; listing formatValue keeps
    // the memo honest without depending on the inline arrow identity.
    [density, formatValue, geometry.bins],
  );
  const interactionState = useChartInteraction({
    items: interactionItems,
    interaction,
    navigation: 'horizontal',
  });
  const tooltipId = useId();
  const activeBin = interactionState.activeKey
    ? geometry.bins.find((bin) => bin.id === interactionState.activeKey)
    : undefined;
  const tooltip = interactionState.activeDatum && interaction && interaction.mode !== 'static'
    ? interaction.renderTooltip?.(interactionState.activeDatum)
    : undefined;

  return (
    <ChartRendererSurface
      rendererId="svg.histogram"
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      ariaDescribedBy={ariaDescribedBy}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.bins.length === 0}
      className={['ds-chart-renderer-histogram', className].filter(Boolean).join(' ')}
      style={style}
      ownerRef={containerRef}
      interactionMode={interactionState.mode}
      interactionRootProps={interactionState.rootProps}
      tooltip={tooltip}
      tooltipId={tooltipId}
      tooltipKey={interactionState.activeKey ?? undefined}
      tooltipAnchor={activeBin ? {
        x: activeBin.labelX,
        y: activeBin.y,
      } : undefined}
    >
      <g data-part="plot-area" data-variant={density ? 'density' : 'frequency'}>
        <g data-part="grid" aria-hidden="true">
          {geometry.yTicks.map((tick) => (
            <line
              key={tick.id}
              data-part="grid-line"
              x1={geometry.plot.x}
              x2={geometry.plot.x + geometry.plot.width}
              y1={tick.y}
              y2={tick.y}
            />
          ))}
        </g>

        <g data-part="axis" data-axis="x" aria-hidden="true">
          {geometry.xTicks.map((tick) => (
            <text
              key={tick.id}
              data-part="axis-tick-label"
              x={tick.x}
              y={tick.y + 20}
              textAnchor="middle"
            >
              {formatValue ? formatBinLabel(Number(tick.value)) : tick.label}
            </text>
          ))}
        </g>

        <g data-part="axis" data-axis="y" aria-hidden="true">
          {geometry.yTicks.map((tick) => (
            <text
              key={tick.id}
              data-part="axis-tick-label"
              x={tick.x - 8}
              y={tick.y}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {tick.label}
            </text>
          ))}
        </g>

        <g data-part="marks">
          {geometry.bins.map((bin) => {
            const rangeLabel = `${formatBinLabel(bin.x0)} - ${formatBinLabel(bin.x1)}`;
            const measured = density ? bin.densityValue : bin.count;
            const accessibleLabel = `${rangeLabel}: ${density ? measured.toFixed(4) : measured}`;
            const datumProps = interactionState.getDatumProps(bin.id);
            const interactive = interactionState.mode !== 'static';
            const actionable = interactionState.mode === 'select' || interactionState.mode === 'drill';
            const markLabel = actionable && interaction && interaction.mode !== 'static'
              ? `${accessibleLabel}. ${interaction.actionLabel}`
              : accessibleLabel;
            // Contiguous bins leave no gaps, so the hit rect mirrors the bar
            // rect; the 24px floor keeps narrow bins keyboard/pointer reachable.
            const hitWidth = Math.max(24, bin.width);
            const hitHeight = Math.max(24, bin.height);
            const hitX = bin.x - (hitWidth - bin.width) / 2;
            const hitY = bin.y - (hitHeight - bin.height) / 2;
            return (
              <g
                key={bin.id}
                data-part="bar-mark"
                data-datum-id={bin.id}
                data-series="histogram"
                data-chart-datum-key={datumProps['data-chart-datum-key']}
                data-active={datumProps['data-active']}
                data-focused={datumProps['data-focused']}
                data-hovered={datumProps['data-hovered']}
                data-pinned={datumProps['data-pinned']}
                tabIndex={datumProps.tabIndex}
                role={interactive ? actionable ? 'button' : 'img' : undefined}
                aria-label={interactive ? markLabel : accessibleLabel}
                aria-describedby={
                  datumProps['data-active'] && tooltip !== undefined && tooltip !== null && tooltip !== false
                    ? tooltipId
                    : undefined
                }
              >
                {!interactive ? <title>{accessibleLabel}</title> : null}
                {interactive ? (
                  <>
                    <rect
                      data-part="interaction-target"
                      x={hitX}
                      y={hitY}
                      width={hitWidth}
                      height={hitHeight}
                      pointerEvents="all"
                      aria-hidden="true"
                    />
                    <rect
                      data-part="interaction-halo"
                      x={hitX}
                      y={hitY}
                      width={hitWidth}
                      height={hitHeight}
                      rx={4}
                      aria-hidden="true"
                    />
                  </>
                ) : null}
                <rect
                  data-part="bar"
                  data-series="histogram"
                  x={bin.x}
                  y={bin.y}
                  width={bin.width}
                  height={bin.height}
                  fill={color}
                  fillOpacity={0.85}
                  aria-hidden={interactive ? true : undefined}
                />
                {showLabels ? (
                  <text
                    data-part="value-label"
                    x={bin.labelX}
                    y={bin.labelY}
                    textAnchor="middle"
                  >
                    {density ? bin.densityValue.toFixed(2) : bin.count}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>

        {geometry.cumulative ? (
          <g data-part="cumulative">
            <g data-part="axis" data-axis="cumulative" aria-hidden="true">
              {geometry.cumulative.axisTicks.map((tick) => (
                <text
                  key={tick.id}
                  data-part="axis-tick-label"
                  data-axis="cumulative"
                  x={tick.x + 6}
                  y={tick.y}
                  textAnchor="start"
                  dominantBaseline="middle"
                  fill={cumulativeColor}
                >
                  {tick.label}
                </text>
              ))}
            </g>
            <path
              data-part="cumulative-line"
              d={geometry.cumulative.path}
              fill="none"
              stroke={cumulativeColor}
              strokeWidth={2}
              aria-hidden="true"
            />
            {geometry.cumulative.points.map((point, index) => (
              <circle
                key={`cumulative-${index}`}
                data-part="cumulative-point"
                data-series="cumulative"
                cx={point.cx}
                cy={point.cy}
                r={3}
                fill={cumulativeColor}
                aria-hidden="true"
              />
            ))}
          </g>
        ) : null}

        {xLabel ? (
          <text
            data-part="axis-label"
            data-axis="x"
            x={geometry.width / 2}
            y={geometry.height - 4}
            textAnchor="middle"
            aria-hidden="true"
          >
            {xLabel}
          </text>
        ) : null}
        {yLabel ? (
          <text
            data-part="axis-label"
            data-axis="y"
            transform="rotate(-90)"
            x={-geometry.height / 2}
            y={14}
            textAnchor="middle"
            aria-hidden="true"
          >
            {yLabel}
          </text>
        ) : null}
      </g>
    </ChartRendererSurface>
  );
}
