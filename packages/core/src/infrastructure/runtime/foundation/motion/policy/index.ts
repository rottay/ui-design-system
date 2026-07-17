import type {
  MotionPolicy,
  MotionPolicyInput,
  NormalizedTenantMotionDial,
} from '../../../../../foundation/contracts/runtime/motion';
import { MOTION_DIAL_BOUNDS } from '../../../../../foundation/contracts/runtime/motion';
import type { MotionProfile } from '../../../../../foundation/contracts/kernel/verticals';

export const MOTION_PROFILE_DEFAULTS: Readonly<
  Record<MotionProfile, Readonly<NormalizedTenantMotionDial>>
> = Object.freeze({
  precise: Object.freeze({
    intensity: 0.45,
    durationScale: 0.85,
    ambient: 'subtle' as const,
  }),
  calm: Object.freeze({
    intensity: 0.3,
    durationScale: 1,
    ambient: 'off' as const,
  }),
  expressive: Object.freeze({
    intensity: 0.8,
    durationScale: 0.95,
    ambient: 'subtle' as const,
  }),
});

/** Vertical-owned choreography limits. Tenants can scale, never replace them. */
export const MOTION_PROFILE_ENVELOPES = Object.freeze({
  precise: Object.freeze({
    entrance: 'spring' as const,
    baseDurationMs: 180,
    staggerDelayMs: 24,
    staggerMaxMs: 160,
    maxOffsetPx: 2,
    maxScaleDelta: 0.01,
    useSpring: true,
    springTension: 170,
    springFriction: 26,
  }),
  calm: Object.freeze({
    entrance: 'fade' as const,
    baseDurationMs: 200,
    staggerDelayMs: 30,
    staggerMaxMs: 200,
    maxOffsetPx: 2,
    maxScaleDelta: 0,
    useSpring: false,
    springTension: 170,
    springFriction: 26,
  }),
  expressive: Object.freeze({
    entrance: 'slideUp' as const,
    baseDurationMs: 350,
    staggerDelayMs: 65,
    staggerMaxMs: 450,
    maxOffsetPx: 6,
    maxScaleDelta: 0.02,
    useSpring: true,
    springTension: 200,
    springFriction: 18,
  }),
} as const satisfies Record<MotionProfile, object>);

/**
 * Resolve one governed choreography envelope without an opaque computed
 * capability lookup. The explicit switch is also the exhaustiveness boundary
 * used by static dependency-honesty scanning.
 */
export function resolveMotionProfileEnvelope(profile: MotionProfile) {
  switch (profile) {
    case 'precise':
      return MOTION_PROFILE_ENVELOPES.precise;
    case 'expressive':
      return MOTION_PROFILE_ENVELOPES.expressive;
    case 'calm':
    default:
      return MOTION_PROFILE_ENVELOPES.calm;
  }
}

function normalizeProfile(value: unknown): MotionProfile {
  return value === 'precise' || value === 'expressive' || value === 'calm'
    ? value
    : 'calm';
}

function safeRead(value: unknown, key: keyof TenantDialLike): unknown {
  if ((typeof value !== 'object' && typeof value !== 'function') || value === null) {
    return undefined;
  }

  try {
    const dial = value as TenantDialLike;
    switch (key) {
      case 'intensity':
        return dial.intensity;
      case 'durationScale':
        return dial.durationScale;
      case 'ambient':
        return dial.ambient;
    }
  } catch {
    return undefined;
  }
}

interface TenantDialLike {
  intensity?: unknown;
  durationScale?: unknown;
  ambient?: unknown;
}

function finiteBoundedNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

/**
 * Resolve untrusted DB/JSON tenant input into the intentionally small public
 * dial. Invalid values fall back to the vertical profile instead of being
 * coerced; getters and proxies cannot escape the normalization boundary.
 */
export function normalizeTenantMotionDial(
  value: unknown,
  profileInput: MotionProfile = 'calm',
): NormalizedTenantMotionDial {
  const profile = normalizeProfile(profileInput);
  const defaults = MOTION_PROFILE_DEFAULTS[profile];
  const ambientValue = safeRead(value, 'ambient');

  return {
    intensity: finiteBoundedNumber(
      safeRead(value, 'intensity'),
      defaults.intensity,
      MOTION_DIAL_BOUNDS.intensity.min,
      MOTION_DIAL_BOUNDS.intensity.max,
    ),
    durationScale: finiteBoundedNumber(
      safeRead(value, 'durationScale'),
      defaults.durationScale,
      MOTION_DIAL_BOUNDS.durationScale.min,
      MOTION_DIAL_BOUNDS.durationScale.max,
    ),
    ambient:
      ambientValue === 'off' || ambientValue === 'subtle'
        ? ambientValue
        : defaults.ambient,
  };
}

/** Resolve the sole runtime motion policy from profile, tenant and device state. */
export function resolveMotionPolicy(input: MotionPolicyInput): MotionPolicy {
  const profile = normalizeProfile(input?.profile);
  const dial = normalizeTenantMotionDial(input?.tenantDial, profile);
  const reduce = input?.reduce === true;
  const pointer = input?.pointer === 'fine' ? 'fine' : 'coarse';
  const power = input?.power === 'normal' ? 'normal' : 'constrained';
  const visible = input?.visible === true;
  const allowHoverEffects =
    !reduce && pointer === 'fine' && power === 'normal' && visible;
  // Live product state (for example an active tool) is not ambient decoration.
  // Both are disabled on coarse/reduced/constrained/hidden environments, while
  // the tenant ambient dial only gates decorative motion.
  const allowContinuousMotion = allowHoverEffects;
  const allowAmbientMotion =
    allowContinuousMotion && dial.ambient === 'subtle';
  const maxContinuousLoops: 0 | 1 = allowContinuousMotion ? 1 : 0;

  return {
    profile,
    ...dial,
    reduce,
    pointer,
    power,
    visible,
    maxContinuousLoops,
    allowContinuousMotion,
    allowAmbientMotion,
    allowHoverEffects,
  };
}
