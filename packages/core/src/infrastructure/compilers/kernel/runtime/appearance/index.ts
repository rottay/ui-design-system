/**
 * @fileoverview Expressive field defaults for a tenant's general appearance.
 *
 * The appearance-to-CSS lowering that used to live here is gone: every
 * transport now resolves a total Theme and lowers it once through
 * `compileTheme`. What remains is the field-default expansion the DB
 * composition compiler applies before that lowering.
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
 * Apply expressive-profile FIELD defaults to the general appearance —
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
export function withExpressiveFieldDefaults(
  general: TenantAppearanceGeneral | undefined,
  fieldDefaults: ExpressiveFieldDefaultSet,
  ranges?: ExpressiveClampRanges
): TenantAppearanceGeneral | undefined {
  const clampInto = (
    value: number,
    bounds?: { min: number; max: number }
  ): number =>
    bounds ? Math.min(bounds.max, Math.max(bounds.min, value)) : value;

  const source = general ?? {};
  let next: TenantAppearanceGeneral | undefined;
  const target = (): TenantAppearanceGeneral => (next ??= { ...source });

  if (fieldDefaults.typePairing && !source.typography?.typePairing) {
    target().typography = {
      ...source.typography,
      typePairing: fieldDefaults.typePairing,
    };
  }
  if (
    fieldDefaults.buttonStyle !== undefined &&
    source.shape?.buttonStyle === undefined
  ) {
    target().shape = {
      ...target().shape,
      buttonStyle: fieldDefaults.buttonStyle,
    };
  }
  if (
    fieldDefaults.radiusScale !== undefined &&
    source.shape?.radiusScale === undefined
  ) {
    target().shape = {
      ...target().shape,
      radiusScale: clampInto(fieldDefaults.radiusScale, ranges?.radiusScale),
    };
  }
  if (fieldDefaults.density && source.density === undefined) {
    target().density = fieldDefaults.density;
  }
  if (fieldDefaults.motion && source.motion === undefined) {
    const motion = fieldDefaults.motion;
    target().motion = {
      ...(motion.intensity !== undefined
        ? { intensity: clampInto(motion.intensity, ranges?.motionIntensity) }
        : {}),
      ...(motion.durationScale !== undefined
        ? {
            durationScale: clampInto(
              motion.durationScale,
              ranges?.motionDurationScale
            ),
          }
        : {}),
      ...(motion.ambient !== undefined ? { ambient: motion.ambient } : {}),
    };
  }
  if (fieldDefaults.elevation && source.surfaces?.elevation === undefined) {
    target().surfaces = {
      ...source.surfaces,
      elevation: fieldDefaults.elevation,
    };
  }
  return next ?? general;
}
