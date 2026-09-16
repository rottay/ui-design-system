/**
 * @fileoverview The descriptions family: its label and content inks on the text
 * roles, its grid rhythm on the spacing ramp, its header and row grounds mixed
 * from the card surface toward the primary seed, and its corners on the radius
 * step. Each relation is the one the skin already stated as its resting value;
 * the deriver is where it gains a producer, so a decision can move it.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/descriptions
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own descriptions chrome outranks every relation stated here. */
export const descriptionsChromeDeriver: FamilyDeriver = {
  family: "descriptions",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.radiusScale", "typography.roles", "typography.roleWeights", "density"],
  produces: [
    "--ds-descriptions-color",
    "--ds-descriptions-column-gap",
    "--ds-descriptions-content-font-size",
    "--ds-descriptions-content-font-weight",
    "--ds-descriptions-content-line-height",
    "--ds-descriptions-extra-border",
    "--ds-descriptions-extra-padding",
    "--ds-descriptions-extra-radius",
    "--ds-descriptions-grid-gap",
    "--ds-descriptions-grid-padding",
    "--ds-descriptions-header-bg",
    "--ds-descriptions-header-border",
    "--ds-descriptions-header-border-hover",
    "--ds-descriptions-header-min-height",
    "--ds-descriptions-header-padding",
    "--ds-descriptions-header-radius",
    "--ds-descriptions-header-shadow",
    "--ds-descriptions-header-shadow-hover",
    "--ds-descriptions-item-span",
    "--ds-descriptions-label-font-size",
    "--ds-descriptions-label-font-weight",
    "--ds-descriptions-label-gap",
    "--ds-descriptions-label-ink",
    "--ds-descriptions-label-letter-spacing",
    "--ds-descriptions-label-line-height",
    "--ds-descriptions-label-transform",
    "--ds-descriptions-radius",
    "--ds-descriptions-row-bg",
    "--ds-descriptions-row-bg-hover",
    "--ds-descriptions-row-border",
    "--ds-descriptions-row-border-hover",
    "--ds-descriptions-row-padding",
    "--ds-descriptions-row-padding-md",
    "--ds-descriptions-row-padding-sm",
    "--ds-descriptions-row-radius",
    "--ds-descriptions-section-gap",
    "--ds-descriptions-shadow",
    "--ds-descriptions-title-font-family",
    "--ds-descriptions-title-font-size",
    "--ds-descriptions-title-font-weight",
    "--ds-descriptions-title-letter-spacing",
    "--ds-descriptions-title-line-height",
  ],
  derive: () => deriveDescriptionsChannels(),
};

/**
 * Channels outside the family's own namespace are NOT produced here: they have
 * their own producing family, and two families may not claim one channel at one
 * rank. The skin reads them; the owner declares them.
 */
export function deriveDescriptionsChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-descriptions-color"] = "var(--ds-color-text-primary)";
  vars["--ds-descriptions-column-gap"] = "var(--ds-spacing-6)";
  vars["--ds-descriptions-content-font-size"] = "var(--ds-font-size-sm)";
  vars["--ds-descriptions-content-font-weight"] = "var(--ds-font-weight-medium)";
  vars["--ds-descriptions-content-line-height"] = "1.45";
  vars["--ds-descriptions-extra-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-descriptions-extra-padding"] = "0.1875rem";
  vars["--ds-descriptions-extra-radius"] = "var(--ds-radius-md)";
  vars["--ds-descriptions-grid-gap"] = "calc(var(--ds-spacing-2) * 1.25)";
  vars["--ds-descriptions-grid-padding"] = "var(--ds-spacing-3)";
  vars["--ds-descriptions-header-bg"] = "linear-gradient(118deg, color-mix(in srgb, var(--ds-surface-card) 94%, var(--ds-color-primary) 6%), var(--ds-surface-card) 52%, color-mix(in srgb, var(--ds-surface-inset) 70%, var(--ds-surface-card)))";
  vars["--ds-descriptions-header-border"] = "var(--ds-color-border)";
  vars["--ds-descriptions-header-border-hover"] = "color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-color-border))";
  vars["--ds-descriptions-header-min-height"] = "calc(var(--ds-spacing-14))";
  vars["--ds-descriptions-header-padding"] = "0.75rem 1rem";
  vars["--ds-descriptions-header-radius"] = "var(--ds-radius-lg)";
  vars["--ds-descriptions-header-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-descriptions-header-shadow-hover"] = "var(--ds-elevation-2)";
  vars["--ds-descriptions-item-span"] = "1";
  vars["--ds-descriptions-label-font-size"] = "var(--ds-font-size-xs)";
  vars["--ds-descriptions-label-font-weight"] = "var(--ds-font-weight-medium)";
  vars["--ds-descriptions-label-gap"] = "0.3125rem";
  vars["--ds-descriptions-label-ink"] = "color-mix(in srgb, var(--ds-descriptions-label-color, var(--ds-color-text-secondary)) 70%, var(--ds-color-text-primary) 30%)";
  vars["--ds-descriptions-label-letter-spacing"] = "0.045em";
  vars["--ds-descriptions-label-line-height"] = "1.25";
  vars["--ds-descriptions-label-transform"] = "uppercase";
  vars["--ds-descriptions-radius"] = "var(--ds-radius-xl)";
  vars["--ds-descriptions-row-bg"] = "color-mix(in srgb, var(--ds-surface-inset) 46%, transparent)";
  vars["--ds-descriptions-row-bg-hover"] = "color-mix(in srgb, var(--ds-surface-card) 91%, var(--ds-color-primary) 9%)";
  vars["--ds-descriptions-row-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-descriptions-row-border-hover"] = "color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-color-border))";
  vars["--ds-descriptions-row-padding"] = "0.75rem 0.875rem";
  vars["--ds-descriptions-row-padding-md"] = "0.625rem 0.75rem";
  vars["--ds-descriptions-row-padding-sm"] = "0.5rem 0.625rem";
  vars["--ds-descriptions-row-radius"] = "var(--ds-radius-md)";
  vars["--ds-descriptions-section-gap"] = "calc(var(--ds-spacing-2) * 1.25)";
  vars["--ds-descriptions-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-descriptions-title-font-family"] = "var(--ds-font-family-heading)";
  vars["--ds-descriptions-title-font-size"] = "var(--ds-font-size-lg)";
  vars["--ds-descriptions-title-font-weight"] = "var(--ds-font-weight-semibold)";
  vars["--ds-descriptions-title-letter-spacing"] = "-0.02em";
  vars["--ds-descriptions-title-line-height"] = "1.25";
  return vars;
}
