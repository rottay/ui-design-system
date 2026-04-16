'use client';

/**
 * @fileoverview ParticleField - Rottay Design System
 *
 * Rich canvas-driven point cloud / particle field used to create premium,
 * living surfaces behind content. Supports calm/active/focus moods, density
 * presets, focal areas, reduced-motion fallbacks, and both square/round
 * particle geometry.
 *
 * `Particles` remains as a backward-compatible alias.
 */

import React, { useEffect, useRef } from 'react';

import { useReducedMotion } from '../../hooks';
import type { ParticleFieldFocalArea, ParticleFieldProps } from '../../types';

interface ParticleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
  bandOffset: number;
  seed: number;
}

const DENSITY_MULTIPLIER = {
  low: 0.00065,
  medium: 0.00105,
  high: 0.00145,
} as const;

const INTENSITY_MULTIPLIER = {
  low: 0.84,
  medium: 1,
  high: 1.18,
} as const;

const MOOD_DRIFT = {
  calm: 0.09,
  active: 0.19,
  focus: 0.13,
} as const;

const MOOD_CLUSTER = {
  calm: 0.18,
  active: 0.34,
  focus: 0.4,
} as const;

const MOOD_TWINKLE = {
  calm: 0.35,
  active: 0.6,
  focus: 0.45,
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function resolveParticleCount(
  width: number,
  height: number,
  density: 'low' | 'medium' | 'high',
  intensity: 'low' | 'medium' | 'high',
  explicitCount?: number,
) {
  if (typeof explicitCount === 'number' && Number.isFinite(explicitCount)) {
    return explicitCount;
  }

  const area = Math.max(width * height, 1);
  return clamp(
    Math.round(area * DENSITY_MULTIPLIER[density] * INTENSITY_MULTIPLIER[intensity]),
    220,
    2600,
  );
}

function resolveAmbientBandY(width: number, height: number, x: number, bandOffset: number, cluster: number) {
  const normalizedX = width <= 0 ? 0 : x / width;
  const bandCenter =
    0.42 +
    Math.sin(normalizedX * Math.PI * (1.15 + cluster * 0.55) + bandOffset) *
      (0.09 + cluster * 0.1);

  const spread = height * (0.16 + cluster * 0.08);
  const gaussianish = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;

  return clamp(height * bandCenter + gaussianish * spread * 2, 0, height);
}

function resolvePatternWeight(
  pattern: 'ambient' | 'orbital',
  x: number,
  y: number,
  width: number,
  height: number,
  cluster: number,
  bandOffset: number,
) {
  const normalizedX = width <= 0 ? 0 : x / width;
  const normalizedY = height <= 0 ? 0 : y / height;

  if (pattern === 'orbital') {
    const dx = (normalizedX - 0.5) / 0.92;
    const dy = (normalizedY - 0.43) / 0.62;
    const distance = Math.hypot(dx, dy);
    const theta = Math.atan2(dy, dx);
    const voidRadius = 0.28;
    const shellDistance = clamp((distance - voidRadius) / 0.88, 0, 1);
    const contourPhase = distance * (28 + cluster * 10) + bandOffset * 0.4;
    const contour = 0.34 + Math.pow(Math.abs(Math.sin(contourPhase)), 0.72) * 0.86;
    const terrace = 0.55 + ((Math.floor((distance - voidRadius) * 18) % 2 === 0) ? 0.18 : 0);
    const edgeBias = 0.76 + Math.pow(Math.abs(normalizedX - 0.5) * 2, 0.88) * 0.92;
    const topBias = 0.84 + Math.max(0, 0.6 - normalizedY) * 0.82;
    const angularBias = 0.92 + Math.abs(Math.cos(theta * 1.6)) * 0.34;
    const innerSuppression = distance < voidRadius ? distance / voidRadius : 1;
    const outerFalloff = distance > 1.08 ? clamp(1.4 - distance, 0, 1) : 1;
    return clamp(
      shellDistance * contour * terrace * edgeBias * topBias * angularBias * innerSuppression * outerFalloff,
      0.01,
      1.35,
    );
  }

  const bandCenter =
    0.44 +
    Math.sin(normalizedX * Math.PI * (1.15 + cluster * 0.7) + bandOffset) *
      (0.08 + cluster * 0.1);
  const bandDistance = Math.abs(normalizedY - bandCenter);
  return clamp(0.22 + (1 - bandDistance / (0.18 + cluster * 0.12)) * 0.95, 0.02, 1);
}

function sampleParticlePosition(
  width: number,
  height: number,
  pattern: 'ambient' | 'orbital',
  cluster: number,
  bandOffset: number,
) {
  if (pattern === 'ambient') {
    const x = Math.random() * width;
    return {
      x,
      y: resolveAmbientBandY(width, height, x, bandOffset, cluster),
    };
  }

  for (let attempt = 0; attempt < 14; attempt += 1) {
    const candidateX = Math.random() * width;
    const candidateY = Math.random() * height;
    const weight = resolvePatternWeight(pattern, candidateX, candidateY, width, height, cluster, bandOffset);
    if (Math.random() <= Math.min(weight, 1)) {
      return { x: candidateX, y: candidateY };
    }
  }

  const fallbackX = Math.random() * width;
  return { x: fallbackX, y: Math.random() * height };
}

function resolveInitialVelocity(
  pattern: 'ambient' | 'orbital',
  x: number,
  y: number,
  width: number,
  height: number,
  drift: number,
  seed: number,
) {
  if (pattern === 'orbital') {
    const centerX = width * 0.5;
    const centerY = height * 0.44;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.max(Math.hypot(dx, dy), 1);
    const tangentX = -dy / distance;
    const tangentY = dx / distance;
    const orbitalDrift = drift * (0.48 + seed * 0.38);
    return {
      vx: tangentX * orbitalDrift + (Math.random() - 0.5) * drift * 0.08,
      vy: tangentY * orbitalDrift + (Math.random() - 0.5) * drift * 0.08,
    };
  }

  return {
    vx: (Math.random() - 0.5) * drift * (1.1 + Math.random() * 0.5),
    vy: (Math.random() - 0.5) * drift * 0.46,
  };
}

function resolveFocalBoost(
  x: number,
  y: number,
  width: number,
  height: number,
  focalAreas: ParticleFieldFocalArea[] | undefined,
) {
  if (!focalAreas?.length || width <= 0 || height <= 0) return 1;

  let boost = 1;

  for (const area of focalAreas) {
    const areaX = area.x * width;
    const areaY = area.y * height;
    const radius = Math.max(1, area.radius * Math.max(width, height));
    const distance = Math.hypot(x - areaX, y - areaY);

    if (distance > radius) continue;

    const proximity = 1 - distance / radius;
    boost = Math.max(boost, 1 + proximity * (area.strength ?? 0.45));
  }

  return boost;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count,
  color = 'rgba(255,255,255,0.88)',
  speed,
  density = 'medium',
  intensity = 'medium',
  mood = 'calm',
  pattern = 'ambient',
  shape = 'square',
  sizeRange = [0.6, 1.8],
  opacity = 1,
  blendMode = 'screen',
  focalAreas,
  children,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ParticleState[]>([]);
  const frameRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drift = typeof speed === 'number' ? speed : MOOD_DRIFT[mood];
    const cluster = MOOD_CLUSTER[mood];
    const twinkleStrength = MOOD_TWINKLE[mood];

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);

      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const resolvedCount = resolveParticleCount(width, height, density, intensity, count);

      particlesRef.current = Array.from({ length: resolvedCount }, () => {
        const bandOffset = Math.random() * Math.PI * 2;
        const seed = Math.random();
        const position = sampleParticlePosition(width, height, pattern, cluster, bandOffset);
        const velocity = resolveInitialVelocity(pattern, position.x, position.y, width, height, drift, seed);
        return {
          x: position.x,
          y: position.y,
          vx: velocity.vx,
          vy: velocity.vy,
          size: sizeRange[0] + Math.random() * Math.max(sizeRange[1] - sizeRange[0], 0.1),
          alpha: 0.3 + Math.random() * 0.7,
          phase: Math.random() * Math.PI * 2,
          bandOffset,
          seed,
        };
      });
    };

    const drawFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;

      for (const particle of particlesRef.current) {
        if (!reduceMotion) {
          if (pattern === 'orbital') {
            const centerX = width * 0.5;
            const centerY = height * 0.44;
            const dx = particle.x - centerX;
            const dy = particle.y - centerY;
            const distance = Math.max(Math.hypot(dx, dy), 1);
            const tangentX = -dy / distance;
            const tangentY = dx / distance;
            const inwardX = -dx / distance;
            const inwardY = -dy / distance;

            particle.vx =
              particle.vx * 0.982 +
              tangentX * drift * (0.012 + particle.seed * 0.01) +
              inwardX * Math.sin(time * 0.00018 + particle.phase) * drift * 0.0022;
            particle.vy =
              particle.vy * 0.982 +
              tangentY * drift * (0.012 + particle.seed * 0.01) +
              inwardY * Math.sin(time * 0.00016 + particle.phase) * drift * 0.0018;
          }

          particle.x += particle.vx;
          particle.y += particle.vy + Math.sin(time * 0.00014 + particle.phase) * drift * (pattern === 'orbital' ? 0.03 : 0.08);

          const weight = resolvePatternWeight(pattern, particle.x, particle.y, width, height, cluster, particle.bandOffset);
          if (particle.x < -8 || particle.x > width + 8 || particle.y < -8 || particle.y > height + 8 || weight < 0.03) {
            const next = sampleParticlePosition(width, height, pattern, cluster, particle.bandOffset);
            const velocity = resolveInitialVelocity(pattern, next.x, next.y, width, height, drift, particle.seed);
            particle.x = next.x;
            particle.y = next.y;
            particle.vx = velocity.vx;
            particle.vy = velocity.vy;
          }
        }

        const fieldWeight = resolvePatternWeight(pattern, particle.x, particle.y, width, height, cluster, particle.bandOffset);
        const twinkle = reduceMotion
          ? 0.92
          : 0.8 + Math.sin(time * 0.001 * (0.55 + twinkleStrength) + particle.phase) * twinkleStrength * 0.16;
        const focalBoost = resolveFocalBoost(particle.x, particle.y, width, height, focalAreas);
        const resolvedAlpha = clamp(
          particle.alpha * fieldWeight * twinkle * opacity * (pattern === 'orbital' ? 0.82 : 0.58) * focalBoost,
          0.015,
          0.96,
        );
        const resolvedSize =
          particle.size *
          clamp((pattern === 'orbital' ? 0.88 + fieldWeight * 0.4 : 1) * focalBoost, 0.7, 2.2);

        ctx.globalAlpha = resolvedAlpha;

        if (shape === 'round') {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, resolvedSize * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(particle.x, particle.y, resolvedSize, resolvedSize);
        }
      }

      ctx.globalAlpha = 1;

      if (!reduceMotion) {
        frameRef.current = window.requestAnimationFrame(drawFrame);
      }
    };

    resize();

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => resize())
      : null;

    observer?.observe(container);
    window.addEventListener('resize', resize);
    drawFrame(0);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [
    blendMode,
    color,
    count,
    density,
    focalAreas,
    intensity,
    mood,
    opacity,
    pattern,
    reduceMotion,
    shape,
    sizeRange,
    speed,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        isolation: 'isolate',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          mixBlendMode: blendMode,
          opacity: reduceMotion ? Math.min(opacity, 0.6) : opacity,
        }}
      />
      {children ? <div style={{ position: 'relative', zIndex: 1 }}>{children}</div> : null}
    </div>
  );
};

ParticleField.displayName = 'ParticleField';

/** Backward-compatible alias for the earlier, simpler particle effect. */
export const Particles = ParticleField;
