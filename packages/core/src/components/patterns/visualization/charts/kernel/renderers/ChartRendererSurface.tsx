'use client';

import {
  useId,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';

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
  children,
}: ChartRendererSurfaceProps): React.ReactElement {
  const titleId = useId();
  const descriptionId = useId();
  const surfaceClassName = ['ds-chart-renderer', className].filter(Boolean).join(' ');

  return (
    <div
      ref={ownerRef}
      className={surfaceClassName}
      data-part="chart-renderer"
      data-renderer-id={rendererId}
      data-interaction="static"
      data-responsive={responsive ? 'true' : 'false'}
      data-empty={empty ? 'true' : undefined}
      style={style}
    >
      <svg
        data-part="chart-svg"
        data-renderer-id={rendererId}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby={titleId}
        aria-describedby={ariaDescription ? descriptionId : undefined}
      >
        <title id={titleId}>{ariaLabel}</title>
        {ariaDescription ? <desc id={descriptionId}>{ariaDescription}</desc> : null}
        {children}
      </svg>
    </div>
  );
}
