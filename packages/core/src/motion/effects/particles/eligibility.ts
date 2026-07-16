import type { MotionPolicy } from '../../../contracts/motion';

export interface ParticleMotionPolicyLike extends Pick<
  MotionPolicy,
  | 'allowAmbientMotion'
  | 'maxContinuousLoops'
  | 'pointer'
  | 'power'
  | 'reduce'
  | 'visible'
> {}

/** Decorative canvas work is fail-closed at every environmental seam. */
export function isParticleAnimationEligible(
  inView: boolean,
  policy: ParticleMotionPolicyLike,
): boolean {
  return inView === true
    && policy.allowAmbientMotion === true
    && policy.maxContinuousLoops === 1
    && policy.reduce === false
    && policy.pointer === 'fine'
    && policy.power === 'normal'
    && policy.visible === true;
}

/** Avoid requesting the lazy runtime when props guarantee an empty field. */
export function hasPotentialParticles(count: unknown, opacity: unknown): boolean {
  if (typeof count === 'number' && Number.isFinite(count) && count <= 0) return false;
  if (typeof opacity === 'number' && Number.isFinite(opacity) && opacity <= 0) return false;
  return true;
}
