'use client';

/**
 * @fileoverview ShimmerText - Rottay Design System
 *
 * Applies a horizontally-sliding gradient to text using the CSS
 * `background-clip: text` technique. The gradient is twice the element width
 * (`backgroundSize: 200%`) and a keyframe animation continuously shifts
 * `background-position` from 200% to -200%, creating the illusion of a light
 * sweep across the letters. Two gradient variants are available based on the
 * motion personality's skeleton style: "pulse" uses a simpler two-tone fade,
 * while "wave" adds a bright center highlight for a more dramatic sweep.
 *
 * @example
 * <ShimmerText text="Loading dashboard..." style={{ fontSize: '1.5rem' }} />
 */

import React from 'react';
import type { ShimmerTextProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

/**
 * Animated shimmer text that adapts gradient style and timing to the active
 * motion personality, with full reduced-motion support.
 *
 * @param props - {@link ShimmerTextProps}
 * @param props.text - The string to render with the shimmer effect.
 * @param props.className - Optional CSS class for the span element.
 * @param props.style - Optional inline styles (e.g., fontSize, fontWeight).
 * @returns An inline-block span with an animated gradient text fill.
 */
export const ShimmerText: React.FC<ShimmerTextProps> = ({ text, className, style }) => {
  const motionPersonality = useMotionPersonality();
  const shouldReduceMotion = motionPersonality.shouldReduceMotion;

  // Speed multipliers are slightly different from other effects because
  // shimmer text needs a longer sweep at "slow" to remain readable, while
  // "fast" can be tighter since the eye tracks the highlight easily.
  const speedMultiplier = {
    none: 0,
    slow: 1.35,
    normal: 1,
    fast: 0.8,
  } as const;

  // 1.4s floor prevents the sweep from being so fast that it looks like
  // flickering rather than a smooth light pass.
  const animationDuration = `${Math.max(
    motionPersonality.durationSeconds * 6 * (speedMultiplier[motionPersonality.pulseSpeed] || 1),
    1.4
  )}s`;

  // Two gradient variants adapt the shimmer look to the skeleton style:
  //   - "pulse": subtle two-tone (secondary -> primary -> secondary)
  //   - "wave": adds a bright on-primary highlight at the 50% center mark
  //     for a more dramatic "light sweep" look.
  const shimmerGradient =
    motionPersonality.skeletonStyle === 'pulse'
      ? 'linear-gradient(90deg, var(--ds-color-text-secondary) 0%, var(--ds-color-text-primary) 50%, var(--ds-color-text-secondary) 100%)'
      : 'linear-gradient(90deg, var(--ds-color-text-secondary) 0%, var(--ds-color-text-primary) 40%, var(--ds-color-text-on-primary) 50%, var(--ds-color-text-primary) 60%, var(--ds-color-text-secondary) 100%)';

  return (
    <>
      {/* Inline keyframes keep the effect self-contained and easy to reuse in app shells.
          The position sweeps from 200% to -200% (400% total travel) so the highlight
          enters from one side and exits fully on the other before looping. */}
      <style>{`@keyframes ds-shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }`}</style>
      <span
        className={className}
        style={{
          // When reduced motion is active, show a solid primary color fill
          // instead of the animated gradient for accessibility.
          background: shouldReduceMotion
            ? 'var(--ds-color-text-primary)'
            : shimmerGradient,
          // 200% width creates the off-screen area the gradient slides through;
          // at 100% there would be no room for the position to shift.
          backgroundSize: shouldReduceMotion ? '100% 100%' : '200% 100%',
          // background-clip: text + transparent fill is the standard technique
          // for applying a gradient as a text color. Both prefixed and standard
          // properties are needed for cross-browser support.
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: shouldReduceMotion ? 'none' : `ds-shimmer ${animationDuration} linear infinite`,
          display: 'inline-block',
          ...style,
        }}
      >
        {text}
      </span>
    </>
  );
};

ShimmerText.displayName = 'ShimmerText';
