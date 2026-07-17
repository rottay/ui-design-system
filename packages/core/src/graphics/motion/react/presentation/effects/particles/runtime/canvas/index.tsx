'use client';

/**
 * ParticleField canvas runtime.
 *
 * This module is loaded only through the public lazy boundary. Canvas work is
 * static-first and globally budgeted: policy, viewport and context state must
 * all be eligible before one ParticleField may acquire the sole RAF lease.
 */

import React, { useEffect, useMemo, useRef } from 'react';

import { PROVIDER_PAINT_ATTRIBUTE_FILTER } from '@/infrastructure/runtime/dom/runtime/css-color-resolution';
import type { ParticleFieldFocalArea, ParticleFieldProps } from '@/graphics/motion/foundation/contracts';
import { useMotionPolicy } from '@/infrastructure/runtime/motion';
import { isParticleAnimationEligible } from '@/graphics/motion/foundation/particles/eligibility';
import {
  createParticleRandom,
  normalizeParticleRuntimeConfig,
  resolveBoundedParticleCount,
  resolveConcreteParticleColor,
  resolveParticleCanvasMetrics,
  resolveParticleDeltaMs,
  stableParticleSeed,
} from '@/graphics/motion/foundation/particles/config';
import { useParticleInView } from '../foundation/visibility';
import {
  acquireParticleAnimationLease,
  releaseParticleAnimationLease,
} from './governance/animation-lease';

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

type RuntimeEvidence =
  | 'active'
  | 'context-lost'
  | 'lease-waiting'
  | 'no-context'
  | 'static';

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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveAmbientBandY(
  width: number,
  height: number,
  x: number,
  bandOffset: number,
  cluster: number,
  random: () => number,
): number {
  const normalizedX = width <= 0 ? 0 : x / width;
  const bandCenter =
    0.42
    + Math.sin(normalizedX * Math.PI * (1.15 + cluster * 0.55) + bandOffset)
      * (0.09 + cluster * 0.1);
  const spread = height * (0.16 + cluster * 0.08);
  const gaussianish = (random() + random() + random()) / 3 - 0.5;
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
): number {
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
    const terrace = 0.55 + (Math.floor((distance - voidRadius) * 18) % 2 === 0 ? 0.18 : 0);
    const edgeBias = 0.76 + Math.pow(Math.abs(normalizedX - 0.5) * 2, 0.88) * 0.92;
    const topBias = 0.84 + Math.max(0, 0.6 - normalizedY) * 0.82;
    const angularBias = 0.92 + Math.abs(Math.cos(theta * 1.6)) * 0.34;
    const innerSuppression = distance < voidRadius ? distance / voidRadius : 1;
    const outerFalloff = distance > 1.08 ? clamp(1.4 - distance, 0, 1) : 1;
    return clamp(
      shellDistance
      * contour
      * terrace
      * edgeBias
      * topBias
      * angularBias
      * innerSuppression
      * outerFalloff,
      0.01,
      1.35,
    );
  }

  const bandCenter =
    0.44
    + Math.sin(normalizedX * Math.PI * (1.15 + cluster * 0.7) + bandOffset)
      * (0.08 + cluster * 0.1);
  const bandDistance = Math.abs(normalizedY - bandCenter);
  return clamp(0.22 + (1 - bandDistance / (0.18 + cluster * 0.12)) * 0.95, 0.02, 1);
}

function sampleParticlePosition(
  width: number,
  height: number,
  pattern: 'ambient' | 'orbital',
  cluster: number,
  bandOffset: number,
  random: () => number,
): { x: number; y: number } {
  if (pattern === 'ambient') {
    const x = random() * width;
    return {
      x,
      y: resolveAmbientBandY(width, height, x, bandOffset, cluster, random),
    };
  }

  for (let attempt = 0; attempt < 14; attempt += 1) {
    const candidateX = random() * width;
    const candidateY = random() * height;
    const weight = resolvePatternWeight(
      pattern,
      candidateX,
      candidateY,
      width,
      height,
      cluster,
      bandOffset,
    );
    if (random() <= Math.min(weight, 1)) return { x: candidateX, y: candidateY };
  }

  return { x: random() * width, y: random() * height };
}

function resolveInitialVelocity(
  pattern: 'ambient' | 'orbital',
  x: number,
  y: number,
  width: number,
  height: number,
  drift: number,
  seed: number,
  random: () => number,
): { vx: number; vy: number } {
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
      vx: tangentX * orbitalDrift + (random() - 0.5) * drift * 0.08,
      vy: tangentY * orbitalDrift + (random() - 0.5) * drift * 0.08,
    };
  }

  return {
    vx: (random() - 0.5) * drift * (1.1 + random() * 0.5),
    vy: (random() - 0.5) * drift * 0.46,
  };
}

