import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  PARTICLE_RUNTIME_LIMITS,
  createParticleRandom,
  normalizeParticleRuntimeConfig,
  resolveBoundedParticleCount,
  resolveConcreteParticleColor,
  resolveParticleCanvasMetrics,
  resolveParticleDeltaMs,
  stableParticleSeed,
} from '..';
import { installInheritedCustomPropertyModel } from './support/inherited-custom-properties';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('ParticleField runtime normalization', () => {
  it('bounds hostile numeric, enum, tuple, blend and focal-area input', () => {
    const focalAreas = Array.from({ length: 20 }, (_, index) => ({
      x: index - 10,
      y: index + 10,
      radius: index === 0 ? 0 : 10,
      strength: 99,
    }));
    focalAreas[1] = { x: Number.NaN, y: 1, radius: 1, strength: 1 };

    const config = normalizeParticleRuntimeConfig({
      count: Number.MAX_SAFE_INTEGER,
      color: `  var(--brand)${'x'.repeat(700)}  `,
      speed: -999,
      density: 'catastrophic',
      intensity: 'ultra',
      mood: 'chaos',
      pattern: 'hostile',
      shape: 'triangle',
      sizeRange: [99, -99],
      opacity: -4,
      blendMode: 'url(javascript:alert(1))',
      focalAreas,
    } as never);

    expect(config.count).toBe(PARTICLE_RUNTIME_LIMITS.maxParticles);
    expect(config.color.length).toBeLessThanOrEqual(512);
    expect(config.speed).toBe(0);
    expect(config.density).toBe('medium');
    expect(config.intensity).toBe('medium');
    expect(config.mood).toBe('calm');
    expect(config.pattern).toBe('ambient');
    expect(config.shape).toBe('square');
    expect(config.sizeRange).toEqual([0.25, 8]);
    expect(config.opacity).toBe(0);
    expect(config.blendMode).toBe('screen');
    expect(config.focalAreas).toHaveLength(7);
    expect(config.focalAreas[0]).toEqual({ x: 0, y: 1, radius: 0.01, strength: 2 });
  });

  it('does not let throwing getters escape the normalization boundary', () => {
    const hostile = new Proxy({}, {
      get() {
        throw new Error('hostile getter');
      },
    });

    expect(() => normalizeParticleRuntimeConfig(hostile)).not.toThrow();
    expect(normalizeParticleRuntimeConfig(hostile)).toMatchObject({
      density: 'medium',
      intensity: 'medium',
      mood: 'calm',
      opacity: 1,
    });
  });
});

describe('ParticleField allocation budgets', () => {
  it('caps DPR, each backing dimension, total pixels and particle count', () => {
    const metrics = resolveParticleCanvasMetrics(100_000, 100_000, 99);
    const count = resolveBoundedParticleCount(metrics, {
      count: PARTICLE_RUNTIME_LIMITS.maxParticles,
      density: 'high',
      intensity: 'high',
    });

    expect(metrics.effectiveDpr).toBeLessThanOrEqual(
      PARTICLE_RUNTIME_LIMITS.maxDevicePixelRatio,
    );
    expect(metrics.pixelWidth).toBeLessThanOrEqual(PARTICLE_RUNTIME_LIMITS.maxCanvasDimension);
    expect(metrics.pixelHeight).toBeLessThanOrEqual(PARTICLE_RUNTIME_LIMITS.maxCanvasDimension);
    expect(metrics.pixelCount).toBeLessThanOrEqual(PARTICLE_RUNTIME_LIMITS.maxCanvasPixels);
    expect(count).toBeLessThanOrEqual(PARTICLE_RUNTIME_LIMITS.maxParticles);
    expect(PARTICLE_RUNTIME_LIMITS.maxActiveCanvasContexts).toBe(1);
  });

  it('clamps frame stalls and produces stable seeded random sequences', () => {
    const seed = stableParticleSeed('same field');
    const first = createParticleRandom(seed);
    const second = createParticleRandom(seed);

    expect(Array.from({ length: 8 }, first)).toEqual(Array.from({ length: 8 }, second));
    expect(resolveParticleDeltaMs(10_000, 0)).toBe(PARTICLE_RUNTIME_LIMITS.maxDeltaMs);
    expect(resolveParticleDeltaMs(10, null)).toBe(0);
    expect(resolveParticleDeltaMs(Number.NaN, 0)).toBe(0);
  });
});

describe('ParticleField color boundary', () => {
  it('resolves inherited provider variables and color-mix to concrete RGBA', () => {
    installInheritedCustomPropertyModel();
    const provider = document.createElement('section');
    const field = document.createElement('div');
    provider.style.setProperty('--tenant-particle', '#123456');
    provider.style.setProperty(
      '--tenant-particle-nested',
      'var(--missing-particle, var(--tenant-particle, #ffffff))',
    );
    provider.style.setProperty('--particle-cycle-a', 'var(--particle-cycle-b)');
    provider.style.setProperty('--particle-cycle-b', 'var(--particle-cycle-a)');
    provider.appendChild(field);
    document.body.appendChild(provider);

    const color = resolveConcreteParticleColor(
      'color-mix(in srgb, var(--tenant-particle-nested) 25%, transparent)',
      field,
    );

    expect(color).toBe('rgba(18, 52, 86, 0.25)');
    expect(color).not.toMatch(/var\(|color-mix\(/);
    expect(resolveConcreteParticleColor('var(--particle-cycle-a)', field))
      .toBe('rgba(255, 255, 255, 0.88)');
    expect(field.querySelector('span')).toBeNull();
  });
});
