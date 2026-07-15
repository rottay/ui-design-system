/**
 * Canonical timing helpers for the public motion primitives.
 *
 * Public `*Ms` props are always milliseconds. The older un-suffixed props
 * remain compatible for one minor release: positive values up to ten are
 * interpreted as the historical seconds form, while every other value is
 * interpreted as milliseconds.
 */

export const LEGACY_SECONDS_COMPAT_MAX = 10;

export interface ResolveMotionMillisecondsOptions {
  /** Canonical, unambiguous millisecond value. */
  milliseconds?: number;
  /** Deprecated value that may be either historical seconds or milliseconds. */
  legacy?: number;
  /** Canonical fallback in milliseconds. */
  fallbackMilliseconds: number;
}

function finiteNonNegative(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : Math.max(0, fallback);
}

/** Resolve a canonical millisecond value while preserving the legacy window. */
export function resolveMotionMilliseconds({
  milliseconds,
  legacy,
  fallbackMilliseconds,
}: ResolveMotionMillisecondsOptions): number {
  const fallback = finiteNonNegative(fallbackMilliseconds, 0);

  if (milliseconds !== undefined) {
    return finiteNonNegative(milliseconds, fallback);
  }

  if (legacy === undefined) {
    return fallback;
  }

  const normalizedLegacy = finiteNonNegative(legacy, fallback);
  return normalizedLegacy > 0 && normalizedLegacy <= LEGACY_SECONDS_COMPAT_MAX
    ? normalizedLegacy * 1000
    : normalizedLegacy;
}

/** The only millisecond-to-second conversion used by motion primitives. */
export function motionMillisecondsToSeconds(milliseconds: number): number {
  return finiteNonNegative(milliseconds, 0) / 1000;
}

/** Convert personality values, which currently expose seconds, back to the canonical unit. */
export function motionSecondsToMilliseconds(seconds: number): number {
  return finiteNonNegative(seconds, 0) * 1000;
}

/** Whether a caller supplied either the canonical or deprecated timing prop. */
export function hasExplicitMotionTiming(
  milliseconds: number | undefined,
  legacy: number | undefined
): boolean {
  return milliseconds !== undefined || legacy !== undefined;
}
