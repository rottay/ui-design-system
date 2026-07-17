'use client';

/**
 * @fileoverview Aurora - Rottay Design System
 *
 * Renders 2-4 large, heavily-blurred color blobs that drift in overlapping
 * circular paths, producing a soft ambient "northern lights" backdrop.
 * Each blob follows a unique translate/rotate/scale keyframe loop whose
 * duration, delay, and opacity are derived from the active motion personality
 * so the effect automatically adapts to tenant branding and reduced-motion
 * preferences.
 *
 * @example
 * <Aurora colors={['var(--ds-color-primary-500)', 'var(--ds-color-accent)']} speed={0.8}>
 *   <Heading>Welcome</Heading>
 * </Aurora>
 */

import React, { useMemo } from 'react';
import type { AuroraProps } from '@/graphics/motion/foundation/contracts';
import { useMotionPersonality } from '@/graphics/motion/react/runtime';

/**
 * Ambient aurora background that layers animated color blobs behind child
 * content, inheriting tenant-aware motion timing from `useMotionPersonality`.
 *
 * @param props - {@link AuroraProps}
 * @param props.colors - Array of CSS color values for each blob (default: primary, secondary, accent).
 * @param props.speed - Multiplier applied to blob animation duration; higher = faster (default: 1).
 * @param props.children - Content rendered above the aurora layer at z-index 1.
 * @param props.className - Optional CSS class for the outer wrapper.
 * @param props.style - Optional inline styles merged onto the outer wrapper.
 * @returns A positioned container with animated blobs behind the child content.
 */
export const Aurora: React.FC<AuroraProps> = ({
  colors = ['var(--ds-color-primary-500)', 'var(--ds-color-secondary-500)', 'var(--ds-color-accent)'],
  speed = 1,
  children,
  className,
  style,
}) => {
  const motionPersonality = useMotionPersonality();
  const shouldReduceMotion = motionPersonality.shouldReduceMotion;

  // Maps pulse speed names to duration multipliers so the effect slows down
  // or speeds up in step with the tenant's configured motion personality.
  const pulseDurationMap = {
    none: 0,
    slow: 1.2,
    normal: 1,
    fast: 0.8,
  } as const;

  // Pre-compute blob geometry and timing once per prop/personality change.
  // Each blob gets a staggered duration (+3s per index) and progressive
  // position offsets so they overlap without clustering.
  const blobs = useMemo(
    () => {
      // Base duration is personality-aware with a 6s floor to prevent
      // jarring fast loops on very short personality durations.
      const baseDuration = Math.max(
        motionPersonality.durationSeconds * 18 * (pulseDurationMap[motionPersonality.pulseSpeed] || 1),
        6
      );
      // Guard against zero/negative speed which would freeze or reverse animation.
      const normalizedSpeed = speed <= 0 ? 1 : speed;

      return colors.map((color, i) => ({
        color,
        duration: (baseDuration + i * 3) / normalizedSpeed,
        // Stagger start times so blobs don't all move in unison.
        delay: i * Math.max(motionPersonality.delaySeconds * 4, 0.2),
        // Progressive sizing: later blobs are slightly larger for depth.
        size: 40 + i * 10,
        top: 20 + i * 15,
        left: 10 + i * 20,
      }));
    },
    [
      colors,
      motionPersonality.delaySeconds,
      motionPersonality.durationSeconds,
      motionPersonality.pulseSpeed,
      speed,
    ]
  );

  return (
    <div className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {/*
        Inline keyframes keep the effect self-contained - no global CSS dependency.
        The 4-stop loop (0/25/50/75/100%) combines translate, rotate, and scale to
        create an organic drifting path; slight scale variance (0.9-1.1) adds a
        breathing quality without jarring size changes.
      */}
      <style>{`@keyframes ds-aurora-blob { 0%, 100% { transform: translate(0%, 0%) rotate(0deg) scale(1); } 25% { transform: translate(50%, 50%) rotate(90deg) scale(1.1); } 50% { transform: translate(0%, 100%) rotate(180deg) scale(0.9); } 75% { transform: translate(-50%, 50%) rotate(270deg) scale(1.05); } }`}</style>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {blobs.map((blob, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${blob.top}%`,
              left: `${blob.left}%`,
              width: `${blob.size}%`,
              height: `${blob.size}%`,
              background: blob.color,
              borderRadius: '50%',
              // Heavy blur (60px) is the core visual trick - it merges blob edges
              // into each other, producing the soft aurora glow instead of visible circles.
              filter: 'blur(60px)',
              // Wave skeleton style gets slightly higher opacity for a bolder look;
              // pulse style stays subtler to avoid competing with loading indicators.
              opacity: motionPersonality.skeletonStyle === 'wave' ? 0.34 : 0.28,
              animation: shouldReduceMotion ? 'none' : `ds-aurora-blob ${blob.duration}s ease-in-out ${blob.delay}s infinite`,
              // willChange: 'transform' promotes the blob to its own compositor layer,
              // preventing repaint of the parent during animation. Disabled when static.
              willChange: shouldReduceMotion ? 'auto' : 'transform',
            }}
          />
        ))}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
};

Aurora.displayName = 'Aurora';
