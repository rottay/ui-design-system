/**
 * Canonical timing helpers for the public motion primitives.
 *
 * Public `*Ms` props are always milliseconds; Motion's seconds are produced
 * by exactly one conversion.
 */

export interface ResolveMotionMillisecondsOptions {
  /** Caller-supplied millisecond value. */
  milliseconds?: number;
  /** Fallback in milliseconds when the caller supplied none. */
  fallbackMilliseconds: number;
}

function finiteNonNegative(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : Math.max(0, fallback);
}

/** Resolve a caller millisecond value against its fallback. */
export function resolveMotionMilliseconds({
  milliseconds,
  fallbackMilliseconds,
}: ResolveMotionMillisecondsOptions): number {
  const fallback = finiteNonNegative(fallbackMilliseconds, 0);

  return milliseconds === undefined
    ? fallback
    : finiteNonNegative(milliseconds, fallback);
}

/** The only millisecond-to-second conversion used by motion primitives. */
export function motionMillisecondsToSeconds(milliseconds: number): number {
  return finiteNonNegative(milliseconds, 0) / 1000;
}

/** Convert personality values, which currently expose seconds, back to the canonical unit. */
export function motionSecondsToMilliseconds(seconds: number): number {
  return finiteNonNegative(seconds, 0) * 1000;
}
