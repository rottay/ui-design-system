/**
 * @fileoverview The confirm-dialog family: its panel on the modal chamber it blocks
 * alongside, the overlay material and the elevation scale, its scrim on the
 * glass decisions, its title on the section-title role, and its icon well on the palette tone its variant names.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/confirm-dialog
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own confirm-dialog chrome outranks every relation stated here. */
export const confirmDialogChromeDeriver: FamilyDeriver = {
  family: "confirm-dialog",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "surfaces.effects", "typography.roles"],
  produces: [
    "--ds-confirm-dialog-bg",
    "--ds-confirm-dialog-surface-lift",
    "--ds-confirm-dialog-shadow",
    "--ds-confirm-dialog-keyline",
    "--ds-confirm-dialog-border-color",
    "--ds-confirm-dialog-overlay-bg",
    "--ds-confirm-dialog-overlay-glass",
    "--ds-confirm-dialog-overlay-backdrop",
    "--ds-confirm-dialog-title-color",
    "--ds-confirm-dialog-title-font-family",
    "--ds-confirm-dialog-title-font-size",
    "--ds-confirm-dialog-title-font-weight",
    "--ds-confirm-dialog-description-color",
    "--ds-confirm-dialog-info-icon-color",
    "--ds-confirm-dialog-info-icon-bg",
    "--ds-confirm-dialog-info-icon-ring",
    "--ds-confirm-dialog-warning-icon-color",
    "--ds-confirm-dialog-warning-icon-bg",
    "--ds-confirm-dialog-warning-icon-ring",
    "--ds-confirm-dialog-danger-icon-color",
    "--ds-confirm-dialog-danger-icon-bg",
    "--ds-confirm-dialog-danger-icon-ring",
  ],
  derive: () => deriveConfirmDialogChannels(),
};

export function deriveConfirmDialogChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-confirm-dialog-bg"] = "var(--ds-modal-bg, var(--ds-material-overlay-background))";
  vars["--ds-confirm-dialog-surface-lift"] = "var(--ds-elevation-surface-4)";
  vars["--ds-confirm-dialog-shadow"] = "var(--ds-modal-shadow, var(--ds-elevation-4))";
  vars["--ds-confirm-dialog-keyline"] = "color-mix(in srgb, var(--ds-color-bg-elevated) calc(72% * var(--ds-effect-intensity)), transparent)";
  vars["--ds-confirm-dialog-border-color"] = "var(--ds-color-border-subtle)";
  vars["--ds-confirm-dialog-overlay-bg"] = "var(--ds-overlay-bg, var(--ds-color-alpha-black-40))";
  vars["--ds-confirm-dialog-overlay-glass"] = "var(--ds-glass-scrim-tint)";
  vars["--ds-confirm-dialog-overlay-backdrop"] = "var(--ds-glass-backdrop-filter)";
  vars["--ds-confirm-dialog-title-color"] = "var(--ds-color-text-primary)";
  vars["--ds-confirm-dialog-title-font-family"] = "var(--ds-type-section-title-font-family)";
  vars["--ds-confirm-dialog-title-font-size"] = "var(--ds-type-section-title-font-size)";
  vars["--ds-confirm-dialog-title-font-weight"] = "var(--ds-type-section-title-font-weight)";
  vars["--ds-confirm-dialog-description-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-confirm-dialog-info-icon-color"] = "var(--ds-color-primary)";
  vars["--ds-confirm-dialog-info-icon-bg"] = "color-mix(in srgb, var(--ds-color-primary) 10%, transparent)";
  vars["--ds-confirm-dialog-info-icon-ring"] = "color-mix(in srgb, var(--ds-color-primary) 22%, transparent)";
  vars["--ds-confirm-dialog-warning-icon-color"] = "var(--ds-color-warning)";
  vars["--ds-confirm-dialog-warning-icon-bg"] = "color-mix(in srgb, var(--ds-color-warning) 10%, transparent)";
  vars["--ds-confirm-dialog-warning-icon-ring"] = "color-mix(in srgb, var(--ds-color-warning) 22%, transparent)";
  vars["--ds-confirm-dialog-danger-icon-color"] = "var(--ds-color-error)";
  vars["--ds-confirm-dialog-danger-icon-bg"] = "color-mix(in srgb, var(--ds-color-error) 10%, transparent)";
  vars["--ds-confirm-dialog-danger-icon-ring"] = "color-mix(in srgb, var(--ds-color-error) 22%, transparent)";
  return vars;
}
