/**
 * @fileoverview The posture vocabulary every layout-sensitive family adapts on.
 *
 * Two axes, one vocabulary. A viewport posture is the device band of the
 * request (`phone | tablet | desktop`, the same bands as
 * `useResponsive().deviceClass`); a container posture is the band of the
 * family's own box (`compact | regular | expanded`) on the tenant's container
 * ladder. No family spells a posture name or a threshold of its own.
 *
 * @module Contracts/Kernel/Adaptation/Foundation
 * @category Types
 * @package @rottay/design-system
 */

export const VIEWPORT_POSTURES = ['phone', 'tablet', 'desktop'] as const;

export type ViewportPosture = (typeof VIEWPORT_POSTURES)[number];

export const CONTAINER_POSTURES = ['compact', 'regular', 'expanded'] as const;

export type ContainerPosture = (typeof CONTAINER_POSTURES)[number];

/** Every posture an `adapt` slot may be keyed on, viewport first. */
export const POSTURES = [...VIEWPORT_POSTURES, ...CONTAINER_POSTURES] as const;

export type Posture = ViewportPosture | ContainerPosture;

/**
 * Per-posture deltas of a family's adaptation. Application-authored, never a
 * tenant decision: the app says which columns stay, the DS says when.
 */
export type Adapt<A extends object> = Partial<Record<Posture, A>>;

/**
 * Inclusive upper bounds of the compact and regular bands, in px of the
 * measured box. `standardMaxPx` is the tenant ladder's name for the regular
 * band's edge; anything above it is `expanded`.
 */
export interface ContainerPostureThresholds {
  readonly compactMaxPx: number;
  readonly standardMaxPx: number;
}

/** The postures in force for one rendered family instance. */
export interface ResolvedPosture {
  readonly viewport: ViewportPosture;
  /** `null` until the family's own box has been measured (always on the server). */
  readonly container: ContainerPosture | null;
}

/** Container width -> posture band on the given ladder. */
export function resolveContainerPosture(
  widthPx: number,
  profile: { readonly thresholds: ContainerPostureThresholds },
): ContainerPosture {
  if (widthPx <= profile.thresholds.compactMaxPx) return 'compact';
  if (widthPx <= profile.thresholds.standardMaxPx) return 'regular';
  return 'expanded';
}

/**
 * The `data-posture` value: a token list a skin selects with
 * `[data-posture~='compact']`. The viewport token is always present; the
 * container token joins it once the box has been measured.
 */
export function postureAttribute(posture: ResolvedPosture): string {
  return posture.container === null
    ? posture.viewport
    : `${posture.viewport} ${posture.container}`;
}
