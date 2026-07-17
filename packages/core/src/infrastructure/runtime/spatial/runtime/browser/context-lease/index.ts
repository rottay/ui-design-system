import {
  acquireContinuousGraphicsRuntimeLease,
  getContinuousGraphicsRuntimeSnapshot,
  releaseContinuousGraphicsRuntimeLease,
  resetContinuousGraphicsRuntimeGovernorForTests,
} from '@/infrastructure/runtime/foundation/graphics/continuous-runtime-governor/runtime/admission';

type SpatialLeaseOwner = symbol;
type SpatialLeaseCallback = () => void;

/**
 * Admit at most one live spatial context through the shared document graphics
 * budget. A Spatial context and a Particle RAF can therefore never run at the
 * same time.
 *
 * Callers that cannot acquire immediately are queued in insertion order. The
 * callback is only a notification: it must call this function again before it
 * mounts a context. Keeping ownership explicit prevents a stale/unmounted
 * waiter from inheriting a lease it can no longer release.
 */
export function acquireSpatialContextLease(
  owner: SpatialLeaseOwner,
  onAvailable: SpatialLeaseCallback,
): boolean {
  return acquireContinuousGraphicsRuntimeLease({
    owner,
    runtimeClass: 'immersive-spatial',
    onAvailable,
  });
}

export function releaseSpatialContextLease(owner: SpatialLeaseOwner): void {
  releaseContinuousGraphicsRuntimeLease(owner);
}

export function getSpatialContextLeaseCount(): 0 | 1 {
  return getContinuousGraphicsRuntimeSnapshot().activeByClass['immersive-spatial'] === 0
    ? 0
    : 1;
}

/** Test-only module reset; intentionally absent from the public entrypoint. */
export function resetSpatialContextLeaseForTests(): void {
  resetContinuousGraphicsRuntimeGovernorForTests();
}
