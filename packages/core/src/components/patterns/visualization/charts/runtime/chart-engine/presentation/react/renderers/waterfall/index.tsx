'use client';

import { useId, useMemo, type CSSProperties } from 'react';

import { useChartDimensions } from '../../../../runtime/dimensions';
import type { ChartInteraction } from '../../../../foundation/interaction';
import { useChartInteraction } from '../../../../runtime/interaction/controller';
import {
  buildSvgWaterfallGeometry,
  type ChartGeometryInsets,
  type SvgWaterfallDatum,
  type SvgWaterfallType,
} from '../../../../foundation/renderers/geometry';
import { ChartRendererSurface } from '..';

/** Tooltip/keyboard datum exposed to the family for each rendered bar. */
export interface SvgWaterfallBarDatum {
  readonly label: string;
  readonly value: number;
  readonly type: SvgWaterfallType;
  /** Running total before this bar. */
  readonly start: number;
  /** Running total after this bar. */
  readonly end: number;
  readonly paint: string;
}

export interface SvgWaterfallRendererProps {
  readonly data: readonly SvgWaterfallDatum[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly ariaDescribedBy?: string;
  readonly width?: number;
  readonly height?: number;
  /** Recompute geometry from the container width. Defaults to true. */
  readonly responsive?: boolean;
  readonly orientation?: 'vertical' | 'horizontal';
  /** Increase-bar paint (semantic status token, not the categorical palette). */
  readonly increaseColor?: string;
  readonly decreaseColor?: string;
  readonly totalColor?: string;
  readonly showConnectors?: boolean;
  readonly showValues?: boolean;
  readonly formatValue?: (value: number) => string;
  readonly barRadius?: number;
  readonly insets?: ChartGeometryInsets;
  readonly maxTicks?: number;
  /** Explore/select interaction contract wired by the owning family. */
  readonly interaction?: ChartInteraction<SvgWaterfallBarDatum>;
  readonly className?: string;
  readonly style?: CSSProperties;
}

const DEFAULT_INCREASE_PAINT = 'var(--ds-color-success)';
const DEFAULT_DECREASE_PAINT = 'var(--ds-color-error)';
const DEFAULT_TOTAL_PAINT = 'var(--ds-color-primary)';

/**
 * React-owned semantic SVG waterfall renderer. Bars reuse the shared bar
 * anatomy; each bar's tone is a semantic status token driven by its
 * increase/decrease/total type rather than the categorical palette (the
 * sanctioned exception to the categories-never-borrow-status law). The running
 * total math lives in the pure geometry builder.
 */
export function SvgWaterfallRenderer({
  data,
  ariaLabel,
  ariaDescription,
  ariaDescribedBy,
  width = 640,
  height = 360,
  responsive = true,
  orientation = 'vertical',
  increaseColor = DEFAULT_INCREASE_PAINT,
  decreaseColor = DEFAULT_DECREASE_PAINT,
  totalColor = DEFAULT_TOTAL_PAINT,
  showConnectors = true,
  showValues = true,
  formatValue,
  barRadius = 2,
  insets,
  maxTicks,
  interaction,
  className,
  style,
}: SvgWaterfallRendererProps): React.ReactElement {
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive ? dimensions.width : width;
  const geometry = useMemo(
    () => buildSvgWaterfallGeometry({
      data,
      width: geometryWidth,
      height,
      orientation,
      insets,
      maxTicks,
    }),
    [data, geometryWidth, height, insets, maxTicks, orientation],
  );
  const radius = Number.isFinite(barRadius) ? Math.max(0, barRadius) : 2;
  const formatVal = (value: number): string => (formatValue ? formatValue(value) : String(value));
  const paintForType = (type: SvgWaterfallType): string => {
    if (type === 'increase') return increaseColor;
    if (type === 'decrease') return decreaseColor;
    return totalColor;
  };
  const interactionItems = useMemo(
    () => geometry.bars.map((bar) => ({
      key: bar.key,
      label: `${bar.label}: ${bar.value} (${bar.type})`,
      datum: {
        label: bar.label,
        value: bar.value,
        type: bar.type,
        start: bar.start,
        end: bar.end,
        paint: paintForType(bar.type),
      },
      x: orientation === 'vertical' ? bar.x + bar.width / 2 : bar.x + bar.width,
      y: orientation === 'vertical' ? bar.y : bar.y + bar.height / 2,
    })),
    // paintForType is pure in the color props; listing them keeps the memo
    // honest without depending on the inline arrow identity.
    [decreaseColor, geometry.bars, increaseColor, orientation, totalColor],
  );
  const interactionState = useChartInteraction({
    items: interactionItems,
    interaction,
    navigation: orientation === 'vertical' ? 'horizontal' : 'vertical',
  });
  const tooltipId = useId();
  const activeBar = interactionState.activeKey
    ? geometry.bars.find((bar) => bar.key === interactionState.activeKey)
    : undefined;
  const tooltip = interactionState.activeDatum && interaction && interaction.mode !== 'static'
    ? interaction.renderTooltip?.(interactionState.activeDatum)
    : undefined;

  return (
    <ChartRendererSurface
      rendererId="svg.waterfall"
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      ariaDescribedBy={ariaDescribedBy}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.bars.length === 0}
      className={['ds-chart-renderer-waterfall', 'ds-chart-renderer-bar', className].filter(Boolean).join(' ')}
      style={style}
      ownerRef={containerRef}
      interactionMode={interactionState.mode}
      interactionRootProps={interactionState.rootProps}
      tooltip={tooltip}
      tooltipId={tooltipId}
      tooltipKey={interactionState.activeKey ?? undefined}
      tooltipAnchor={activeBar ? {
        x: orientation === 'vertical' ? activeBar.x + activeBar.width / 2 : activeBar.x + activeBar.width,
        y: orientation === 'vertical' ? activeBar.y : activeBar.y + activeBar.height / 2,
      } : undefined}
    >
      <g data-part="plot-area" data-orientation={orientation}>
      <g data-part="grid" aria-hidden="true">
        {geometry.valueTicks.map((tick) => (
          <line
            key={tick.id}
            data-part="grid-line"
            x1={orientation === 'vertical' ? geometry.plot.x : tick.x}
            x2={orientation === 'vertical' ? geometry.plot.x + geometry.plot.width : tick.x}
            y1={orientation === 'vertical' ? tick.y : geometry.plot.y}
            y2={orientation === 'vertical' ? tick.y : geometry.plot.y + geometry.plot.height}
          />
        ))}
      </g>

      <g data-part="axis" data-axis="category" aria-hidden="true">
        {geometry.categoryTicks.map((tick) => (
          <text
            key={tick.id}
            data-part="axis-tick-label"
            data-axis="category"
            x={orientation === 'vertical' ? tick.x : tick.x - 8}
            y={orientation === 'vertical' ? tick.y + 20 : tick.y}
            textAnchor={orientation === 'vertical' ? 'middle' : 'end'}
            dominantBaseline={orientation === 'vertical' ? undefined : 'middle'}
          >
            {tick.label}
          </text>
        ))}
      </g>

      <g data-part="axis" data-axis="value" aria-hidden="true">
        {geometry.valueTicks.map((tick) => (
          <text
            key={tick.id}
            data-part="axis-tick-label"
            data-axis="value"
            x={orientation === 'vertical' ? tick.x - 8 : tick.x}
            y={orientation === 'vertical' ? tick.y : tick.y + 20}
            textAnchor={orientation === 'vertical' ? 'end' : 'middle'}
            dominantBaseline={orientation === 'vertical' ? 'middle' : undefined}
          >
            {tick.label}
          </text>
        ))}
      </g>

      {showConnectors ? (
        <g data-part="connectors" aria-hidden="true">
          {geometry.connectors.map((connector) => (
            <line
              key={connector.id}
              data-part="connector"
              x1={connector.x1}
              y1={connector.y1}
              x2={connector.x2}
              y2={connector.y2}
              stroke="var(--ds-chart-connector-color, var(--ds-color-border))"
              strokeWidth={1}
              strokeDasharray="4,3"
            />
          ))}
        </g>
      ) : null}

      <g data-part="marks">
        {geometry.bars.map((bar) => {
          const accessibleLabel = `${bar.label}: ${formatVal(bar.value)} (${bar.type})`;
          const datumProps = interactionState.getDatumProps(bar.key);
          const interactive = interactionState.mode !== 'static';
          const actionable = interactionState.mode === 'select' || interactionState.mode === 'drill';
          const markLabel = actionable && interaction && interaction.mode !== 'static'
            ? `${accessibleLabel}. ${interaction.actionLabel}`
            : accessibleLabel;
          // The 24px hit floor keeps zero-height deltas and thin totals
          // keyboard/pointer reachable without distorting the painted bar.
          const hitWidth = Math.max(24, bar.width);
          const hitHeight = Math.max(24, bar.height);
          const hitX = bar.x - (hitWidth - bar.width) / 2;
          const hitY = bar.y - (hitHeight - bar.height) / 2;
          return (
            <g
              key={bar.key}
              data-part="bar-mark"
              data-datum-id={bar.key}
              data-status={bar.type}
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
                    rx={Math.max(radius, 4)}
                    aria-hidden="true"
                  />
                </>
              ) : null}
              <rect
                data-part="bar"
                data-status={bar.type}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx={radius}
                ry={radius}
                fill={paintForType(bar.type)}
                aria-hidden={interactive ? true : undefined}
              />
              {showValues ? (
                <text
                  data-part="value-label"
                  x={bar.valueX}
                  y={bar.valueY}
                  textAnchor={bar.valueAnchor}
                  dominantBaseline={bar.valueBaseline}
                >
                  {formatVal(bar.value)}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>
      </g>
    </ChartRendererSurface>
  );
}
