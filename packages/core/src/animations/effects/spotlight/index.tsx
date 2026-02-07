'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { SpotlightProps } from '../../types';

export const Spotlight: React.FC<SpotlightProps> = ({
  size = 300,
  color = 'rgba(255, 255, 255, 0.05)',
  children,
  className,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (shouldReduceMotion) return;
    const el = containerRef.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, [shouldReduceMotion]);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {!shouldReduceMotion && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(${size}px circle at ${pos.x}px ${pos.y}px, ${color}, transparent 80%)`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
};

Spotlight.displayName = 'Spotlight';
