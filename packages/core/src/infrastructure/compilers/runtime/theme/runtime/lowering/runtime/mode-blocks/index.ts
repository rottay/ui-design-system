/**
 * @fileoverview Per-mode compiled deltas over an already-compiled base block.
 *
 * @module Compilers/Theme/Lowering/Runtime/mode-blocks
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { TenantAuthoredPaths } from "@/foundation/contracts/composition/tenants/themes/iso";
import type { TenantStatusSeedAuthorship } from "@/foundation/contracts/composition/tenants/themes/resolved";
import type { AppearancePostureFields } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import { ON_TONE_ROLES } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import type { OnToneRole } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import { brandThemeToChromeVariables } from "../../foundation/chrome";
import {
  applyModeOverlay,
  modeOverlayHasValues,
} from "../../foundation/mode-overlay";
import {
  PRIMARY_SEED_FIELD,
  applyTenantSeedDerivations,
  applyTenantStatusSeedDerivations,
} from "../../foundation/seeds";
import { keepTenantBaseSidebarLeaves } from "../../foundation/sidebar";
import { brandThemeToCssVariables } from "../variables";
import type { ThemeCompilationModeBlock } from "@/foundation/contracts/composition/tenants/themes/compiled";

export function compileModeBlocks(
  bt: BrandTheme,
  baseVars: Record<string, string>,
  authoredPaths: TenantAuthoredPaths | undefined,
  // The overlay re-runs the whole lowering: without this a moved channel would
  // revert inside `data-mode="dark"`.
  tenantPosture?: AppearancePostureFields,
  // E-2: the overlay re-runs the whole lowering, so both halves travel together.
  tenantTypography?: BrandTheme["typography"],
  // The raw tenant patch, read-only here -- see
  // `applyTenantStatusSeedDerivations`'s docblock for why the merged `bt`
  // and `authoredPaths` alone cannot tell "the tenant wrote this seed" from
  // "the patch builder always emits this key".
  tenantPatch?: Partial<BrandTheme>,
  // The closed authorship channel. When present it is the sole
  // source of `toneSeedIsTenantAuthored`; when absent (the static arm, this
  // file's own synthetic fixtures) this falls back to reading `tenantPatch`
  // directly, exactly as before this field existed.
  tenantStatusSeedAuthorship?: TenantStatusSeedAuthorship
): ThemeCompilationModeBlock[] {
  const modes = bt.modes;
  if (!modes) return [];
  const defaultMode = bt.appearance?.defaultMode;
  const blocks: ThemeCompilationModeBlock[] = [];
  for (const mode of ["light", "dark"] as const) {
    const overlay = modes[mode];
    if (!overlay) continue;
    if (mode === defaultMode) {
      // Canonical ISO Themes always carry both mode slots; an empty default-mode
      // overlay is a structural placeholder, not an authority violation.
      if (!modeOverlayHasValues(overlay)) continue;
      throw new Error(
        `BrandTheme '${bt.id}' authors modes.${mode}, but ${mode} is its declared defaultMode. ` +
          `The default mode's values belong in the theme body; a mode overlay describes the OTHER mode.`
      );
    }
    const merged = applyModeOverlay(bt, overlay);
    const modePrefix = `modes.${mode}.`;
    const modeVars = {
      ...brandThemeToCssVariables(merged, mode, tenantPosture, tenantTypography),
      ...brandThemeToChromeVariables(merged, mode, authoredPaths, modePrefix),
    };
    // The seed this block compiles from is `merged.palette.primaryColor`. It is
    // the TENANT'S only when the tenant stated it for this mode, or stated it
    // at the base and the overlay does not restate it -- an overlay-authored
    // seed belongs to whoever wrote that overlay, and re-deriving a baseline's
    // own mode seed would be a baseline-versus-baseline fight this site has no
    // standing in.
    applyTenantSeedDerivations(
      modeVars,
      merged.palette?.primaryColor,
      authoredPaths === undefined
        ? undefined
        : {
            authoredPaths,
            modePrefix,
            seedIsTenantAuthored:
              authoredPaths.has(`${modePrefix}${PRIMARY_SEED_FIELD}`) ||
              (overlay.palette?.primaryColor === undefined &&
                authoredPaths.has(PRIMARY_SEED_FIELD)),
          }
    );
    // The status-tint sibling uses the same block and authored paths. Seed
    // authorship is computed from the RAW tenant patch value (never from
    // `authoredPaths` membership alone -- see the function's docblock).
    applyTenantStatusSeedDerivations(
      modeVars,
      merged.palette,
      authoredPaths === undefined
        ? undefined
        : {
            authoredPaths,
            modePrefix,
            toneSeedIsTenantAuthored: Object.fromEntries(
              ON_TONE_ROLES.map((role) => [
                role,
                tenantStatusSeedAuthorship
                  ? tenantStatusSeedAuthorship.modes[mode]?.[role] ||
                    (overlay.palette?.[`${role}Color`] === undefined &&
                      tenantStatusSeedAuthorship.base[role])
                  : tenantPatch?.modes?.[mode]?.palette?.[`${role}Color`] !==
                      undefined ||
                    (overlay.palette?.[`${role}Color`] === undefined &&
                      tenantPatch?.palette?.[`${role}Color`] !== undefined),
              ])
            ) as Record<OnToneRole, boolean>,
          }
    );
    keepTenantBaseSidebarLeaves(modeVars, baseVars, authoredPaths, modePrefix);
    const cssVariables: Record<string, string> = {};
    for (const [key, value] of Object.entries(modeVars)) {
      if (baseVars[key] !== value) cssVariables[key] = value;
    }
    blocks.push({ mode, cssVariables, colorScheme: mode });
  }
  return blocks;
}
