'use client';

import { useId, useMemo, type CSSProperties } from 'react';

import { useReducedMotion } from '@/graphics/motion/react/runtime';
import { useResolvedChartPersonality } from '@/infrastructure/runtime/personality';
import type { ChartInteraction } from '../../../../foundation/interaction';
import { useChartInteraction } from '../../../../runtime/interaction/controller';
import { useChartDimensions } from '../../../../runtime/dimensions';
import { useResolvedChartGrammar } from '../../../../runtime/grammar';
import {
  buildSvgGaugeGeometry,
  type SvgGaugeSegment,
} from '../../../../foundation/renderers/geometry';
import { ChartRendererSurface } from '..';

export interface SvgGaugeRendererProps {
  readonly value: number;
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly ariaDescribedBy?: string;
  readonly width?: number | string;
  readonly height?: number;
  /** Recompute radial geometry from the container width. Defaults to true. */
  readonly responsive?: boolean;
  /** Uses the resolved tenant personality unless explicitly overridden. */
  readonly animate?: boolean;
  readonly min?: number;
  readonly max?: number;
  readonly segments?: readonly SvgGaugeSegment[];
  readonly showValue?: boolean;
  readonly formatValue?: (value: number) => string;
  readonly label?: string;
  readonly startAngle?: number;
  readonly endAngle?: number;
  readonly innerRadius?: number;
  readonly showNeedle?: boolean;
  readonly needleColor?: string;
  readonly trackCornerRadius?: number;
  readonly segmentCornerRadius?: number;
  /** Native segment labels retained for non-interactive compatibility views. */
  readonly showSegmentTitles?: boolean;
  readonly interaction?: ChartInteraction<SvgGaugeSegment>;
  readonly className?: string;
  readonly style?: CSSProperties;
}

function grammarGaugeCornerRadius(marks: string): number {
  if (marks === 'human-rounded') return 5;
  if (marks === 'tactile-temporal') return 2;
  if (marks === 'technical-sharp') return 0;
  return 1;
}

function segmentLabel(segment: SvgGaugeSegment): string {
  const range = `${segment.from} to ${segment.to}`;
  return segment.label ? `${segment.label}: ${range}` : range;
}

/**
 * React-owned radial gauge. D3 is constrained to the immutable geometry
 * builder, while SVG marks, accessibility, and interactions remain React-owned.
 */
