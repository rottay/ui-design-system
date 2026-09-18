/**
 * @fileoverview The `mobile-header` channels: the bar row and its notch inset, the
 * sticky posture, the title's optical type and the back trigger's chrome.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/mobile-header
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * Three names the skin already read had no producer at all
 * (`-focus-ring`, `-sticky-backdrop`, `-sticky-z`): a `var(--ds-x, LITERAL)` nobody
 * writes is a channel that looks customizable and is not.
 *
 * Two more were family-PRIVATE (`--_ds-mobile-header-bar-block-size`,
 * `--_ds-mobile-header-safe-area`). A leading underscore puts a channel outside
 * every producer census and outside the tenant's reach at the same time. The
 * bar row carries the family's whole box model -- the 56px row the notch inset
 * is added to on top of rather than taken out of -- so it is the family's own
 * and is in the family's own namespace now, at the same value.
 *
 * `--ds-mobile-header-safe-area` is NOT here, and the reason is measured rather
 * than chosen: its only honest value is `env(safe-area-inset-top, 0px)`, and
 * `env` is absent from `ALLOWED_VALUE_FUNCTIONS` in the single emission door
 * (`kernel/foundation/css/value-safety`), which drops an inadmissible value in
 * silence. Measured, the door admitted 15 of this deriver's 16 channels and
 * dropped this one whole, so producing it claimed a channel the artifact never
 * carried. The skin keeps stating the inset as its own double fallback
 * (`var(--ds-safe-area-top, env(...))`), the pixels survive, and the channel
 * stays an unproduced read until the door admits `env` — routed, not worked
 * around. (Same disposition as `--ds-cockpit-header-sticky-top`.)
 *
 * The rest were literals in the skin. Each is stated here at exactly the fallback the
 * skin reads it with, so naming it moves no pixel and changes only whether a tenant
 * can reach it.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own mobile-header chrome outranks every relation stated here. */
export const mobileHeaderChromeDeriver: FamilyDeriver = {
  family: "mobile-header",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "typography.scale",
    "surfaces.elevation-posture",
    "surfaces.focusStyle",
    "states.*",
    "shape.*",
  ],
  produces: [
    "--ds-mobile-header-bar-block-size",
    "--ds-mobile-header-bar-padding-inline",
    "--ds-mobile-header-center-padding-inline",
    "--ds-mobile-header-focus-ring",
    "--ds-mobile-header-hairline-color",
    "--ds-mobile-header-sticky-backdrop",
    "--ds-mobile-header-sticky-bg",
    "--ds-mobile-header-sticky-z",
    "--ds-mobile-header-stuck-shadow",
    "--ds-mobile-header-title-font-size",
    "--ds-mobile-header-title-line-height",
    "--ds-mobile-header-title-tracking",
    "--ds-mobile-header-trigger-press-scale",
    "--ds-mobile-header-trigger-radius",
    "--ds-mobile-header-trigger-tint",
  ],
  derive: () => deriveMobileHeaderChannels(),
};

export function deriveMobileHeaderChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* The 56px is the BAR ROW, not the root box: the notch inset is added to the root
     on top of it, so a notch never subtracts itself from the row. Both values are
     density-neutral by decision -- a mobile bar that grows with the density dial
     stops being the platform-height bar its consumers position against. */
  vars["--ds-mobile-header-bar-block-size"] = "56px";
  vars["--ds-mobile-header-bar-padding-inline"] = "4px";
  vars["--ds-mobile-header-center-padding-inline"] = "8px";

  vars["--ds-mobile-header-hairline-color"] = "var(--ds-color-border)";
  vars["--ds-mobile-header-sticky-bg"] =
    "color-mix(in srgb, var(--ds-color-bg-primary) 86%, transparent)";
  /* Glass is opt-in: a default-ON backdrop blur taxed every scroll frame. */
  vars["--ds-mobile-header-sticky-backdrop"] = "none";
  vars["--ds-mobile-header-sticky-z"] = "40";
  vars["--ds-mobile-header-stuck-shadow"] = "var(--ds-elevation-2)";

  /* 17px optical: the one size on this bar with no canonical rung. */
  vars["--ds-mobile-header-title-font-size"] = "calc(var(--ds-font-size-lg) * 1.0625)";
  vars["--ds-mobile-header-title-line-height"] = "1.29";
  vars["--ds-mobile-header-title-tracking"] = "-0.01em";

  vars["--ds-mobile-header-trigger-radius"] = "var(--ds-radius-md, 8px)";
  vars["--ds-mobile-header-trigger-tint"] =
    "color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent)";
  vars["--ds-mobile-header-trigger-press-scale"] = "0.94";
  vars["--ds-mobile-header-focus-ring"] =
    "var(--ds-focus-ring, 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 24%, transparent))";

  return vars;
}
