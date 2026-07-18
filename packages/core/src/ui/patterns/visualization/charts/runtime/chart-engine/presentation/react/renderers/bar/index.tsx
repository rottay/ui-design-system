'use client';

import { useId, useMemo, type CSSProperties } from 'react';

import { useResolvedChartGrammar } from '../../../../runtime/grammar';
import { ChartInsightLayer } from '../../../../runtime/insight/layer';
import type { ChartInteraction } from '../../../../foundation/interaction';
import type { ChartInsightSpec } from '@ui/patterns/visualization/charts/runtime/chart-engine/foundation/spec';
import { useChartInteraction } from '../../../../runtime/interaction/controller';
import { useChartDimensions } from '../../../../runtime/dimensions';
import {
  buildSvgBarGeometry,
  buildSvgBarSeriesGeometry,
  type ChartGeometryInsets,
  type SvgBarDatum,
  type SvgBarGeometryDatum,
  type SvgBarLayout,
  type SvgBarSeriesGeometryDatum,
  type SvgBarSeriesInput,
} from '../../../../foundation/renderers/geometry';
import { ChartRendererSurface } from '..';

type ChartPaintStyle = CSSProperties & {
  '--ds-chart-mark-color'?: string;
};

/** A resolved bar mark: single-series data or a series-layout bar share this shape. */
type BarMark = SvgBarGeometryDatum & Partial<Pick<SvgBarSeriesGeometryDatum, 'seriesIndex' | 'seriesLabel' | 'isTopOfStack'>>;

