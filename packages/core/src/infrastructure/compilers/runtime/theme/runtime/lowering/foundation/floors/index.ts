/**
 * @fileoverview Tenant floor merge and the tenant posture the floor resolves to.
 *
 * @module Compilers/Theme/Lowering/Foundation/floors
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
} from "@/foundation/tokens/ts/presentation/expressive-profiles";
import { expandExpressiveProfiles } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type { AppearancePostureFields } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";

/**
 * Deep-merges the tenant floor over the vertical baseline, mirroring
 * `resolveTheme` (`iso:908-918`). NOT a shallow spread: that drops every
 * sibling leaf of any object the tenant touched.
 */
export function mergeBrandThemeFloors(base: unknown, patch: unknown): unknown {
  const plain = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === "object" && !Array.isArray(v);
  if (!plain(base) || !plain(patch)) return patch === undefined ? base : patch;
  // Own keys only: the tenant floor is untrusted.
  const own = (o: Record<string, unknown>, k: string) =>
    Object.prototype.hasOwnProperty.call(o, k);
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    out[k] = mergeBrandThemeFloors(own(base, k) ? base[k] : undefined, v);
  }
  return out;
}

/**
 * The tenant floor's posture: explicit tenant field, else the tenant's own
 * profile default (the `??` chain is the owner's law, and the default-only
 * shape `withExpressiveFieldDefaults` uses on the DB arm).
 *
 * THE STRUCTURAL GATE: the profile contributes only when the selection came
 * from THIS patch, so a vertical selecting one in its baseline never reaches
 * here. That is why bithire cannot regress.
 */
export function resolveTenantPosture(
  patch: Partial<BrandTheme>
): AppearancePostureFields | undefined {
  const selection = patch.expressive?.experienceProfile;
  const profile = selection
    ? expandExpressiveProfiles(
        resolveExpressiveAxes(
          selection,
          sanitizeExpressiveOverrides(patch.expressive?.profiles)
        )
      ).fieldDefaults
    : undefined;
  const posture: AppearancePostureFields = {
    typePairing: patch.typography?.typePairing ?? profile?.typePairing,
    typeScale: patch.typography?.scale,
    buttonStyle: patch.surfaces?.buttonStyle ?? profile?.buttonStyle,
    radiusScale: patch.surfaces?.radiusScale ?? profile?.radiusScale,
    density: patch.surfaces?.density ?? profile?.density,
    motion: patch.motion ?? profile?.motion,
    elevation: patch.surfaces?.elevation ?? profile?.elevation,
  };
  // Empty must stay INDISTINGUISHABLE from absent, or `absent => identity`
  // becomes `almost identity`.
  return Object.values(posture).some((v) => v !== undefined)
    ? posture
    : undefined;
}
