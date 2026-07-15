/**
 * @fileoverview AnimatedCheck - success/confirm choreography - Rottay Design System
 * @description An SVG checkmark that draws itself in via `stroke-dashoffset`
 * (a "stroke draw" animation), for completed confirm flows (a successful
 * Toast, a confirmed ConfirmDialog action). The path uses `pathLength={1}`
 * so the dash animation is defined in normalized units (1 -> 0) regardless
 * of the path's actual pixel length -- no geometry math required to keep the
 * draw looking continuous if the glyph is ever redrawn.
 *
 * Single-shot: `animation-iteration-count` is never set (defaults to 1) and
 * must stay that way -- this is a completion moment, not an ambient loop.
 * Under `prefers-reduced-motion: reduce` the check renders fully drawn with
 * no animation at all.
 *
 * @module Toast/Compound/AnimatedCheck
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { useId } from 'react';
import type { CSSProperties } from 'react';
import { useBreakpoints } from '../../../../../../hooks';

export interface AnimatedCheckProps {
  /** Glyph box size in pixels. @default 20 */
  size?: number;
  /** Stroke width of the check mark. @default 2.5 */
  strokeWidth?: number;
  /** Stroke color. @default 'var(--ds-color-success)' */
  color?: string;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles applied to the outer wrapper. */
  style?: CSSProperties;
}

/**
 * Draw-in success checkmark for completed confirm flows.
 *
 * @example
 * ```tsx
 * <Toast variant="success" title="Saved" icon={<AnimatedCheck />} />
 * ```
 */
export function AnimatedCheck({
  size = 20,
  strokeWidth = 2.5,
  color = 'var(--ds-color-success)',
  className,
  style,
}: AnimatedCheckProps): React.ReactElement {
  const { prefersReducedMotion } = useBreakpoints();
  const uid = useId().replace(/:/g, '');
  const animationName = `ds-toast-animated-check-${uid}`;

  const keyframes = `@keyframes ${animationName}{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}`;

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', width: size, height: size, flexShrink: 0, ...style }}
    >
      {!prefersReducedMotion && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 12.5L9.5 18L20 6"
          pathLength={1}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: prefersReducedMotion ? 0 : 1,
            ...(prefersReducedMotion
              ? {}
              : {
                  animationName,
                  animationDuration: 'var(--ds-motion-slow)',
                  animationTimingFunction: 'var(--ds-motion-ease-out)',
                  animationFillMode: 'forwards',
                }),
          }}
        />
      </svg>
    </span>
  );
}

AnimatedCheck.displayName = 'Toast.AnimatedCheck';
