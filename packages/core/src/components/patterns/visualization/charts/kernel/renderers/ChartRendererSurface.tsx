'use client';

import {
  useId,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';

import { useResolvedChartPersonality } from '@/runtime/personality';
import { useResolvedChartGrammar } from '../grammar';
import type {
  ChartInteractionMode,
} from '../interaction/ChartInteraction';
import type {
  ChartInteractionRootProps,
} from '../interaction/useChartInteraction';

type ChartTooltipPositionStyle = CSSProperties & {
  '--ds-chart-tooltip-x'?: string;
  '--ds-chart-tooltip-y'?: string;
};

export interface ChartRendererSurfaceProps {
  readonly rendererId: string;
  readonly ariaLabel: string;
  readonly ariaDescription?: string;
  readonly width: number;
  readonly height: number;
  /** Whether the SVG geometry follows the measured container width. */
  readonly responsive?: boolean;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly ownerRef?: RefObject<HTMLDivElement | null>;
  readonly empty?: boolean;
  readonly interactionMode?: ChartInteractionMode;
  readonly interactionRootProps?: ChartInteractionRootProps;
  readonly tooltip?: ReactNode;
  readonly tooltipId?: string;
  readonly tooltipKey?: string;
  readonly tooltipAnchor?: { readonly x: number; readonly y: number };
  readonly children: ReactNode;
}

/**
 * Stable semantic SVG surface shared by the React-owned renderers.
 *
 * Title and description remain React nodes for the full lifetime of the
 * renderer. Geometry updates can therefore never erase its accessible name.
 */
export function ChartRendererSurface({
  rendererId,
  ariaLabel,
  ariaDescription,
  width,
  height,
  responsive = true,
  className,
  style,
  ownerRef,
  empty = false,
  interactionMode = 'static',
  interactionRootProps,
  tooltip,
  tooltipId,
  tooltipKey,
  tooltipAnchor,
  children,
}: ChartRendererSurfaceProps): React.ReactElement {
  const titleId = useId();
  const descriptionId = useId();
  const grammar = useResolvedChartGrammar();
  const chartPersonality = useResolvedChartPersonality();
  const colorScheme = chartPersonality.colorScheme ?? 'default';
  const surfaceClassName = ['ds-chart-renderer', className].filter(Boolean).join(' ');
  const interactive = interactionMode !== 'static';
  const hasTooltip = tooltip !== null && tooltip !== undefined && tooltip !== false;
  const tooltipXPercent = tooltipAnchor && width > 0
    ? Math.min(100, Math.max(0, (tooltipAnchor.x / width) * 100))
    : 0;
  const tooltipYPercent = tooltipAnchor && height > 0
    ? Math.min(100, Math.max(0, (tooltipAnchor.y / height) * 100))
    : 0;
  const tooltipPosition: ChartTooltipPositionStyle | undefined = tooltipAnchor && width > 0 && height > 0
    ? {
        '--ds-chart-tooltip-x': `${tooltipXPercent}%`,
        '--ds-chart-tooltip-y': `${tooltipYPercent}%`,
      }
    : undefined;

  return (
    <div
      {...(interactive ? interactionRootProps : undefined)}
      ref={ownerRef}
      className={surfaceClassName}
      data-part="chart-renderer"
      data-renderer-id={rendererId}
      data-interaction={interactionMode}
      data-responsive={responsive ? 'true' : 'false'}
      data-empty={empty ? 'true' : undefined}
      data-chart-grammar={grammar.id}
      data-chart-posture={grammar.posture}
      data-chart-grid={grammar.grid}
      data-chart-axes={grammar.axes}
      data-chart-marks={grammar.marks}
      data-chart-motion={grammar.motion}
      data-chart-color-scheme={colorScheme}
      data-chart-line-style={chartPersonality.lineStyle}
      data-chart-show-dots={chartPersonality.showDots ? 'true' : 'false'}
      data-chart-gradient-fill={chartPersonality.useGradientFill ? 'true' : 'false'}
      data-chart-tooltip-style={chartPersonality.tooltipStyle}
      style={style}
    >
      <svg
        data-part="chart-svg"
        data-renderer-id={rendererId}
        data-interaction={interactive ? interactionMode : undefined}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
        role={interactive ? 'group' : 'img'}
        aria-labelledby={titleId}
        aria-describedby={ariaDescription ? descriptionId : undefined}
      >
        <title id={titleId}>{ariaLabel}</title>
        {ariaDescription ? <desc id={descriptionId}>{ariaDescription}</desc> : null}
        {children}
      </svg>
      {hasTooltip && tooltipId && tooltipKey !== undefined ? (
        <div
          id={tooltipId}
          data-part="interaction-tooltip"
          data-chart-tooltip-key={tooltipKey}
          data-align={tooltipXPercent < 20 ? 'start' : tooltipXPercent > 80 ? 'end' : 'center'}
          data-side={tooltipYPercent < 24 ? 'bottom' : 'top'}
          role="tooltip"
          style={tooltipPosition}
        >
          {tooltip}
        </div>
      ) : null}
    </div>
  );
}
