/**
 * @fileoverview Per-mode compiled deltas over an already-compiled base block.
 *
 * @module Compilers/Theme/Lowering/Runtime/mode-blocks
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ThemeCompilationModeBlock } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { OnToneRole } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import { ON_TONE_ROLES } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import type { TenantFacts } from "../../foundation/contract";
import {
  applyModeOverlay,
  modeOverlayHasValues,
} from "../../foundation/mode-overlay";
import { PRIMARY_SEED_FIELD } from "../../foundation/seeds";
import { keepTenantBaseSidebarLeaves } from "../../foundation/sidebar";
import { lowerBlock } from "../pipeline";

/**
 * Compile every authored mode overlay into its delta over the base block.
 *
 * The overlay goes through the SAME pipeline as the base -- there is no second
 * emission path and no per-vertical branch. Only channels whose value actually
 * moves are kept: everything the mode does not restate keeps cascading from the
 * base block.
 */
export function compileModeBlocks(
  bt: BrandTheme,
  baseVars: Record<string, string>,
  tenantFacts?: TenantFacts,
  // The raw tenant patch, read-only here -- see
  // `applyTenantStatusSeedDerivations`'s docblock for why the merged `bt` and
  // `authoredPaths` alone cannot tell "the tenant wrote this seed" from "the
  // patch builder always emits this key".
  tenantPatch?: Partial<BrandTheme>
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
    const authoredPaths = tenantFacts?.authoredPaths;
    const statusSeedAuthorship = tenantFacts?.statusSeedAuthorship;
    // The seed this block compiles from is the TENANT'S only when the tenant
    // stated it for this mode, or stated it at the base and the overlay does
    // not restate it -- an overlay-authored seed belongs to whoever wrote that
    // overlay, and re-deriving a baseline's own mode seed would be a
    // baseline-versus-baseline fight this site has no standing in.
    const modeTenant: TenantFacts | undefined = tenantFacts
      ? {
          ...tenantFacts,
          seedIsTenantAuthored:
            authoredPaths !== undefined &&
            (authoredPaths.has(`${modePrefix}${PRIMARY_SEED_FIELD}`) ||
              (overlay.palette?.primaryColor === undefined &&
                authoredPaths.has(PRIMARY_SEED_FIELD))),
          toneSeedIsTenantAuthored: Object.fromEntries(
            ON_TONE_ROLES.map((role) => [
              role,
              statusSeedAuthorship
                ? statusSeedAuthorship.modes[mode]?.[role] ||
                  (overlay.palette?.[`${role}Color`] === undefined &&
                    statusSeedAuthorship.base[role])
                : tenantPatch?.modes?.[mode]?.palette?.[`${role}Color`] !==
                    undefined ||
                  (overlay.palette?.[`${role}Color`] === undefined &&
                    tenantPatch?.palette?.[`${role}Color`] !== undefined),
            ])
          ) as Record<OnToneRole, boolean>,
        }
      : undefined;
    const modeVars = lowerBlock({
      theme: merged,
      mode,
      surface: mode,
      modePrefix,
      tenant: modeTenant,
    });
    keepTenantBaseSidebarLeaves(modeVars, baseVars, authoredPaths, modePrefix);
    const cssVariables: Record<string, string> = {};
    for (const [key, value] of Object.entries(modeVars)) {
      if (baseVars[key] !== value) cssVariables[key] = value;
    }
    blocks.push({ mode, cssVariables, colorScheme: mode });
  }
  return blocks;
}
