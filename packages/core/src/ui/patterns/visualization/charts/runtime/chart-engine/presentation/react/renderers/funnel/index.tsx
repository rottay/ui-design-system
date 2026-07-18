'use client';

import { useId, useMemo, type CSSProperties } from 'react';

import { useReducedMotion } from '@/graphics/motion/react/runtime';
import { useResolvedChartPersonality } from '@/infrastructure/runtime/personality';
import type { ChartInteraction } from '../../../../foundation/interaction';
import {
  buildSvgFunnelGeometry,
  type ChartGeometryInsets,
  type SvgFunnelDatum,
  type SvgFunnelOrientation,
} from '../../../../foundation/renderers/geometry';
import { useChartInteraction } from '../../../../runtime/interaction/controller';
import { useChartDimensions } from '../../../../runtime/dimensions';
import { ChartRendererSurface } from '..';

export interface SvgFunnelRendererProps {
  readonly data: readonly SvgFunnelDatum[];
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly ariaDescribedBy?: string;
  readonly width?: number | string;
  readonly height?: number;
  /** Recompute taper geometry from the renderer container. Defaults to true. */
  readonly responsive?: boolean;
  /** Uses the resolved tenant personality unless explicitly overridden. */
  readonly animate?: boolean;
  readonly orientation?: SvgFunnelOrientation;
  readonly showPercentage?: boolean;
  readonly showConversion?: boolean;
  readonly colors?: readonly string[];
  readonly margin?: ChartGeometryInsets;
  /** Retains native stage titles for non-interactive compatibility views. */
  readonly showSegmentTitles?: boolean;
  readonly interaction?: ChartInteraction<SvgFunnelDatum>;
  readonly className?: string;
  readonly style?: CSSProperties;
}

function segmentLabel(segment: SvgFunnelDatum): string {
  return `${segment.label}: ${segment.value}`;
}

/**
 * React-owned tapering funnel renderer. The geometry builder is pure and
 * immutable; all SVG marks, state, accessibility, and motion are React-owned.
 */
