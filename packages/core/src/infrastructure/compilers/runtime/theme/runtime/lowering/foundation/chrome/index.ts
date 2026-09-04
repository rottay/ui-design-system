/**
 * @fileoverview Chrome channel writer and the radius scale it divides by.
 *
 * @module Compilers/Theme/Lowering/Foundation/chrome
 * @category Compilers
 * @package @rottay/design-system
 */

import type {
  BrandTheme,
  BrandThemeMode,
} from "@/foundation/contracts/composition/tenants/themes";
import type { TenantAuthoredPaths } from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
} from "@/foundation/tokens/ts/presentation/expressive-profiles";
import { expandExpressiveProfiles } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import { appearancePostureToVariables } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import { chromeToVariables } from "@/infrastructure/compilers/kernel/foundation/css/chrome-variables";

/**
 * Map BrandTheme.chrome sub-interfaces to flat CSS variable declarations.
 *
 * This is the explicit chrome channel — sidebar, layout, shell, controls,
 * and table are NOT shoehorned into tokenOverrides or personality. The
 * mapping is shared with runtime/appearance via kernel/css/chrome-variables,
 * since TenantAppearanceAdvanced.chrome is the same shape as BrandTheme.chrome.
 */
export function brandThemeToChromeVariables(
  bt: BrandTheme,
  mode: BrandThemeMode = bt.appearance?.defaultMode ?? "light",
  /** Tenant authorship, when this compile has a tenant. See `ChromeVariableContext`. */
  tenantAuthoredPaths?: TenantAuthoredPaths,
  modePrefix = ""
): Record<string, string> {
  return chromeToVariables(bt.chrome, {
    radiusScale: brandThemeRadiusScale(bt),
    mode,
    tenantAuthoredPaths,
    modePrefix,
  });
}

/**
 * The `--ds-radius-scale` this theme compiles to.
 *
 * Derived here rather than threaded from the caller so no call site can emit
 * chrome against the wrong dial: the chrome emitter divides authored radius
 * literals by this exact number, and a divisor that disagrees with the
 * declared scale is a silent repaint rather than a failure. Same lowering, on
 * the same input, as the assignment `brandThemeToCssVariables` makes before it
 * reads the channel for the surface ramp's `-base` operands.
 */
function brandThemeRadiusScale(bt: BrandTheme): string {
  const expansion = expandExpressiveProfiles(
    resolveExpressiveAxes(
      bt.expressive?.experienceProfile,
      sanitizeExpressiveOverrides(bt.expressive?.profiles),
      bt.expressive?.schemaVersion
    )
  );
  return (
    appearancePostureToVariables({ radiusScale: bt.surfaces?.radiusScale })[
      "--ds-radius-scale"
    ] ??
    appearancePostureToVariables(expansion.fieldDefaults)[
      "--ds-radius-scale"
    ] ??
    "1"
  );
}
