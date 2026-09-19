/**
 * @fileoverview The pagination family: a joined control row on the paired
 * card material, page ink from the palette, the current page on the primary
 * seed, three size steps on the spacing ramp and the type roles, the jumper
 * and size changer on the same control grammar, motion on the intent cadences.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/pagination
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own pagination chrome outranks every relation stated here. */
export const paginationChromeDeriver: FamilyDeriver = {
  family: "pagination",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "surfaces.effects", "surfaces.radiusScale", "typography.roles", "typography.numeric", "states.focus", "states.press", "density", "motion"],
  produces: [
    "--ds-pagination-color",
    "--ds-pagination-font-family",
    "--ds-pagination-font-size",
    "--ds-pagination-numeric",
    "--ds-pagination-gap",
    "--ds-pagination-row-gap",
    "--ds-pagination-simple-gap",
    "--ds-pagination-motion-duration",
    "--ds-pagination-motion-easing",
    "--ds-pagination-border",
    "--ds-pagination-radius",
    "--ds-pagination-sm-height",
    "--ds-pagination-sm-padding-x",
    "--ds-pagination-sm-font-size",
    "--ds-pagination-md-height",
    "--ds-pagination-md-padding-x",
    "--ds-pagination-md-font-size",
    "--ds-pagination-lg-height",
    "--ds-pagination-lg-padding-x",
    "--ds-pagination-lg-font-size",
    "--ds-pagination-nav-inline-size",
    "--ds-pagination-item-bg",
    "--ds-pagination-item-color",
    "--ds-pagination-item-bg-hover",
    "--ds-pagination-item-color-hover",
    "--ds-pagination-item-bg-active",
    "--ds-pagination-item-bg-current",
    "--ds-pagination-item-color-current",
    "--ds-pagination-current-font-weight",
    "--ds-pagination-ellipsis-color",
    "--ds-pagination-disabled-opacity",
    "--ds-pagination-focus-ring",
    "--ds-pagination-focus-ring-width",
    "--ds-pagination-range-color",
    "--ds-pagination-range-font-size",
    "--ds-pagination-range-margin-block-end",
    "--ds-pagination-jumper-width",
    "--ds-pagination-size-arrow-clearance",
    "--ds-pagination-size-arrow-inset",
    "--ds-pagination-size-icon-color",
    "--ds-pagination-controls-bleed",
    "--ds-pagination-touch-target-min",
  ],
  derive: () => derivePaginationChannels(),
};

export function derivePaginationChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // Toolbar rhythm, type and motion.
  vars["--ds-pagination-color"] = "var(--ds-color-text-primary)";
  vars["--ds-pagination-font-family"] = "var(--ds-type-body-font-family)";
  vars["--ds-pagination-font-size"] = "var(--ds-type-body-font-size)";
  vars["--ds-pagination-numeric"] = "tabular-nums";
  vars["--ds-pagination-gap"] = "var(--ds-spacing-3)";
  vars["--ds-pagination-row-gap"] = "var(--ds-spacing-2)";
  vars["--ds-pagination-simple-gap"] = "var(--ds-spacing-2)";
  vars["--ds-pagination-motion-duration"] = "var(--ds-motion-feedback)";
  vars["--ds-pagination-motion-easing"] = "var(--ds-motion-ease-standard)";
  vars["--ds-pagination-border"] = "var(--ds-color-border)";
  vars["--ds-pagination-radius"] = "var(--ds-radius-md)";

  // Three size steps on the spacing ramp and the type roles.
  vars["--ds-pagination-sm-height"] = "var(--ds-spacing-8)";
  vars["--ds-pagination-sm-padding-x"] = "var(--ds-spacing-3)";
  vars["--ds-pagination-sm-font-size"] = "var(--ds-type-supporting-font-size)";
  vars["--ds-pagination-md-height"] = "var(--ds-spacing-9)";
  vars["--ds-pagination-md-padding-x"] = "var(--ds-spacing-4)";
  vars["--ds-pagination-md-font-size"] = "var(--ds-type-body-font-size)";
  vars["--ds-pagination-lg-height"] = "var(--ds-spacing-11)";
  vars["--ds-pagination-lg-padding-x"] = "var(--ds-spacing-5)";
  vars["--ds-pagination-lg-font-size"] = "var(--ds-font-size-base)";
  vars["--ds-pagination-nav-inline-size"] =
    "var(--ds-pagination-md-height, var(--_ds-pagination-current-height))";

  // Cells: paired card material at rest, primary tint on hover and press, inverted current page.
  vars["--ds-pagination-item-bg"] = "var(--ds-card-bg, var(--ds-surface-card))";
  vars["--ds-pagination-item-color"] = "var(--ds-color-text-primary)";
  vars["--ds-pagination-item-bg-hover"] = "color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-card-bg, var(--ds-surface-card)))";
  vars["--ds-pagination-item-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-pagination-item-bg-active"] = "color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-card-bg, var(--ds-surface-card)))";
  vars["--ds-pagination-item-bg-current"] = "var(--ds-color-primary)";
  vars["--ds-pagination-item-color-current"] = "var(--ds-color-text-on-primary)";
  vars["--ds-pagination-current-font-weight"] = "var(--ds-font-weight-semibold)";
  vars["--ds-pagination-ellipsis-color"] = "var(--ds-color-text-muted)";
  vars["--ds-pagination-disabled-opacity"] = "var(--ds-button-disabled-opacity)";
  vars["--ds-pagination-focus-ring"] = "var(--ds-focus-ring)";
  vars["--ds-pagination-focus-ring-width"] = "var(--ds-focus-ring-width)";

  // Range readout, quick jumper and size changer.
  vars["--ds-pagination-range-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-pagination-range-font-size"] = "var(--ds-type-supporting-font-size)";
  vars["--ds-pagination-range-margin-block-end"] = "var(--ds-spacing-0)";
  vars["--ds-pagination-jumper-width"] = "calc(var(--ds-spacing-14) + var(--ds-spacing-0))";
  vars["--ds-pagination-size-arrow-clearance"] = "var(--ds-spacing-8)";
  vars["--ds-pagination-size-arrow-inset"] = "var(--ds-spacing-2)";
  vars["--ds-pagination-size-icon-color"] = "var(--ds-color-text-muted)";
  vars["--ds-pagination-controls-bleed"] = "var(--ds-spacing-1)";
  vars["--ds-pagination-touch-target-min"] = "var(--ds-touch-target-min)";
  return vars;
}
