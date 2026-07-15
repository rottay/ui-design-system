'use client';

/**
 * @fileoverview GlowEffect - Rottay Design System
 *
 * Wraps child content in a pulsing box-shadow glow whose color, blur radius,
 * and animation speed are derived from prop-based intensity tiers and the
 * tenant's motion personality. Uses Motion for React's `animate` prop to
 * smoothly interpolate between two shadow states ("breathe" effect) on the
 * GPU-accelerated compositor layer.
 *
 * @example
 * <GlowEffect color="var(--ds-color-accent)" intensity="lg">
 *   <Button>Call to Action</Button>
 * </GlowEffect>
 */

import React from 'react';
import { motion } from 'motion/react';
import type { GlowEffectProps } from '../../types';
import { useMotionPersonality } from '../../hooks/use-motion-personality';
import { useReducedMotion } from '../../hooks/use-reduced-motion';

/**
 * Blur and spread pixel values for each intensity tier.
 * These are intentionally modest to keep the glow decorative
 * rather than overpowering - even 'lg' stays under 30px blur.
 */
const INTENSITY_MAP = {
  sm: { blur: 8, spread: 2 },
  md: { blur: 16, spread: 4 },
  lg: { blur: 24, spread: 6 },
};

/** Maps personality pulse speed names to duration multipliers for the glow cycle. */
const PULSE_DURATION_MAP: Record<string, number> = { slow: 1.6, normal: 1, fast: 0.6 };

/**
 * Animated glow wrapper that applies a pulsing box-shadow to spotlight
 * interactive or branded content.
 *
 * @param props - {@link GlowEffectProps}
 * @param props.color - CSS color value for the glow (default: primary-500 token).
 * @param props.intensity - Size tier for blur/spread: 'sm' | 'md' | 'lg' (default: 'md').
 * @param props.children - Content displayed inside the glowing wrapper.
 * @param props.className - Optional CSS class for the motion container.
 * @param props.style - Optional inline styles merged onto the motion container.
 * @returns A Motion div with an animated box-shadow glow.
 */
export const GlowEffect: React.FC<GlowEffectProps> = ({
  color = 'var(--ds-color-primary-500)',
  intensity = 'md',
  children,
  className,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const motionPersonality = useMotionPersonality();
  const { blur, spread } = INTENSITY_MAP[intensity];

  // Duration scales with the motion personality but never drops below 1s.
  // Very fast pulses feel more like a strobe than a glow, so the floor
  // prevents that.
  const effectiveDuration = Math.max(
    motionPersonality.durationSeconds * 4 * (PULSE_DURATION_MAP[motionPersonality.pulseSpeed] || 1),
    1
  );

  // Only two shadow stops (small -> large -> small) are needed to produce
  // a convincing "breathing" effect. The small shadow uses 70% blur and the
  // large shadow uses 150% spread, giving enough visual contrast to read
  // as a pulse without creating harsh flickering.
  const glowSm = `0 0 ${blur * 0.7}px ${spread}px ${color}`;
  const glowLg = `0 0 ${blur}px ${spread * 1.5}px ${color}`;

  return (
    <motion.div
      className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      animate={shouldReduceMotion ? undefined : { boxShadow: [glowSm, glowLg, glowSm] }}
      transition={{ duration: effectiveDuration, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

GlowEffect.displayName = 'GlowEffect';
