'use client';

import React, { useId } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { GridPatternProps } from '../../types';
import { useMotionPersonality } from '../../hooks/use-motion-personality';

const PULSE_DURATION_MAP: Record<string, number> = { slow: 1.6, normal: 1, fast: 0.6 };

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
  const patternId = useId();
  const dotSize = Math.max(1, size * 0.06);

  const fadeDuration = Math.max(
    motionPersonality.durationSeconds * 6 * (PULSE_DURATION_MAP[motionPersonality.pulseSpeed] || 1),
    2
  );

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      {shouldAnimate && (
        <style>{`@keyframes ds-grid-fade { 0%, 100% { opacity: ${opacity * 0.5}; } 50% { opacity: ${opacity}; } }`}</style>
      )}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none', zIndex: 0 }}>
        <defs>
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
