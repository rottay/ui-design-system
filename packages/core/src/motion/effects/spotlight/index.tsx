'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { SpotlightProps } from '../../types';

export const Spotlight: React.FC<SpotlightProps> = ({
  size = 300,
  color = 'var(--ds-spotlight-color, var(--ds-color-alpha-white-5))',
  children,
  className,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (shouldReduceMotion) return;
    const el = containerRef.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        frameRef.current = null;
      });
    };

    el.addEventListener('mousemove', handleMove);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
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
