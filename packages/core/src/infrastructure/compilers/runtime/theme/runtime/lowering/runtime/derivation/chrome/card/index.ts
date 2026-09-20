/**
 * @fileoverview The card family: its size steps on the type roles, the toned
 * title inks on the palette's deep steps, the header and image compounds on
 * the edge weight, the elevation scale and the spacing ramp, the reserved
 * loading height, and the runtime image channels with their resting defaults.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/card
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own card chrome outranks every relation stated here. */
export const cardChromeDeriver: FamilyDeriver = {
  family: "card",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "surfaces.borderStyle", "surfaces.radiusScale", "typography.roles", "density"],
  produces: [
    "--ds-card-title-font-size-sm",
    "--ds-card-title-font-size-lg",
    "--ds-card-body-font-size-sm",
    "--ds-card-header-ink",
    "--ds-card-header-eyebrow-color",
    "--ds-card-border-accent-hover",
    "--ds-card-outlined-border-hover",
    "--ds-card-underline-border-width",
    "--ds-card-border-width",
    "--ds-card-nested-shadow",
    "--ds-card-padding-base",
    "--ds-card-instance-padding",
    "--ds-card-loading-min-height",
    "--ds-card-primary-title-color",
    "--ds-card-success-title-color",
    "--ds-card-warning-title-color",
    "--ds-card-error-title-color",
    "--ds-card-info-title-color",
    "--ds-card-header-icon-shadow",
    "--ds-card-header-icon-shadow-hover",
    "--ds-card-header-icon-lift",
    "--ds-card-header-extra-min-height",
    "--ds-card-footer-actions-inset",
    "--ds-card-image-aspect-ratio",
    "--ds-card-image-block-size",
    "--ds-card-image-radius-sm",
    "--ds-card-image-radius-md",
    "--ds-card-image-radius-lg",
    "--ds-card-image-placeholder-fill",
    "--ds-card-image-placeholder-ink",
  ],
  derive: () => deriveCardChannels(),
};

export function deriveCardChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-card-title-font-size-sm"] = "var(--ds-type-body-font-size)";
  vars["--ds-card-title-font-size-lg"] = "var(--ds-type-section-title-font-size)";
  vars["--ds-card-body-font-size-sm"] = "var(--ds-type-supporting-font-size)";
  vars["--ds-card-header-ink"] = "var(--ds-card-header-color, var(--ds-color-text-primary))";
  vars["--ds-card-header-eyebrow-color"] = "var(--ds-card-header-color, var(--ds-color-text-muted))";
  vars["--ds-card-border-accent-hover"] =
    "var(--ds-card-border-hover, var(--ds-card-border-color-hover, var(--ds-color-border-secondary)))";
  vars["--ds-card-outlined-border-hover"] =
    "var(--ds-card-border-accent-hover, var(--ds-card-border-hover, var(--ds-card-border-color-hover, var(--ds-color-border-secondary))))";
  vars["--ds-card-underline-border-width"] = "var(--ds-edge-hairline-width)";
  // The frame's own weight, hairline rather than standard: hairline is the one
  // edge role resting at the component default's 1px in every vertical.
  vars["--ds-card-border-width"] = "var(--ds-edge-hairline-width)";
  vars["--ds-card-nested-shadow"] = "none";
  vars["--ds-card-padding-base"] = "var(--ds-card-padding, var(--ds-card-md-padding))";
  vars["--ds-card-instance-padding"] =
    "calc(var(--ds-card-padding-md, var(--ds-card-padding-base)) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-card-loading-min-height"] = "calc(var(--ds-spacing-10) * 3 * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-card-primary-title-color"] = "var(--ds-color-primary-900)";
  vars["--ds-card-success-title-color"] = "var(--ds-color-success-900)";
  vars["--ds-card-warning-title-color"] = "var(--ds-color-warning-900)";
  vars["--ds-card-error-title-color"] = "var(--ds-color-error-900)";
  vars["--ds-card-info-title-color"] = "var(--ds-color-info-900)";
  vars["--ds-card-header-icon-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-card-header-icon-shadow-hover"] = "var(--ds-elevation-2)";
  vars["--ds-card-header-icon-lift"] = "translateY(calc(-1 * var(--ds-edge-hairline-width))) scale(1.025)";
  vars["--ds-card-header-extra-min-height"] = "calc(2rem * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))";
  vars["--ds-card-footer-actions-inset"] = "var(--ds-spacing-1)";
  vars["--ds-card-image-aspect-ratio"] = "auto";
  vars["--ds-card-image-block-size"] = "var(--ds-card-image-height)";
  vars["--ds-card-image-radius-sm"] = "var(--ds-radius-sm)";
  vars["--ds-card-image-radius-md"] = "var(--ds-radius-md)";
  vars["--ds-card-image-radius-lg"] = "var(--ds-radius-lg)";
  vars["--ds-card-image-placeholder-fill"] = "var(--ds-card-image-placeholder-bg, var(--ds-surface-inset))";
  vars["--ds-card-image-placeholder-ink"] = "var(--ds-card-image-placeholder-color, var(--ds-color-text-tertiary))";
  return vars;
}
