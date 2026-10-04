/**
 * @fileoverview The hover-card family: its card on the overlay material, the
 * elevation scale and a primary-tinted edge.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/hover-card
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own hover-card chrome outranks every relation stated here. */
export const hoverCardChromeDeriver: FamilyDeriver = {
  family: "hover-card",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation"],
  produces: [
    "--ds-hover-card-bg",
    "--ds-hover-card-surface-lift",
    "--ds-hover-card-texture",
    "--ds-hover-card-border-color",
    "--ds-hover-card-shadow",
  ],
  derive: () => deriveHoverCardChannels(),
};

export function deriveHoverCardChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-hover-card-bg"] = "var(--ds-material-overlay-background)";
  vars["--ds-hover-card-surface-lift"] = "var(--ds-elevation-surface-3)";
  vars["--ds-hover-card-texture"] = "none";
  vars["--ds-hover-card-border-color"] = "color-mix(in srgb, var(--ds-color-border) 86%, var(--ds-color-primary) 14%)";
  vars["--ds-hover-card-shadow"] = "var(--ds-elevation-3)";
  return vars;
}