export function SvgGaugeRenderer({
  value,
  ariaLabel,
  ariaDescription,
  ariaDescribedBy,
  width = 400,
  height = 300,
  responsive = true,
  animate,
  min,
  max,
  segments,
  showValue = true,
  formatValue,
  label,
  startAngle,
  endAngle,
  innerRadius,
  showNeedle = true,
  needleColor = 'var(--ds-color-text-primary)',
  trackCornerRadius,
  segmentCornerRadius,
  showSegmentTitles = true,
  interaction,
  className,
  style,
}: SvgGaugeRendererProps): React.ReactElement {
  const grammar = useResolvedChartGrammar();
  const chartPersonality = useResolvedChartPersonality();
  const reducedMotion = useReducedMotion();
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive
    ? dimensions.width
    : typeof width === 'number'
      ? width
      : 400;
  const defaultCornerRadius = grammarGaugeCornerRadius(grammar.marks);
  const animationDuration = Number.isFinite(chartPersonality.mountDuration)
    ? Math.max(0, chartPersonality.mountDuration)
    : 0;
  const shouldAnimate = !reducedMotion
    && (animate ?? chartPersonality.animateOnMount)
    && animationDuration > 0;
  const geometry = useMemo(
    () => buildSvgGaugeGeometry({
      value,
      width: geometryWidth,
      height,
      min,
      max,
      segments,
      startAngle,
      endAngle,
      innerRadiusRatio: innerRadius,
      trackCornerRadius: trackCornerRadius ?? Math.max(2, defaultCornerRadius),
      segmentCornerRadius: segmentCornerRadius ?? defaultCornerRadius,
    }),
    [
      defaultCornerRadius,
      endAngle,
      geometryWidth,
      height,
      innerRadius,
      max,
      min,
      segmentCornerRadius,
      segments,
      startAngle,
      trackCornerRadius,
      value,
    ],
  );
  const displayValue = useMemo(
    () => formatValue ? formatValue(geometry.value) : String(geometry.value),
    [formatValue, geometry.value],
  );
  const interactionItems = useMemo(
    () => geometry.segments.map((segment) => ({
      key: segment.id,
      label: segmentLabel(segment),
      datum: {
        from: segment.from,
        to: segment.to,
        ...(segment.color === undefined ? {} : { color: segment.color }),
        ...(segment.label === undefined ? {} : { label: segment.label }),
      },
      x: segment.centerX,
      y: segment.centerY,
    })),
    [geometry.segments],
  );
  const interactionState = useChartInteraction({
    items: interactionItems,
    interaction,
    navigation: 'horizontal',
  });
  const tooltipId = useId();
  const activeSegment = interactionState.activeKey
    ? geometry.segments.find((segment) => segment.id === interactionState.activeKey)
    : undefined;
  const tooltip = interactionState.activeDatum && interaction && interaction.mode !== 'static'
    ? interaction.renderTooltip?.(interactionState.activeDatum)
    : undefined;
  const surfaceStyle: CSSProperties = {
    ...(typeof width === 'string' ? { width } : {}),
    ...style,
  };
  const description = ariaDescription
    ?? `Gauge chart showing ${displayValue}. Range: ${geometry.rangeMin} to ${geometry.rangeMax}.`;

  return (
    <ChartRendererSurface
      rendererId="svg.gauge"
      ariaLabel={ariaLabel}
      ariaDescription={description}
      ariaDescribedBy={ariaDescribedBy}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.segments.length === 0}
      className={['ds-chart-renderer-gauge', className].filter(Boolean).join(' ')}
      style={surfaceStyle}
      ownerRef={containerRef}
      interactionMode={interactionState.mode}
      interactionRootProps={interactionState.rootProps}
      tooltip={tooltip}
      tooltipId={tooltipId}
      tooltipKey={interactionState.activeKey ?? undefined}
      tooltipAnchor={activeSegment ? {
        x: activeSegment.centerX,
        y: activeSegment.centerY,
      } : undefined}
    >
      <g
        data-part="plot-area"
        data-variant="gauge"
        data-start-angle={geometry.startAngle}
        data-end-angle={geometry.endAngle}
        transform={`translate(${geometry.centerX},${geometry.centerY})`}
      >
        <g data-part="gauge-motion" data-animate={shouldAnimate ? 'true' : 'false'}>
          <path
            data-part="track"
            d={geometry.trackPath}
            opacity={0.4}
            aria-hidden="true"
          >
            {shouldAnimate ? (
              <animate attributeName="opacity" from="0" to="0.4" dur={`${animationDuration}ms`} fill="freeze" />
            ) : null}
          </path>
          {geometry.segments.map((segment, index) => {
            const datumProps = interactionState.getDatumProps(segment.id);
            const interactive = interactionState.mode !== 'static';
            const actionable = interactionState.mode === 'select' || interactionState.mode === 'drill';
            const accessibleLabel = segmentLabel(segment);
            const markLabel = actionable && interaction && interaction.mode !== 'static'
              ? `${accessibleLabel}. ${interaction.actionLabel}`
              : accessibleLabel;

            return (
              <g
                key={segment.id}
                data-part="gauge-segment-mark"
                data-datum-id={segment.id}
                data-mark-index={index % 5}
                data-chart-datum-key={datumProps['data-chart-datum-key']}
                data-active={datumProps['data-active']}
                data-focused={datumProps['data-focused']}
                data-hovered={datumProps['data-hovered']}
                data-pinned={datumProps['data-pinned']}
                tabIndex={datumProps.tabIndex}
                role={interactive ? actionable ? 'button' : 'img' : undefined}
                aria-label={interactive ? markLabel : undefined}
                aria-describedby={
                  datumProps['data-active'] && tooltip !== undefined && tooltip !== null && tooltip !== false
                    ? tooltipId
                    : undefined
                }
              >
                {shouldAnimate ? (
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    begin={`${Math.round(index * animationDuration * 0.12)}ms`}
                    dur={`${Math.round(animationDuration * 0.6)}ms`}
                    fill="freeze"
                  />
                ) : null}
                {!interactive && showSegmentTitles && segment.label ? (
                  <title>{segmentLabel(segment)}</title>
                ) : null}
                {interactive ? (
                  <>
                    <path
                      data-part="interaction-target"
                      d={segment.path}
                      strokeWidth={12}
                      pointerEvents="all"
                      aria-hidden="true"
                    />
                    <path
                      data-part="interaction-halo"
                      d={segment.path}
                      aria-hidden="true"
                    />
                  </>
                ) : null}
                <path
                  data-part="segment"
                  data-state={segment.active ? 'active' : 'inactive'}
                  data-color-source={segment.colorSource}
                  data-tone={segment.tone}
                  d={segment.path}
                  fill={segment.colorSource === 'custom' ? segment.color : undefined}
                  opacity={0.85}
                  aria-hidden={interactive ? true : undefined}
                />
              </g>
            );
          })}
          {showNeedle ? (
            <g
              data-part="needle"
              transform={`rotate(${geometry.needleRotation})`}
              aria-hidden="true"
            >
              {shouldAnimate ? (
                <animate
                  attributeName="opacity"
                  from="0"
                  to="1"
                  begin={`${Math.round(animationDuration * 0.3)}ms`}
                  dur={`${Math.round(animationDuration * 0.7)}ms`}
                  fill="freeze"
                />
              ) : null}
              <path
                data-part="needle-mark"
                d={geometry.needlePath}
                fill={needleColor}
                stroke={needleColor}
                strokeWidth={0.5}
              />
              <circle
                data-part="needle-cap"
                cx={0}
                cy={0}
                r={geometry.needleCapRadius}
                fill={needleColor}
              />
            </g>
          ) : null}
          {showValue ? (
            <text
              data-part="value-label"
              x={0}
              y={geometry.valueY}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: `${geometry.valueFontSize}px`, fontWeight: 600 }}
              aria-hidden="true"
            >
              {shouldAnimate ? (
                <animate
                  attributeName="opacity"
                  from="0"
                  to="1"
                  begin={`${Math.round(animationDuration * 0.5)}ms`}
                  dur={`${Math.round(animationDuration * 0.45)}ms`}
                  fill="freeze"
                />
              ) : null}
              {displayValue}
            </text>
          ) : null}
          {label ? (
            <text
              data-part="label"
              x={0}
              y={showValue ? geometry.labelY : geometry.valueY}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: `${geometry.labelFontSize}px` }}
              aria-hidden="true"
            >
              {label}
            </text>
          ) : null}
        </g>
      </g>
    </ChartRendererSurface>
  );
}
