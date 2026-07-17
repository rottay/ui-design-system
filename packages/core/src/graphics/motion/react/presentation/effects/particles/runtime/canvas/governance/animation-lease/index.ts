import {
  acquireContinuousGraphicsRuntimeLease,
  getContinuousGraphicsRuntimeSnapshot,
  releaseContinuousGraphicsRuntimeLease,
  resetContinuousGraphicsRuntimeGovernorForTests,
} from '@/infrastructure/runtime/foundation/graphics/continuous-runtime-governor/runtime/admission';

type ParticleAnimationLeaseOwner = symbol;
type ParticleAnimationLeaseCallback = () => void;

/** Particle-specific adapter over the shared document graphics budget. */
export function acquireParticleAnimationLease(
  owner: ParticleAnimationLeaseOwner,
  onAvailable: ParticleAnimationLeaseCallback,
): boolean {
  return acquireContinuousGraphicsRuntimeLease({
    owner,
    runtimeClass: 'decorative-2d',
    onAvailable,
  });
}

export function releaseParticleAnimationLease(
  owner: ParticleAnimationLeaseOwner,
): void {
  releaseContinuousGraphicsRuntimeLease(owner);
}

export function getParticleAnimationLeaseCount(): 0 | 1 {
  return getContinuousGraphicsRuntimeSnapshot().activeByClass['decorative-2d'] === 0
    ? 0
    : 1;
}

/** Test-only cleanup; intentionally absent from public effect entrypoints. */
export function resetParticleAnimationLeaseForTests(): void {
  resetContinuousGraphicsRuntimeGovernorForTests();
}
