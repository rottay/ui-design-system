/**
 * @fileoverview Expressive-profile FIELD defaults: the dials a selected profile
 * supplies for the fields a tenant left empty.
 *
 * It lived beside the channel deriver, which put a document-shaped concern
 * inside the lowering and made the ingress station that now owns it reach
 * upward for it. The deriver keeps the channels a profile paints; this owns
 * what a profile DEFAULTS, which is a statement about the document.
 *
 * @module Compilers/Theme/Ingress/Foundation/ProfileExpansion/Foundation/FieldDefaults
 * @category Compilers
 * @package @rottay/design-system
 */

import type { TenantAppearanceGeneral } from "@/foundation/contracts/composition/tenants/themes";
import type { ExpressiveFieldDefaultSet } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";

/** Envelope ranges a caller may clamp expressive field defaults against. */
export interface ExpressiveClampRanges {
  radiusScale?: { min: number; max: number };
  motionIntensity?: { min: number; max: number };
  motionDurationScale?: { min: number; max: number };
}

/**
 * The fields a profile expansion can fill, named at the granularity it fills
 * them: a tenant that dials `motion.intensity` and leaves the rest of the dial
 * empty authored ONE leaf, and the profile supplies the other two.
 */
export const EXPRESSIVE_FIELD_DEFAULT_KEYS = Object.freeze([
  "typePairing",
  "buttonStyle",
  "radiusScale",
  "density",
  "motion.intensity",
  "motion.durationScale",
  "motion.ambient",
  "elevation",
] as const);

export type ExpressiveFieldDefaultKey =
  (typeof EXPRESSIVE_FIELD_DEFAULT_KEYS)[number];

/** The general a profile expansion produced, and which fields it filled. */
export interface ExpressiveFieldDefaultsApplication {
  readonly general: TenantAppearanceGeneral | undefined;
  readonly filled: readonly ExpressiveFieldDefaultKey[];
}

/**
 * Apply expressive-profile FIELD defaults to the general appearance --
 * only where the tenant left the field unset, so authored dials always win.
 *
 * Density, motion and the pairing/silhouette/posture enums ride fields
 * instead of expansion variables because they have JS consumers (useTokens,
 * MotionProvider) and single field emitters: defaulting the field keeps CSS
 * and JS reading the same effective value through the same single writer.
 * Numeric defaults are additionally clamped into the vertical envelope when
 * the caller provides it (profile data is DS-reviewed, but a vertical's
 * envelope is law and a profile must never be a bypass around it).
 *
 * Returns the SAME reference when nothing applies, so profile-less
 * documents keep an identical normalized appearance and digest.
 */
export function applyExpressiveFieldDefaults(
  general: TenantAppearanceGeneral | undefined,
  fieldDefaults: ExpressiveFieldDefaultSet,
  ranges?: ExpressiveClampRanges
): ExpressiveFieldDefaultsApplication {
  const clampInto = (
    value: number,
    bounds?: { min: number; max: number }
  ): number =>
    bounds ? Math.min(bounds.max, Math.max(bounds.min, value)) : value;

  const source = general ?? {};
  const filled: ExpressiveFieldDefaultKey[] = [];
  let next: TenantAppearanceGeneral | undefined;
  const target = (): TenantAppearanceGeneral => (next ??= { ...source });
  const fill = (key: ExpressiveFieldDefaultKey): TenantAppearanceGeneral => {
    filled.push(key);
    return target();
  };

  if (fieldDefaults.typePairing && !source.typography?.typePairing) {
    fill("typePairing").typography = {
      ...source.typography,
      typePairing: fieldDefaults.typePairing,
    };
  }
  if (
    fieldDefaults.buttonStyle !== undefined &&
    source.shape?.buttonStyle === undefined
  ) {
    fill("buttonStyle").shape = {
      ...target().shape,
      buttonStyle: fieldDefaults.buttonStyle,
    };
  }
  if (
    fieldDefaults.radiusScale !== undefined &&
    source.shape?.radiusScale === undefined
  ) {
    fill("radiusScale").shape = {
      ...target().shape,
      radiusScale: clampInto(fieldDefaults.radiusScale, ranges?.radiusScale),
    };
  }
  if (fieldDefaults.density && source.density === undefined) {
    fill("density").density = fieldDefaults.density;
  }
  // Dial by dial, not object by object: a tenant that authored `intensity`
  // alone left `durationScale` and `ambient` unset, and an unset field is
  // exactly what a profile default is for.
  if (fieldDefaults.motion) {
    const motion = fieldDefaults.motion;
    const authored = source.motion;
    if (motion.intensity !== undefined && authored?.intensity === undefined) {
      fill("motion.intensity").motion = {
        ...target().motion,
        intensity: clampInto(motion.intensity, ranges?.motionIntensity),
      };
    }
    if (
      motion.durationScale !== undefined &&
      authored?.durationScale === undefined
    ) {
      fill("motion.durationScale").motion = {
        ...target().motion,
        durationScale: clampInto(
          motion.durationScale,
          ranges?.motionDurationScale
        ),
      };
    }
    if (motion.ambient !== undefined && authored?.ambient === undefined) {
      fill("motion.ambient").motion = {
        ...target().motion,
        ambient: motion.ambient,
      };
    }
  }
  if (fieldDefaults.elevation && source.surfaces?.elevation === undefined) {
    fill("elevation").surfaces = {
      ...source.surfaces,
      elevation: fieldDefaults.elevation,
    };
  }
  return { general: next ?? general, filled };
}

/** The effective general alone, for callers that record no provenance. */
export function withExpressiveFieldDefaults(
  general: TenantAppearanceGeneral | undefined,
  fieldDefaults: ExpressiveFieldDefaultSet,
  ranges?: ExpressiveClampRanges
): TenantAppearanceGeneral | undefined {
  return applyExpressiveFieldDefaults(general, fieldDefaults, ranges).general;
}