export interface SvgBarRendererProps {
  /** Single-series data. Ignored when {@link series} is provided. */
  readonly data?: readonly SvgBarDatum[];
  /** Multi-series data for grouped or stacked layouts. */
  readonly series?: readonly SvgBarSeriesInput[];
  /** Layout used when {@link series} is provided. Defaults to grouped. */
  readonly layout?: SvgBarLayout;
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  /** ID of family- or app-owned extended description content. */
  readonly ariaDescribedBy?: string;
  readonly width?: number;
  readonly height?: number;
  /** Recompute geometry from the container width. Defaults to true. */
  readonly responsive?: boolean;
  readonly orientation?: 'vertical' | 'horizontal';
  readonly insets?: ChartGeometryInsets;
  readonly bandPadding?: number;
  readonly groupPadding?: number;
  readonly maxTicks?: number;
  readonly barRadius?: number;
  readonly showValues?: boolean;
  /** Optional axis captions rendered outside the plot rect. */
  readonly xLabel?: string;
  readonly yLabel?: string;
  /** Static, app-authored annotation specs. */
  readonly insights?: readonly ChartInsightSpec[];
  readonly interaction?: ChartInteraction<SvgBarDatum>;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * React-owned semantic SVG bar renderer supporting single-series bars plus the
 * multi-series grouped and stacked modes in both orientations. D3 only
 * calculates geometry; every visible node stays under React ownership.
 */
export function SvgBarRenderer({
  data,
  series,
  layout = 'grouped',
  ariaLabel,
  ariaDescription,
  ariaDescribedBy,
  width = 640,
  height = 360,
  responsive = true,
  orientation = 'vertical',
  insets,
  bandPadding,
  groupPadding,
  maxTicks,
  barRadius,
  showValues = false,
  xLabel,
  yLabel,
  insights,
  interaction,
  className,
  style,
}: SvgBarRendererProps): React.ReactElement {
  const grammar = useResolvedChartGrammar();
  const isSeries = series !== undefined && series.length > 0;
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive ? dimensions.width : width;
  const geometry = useMemo(
    () => (isSeries
      ? buildSvgBarSeriesGeometry({
        series: series ?? [],
        width: geometryWidth,
        height,
        orientation,
        layout,
        insets,
        bandPadding,
        groupPadding,
        maxTicks,
      })
      : buildSvgBarGeometry({
        data: data ?? [],
        width: geometryWidth,
        height,
        orientation,
        insets,
        bandPadding,
        maxTicks,
      })),
    [bandPadding, data, geometryWidth, groupPadding, height, insets, isSeries, layout, maxTicks, orientation, series],
  );
  const bars = geometry.bars as readonly BarMark[];
  const interactionItems = useMemo(
    () => bars.map((bar) => {
      const label = bar.ariaLabel
        ?? (bar.seriesLabel
          ? `${bar.seriesLabel}, ${bar.category}: ${bar.valueLabel ?? bar.value}`
          : `${bar.category}: ${bar.valueLabel ?? bar.value}`);
      const datum: SvgBarDatum = {
        id: bar.id,
        category: bar.category,
        value: bar.value,
        ...(bar.valueLabel === undefined ? {} : { valueLabel: bar.valueLabel }),
        ...(bar.ariaLabel === undefined ? {} : { ariaLabel: bar.ariaLabel }),
        ...(bar.color === undefined ? {} : { color: bar.color }),
        ...(bar.series === undefined ? {} : { series: bar.series }),
      };
      return {
        key: bar.id,
        label,
        datum,
        x: bar.x + bar.width / 2,
        y: bar.y + bar.height / 2,
      };
    }),
    [bars],
  );
  const insightCoordinates = useMemo(() => {
    const valueAxis = geometry.orientation === 'vertical' ? 'y' : 'x';
    const categoryAxis = geometry.orientation === 'vertical' ? 'x' : 'y';
    const valueAnchors = [
      { value: 0, position: geometry.baseline },
      ...bars.map((bar) => ({
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
      categoricalEventAnchors: bars.map((bar) => ({
        key: bar.category,
        position: geometry.orientation === 'vertical'
          ? bar.x + bar.width / 2
          : bar.y + bar.height / 2,
      })),
      datumAnchors: bars.map((bar) => ({
        id: bar.id,
        x: geometry.orientation === 'vertical'
          ? bar.x + bar.width / 2
          : bar.value >= 0 ? bar.x + bar.width : bar.x,
        y: geometry.orientation === 'vertical'
          ? bar.value >= 0 ? bar.y : bar.y + bar.height
          : bar.y + bar.height / 2,
      })),
    } as const;
  }, [bars, geometry.baseline, geometry.orientation]);
  const interactionState = useChartInteraction({
    items: interactionItems,
    interaction,
    navigation: orientation === 'vertical' ? 'horizontal' : 'vertical',
  });
  const tooltipId = useId();
  const activeBar = interactionState.activeKey
    ? bars.find((bar) => bar.id === interactionState.activeKey)
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
      {...(ariaDescribedBy === undefined ? {} : { ariaDescribedBy })}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={bars.length === 0}
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
        {bars.map((bar, barIndex) => {
          const paintStyle: ChartPaintStyle = {
            '--ds-chart-mark-color': bar.color ?? 'var(--ds-chart-paint-1, var(--ds-color-primary))',
          };
          const accessibleLabel = bar.ariaLabel
            ?? (bar.seriesLabel
              ? `${bar.seriesLabel}, ${bar.category}: ${bar.valueLabel ?? bar.value}`
              : `${bar.category}: ${bar.valueLabel ?? bar.value}`);
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
          const cornerRadius = bar.isTopOfStack === false ? 0 : radius;

          return (
            <g
              key={bar.id}
              data-part="bar-mark"
              data-datum-id={bar.id}
              data-mark-index={barIndex % 5}
              data-series-index={bar.seriesIndex === undefined ? undefined : bar.seriesIndex % 10}
              data-layout={isSeries ? layout : undefined}
              data-orientation={orientation}
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
                    rx={Math.max(cornerRadius, 4)}
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
                rx={cornerRadius}
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
      <ChartInsightLayer
        insights={insights}
        plot={geometry.plot}
        {...insightCoordinates}
      />
    </ChartRendererSurface>
  );
}
