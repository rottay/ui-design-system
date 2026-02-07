'use client';

import React, { useId } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { GridPatternProps } from '../../types';

export const GridPattern: React.FC<GridPatternProps> = ({
  size = 30,
  color = 'rgba(0, 0, 0, 0.06)',
  opacity = 1,
  animate = false,
  children,
  className,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = animate && !shouldReduceMotion;
  const patternId = useId();
  const dotSize = Math.max(1, size * 0.06);

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
              style={shouldAnimate ? { animation: 'ds-grid-fade 4s ease-in-out infinite' } : undefined}
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
