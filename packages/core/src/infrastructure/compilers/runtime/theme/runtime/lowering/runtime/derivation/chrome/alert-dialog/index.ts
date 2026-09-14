/**
 * @fileoverview The alert-dialog family: its panel on the modal chamber it blocks
 * alongside, the overlay material and the elevation scale, its scrim on the
 * glass decisions, its title on the section-title role, and its destructive icon well on the error palette.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/alert-dialog
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own alert-dialog chrome outranks every relation stated here. */
export const alertDialogChromeDeriver: FamilyDeriver = {
  family: "alert-dialog",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "surfaces.effects", "typography.roles"],
  produces: [
    "--ds-alert-dialog-bg",
    "--ds-alert-dialog-surface-lift",
    "--ds-alert-dialog-shadow",
    "--ds-alert-dialog-keyline",
    "--ds-alert-dialog-border-color",
    "--ds-alert-dialog-overlay-bg",
    "--ds-alert-dialog-overlay-glass",
    "--ds-alert-dialog-overlay-backdrop",
    "--ds-alert-dialog-title-color",
    "--ds-alert-dialog-title-font-family",
    "--ds-alert-dialog-title-font-size",
    "--ds-alert-dialog-title-font-weight",
    "--ds-alert-dialog-description-color",
    "--ds-alert-dialog-icon-color",
    "--ds-alert-dialog-icon-bg",
    "--ds-alert-dialog-icon-ring",
  ],
  derive: () => deriveAlertDialogChannels(),
};

export function deriveAlertDialogChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-alert-dialog-bg"] = "var(--ds-modal-bg, var(--ds-material-overlay-background))";
  vars["--ds-alert-dialog-surface-lift"] = "var(--ds-elevation-surface-4)";
  vars["--ds-alert-dialog-shadow"] = "var(--ds-modal-shadow, var(--ds-elevation-4))";
  vars["--ds-alert-dialog-keyline"] = "color-mix(in srgb, var(--ds-color-bg-elevated) calc(72% * var(--ds-effect-intensity)), transparent)";
  vars["--ds-alert-dialog-border-color"] = "var(--ds-color-border-subtle)";
  vars["--ds-alert-dialog-overlay-bg"] = "var(--ds-overlay-bg, var(--ds-color-alpha-black-40))";
  vars["--ds-alert-dialog-overlay-glass"] = "var(--ds-glass-scrim-tint)";
  vars["--ds-alert-dialog-overlay-backdrop"] = "var(--ds-glass-backdrop-filter)";
  vars["--ds-alert-dialog-title-color"] = "var(--ds-color-text-primary)";
  vars["--ds-alert-dialog-title-font-family"] = "var(--ds-type-section-title-font-family)";
  vars["--ds-alert-dialog-title-font-size"] = "var(--ds-type-section-title-font-size)";
  vars["--ds-alert-dialog-title-font-weight"] = "var(--ds-type-section-title-font-weight)";
  vars["--ds-alert-dialog-description-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-alert-dialog-icon-color"] = "var(--ds-color-error)";
  vars["--ds-alert-dialog-icon-bg"] = "color-mix(in srgb, var(--ds-color-error) 10%, transparent)";
  vars["--ds-alert-dialog-icon-ring"] = "color-mix(in srgb, var(--ds-color-error) 22%, transparent)";
  return vars;
}
