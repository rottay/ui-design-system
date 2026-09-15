/**
 * @fileoverview The breadcrumb family: a trail on the paired card material,
 * crumb ink from the palette, the current location on the primary tint, the
 * separator and icon wells on the tertiary ink, geometry on the spacing ramp
 * and the type roles, motion on the intent cadences.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/breadcrumb
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own breadcrumb chrome outranks every relation stated here. */
export const breadcrumbChromeDeriver: FamilyDeriver = {
  family: "breadcrumb",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "surfaces.effects", "surfaces.radiusScale", "typography.roles", "states.focus", "states.press", "density", "motion"],
  produces: [
    "--ds-breadcrumb-bg",
    "--ds-breadcrumb-border",
    "--ds-breadcrumb-color",
    "--ds-breadcrumb-radius",
    "--ds-breadcrumb-shadow",
    "--ds-breadcrumb-padding",
    "--ds-breadcrumb-list-gap",
    "--ds-breadcrumb-motion-duration",
    "--ds-breadcrumb-motion-easing",
    "--ds-breadcrumb-font-family",
    "--ds-breadcrumb-font-size",
    "--ds-breadcrumb-font-weight",
    "--ds-breadcrumb-current-font-weight",
    "--ds-breadcrumb-item-color",
    "--ds-breadcrumb-item-height",
    "--ds-breadcrumb-item-padding-inline",
    "--ds-breadcrumb-item-radius",
    "--ds-breadcrumb-item-gap",
    "--ds-breadcrumb-label-max-width",
    "--ds-breadcrumb-link-color",
    "--ds-breadcrumb-link-underline",
    "--ds-breadcrumb-color-hover",
    "--ds-breadcrumb-hover-bg",
    "--ds-breadcrumb-hover-border",
    "--ds-breadcrumb-hover-shadow",
    "--ds-breadcrumb-hover-lift",
    "--ds-breadcrumb-active-color",
    "--ds-breadcrumb-current-bg",
    "--ds-breadcrumb-current-border",
    "--ds-breadcrumb-current-keyline",
    "--ds-breadcrumb-focus-ring",
    "--ds-breadcrumb-focus-ring-width",
    "--ds-breadcrumb-icon-size",
    "--ds-breadcrumb-icon-radius",
    "--ds-breadcrumb-icon-bg",
    "--ds-breadcrumb-separator-color",
    "--ds-breadcrumb-separator-size",
    "--ds-breadcrumb-separator-opacity",
    "--ds-breadcrumb-ellipsis-color",
    "--ds-breadcrumb-ellipsis-bg",
    "--ds-breadcrumb-ellipsis-min-width",
    "--ds-breadcrumb-ellipsis-padding-inline",
    "--ds-breadcrumb-touch-target-min",
  ],
  derive: () => deriveBreadcrumbChannels(),
};

export function deriveBreadcrumbChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // The trail surface: paired card material, tinted a breath toward the primary.
  vars["--ds-breadcrumb-bg"] = "linear-gradient(180deg, color-mix(in srgb, var(--ds-card-bg, var(--ds-surface-card)) 97%, var(--ds-color-primary) 3%), var(--ds-card-bg, var(--ds-surface-card)))";
  vars["--ds-breadcrumb-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-breadcrumb-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-breadcrumb-radius"] = "var(--ds-radius-lg)";
  vars["--ds-breadcrumb-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-breadcrumb-padding"] = "var(--ds-spacing-1)";
  vars["--ds-breadcrumb-list-gap"] = "var(--ds-spacing-0)";
  vars["--ds-breadcrumb-motion-duration"] = "var(--ds-motion-feedback)";
  vars["--ds-breadcrumb-motion-easing"] = "var(--ds-motion-ease-standard)";

  // Crumbs on the supporting role.
  vars["--ds-breadcrumb-font-family"] = "var(--ds-type-supporting-font-family)";
  vars["--ds-breadcrumb-font-size"] = "var(--ds-type-supporting-font-size)";
  vars["--ds-breadcrumb-font-weight"] = "var(--ds-font-weight-medium)";
  vars["--ds-breadcrumb-current-font-weight"] = "var(--ds-font-weight-semibold)";
  vars["--ds-breadcrumb-item-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-breadcrumb-item-height"] = "var(--ds-spacing-7)";
  vars["--ds-breadcrumb-item-padding-inline"] = "var(--ds-spacing-2)";
  vars["--ds-breadcrumb-item-radius"] = "var(--ds-radius-md)";
  vars["--ds-breadcrumb-item-gap"] = "var(--ds-spacing-1)";
  vars["--ds-breadcrumb-label-max-width"] = "18rem";
  vars["--ds-breadcrumb-link-color"] = "var(--ds-color-primary)";
  vars["--ds-breadcrumb-link-underline"] = "color-mix(in srgb, currentColor 32%, transparent)";

  // Hover and press share one tint; the press drops the lift.
  vars["--ds-breadcrumb-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-breadcrumb-hover-bg"] = "color-mix(in srgb, var(--ds-color-primary) 6%, var(--ds-card-bg, var(--ds-surface-card)))";
  vars["--ds-breadcrumb-hover-border"] = "color-mix(in srgb, var(--ds-color-primary) 18%, var(--ds-color-border-subtle))";
  vars["--ds-breadcrumb-hover-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-breadcrumb-hover-lift"] = "calc(-1px * var(--ds-motion-intensity))";

  // The current location: primary tint, framed, with an intensity-scaled keyline.
  vars["--ds-breadcrumb-active-color"] = "var(--ds-color-text-primary)";
  vars["--ds-breadcrumb-current-bg"] = "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-card-bg, var(--ds-surface-card)))";
  vars["--ds-breadcrumb-current-border"] = "color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-color-border-subtle))";
  vars["--ds-breadcrumb-current-keyline"] = "inset 0 1px 0 color-mix(in srgb, var(--ds-color-white) calc(58% * var(--ds-effect-intensity)), transparent)";
  vars["--ds-breadcrumb-focus-ring"] = "var(--ds-focus-ring)";
  vars["--ds-breadcrumb-focus-ring-width"] = "var(--ds-focus-ring-width)";

  // Icon well, separator and the collapsed ellipsis.
  vars["--ds-breadcrumb-icon-size"] = "var(--ds-icon-sm-size)";
  vars["--ds-breadcrumb-icon-radius"] = "var(--ds-radius-sm)";
  vars["--ds-breadcrumb-icon-bg"] = "color-mix(in srgb, currentColor 7%, transparent)";
  vars["--ds-breadcrumb-separator-color"] = "var(--ds-color-text-tertiary)";
  vars["--ds-breadcrumb-separator-size"] = "var(--ds-icon-sm-size)";
  vars["--ds-breadcrumb-separator-opacity"] = "0.72";
  vars["--ds-breadcrumb-ellipsis-color"] = "var(--ds-color-text-muted)";
  vars["--ds-breadcrumb-ellipsis-bg"] = "color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)";
  vars["--ds-breadcrumb-ellipsis-min-width"] = "var(--ds-spacing-7)";
  vars["--ds-breadcrumb-ellipsis-padding-inline"] = "var(--ds-spacing-2)";
  vars["--ds-breadcrumb-touch-target-min"] = "var(--ds-touch-target-min)";
  return vars;
}
