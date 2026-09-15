/**
 * @fileoverview The semantic layer of a palette: what each role states, and
 * what a role implies for the channels nobody authored.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/palette/semantic
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandPalette } from "@/foundation/contracts/composition/tenants/themes";
import { derivePaletteSemantics } from "@/infrastructure/compilers/kernel/foundation/css/color-math/palette-derivations";

/**
 * What the seeds IMPLY, merged first so every authored layer outranks them.
 * The math is the shared `palette-derivations` owner both transports call.
 */
export function derivePaletteSemanticFloor(
  palette: BrandPalette
): Record<string, string> {
  return derivePaletteSemantics({
    primary: palette.primaryColor,
    background: palette.backgroundColor,
  });
}

/**
 * What the seeds STATE: one role, one semantic channel. Explicit per-role
 * assignments, because the producer census reads these names out of the source.
 */
export function derivePaletteSemanticChannels(
  palette: BrandPalette
): Record<string, string> {
  const vars: Record<string, string> = {};
  if (palette.primaryColor) vars["--ds-color-primary"] = palette.primaryColor;
  if (palette.secondaryColor)
    vars["--ds-color-secondary"] = palette.secondaryColor;
  if (palette.accentColor) vars["--ds-color-accent"] = palette.accentColor;
  if (palette.textPrimaryColor)
    vars["--ds-color-text-primary"] = palette.textPrimaryColor;
  if (palette.textSecondaryColor)
    vars["--ds-color-text-secondary"] = palette.textSecondaryColor;
  if (palette.textMutedColor)
    vars["--ds-color-text-muted"] = palette.textMutedColor;
  if (palette.textDisabledColor)
    vars["--ds-color-text-disabled"] = palette.textDisabledColor;
  if (palette.borderPrimaryColor)
    vars["--ds-color-border-primary"] = palette.borderPrimaryColor;
  if (palette.borderSecondaryColor)
    vars["--ds-color-border-secondary"] = palette.borderSecondaryColor;
  if (palette.successColor) vars["--ds-color-success"] = palette.successColor;
  if (palette.warningColor) vars["--ds-color-warning"] = palette.warningColor;
  if (palette.errorColor) vars["--ds-color-error"] = palette.errorColor;
  if (palette.infoColor) vars["--ds-color-info"] = palette.infoColor;
  return vars;
}

/**
 * This block's ground. The other mode declares its own in its own overlay,
 * which compiles into a mode block.
 */
export function derivePaletteGround(
  palette: BrandPalette
): Record<string, string> {
  const vars: Record<string, string> = {};
  if (palette.backgroundColor) {
    vars["--ds-color-bg-primary"] = palette.backgroundColor;
    vars["--ds-color-bg"] = palette.backgroundColor;
    vars["--ds-color-background"] = palette.backgroundColor;
  }
  return vars;
}
