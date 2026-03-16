'use client';

/**
 * @fileoverview Particles - Rottay Design System
 *
 * Renders a field of drifting dots on an HTML `<canvas>`, producing a subtle
 * ambient particle effect behind child content. Each particle moves at a
 * constant velocity and wraps around canvas edges (toroidal topology) so the
 * field appears infinite. The animation loop runs via `requestAnimationFrame`
 * for smooth 60fps rendering, and the canvas auto-resizes on window resize.
 * When `prefers-reduced-motion` is active, the canvas is not mounted at all
 * to eliminate unnecessary GPU work.
 *
 * @example
 * <Particles count={80} color="rgba(255,255,255,0.6)" speed={0.3}>
 *   <HeroContent />
 * </Particles>
 */

import React, { useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { ParticlesProps } from '../../types';

/** Internal representation of a single particle's position, velocity, and radius. */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

/**
 * Canvas-based ambient particle field with configurable density, color, and speed.
 * Fully respects `prefers-reduced-motion` by skipping canvas rendering entirely.
 *
 * @param props - {@link ParticlesProps}
 * @param props.count - Number of particles to spawn (default: 50).
 * @param props.color - CSS color string for all particles (default: text-on-primary token).
 * @param props.speed - Maximum velocity per axis; higher = faster drift (default: 0.5).
 * @param props.children - Content rendered above the canvas at z-index 1.
 * @param props.className - Optional CSS class for the outer container.
 * @param props.style - Optional inline styles merged onto the outer container.
 * @returns A positioned container with a canvas particle layer behind child content.
 */
export const Particles: React.FC<ParticlesProps> = ({
  count = 50,
  color = 'var(--ds-color-text-on-primary)',
  speed = 0.5,
  children,
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(undefined);

  useEffect(() => {
    // Skip the entire animation pipeline when reduced motion is preferred.
    if (shouldReduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sync canvas pixel dimensions with its CSS layout size so drawings
    // aren't stretched or blurry on high-DPI displays.
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles with random positions and velocities.
    // Velocity is centered around 0 via (random - 0.5) so particles
    // drift in all directions, not just right/down.
    // Size range 1-3px keeps particles subtle at typical viewport distances.
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * 2 + 1,
    }));

    const animate = () => {
      // Clear the entire canvas each frame; this is cheaper than tracking
      // dirty regions for small, uniformly-distributed particles.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Set fill once outside the loop - all particles share the same color,
      // so switching fill per-particle would waste draw calls.
      ctx.fillStyle = color;
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        // Toroidal wrapping: particles exiting one edge re-enter from the
        // opposite side, creating the illusion of an infinite field.
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    // Cleanup: remove resize listener and cancel the pending animation frame
    // to prevent memory leaks and drawing to an unmounted canvas.
    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [count, color, speed, shouldReduceMotion]);

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      {!shouldReduceMotion && (
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
};

Particles.displayName = 'Particles';
