'use client';

import { useId, useMemo, type CSSProperties } from 'react';

import { useResolvedChartGrammar } from '../grammar';
import { ChartInsightLayer } from '../insight/InsightLayer';
import type { ChartInteraction } from '../interaction/ChartInteraction';
import type { ChartInsightSpec } from '../spec';
import { useChartInteraction } from '../interaction/useChartInteraction';
import { useChartDimensions } from '../../hooks/use-chart-dimensions';
import {
  buildSvgBarGeometry,
  type ChartGeometryInsets,
  type SvgBarDatum,
} from './ChartGeometry';
import { ChartRendererSurface } from './ChartRendererSurface';

type ChartPaintStyle = CSSProperties & {
  '--ds-chart-mark-color'?: string;
};

export interface SvgBarRendererProps {
  readonly data: readonly SvgBarDatum[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly width?: number;
  readonly height?: number;
  /** Recompute geometry from the container width. Defaults to true. */
  readonly responsive?: boolean;
  readonly orientation?: 'vertical' | 'horizontal';
  readonly insets?: ChartGeometryInsets;
  readonly bandPadding?: number;
  readonly maxTicks?: number;
  readonly barRadius?: number;
  readonly showValues?: boolean;
  /** Static, app-authored annotation specs. */
  readonly insights?: readonly ChartInsightSpec[];
  readonly interaction?: ChartInteraction<SvgBarDatum>;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/** React-owned semantic SVG bar renderer. D3 only calculates geometry. */
export function SvgBarRenderer({
  data,
  ariaLabel,
  ariaDescription,
  width = 640,
  height = 360,
  responsive = true,
  orientation = 'vertical',
  insets,
  bandPadding,
  maxTicks,
  barRadius,
  showValues = false,
  insights,
  interaction,
  className,
  style,
}: SvgBarRendererProps): React.ReactElement {
  const grammar = useResolvedChartGrammar();
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive ? dimensions.width : width;
  const geometry = useMemo(
    () => buildSvgBarGeometry({
      data,
      width: geometryWidth,
      height,
      orientation,
      insets,
      bandPadding,
      maxTicks,
    }),
    [bandPadding, data, geometryWidth, height, insets, maxTicks, orientation],
  );
  const interactionItems = useMemo(
    () => {
      const sourceById = new Map(data.map((datum) => [datum.id, datum]));
      return geometry.bars.map((bar) => {
        const label = bar.ariaLabel ?? `${bar.category}: ${bar.valueLabel ?? bar.value}`;
        const datum: SvgBarDatum = sourceById.get(bar.id) ?? bar;
        return {
          key: bar.id,
          label,
          datum,
          x: bar.x + bar.width / 2,
          y: bar.y + bar.height / 2,
        };
      });
    },
    [data, geometry.bars],
  );
  const insightCoordinates = useMemo(() => {
    const valueAxis = geometry.orientation === 'vertical' ? 'y' : 'x';
    const categoryAxis = geometry.orientation === 'vertical' ? 'x' : 'y';
    const valueAnchors = [
      { value: 0, position: geometry.baseline },
      ...geometry.bars.map((bar) => ({
        value: bar.value,
        position: geometry.orientation === 'vertical'
          ? bar.value >= 0 ? bar.y : bar.y + bar.height
          : bar.value >= 0 ? bar.x + bar.width : bar.x,
      })),
    ];
    return {
      valueAxis,
      valueAnchors,
      numericEventAxis: valueAxis,
      numericEventAnchors: valueAnchors,
      categoricalEventAxis: categoryAxis,
      categoricalEventAnchors: geometry.bars.map((bar) => ({
        key: bar.category,
        position: geometry.orientation === 'vertical'
          ? bar.x + bar.width / 2
          : bar.y + bar.height / 2,
      })),
      datumAnchors: geometry.bars.map((bar) => ({
        id: bar.id,
        x: geometry.orientation === 'vertical'
          ? bar.x + bar.width / 2
          : bar.value >= 0 ? bar.x + bar.width : bar.x,
        y: geometry.orientation === 'vertical'
          ? bar.value >= 0 ? bar.y : bar.y + bar.height
          : bar.y + bar.height / 2,
      })),
    } as const;
  }, [geometry]);
  const interactionState = useChartInteraction({
    items: interactionItems,
    interaction,
    navigation: orientation === 'vertical' ? 'horizontal' : 'vertical',
  });
  const tooltipId = useId();
  const activeBar = interactionState.activeKey
    ? geometry.bars.find((bar) => bar.id === interactionState.activeKey)
    : undefined;
  const tooltip = interactionState.activeDatum && interaction && interaction.mode !== 'static'
    ? interaction.renderTooltip?.(interactionState.activeDatum)
    : undefined;
  const grammarRadius = grammar.marks === 'human-rounded'
    ? 8
    : grammar.marks === 'tactile-temporal'
      ? 5
      : grammar.marks === 'technical-sharp'
        ? 0
        : 4;
  const radius = barRadius === undefined
    ? grammarRadius
    : Number.isFinite(barRadius)
      ? Math.max(0, barRadius)
      : grammarRadius;

  return (
    <ChartRendererSurface
      rendererId="svg.bar"
      ariaLabel={ariaLabel}
      ariaDescription={ariaDescription}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.bars.length === 0}
      className={['ds-chart-renderer-bar', className].filter(Boolean).join(' ')}
      style={style}
      ownerRef={containerRef}
      interactionMode={interactionState.mode}
      interactionRootProps={interactionState.rootProps}
      tooltip={tooltip}
      tooltipId={tooltipId}
      tooltipKey={interactionState.activeKey ?? undefined}
      tooltipAnchor={activeBar ? {
        x: activeBar.x + activeBar.width / 2,
        y: activeBar.y,
      } : undefined}
    >
      <g data-part="grid" aria-hidden="true">
        {geometry.valueTicks.map((tick) => (
          <line
            key={tick.id}
            data-part="grid-line"
            x1={geometry.orientation === 'vertical' ? geometry.plot.x : tick.x}
            x2={geometry.orientation === 'vertical' ? geometry.plot.x + geometry.plot.width : tick.x}
            y1={geometry.orientation === 'vertical' ? tick.y : geometry.plot.y}
            y2={geometry.orientation === 'vertical' ? tick.y : geometry.plot.y + geometry.plot.height}
          />
        ))}
      </g>

      <g data-part="axis" data-axis="category" aria-hidden="true">
        {geometry.categoryTicks.map((tick) => (
          <text
            key={tick.id}
            data-part="axis-tick-label"
            data-axis="category"
            x={geometry.orientation === 'vertical' ? tick.x : tick.x - 8}
            y={geometry.orientation === 'vertical' ? tick.y + 20 : tick.y}
            textAnchor={geometry.orientation === 'vertical' ? 'middle' : 'end'}
            dominantBaseline={geometry.orientation === 'vertical' ? undefined : 'middle'}
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
            x={geometry.orientation === 'vertical' ? tick.x - 8 : tick.x}
            y={geometry.orientation === 'vertical' ? tick.y : tick.y + 20}
            textAnchor={geometry.orientation === 'vertical' ? 'end' : 'middle'}
            dominantBaseline={geometry.orientation === 'vertical' ? 'middle' : undefined}
          >
            {tick.label}
          </text>
        ))}
      </g>

      <line
        data-part="baseline"
        aria-hidden="true"
        x1={geometry.orientation === 'vertical' ? geometry.plot.x : geometry.baseline}
        x2={geometry.orientation === 'vertical' ? geometry.plot.x + geometry.plot.width : geometry.baseline}
        y1={geometry.orientation === 'vertical' ? geometry.baseline : geometry.plot.y}
        y2={geometry.orientation === 'vertical' ? geometry.baseline : geometry.plot.y + geometry.plot.height}
      />

      <g data-part="marks">
        {geometry.bars.map((bar, barIndex) => {
          const paintStyle: ChartPaintStyle = {
            '--ds-chart-mark-color': bar.color ?? 'var(--ds-chart-series-1, var(--ds-color-primary))',
          };
          const accessibleLabel = bar.ariaLabel ?? `${bar.category}: ${bar.valueLabel ?? bar.value}`;
          const datumProps = interactionState.getDatumProps(bar.id);
          const interactive = interactionState.mode !== 'static';
          const actionable = interactionState.mode === 'select' || interactionState.mode === 'drill';
          const markLabel = actionable && interaction && interaction.mode !== 'static'
            ? `${accessibleLabel}. ${interaction.actionLabel}`
            : accessibleLabel;
          const hitWidth = Math.max(24, bar.width);
          const hitHeight = Math.max(24, bar.height);
          const hitX = bar.x - (hitWidth - bar.width) / 2;
          const hitY = bar.y - (hitHeight - bar.height) / 2;

          return (
            <g
              key={bar.id}
              data-part="bar-mark"
              data-datum-id={bar.id}
              data-mark-index={barIndex % 5}
              data-chart-datum-key={datumProps['data-chart-datum-key']}
              data-active={datumProps['data-active']}
              data-focused={datumProps['data-focused']}
              data-hovered={datumProps['data-hovered']}
              data-pinned={datumProps['data-pinned']}
              tabIndex={datumProps.tabIndex}
              role={interactive ? actionable ? 'button' : 'img' : undefined}
              aria-label={markLabel}
              aria-describedby={datumProps['data-active'] && tooltip !== undefined && tooltip !== null && tooltip !== false ? tooltipId : undefined}
              style={paintStyle}
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
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx={radius}
              />
              {showValues ? (
                <text
                  data-part="value-label"
                  x={bar.valueX}
                  y={bar.valueY}
                  textAnchor={orientation === 'vertical' ? 'middle' : bar.value >= 0 ? 'start' : 'end'}
                  dominantBaseline={orientation === 'horizontal' ? 'middle' : undefined}
                >
                  {bar.valueLabel ?? bar.value}
                </text>
              ) : (
                <text
                  data-part="forced-color-value-label"
                  display="none"
                  x={bar.valueX}
                  y={bar.valueY}
                  textAnchor={orientation === 'vertical' ? 'middle' : bar.value >= 0 ? 'start' : 'end'}
                  dominantBaseline={orientation === 'horizontal' ? 'middle' : undefined}
                  aria-hidden="true"
                >
                  {bar.valueLabel ?? bar.value}
                </text>
              )}
            </g>
          );
        })}
      </g>
      <ChartInsightLayer
        insights={insights}
        plot={geometry.plot}
        {...insightCoordinates}
      />
    </ChartRendererSurface>
  );
}
