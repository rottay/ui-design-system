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
import { chromeToVariables } from "@/infrastructure/compilers/kernel/foundation/css/chrome-variables";
import { resolveRadiusScaleChannel } from "../dial";
import { resolveExpressiveFacts } from "../expressive";

/**
 * Map BrandTheme.chrome sub-interfaces to flat CSS variable declarations.
 *
 * This is the explicit chrome channel -- sidebar, layout, shell, controls and
 * table are NOT shoehorned into tokenOverrides or personality. The mapping is
 * shared with the DB appearance path via kernel/css/chrome-variables, since
 * `TenantAppearanceAdvanced.chrome` is the same shape as `BrandTheme.chrome`.
 *
 * `radiusScale` is the divisor the emitter applies to authored radius
 * literals. The pipeline resolves it once for the whole block and passes it in;
 * the default exists for the callers that hold a bare theme and nothing else.
 */
export function brandThemeToChromeVariables(
  bt: BrandTheme,
  mode: BrandThemeMode = bt.appearance?.defaultMode ?? "light",
  /** Tenant authorship, when this compile has a tenant. See `ChromeVariableContext`. */
  tenantAuthoredPaths?: TenantAuthoredPaths,
  modePrefix = "",
  radiusScale?: string
): Record<string, string> {
  return chromeToVariables(bt.chrome, {
    radiusScale:
      radiusScale ??
      resolveRadiusScaleChannel(bt, resolveExpressiveFacts(bt.expressive).expansion),
    mode,
    tenantAuthoredPaths,
    modePrefix,
  });
}
