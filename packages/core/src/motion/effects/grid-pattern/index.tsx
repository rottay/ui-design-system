'use client';

/**
 * @fileoverview GridPattern - Rottay Design System
 *
 * Renders a repeating SVG dot grid as a decorative background. Each dot is
 * a `<circle>` inside an SVG `<pattern>`, which the browser tiles natively
 * with near-zero layout cost. When `animate` is true, the dots fade in and
 * out via a CSS keyframe on opacity, whose duration is personality-aware.
 * The pattern ID is generated with React `useId()` to guarantee uniqueness
 * when multiple GridPatterns exist on the same page.
 *
 * @example
 * <GridPattern size={24} color="var(--ds-color-border-muted)" animate>
 *   <DashboardContent />
 * </GridPattern>
 */

import React, { useId } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { GridPatternProps } from '../../types';
import { useMotionPersonality } from '../../hooks/use-motion-personality';

/** Maps personality pulse speed to a duration multiplier for the dot fade cycle. */
const PULSE_DURATION_MAP: Record<string, number> = { slow: 1.6, normal: 1, fast: 0.6 };

/**
 * Decorative grid-dot background with optional animated opacity pulse.
 *
 * @param props - {@link GridPatternProps}
 * @param props.size - Spacing between dots in pixels; also determines dot radius (default: 30).
 * @param props.color - CSS color for the dots (default: design token or alpha-black-5).
 * @param props.opacity - Base opacity for the SVG overlay, 0-1 (default: 1).
 * @param props.animate - Enable a slow fade-in/out pulse on the dots (default: false).
 * @param props.children - Content rendered above the grid at z-index 1.
 * @param props.className - Optional CSS class for the outer container.
 * @param props.style - Optional inline styles merged onto the outer container.
 * @returns A positioned container with an SVG dot-grid behind child content.
 */
export const GridPattern: React.FC<GridPatternProps> = ({
  size = 30,
  color = 'var(--ds-grid-pattern-color, var(--ds-color-alpha-black-5))',
  opacity = 1,
  animate = false,
  children,
  className,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const motionPersonality = useMotionPersonality();
  const shouldAnimate = animate && !shouldReduceMotion;
  // useId() produces a unique ID per component instance, preventing SVG
  // pattern ID collisions when multiple GridPatterns are mounted simultaneously.
  const patternId = useId();
  // Dot radius is 6% of the grid spacing, clamped to a minimum of 1px so
  // very small grids still produce visible dots.
  const dotSize = Math.max(1, size * 0.06);

  // Fade duration is personality-aware with a 2s floor to prevent the dots
  // from flickering, which would be distracting for a background pattern.
  const fadeDuration = Math.max(
    motionPersonality.durationSeconds * 6 * (PULSE_DURATION_MAP[motionPersonality.pulseSpeed] || 1),
    2
  );

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      {/* Inline keyframes avoid global CSS coupling. The fade oscillates between
          50% and 100% of the base opacity for a subtle breathing effect. */}
      {shouldAnimate && (
        <style>{`@keyframes ds-grid-fade { 0%, 100% { opacity: ${opacity * 0.5}; } 50% { opacity: ${opacity}; } }`}</style>
      )}
      {/* pointerEvents: none ensures the SVG overlay never captures clicks
          intended for the child content layer beneath it. */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none', zIndex: 0 }}>
        <defs>
          {/* patternUnits="userSpaceOnUse" tiles the pattern in absolute pixel
              coordinates rather than scaling to the element, which keeps dot
              size consistent regardless of container dimensions. */}
          <pattern id={patternId} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={dotSize}
              fill={color}
              style={shouldAnimate ? { animation: `ds-grid-fade ${fadeDuration}s ease-in-out infinite` } : undefined}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
};

GridPattern.displayName = 'GridPattern';