function resolveFocalBoost(
  x: number,
  y: number,
  width: number,
  height: number,
  focalAreas: readonly ParticleFieldFocalArea[],
): number {
  if (focalAreas.length === 0 || width <= 0 || height <= 0) return 1;
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

/** Canvas implementation; the public owner retains the lazy boundary. */
export const ParticleField: React.FC<ParticleFieldProps> = (props) => {
  const {
    children,
    className,
    style,
    count,
    color,
    speed,
    density,
    intensity,
    mood,
    pattern,
    shape,
    sizeRange,
    opacity,
    blendMode,
    focalAreas,
  } = props;
  const config = useMemo(
    () => normalizeParticleRuntimeConfig({
      count,
      color,
      speed,
      density,
      intensity,
      mood,
      pattern,
      shape,
      sizeRange,
      opacity,
      blendMode,
      focalAreas,
    }),
    [
      blendMode,
      color,
      count,
      density,
      focalAreas,
      intensity,
      mood,
      opacity,
      pattern,
      shape,
      sizeRange,
      speed,
    ],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ParticleState[]>([]);
  const frameRef = useRef<number | null>(null);
  const leaseOwnerRef = useRef(Symbol('particle-field-raf-lease'));
  const motionPolicy = useMotionPolicy();
  const inView = useParticleInView(containerRef, '200px');
  const animationEligible =
    isParticleAnimationEligible(inView, motionPolicy)
    && config.count !== 0
    && config.opacity > 0;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const leaseOwner = leaseOwnerRef.current;
    const drift = config.speed ?? MOOD_DRIFT[config.mood];
    const cluster = MOOD_CLUSTER[config.mood];
    const twinkleStrength = MOOD_TWINKLE[config.mood];
    let disposed = false;
    let contextLost = false;
    let leaseOwned = false;
    let ctx: CanvasRenderingContext2D | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let themeObserver: MutationObserver | null = null;
    let removeResizeFallback: (() => void) | null = null;
    let lastMetricsKey = '';
    let lastTimestamp: number | null = null;
    let simulationTimeMs = 0;
    let width = 1;
    let height = 1;
    let random = createParticleRandom(1);
    let resolvedColor = 'rgba(255, 255, 255, 0.88)';

    const setEvidence = (runtime: RuntimeEvidence): void => {
      if (disposed) return;
      container.dataset.particleFieldRuntime = runtime;
      container.dataset.particleFieldRaf = leaseOwned ? 'leased' : 'none';
    };

    const cancelFrame = (): void => {
      if (frameRef.current === null) return;
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };

    const releaseLease = (): void => {
      cancelFrame();
      releaseParticleAnimationLease(leaseOwner);
      leaseOwned = false;
    };

    const draw = (elapsedMs: number, frameScale: number, animate: boolean): void => {
      if (!ctx || contextLost || disposed) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = resolvedColor;

      for (const particle of particlesRef.current) {
        if (animate) {
          if (config.pattern === 'orbital') {
            const centerX = width * 0.5;
            const centerY = height * 0.44;
            const dx = particle.x - centerX;
            const dy = particle.y - centerY;
            const distance = Math.max(Math.hypot(dx, dy), 1);
            const tangentX = -dy / distance;
            const tangentY = dx / distance;
            const inwardX = -dx / distance;
            const inwardY = -dy / distance;
            const damping = Math.pow(0.982, frameScale);

            particle.vx =
              particle.vx * damping
              + tangentX * drift * (0.012 + particle.seed * 0.01) * frameScale
              + inwardX * Math.sin(elapsedMs * 0.00018 + particle.phase) * drift * 0.0022 * frameScale;
            particle.vy =
              particle.vy * damping
              + tangentY * drift * (0.012 + particle.seed * 0.01) * frameScale
              + inwardY * Math.sin(elapsedMs * 0.00016 + particle.phase) * drift * 0.0018 * frameScale;
          }

          particle.x += particle.vx * frameScale;
          particle.y +=
            particle.vy * frameScale
            + Math.sin(elapsedMs * 0.00014 + particle.phase)
              * drift
              * (config.pattern === 'orbital' ? 0.03 : 0.08)
              * frameScale;

          const weight = resolvePatternWeight(
            config.pattern,
            particle.x,
            particle.y,
            width,
            height,
            cluster,
            particle.bandOffset,
          );
          if (
            particle.x < -8
            || particle.x > width + 8
            || particle.y < -8
            || particle.y > height + 8
            || weight < 0.03
          ) {
            const next = sampleParticlePosition(
              width,
              height,
              config.pattern,
              cluster,
              particle.bandOffset,
              random,
            );
            const velocity = resolveInitialVelocity(
              config.pattern,
              next.x,
              next.y,
              width,
              height,
              drift,
              particle.seed,
              random,
            );
            particle.x = next.x;
            particle.y = next.y;
            particle.vx = velocity.vx;
            particle.vy = velocity.vy;
          }
        }

        const fieldWeight = resolvePatternWeight(
          config.pattern,
          particle.x,
          particle.y,
          width,
          height,
          cluster,
          particle.bandOffset,
        );
        const twinkle = animate
          ? 0.8
            + Math.sin(elapsedMs * 0.001 * (0.55 + twinkleStrength) + particle.phase)
              * twinkleStrength
              * 0.16
          : 0.92;
        const focalBoost = resolveFocalBoost(
          particle.x,
          particle.y,
          width,
          height,
          config.focalAreas,
        );
        const resolvedAlpha = clamp(
          particle.alpha
          * fieldWeight
          * twinkle
          * config.opacity
          * (config.pattern === 'orbital' ? 0.82 : 0.58)
          * focalBoost,
          0.015,
          0.96,
        );
        const resolvedSize = particle.size * clamp(
          (config.pattern === 'orbital' ? 0.88 + fieldWeight * 0.4 : 1) * focalBoost,
          0.7,
          2.2,
        );

        ctx.globalAlpha = resolvedAlpha;
        if (config.shape === 'round') {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, resolvedSize * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(particle.x, particle.y, resolvedSize, resolvedSize);
        }
      }

      ctx.globalAlpha = 1;
    };

    const refreshColor = (): void => {
      const nextColor = resolveConcreteParticleColor(config.color, container);
      const changed = nextColor !== resolvedColor;
      resolvedColor = nextColor;
      canvas.dataset.particleColor = resolvedColor;
      if (changed) draw(simulationTimeMs, 0, false);
    };

    const scheduleFrame = (): void => {
      if (
        disposed
        || contextLost
        || !animationEligible
        || !leaseOwned
        || frameRef.current !== null
      ) {
        return;
      }
      frameRef.current = window.requestAnimationFrame((timestamp) => {
        frameRef.current = null;
        if (disposed || contextLost || !animationEligible || !leaseOwned) return;
        const deltaMs = resolveParticleDeltaMs(timestamp, lastTimestamp);
        lastTimestamp = timestamp;
        simulationTimeMs += deltaMs;
        draw(simulationTimeMs, deltaMs / (1000 / 60), true);
        scheduleFrame();
      });
    };

    const requestLease = (): void => {
      if (disposed || contextLost || !animationEligible) {
        setEvidence(contextLost ? 'context-lost' : 'static');
        return;
      }
      const acquired = acquireParticleAnimationLease(leaseOwner, requestLease);
      leaseOwned = acquired;
      if (!acquired) {
        setEvidence('lease-waiting');
        return;
      }

      if (!ctx) {
        try {
          ctx = canvas.getContext('2d');
        } catch {
          ctx = null;
        }
        if (!ctx) {
          releaseLease();
          setEvidence('no-context');
          return;
        }
        ensureResizeMonitoring();
        resize(true);
      }

      lastTimestamp = null;
      setEvidence('active');
      scheduleFrame();
    };

    const resize = (force = false): void => {
      if (!ctx || contextLost || disposed) return;
      const rect = container.getBoundingClientRect();
      const metrics = resolveParticleCanvasMetrics(
        rect.width,
        rect.height,
        window.devicePixelRatio,
      );
      const metricsKey = [
        metrics.width,
        metrics.height,
        metrics.pixelWidth,
        metrics.pixelHeight,
      ].join(':');
      if (!force && metricsKey === lastMetricsKey) return;
      lastMetricsKey = metricsKey;
      width = metrics.width;
      height = metrics.height;
      canvas.width = metrics.pixelWidth;
      canvas.height = metrics.pixelHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(metrics.scaleX, 0, 0, metrics.scaleY, 0, 0);

      const particleCount = resolveBoundedParticleCount(metrics, config);
      const seed = stableParticleSeed(JSON.stringify({
        width,
        height,
        particleCount,
        density: config.density,
        intensity: config.intensity,
        mood: config.mood,
        pattern: config.pattern,
        shape: config.shape,
        sizeRange: config.sizeRange,
        focalAreas: config.focalAreas,
      }));
      random = createParticleRandom(seed);
      resolvedColor = resolveConcreteParticleColor(config.color, container);

      particlesRef.current = Array.from({ length: particleCount }, () => {
        const bandOffset = random() * Math.PI * 2;
        const particleSeed = random();
        const position = sampleParticlePosition(
          width,
          height,
          config.pattern,
          cluster,
          bandOffset,
          random,
        );
        const velocity = resolveInitialVelocity(
          config.pattern,
          position.x,
          position.y,
          width,
          height,
          drift,
          particleSeed,
          random,
        );
        return {
          x: position.x,
          y: position.y,
          vx: velocity.vx,
          vy: velocity.vy,
          size: config.sizeRange[0]
            + random() * Math.max(config.sizeRange[1] - config.sizeRange[0], 0.1),
          alpha: 0.3 + random() * 0.7,
          phase: random() * Math.PI * 2,
          bandOffset,
          seed: particleSeed,
        };
      });

      canvas.dataset.particleCount = String(particleCount);
      canvas.dataset.particleDpr = metrics.effectiveDpr.toFixed(3);
      canvas.dataset.particlePixels = String(metrics.pixelCount);
      canvas.dataset.particleSeed = String(seed);
      canvas.dataset.particleColor = resolvedColor;
      lastTimestamp = null;
      simulationTimeMs = 0;
      draw(0, 0, false);
    };

    const ensureResizeMonitoring = (): void => {
      if (resizeObserver || removeResizeFallback) return;
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => resize());
        resizeObserver.observe(container);
        return;
      }
      const onWindowResize = () => resize();
      window.addEventListener('resize', onWindowResize);
      removeResizeFallback = () => window.removeEventListener('resize', onWindowResize);
    };

    const ensureThemeMonitoring = (): void => {
      if (themeObserver || typeof MutationObserver === 'undefined') return;
      themeObserver = new MutationObserver(() => refreshColor());
      let owner: HTMLElement | null = container;
      while (owner) {
        themeObserver.observe(owner, {
          attributes: true,
          attributeFilter: [...PROVIDER_PAINT_ATTRIBUTE_FILTER],
        });
        owner = owner.parentElement;
      }
    };

    const onContextLost = (event: Event): void => {
      event.preventDefault();
      contextLost = true;
      releaseLease();
      ctx = null;
      particlesRef.current = [];
      canvas.dataset.particleCount = '0';
      canvas.dataset.particleDpr = '0';
      canvas.dataset.particlePixels = '0';
      setEvidence('context-lost');
    };

    const onContextRestored = (): void => {
      if (disposed) return;
      contextLost = false;
      if (animationEligible) requestLease();
      else setEvidence('static');
    };

    canvas.addEventListener('contextlost', onContextLost);
    canvas.addEventListener('contextrestored', onContextRestored);
    ensureThemeMonitoring();
    refreshColor();
    if (animationEligible) requestLease();
    else setEvidence('static');

    return () => {
      if (disposed) return;
      disposed = true;
      cancelFrame();
      resizeObserver?.disconnect();
      themeObserver?.disconnect();
      removeResizeFallback?.();
      canvas.removeEventListener('contextlost', onContextLost);
      canvas.removeEventListener('contextrestored', onContextRestored);
      particlesRef.current = [];
      ctx = null;
      canvas.width = 1;
      canvas.height = 1;
      canvas.dataset.particleCount = '0';
      canvas.dataset.particleDpr = '0';
      canvas.dataset.particlePixels = '0';
      releaseParticleAnimationLease(leaseOwner);
      leaseOwned = false;
    };
  }, [animationEligible, config]);

  return (
    <div
      ref={containerRef}
      className={className}
      data-particle-field-in-view={inView ? 'true' : 'false'}
      data-particle-field-policy={animationEligible ? 'eligible' : 'blocked'}
      data-particle-field-raf="none"
      data-particle-field-runtime="static"
      style={{
        position: 'relative',
        isolation: 'isolate',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-particle-count="0"
        data-particle-dpr="0"
        data-particle-field-canvas="true"
        data-particle-pixels="0"
        role="presentation"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          mixBlendMode: config.blendMode,
          opacity: animationEligible ? config.opacity : Math.min(config.opacity, 0.6),
        }}
      />
      {children ? (
        <div
          data-particle-field-content="true"
          style={{ position: 'relative', zIndex: 1 }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
};

ParticleField.displayName = 'ParticleField';

/** Backward-compatible alias for the earlier particle effect. */
export const Particles = ParticleField;
