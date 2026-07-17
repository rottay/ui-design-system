import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  acquireParticleAnimationLease,
  getParticleAnimationLeaseCount,
  releaseParticleAnimationLease,
  resetParticleAnimationLeaseForTests,
} from '@/graphics/motion/react/presentation/effects/particles/runtime/canvas/governance/animation-lease';
import {
  acquireSpatialContextLease,
  getSpatialContextLeaseCount,
  releaseSpatialContextLease,
} from '@/infrastructure/runtime/spatial/runtime/browser/context-lease';

afterEach(() => resetParticleAnimationLeaseForTests());

describe('Particle and Spatial shared admission', () => {
  it('never grants the Particle RAF and Spatial context leases simultaneously', () => {
    const particle = Symbol('particle');
    const spatial = Symbol('spatial');
    const acquireSpatial = vi.fn(() => {
      expect(acquireSpatialContextLease(spatial, acquireSpatial)).toBe(true);
    });

    expect(acquireParticleAnimationLease(particle, vi.fn())).toBe(true);
    expect(acquireSpatialContextLease(spatial, acquireSpatial)).toBe(false);
    expect(getParticleAnimationLeaseCount()).toBe(1);
    expect(getSpatialContextLeaseCount()).toBe(0);

    releaseParticleAnimationLease(particle);
    expect(acquireSpatial).toHaveBeenCalledOnce();
    expect(getParticleAnimationLeaseCount()).toBe(0);
    expect(getSpatialContextLeaseCount()).toBe(1);

    releaseSpatialContextLease(spatial);
    expect(getParticleAnimationLeaseCount() + getSpatialContextLeaseCount()).toBe(0);
  });
});