export function SvgFunnelRenderer({
  data,
  ariaLabel,
  ariaDescription,
  ariaDescribedBy,
  width = 600,
  height = 400,
  responsive = true,
  animate,
  orientation = 'vertical',
  showPercentage = true,
  showConversion = false,
  colors,
  margin,
  showSegmentTitles = true,
  interaction,
  className,
  style,
}: SvgFunnelRendererProps): React.ReactElement {
  const chartPersonality = useResolvedChartPersonality();
  const reducedMotion = useReducedMotion();
  const { containerRef, dimensions } = useChartDimensions(width, height, responsive);
  const geometryWidth = responsive
    ? dimensions.width
    : typeof width === 'number'
      ? width
      : 600;
  const animationDuration = Number.isFinite(chartPersonality.mountDuration)
    ? Math.max(0, chartPersonality.mountDuration)
    : 0;
  const shouldAnimate = !reducedMotion
    && (animate ?? chartPersonality.animateOnMount)
    && animationDuration > 0;
  const geometry = useMemo(
    () => buildSvgFunnelGeometry({
      data,
      width: geometryWidth,
      height,
      orientation,
      colors,
      margin,
    }),
    [colors, data, geometryWidth, height, margin, orientation],
  );
  const interactionItems = useMemo(
    () => geometry.segments.map((segment) => ({
      key: segment.id,
      label: segmentLabel(segment),
      datum: {
        label: segment.label,
        value: segment.value,
        ...(segment.colorSource === 'custom' ? { color: segment.color } : {}),
      },
      x: geometry.margin.left + segment.centerX,
      y: geometry.margin.top + segment.centerY,
      column: segment.index,
    })),
    [geometry],
  );
  const interactionState = useChartInteraction({
    items: interactionItems,
    interaction,
    navigation: orientation === 'vertical' ? 'vertical' : 'horizontal',
  });
  const tooltipId = useId();
  const activeSegment = interactionState.activeKey
    ? interactionItems.find((item) => item.key === interactionState.activeKey)
    : undefined;
  const tooltip = interactionState.activeDatum && interaction && interaction.mode !== 'static'
    ? interaction.renderTooltip?.(interactionState.activeDatum)
    : undefined;
  const surfaceStyle: CSSProperties = {
    ...(typeof width === 'string' ? { width } : {}),
    ...style,
  };
  // A family adapter can point at its scaffold-owned structured summary. Do
  // not duplicate that same description inside the SVG; standalone renderers
  // retain their self-contained native description.
  const description = ariaDescribedBy
    ? ariaDescription
    : ariaDescription
      ?? (geometry.fallbackMessage
        ? geometry.fallbackMessage
        : `Funnel chart with ${geometry.segments.length} stages in ${geometry.orientation} orientation.`);
  // Carry the family skin hook even when this public renderer is consumed
  // without the legacy FunnelChart adapter.
  const rendererClassName = ['ds-chart-funnel', 'ds-chart-renderer-funnel', className]
    .filter(Boolean)
    .join(' ');

  return (
    <ChartRendererSurface
      rendererId="svg.funnel"
      ariaLabel={ariaLabel}
      ariaDescription={description}
      ariaDescribedBy={ariaDescribedBy}
      width={geometry.width}
      height={geometry.height}
      responsive={responsive}
      empty={geometry.fallbackMessage !== null}
      className={rendererClassName}
      style={surfaceStyle}
      ownerRef={containerRef}
      interactionMode={interactionState.mode}
      interactionRootProps={interactionState.rootProps}
      tooltip={tooltip}
      tooltipId={tooltipId}
      tooltipKey={interactionState.activeKey ?? undefined}
      tooltipAnchor={activeSegment ? {
        x: activeSegment.x,
        y: activeSegment.y,
      } : undefined}
    >
      <g
        data-part="plot-area"
        data-variant="funnel"
        data-orientation={geometry.orientation}
        transform={`translate(${geometry.margin.left},${geometry.margin.top})`}
      >
        <g data-part="funnel-motion" data-animate={shouldAnimate ? 'true' : 'false'}>
          {geometry.segments.map((segment) => {
            const datumProps = interactionState.getDatumProps(segment.id);
            const interactive = interactionState.mode !== 'static';
            const actionable = interactionState.mode === 'select' || interactionState.mode === 'drill';
            const accessibleLabel = segmentLabel(segment);
            const markLabel = actionable && interaction && interaction.mode !== 'static'
              ? `${accessibleLabel}. ${interaction.actionLabel}`
              : accessibleLabel;
            const valueText = showPercentage
              ? `${segment.value} (${segment.percentageLabel})`
              : String(segment.value);

            return (
              <g
                key={segment.id}
                data-part="funnel-segment-mark"
                data-datum-id={segment.id}
                data-mark-index={segment.index % 5}
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
                    begin={`${Math.round(segment.index * animationDuration * 0.12)}ms`}
                    dur={`${Math.round(animationDuration * 0.6)}ms`}
                    fill="freeze"
                  />
                ) : null}
                {!interactive && showSegmentTitles ? <title>{accessibleLabel}</title> : null}
                {interactive ? (
                  <>
                    <polygon
                      data-part="interaction-target"
                      points={segment.polygonPoints}
                      strokeWidth={12}
                      aria-hidden="true"
                    />
                    <polygon
                      data-part="interaction-halo"
                      points={segment.polygonPoints}
                      aria-hidden="true"
                    />
                  </>
                ) : null}
                <polygon
                  data-part="segment"
                  data-state={datumProps['data-active'] === 'true' ? 'active' : 'idle'}
                  data-position={segment.position}
                  data-color-source={segment.colorSource}
                  points={segment.polygonPoints}
                  fill={segment.color}
                  aria-hidden={interactive ? true : undefined}
                />
                <text
                  data-part="segment-label"
                  x={segment.labelX}
                  y={segment.labelY}
                  textAnchor="middle"
                  style={{
                    fontSize: geometry.orientation === 'vertical' ? '13px' : '12px',
                    fontWeight: 600,
                    pointerEvents: 'none',
                  }}
                  aria-hidden="true"
                >
                  {segment.label}
                </text>
                {geometry.orientation === 'vertical' ? (
                  <text
                    data-part="segment-value"
                    x={segment.valueX}
                    y={segment.valueY}
                    textAnchor="middle"
                    style={{ fontSize: '11px', pointerEvents: 'none' }}
                    aria-hidden="true"
                  >
                    {valueText}
                  </text>
                ) : null}
                {geometry.orientation === 'vertical' && showConversion && segment.conversionLabel ? (
                  <text
                    data-part="conversion-label"
                    x={segment.conversionX}
                    y={segment.conversionY}
                    dominantBaseline="middle"
                    style={{ fontSize: '10px' }}
                    aria-hidden="true"
                  >
                    {segment.conversionLabel}
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
