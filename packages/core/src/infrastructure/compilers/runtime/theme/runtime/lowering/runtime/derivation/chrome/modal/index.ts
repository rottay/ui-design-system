/**
 * @fileoverview The modal family: its panel on the overlay material and the
 * elevation scale, its scrim on the canvas and the glass decisions, its
 * headings on the section-title role, and its close and generated actions on
 * the control material, the palette and the focus decisions.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/modal
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own modal chrome outranks every relation stated here. */
export const modalChromeDeriver: FamilyDeriver = {
  family: "modal",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "surfaces.effects", "typography.roles", "states.focus"],
  produces: [
    "--ds-modal-bg",
    "--ds-modal-color",
    "--ds-modal-border-color",
    "--ds-modal-shadow",
    "--ds-modal-keyline",
    "--ds-modal-surface-lift",
    "--ds-modal-texture",
    "--ds-modal-overlay-bg",
    "--ds-modal-overlay-tint",
    "--ds-modal-overlay-backdrop",
    "--ds-modal-header-bg",
    "--ds-modal-header-border",
    "--ds-modal-footer-bg",
    "--ds-modal-footer-border",
    "--ds-modal-title-color",
    "--ds-modal-title-font-family",
    "--ds-modal-title-font-size",
    "--ds-modal-title-font-weight",
    "--ds-modal-subtitle-color",
    "--ds-modal-body-color",
    "--ds-modal-close-color",
    "--ds-modal-close-color-hover",
    "--ds-modal-close-bg-hover",
    "--ds-modal-focus-ring",
    "--ds-modal-cancel-bg",
    "--ds-modal-cancel-color",
    "--ds-modal-cancel-border",
    "--ds-modal-cancel-shadow",
    "--ds-modal-ok-bg",
    "--ds-modal-ok-color",
    "--ds-modal-ok-border",
    "--ds-modal-ok-texture",
    "--ds-modal-ok-shadow",
    "--ds-modal-action-shadow-hover",
  ],
  derive: () => deriveModalChannels(),
};

export function deriveModalChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-modal-bg"] = "var(--ds-material-overlay-background)";
  vars["--ds-modal-color"] = "var(--ds-color-text-primary)";
  vars["--ds-modal-border-color"] = "var(--ds-color-border-subtle)";
  vars["--ds-modal-shadow"] = "var(--ds-elevation-4)";
  vars["--ds-modal-keyline"] =
    "color-mix(in srgb, var(--ds-color-bg-elevated) calc(72% * var(--ds-effect-intensity)), transparent)";
  vars["--ds-modal-surface-lift"] = "var(--ds-elevation-surface-4)";
  vars["--ds-modal-texture"] = "var(--ds-gradient-surface)";
  vars["--ds-modal-overlay-bg"] = "color-mix(in srgb, var(--ds-color-bg-primary) 80%, transparent)";
  vars["--ds-modal-overlay-tint"] = "var(--ds-glass-scrim-tint)";
  vars["--ds-modal-overlay-backdrop"] = "var(--ds-glass-backdrop-filter)";
  vars["--ds-modal-header-bg"] = "transparent";
  vars["--ds-modal-header-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-modal-footer-bg"] = "transparent";
  vars["--ds-modal-footer-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-modal-title-color"] = "var(--ds-color-text-primary)";
  vars["--ds-modal-title-font-family"] = "var(--ds-type-section-title-font-family)";
  vars["--ds-modal-title-font-size"] = "var(--ds-type-section-title-font-size)";
  vars["--ds-modal-title-font-weight"] = "var(--ds-type-section-title-font-weight)";
  vars["--ds-modal-subtitle-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-modal-body-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-modal-close-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-modal-close-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-modal-close-bg-hover"] = "var(--ds-material-control-background-hover)";
  vars["--ds-modal-focus-ring"] = "var(--ds-focus-ring)";
  vars["--ds-modal-cancel-bg"] = "var(--ds-material-control-background)";
  vars["--ds-modal-cancel-color"] = "var(--ds-color-text-primary)";
  vars["--ds-modal-cancel-border"] = "var(--ds-material-control-border)";
  vars["--ds-modal-cancel-shadow"] = "var(--ds-material-control-shadow)";
  vars["--ds-modal-ok-bg"] = "var(--ds-color-primary)";
  vars["--ds-modal-ok-color"] = "var(--ds-color-text-on-primary)";
  vars["--ds-modal-ok-border"] = "var(--ds-color-primary)";
  vars["--ds-modal-ok-texture"] = "var(--ds-gradient-primary)";
  vars["--ds-modal-ok-shadow"] =
    "inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-on-primary) 22%, transparent), 0 7px 16px color-mix(in srgb, var(--ds-color-primary) 22%, transparent)";
  vars["--ds-modal-action-shadow-hover"] = "var(--ds-shadow-md)";
  return vars;
}
