/**
 * @fileoverview The popover family: its four material recipes on the overlay
 * and raised materials, the palette inks and the elevation scale, and its title
 * rule on the recipe edge.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/popover
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own popover chrome outranks every relation stated here. */
export const popoverChromeDeriver: FamilyDeriver = {
  family: "popover",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation"],
  produces: [
    "--ds-popover-bordered-background",
    "--ds-popover-bordered-foreground",
    "--ds-popover-bordered-muted-foreground",
    "--ds-popover-bordered-border",
    "--ds-popover-bordered-shadow",
    "--ds-popover-bordered-texture",
    "--ds-popover-minimal-background",
    "--ds-popover-minimal-foreground",
    "--ds-popover-minimal-muted-foreground",
    "--ds-popover-minimal-border",
    "--ds-popover-minimal-shadow",
    "--ds-popover-minimal-texture",
    "--ds-popover-inverse-background",
    "--ds-popover-inverse-foreground",
    "--ds-popover-inverse-muted-foreground",
    "--ds-popover-inverse-border",
    "--ds-popover-inverse-shadow",
    "--ds-popover-inverse-texture",
    "--ds-popover-rich-background",
    "--ds-popover-rich-foreground",
    "--ds-popover-rich-muted-foreground",
    "--ds-popover-rich-border",
    "--ds-popover-rich-shadow",
    "--ds-popover-rich-texture",
    "--ds-popover-opaque-background",
    "--ds-popover-surface-lift",
    "--ds-popover-keyline",
    "--ds-popover-title-background",
    "--ds-popover-title-divider",
  ],
  derive: () => derivePopoverChannels(),
};

export function derivePopoverChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-popover-bordered-background"] = "var(--ds-popover-bg, var(--ds-material-overlay-background))";
  vars["--ds-popover-bordered-foreground"] = "var(--ds-color-text-primary)";
  vars["--ds-popover-bordered-muted-foreground"] = "var(--ds-popover-content-color, var(--ds-color-text-secondary))";
  vars["--ds-popover-bordered-border"] = "var(--ds-popover-border, var(--ds-color-border-primary))";
  vars["--ds-popover-bordered-shadow"] = "var(--ds-popover-shadow, var(--ds-elevation-3))";
  vars["--ds-popover-bordered-texture"] = "none";
  vars["--ds-popover-minimal-background"] = "var(--ds-material-overlay-background)";
  vars["--ds-popover-minimal-foreground"] = "var(--ds-color-text-primary)";
  vars["--ds-popover-minimal-muted-foreground"] = "var(--ds-color-text-secondary)";
  vars["--ds-popover-minimal-border"] = "transparent";
  vars["--ds-popover-minimal-shadow"] = "var(--ds-shadow-md)";
  vars["--ds-popover-minimal-texture"] = "none";
  vars["--ds-popover-inverse-background"] = "var(--ds-color-text-primary)";
  vars["--ds-popover-inverse-foreground"] = "var(--ds-color-text-inverse)";
  vars["--ds-popover-inverse-muted-foreground"] = "color-mix(in srgb, var(--ds-color-text-inverse) 72%, transparent)";
  vars["--ds-popover-inverse-border"] = "color-mix(in srgb, var(--ds-color-text-inverse) 18%, transparent)";
  vars["--ds-popover-inverse-shadow"] = "var(--ds-shadow-xl)";
  vars["--ds-popover-inverse-texture"] = "none";
  vars["--ds-popover-rich-background"] = "var(--ds-material-raised-background)";
  vars["--ds-popover-rich-foreground"] = "var(--ds-color-text-primary)";
  vars["--ds-popover-rich-muted-foreground"] = "var(--ds-color-text-secondary)";
  vars["--ds-popover-rich-border"] = "var(--ds-color-border-secondary)";
  vars["--ds-popover-rich-shadow"] = "var(--ds-shadow-xl)";
  vars["--ds-popover-rich-texture"] = "none";
  vars["--ds-popover-opaque-background"] = "var(--ds-popover-bg, var(--ds-material-overlay-opaque))";
  vars["--ds-popover-surface-lift"] = "var(--ds-elevation-surface-3)";
  vars["--ds-popover-keyline"] =
    "color-mix(in srgb, var(--ds-color-bg-elevated) calc(72% * var(--ds-effect-intensity)), transparent)";
  vars["--ds-popover-title-background"] = "none";
  vars["--ds-popover-title-divider"] = "var(--ds-popover-title-border, var(--ds-color-border-subtle))";
  return vars;
}
