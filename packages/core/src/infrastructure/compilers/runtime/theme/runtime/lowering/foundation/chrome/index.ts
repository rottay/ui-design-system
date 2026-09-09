/**
 * @fileoverview Chrome channel writer and the radius baseline it normalizes by.
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
import { chromeToVariables } from "@/infrastructure/compilers/kernel/foundation/css/chrome-variables";

/**
 * Map BrandTheme.chrome sub-interfaces to flat CSS variable declarations.
 *
 * This is the explicit chrome channel -- sidebar, layout, shell, controls and
 * table are NOT shoehorned into tokenOverrides or personality. The mapping is
 * shared with the DB appearance path via kernel/css/chrome-variables, since
 * `TenantAppearanceAdvanced.chrome` is the same shape as `BrandTheme.chrome`.
 *
 * `radiusBaseline` is the divisor the emitter normalizes authored radius
 * literals against. Only the pipeline can answer it -- it is the VERTICAL's
 * dial position, which a bare theme carrying a tenant patch can no longer tell
 * apart from the tenant's own -- so it is passed in, and an absent one is the
 * channel's identity rather than a second resolution of the same fact.
 */
export function brandThemeToChromeVariables(
  bt: BrandTheme,
  mode: BrandThemeMode = bt.appearance?.defaultMode ?? "light",
  /** Tenant authorship, when this compile has a tenant. See `ChromeVariableContext`. */
  tenantAuthoredPaths?: TenantAuthoredPaths,
  modePrefix = "",
  radiusBaseline = "1"
): Record<string, string> {
  return chromeToVariables(bt.chrome, {
    radiusBaseline,
    mode,
    tenantAuthoredPaths,
    modePrefix,
  });
}
