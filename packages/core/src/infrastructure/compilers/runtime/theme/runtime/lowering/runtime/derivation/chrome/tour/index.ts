/**
 * @fileoverview The tour family: its step card on the card material and the
 * elevation scale, its title and copy on the section-title and body roles, and
 * its progress, close and step actions on the palette, the label role and the
 * focus decisions.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/tour
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own tour chrome outranks every relation stated here. */
export const tourChromeDeriver: FamilyDeriver = {
  family: "tour",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "typography.roles", "states.focus"],
  produces: [
    "--ds-tour-surface-bg",
    "--ds-tour-surface-shadow",
    "--ds-tour-border-color",
    "--ds-tour-primary-border-color",
    "--ds-tour-font-family",
    "--ds-tour-title-font-family",
    "--ds-tour-title-font-size",
    "--ds-tour-title-font-weight",
    "--ds-tour-title-line-height",
    "--ds-tour-title-ink",
    "--ds-tour-description-ink",
    "--ds-tour-indicator-bg",
    "--ds-tour-indicator-bg-current",
    "--ds-tour-close-ink",
    "--ds-tour-close-ink-hover",
    "--ds-tour-close-bg-hover",
    "--ds-tour-action-prev-ink",
    "--ds-tour-action-prev-bg-hover",
    "--ds-tour-action-next-bg",
    "--ds-tour-action-next-ink",
    "--ds-tour-action-next-shadow-hover",
    "--ds-tour-action-font-size",
    "--ds-tour-focus-ring",
  ],
  derive: () => deriveTourChannels(),
};

export function deriveTourChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-tour-surface-bg"] = "var(--ds-material-card-background)";
  vars["--ds-tour-surface-shadow"] = "var(--ds-elevation-3)";
  vars["--ds-tour-border-color"] = "var(--ds-color-border-subtle)";
  vars["--ds-tour-primary-border-color"] = "var(--ds-color-primary)";
  vars["--ds-tour-font-family"] = "var(--ds-type-body-font-family)";
  vars["--ds-tour-title-font-family"] = "var(--ds-type-section-title-font-family)";
  vars["--ds-tour-title-font-size"] = "var(--ds-type-section-title-font-size)";
  vars["--ds-tour-title-font-weight"] = "var(--ds-type-section-title-font-weight)";
  vars["--ds-tour-title-line-height"] = "var(--ds-type-section-title-line-height)";
  vars["--ds-tour-title-ink"] = "var(--ds-material-card-foreground)";
  vars["--ds-tour-description-ink"] = "var(--ds-color-text-secondary)";
  vars["--ds-tour-indicator-bg"] = "var(--ds-surface-panel)";
  vars["--ds-tour-indicator-bg-current"] = "var(--ds-color-primary)";
  vars["--ds-tour-close-ink"] = "var(--ds-material-card-foreground-muted)";
  vars["--ds-tour-close-ink-hover"] = "var(--ds-material-card-foreground)";
  vars["--ds-tour-close-bg-hover"] = "color-mix(in srgb, currentColor 8%, transparent)";
  vars["--ds-tour-action-prev-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-tour-action-prev-bg-hover"] = "color-mix(in srgb, currentColor 7%, transparent)";
  vars["--ds-tour-action-next-bg"] = "var(--ds-color-primary)";
  vars["--ds-tour-action-next-ink"] = "var(--ds-color-text-on-primary)";
  vars["--ds-tour-action-next-shadow-hover"] = "var(--ds-elevation-1)";
  vars["--ds-tour-action-font-size"] = "var(--ds-type-label-font-size)";
  vars["--ds-tour-focus-ring"] = "var(--ds-focus-ring-color)";
  return vars;
}
