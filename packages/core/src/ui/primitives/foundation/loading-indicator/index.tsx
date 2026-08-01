'use client';

import React from 'react';

export type LoadingIndicatorSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingIndicatorProps {
  size?: LoadingIndicatorSize;
  color?: string;
  /** Visible supporting copy rendered beside the indicator. */
  label?: string;
  /**
   * Announces this indicator as a status. Omit when the composing owner
   * already carries aria-busy and the glyph is decorative.
   */
  statusLabel?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  'data-part'?: string;
}

/**
 * Engine-neutral loading glyph substrate used by Spinner and by primitive
 * families that need a busy posture. Its geometry, color and cadence remain
 * owned by the canonical Modern spinner skin; callers only stamp semantics.
 */
export function LoadingIndicator({
  size = 'md',
  color,
  label,
  statusLabel,
  children,
  className = '',
  style,
  'data-part': dataPart,
}: LoadingIndicatorProps): React.ReactElement {
  const channelStyle: React.CSSProperties | undefined = color
    ? ({ '--ds-spinner-color': color, ...style } as React.CSSProperties)
    : style;

  return (
    <div
      data-part={dataPart ?? 'root'}
      data-size={size}
      className={['rottay-spinner', 'rottay-spinner--modern', className].filter(Boolean).join(' ')}
      style={channelStyle}
    >
      <span
        data-part="indicator"
        role={statusLabel ? 'status' : undefined}
        aria-label={statusLabel}
        aria-hidden={statusLabel ? undefined : true}
      />
      {label ? <span data-part="label">{label}</span> : null}
      {children}
    </div>
  );
}
