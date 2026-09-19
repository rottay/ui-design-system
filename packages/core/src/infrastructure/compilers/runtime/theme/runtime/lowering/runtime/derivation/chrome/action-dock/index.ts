/**
 * @fileoverview The action-dock family: the thirteen channels its skin already
 * reads under the family's own namespace, at the resting value the skin itself
 * states, so a decision now has somewhere to move them.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/action-dock
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/**
 * A vertical's own action-dock chrome outranks every relation stated here.
 *
 * WHY EVERY VALUE IS THE SKIN'S OWN FALLBACK, VERBATIM. The dock is the one
 * family in this cut that already owned a correct folder-derived namespace and
 * simply had no producer for it: thirteen `var(--ds-action-dock-*, LITERAL)`
 * reads that always resolved to the literal, so the channel looked
 * customizable and was not. Adopting them is a cascade repair, not a redesign
 * -- each channel is published at exactly the value the skin was already
 * painting, so no pixel moves and the reads stop being decorative.
 *
 * WHAT THIS DERIVER DELIBERATELY DOES NOT TOUCH, each for a reason the skin
 * already records at length and this cut declines to overturn:
 *   - the glass default. `--ds-action-dock-backdrop-filter` is published as
 *     `blur(var(--ds-glass-blur, 8px))`, which is the pinned W10 contract the
 *     family's own suite asserts verbatim; the reduced-effects intensity
 *     collapses it through `--ds-glass-blur`, so the no-glass-default law is
 *     satisfied through the channel rather than by editing this default.
 *   - the edge. `--ds-action-dock-edge-color` stays on `--ds-color-border-primary`
 *     rather than the overlay material role: the skin measured that the swap
 *     would displace an AUTHORED palette token with a compiler pass-through and
 *     move a census rather than a screen.
 *   - the bottom depth. `--ds-action-dock-shadow-bottom` stays the family's own
 *     upward ambient pair rather than `--ds-material-overlay-shadow`, because
 *     that channel is publicly `none`-capable and `none` spliced into a
 *     comma list voids the whole declaration, taking the edge highlight with
 *     it. The top placement already reaches the tenant through
 *     `--ds-shadow-navbar`.
 *
 * `--ds-size-touch-target` and `--ds-virtual-keyboard-inset` are read by this
 * skin and are NOT produced here: the first is a kernel root the token lane
 * owns (FAM-10 routed the same name), and the second is stamped per instance
 * by the family's own TSX from the live viewport, which no static compile can
 * answer. Both stay this cut's named residue rather than acquiring an invented
 * producer.
 */
export const actionDockChromeDeriver: FamilyDeriver = {
  family: "action-dock",
  rank: "derived",
  consumes: [
    "palette.*",
    "surfaces.materials",
    "surfaces.elevation",
    "surfaces.effects",
    "density",
    "spacing.rhythm",
    "motion.*",
  ],
  produces: [
    "--ds-action-dock-backdrop-filter",
    "--ds-action-dock-bg",
    "--ds-action-dock-edge-color",
    "--ds-action-dock-edge-highlight",
    "--ds-action-dock-gap",
    "--ds-action-dock-padding-block",
    "--ds-action-dock-padding-inline",
    "--ds-action-dock-safe-area-bottom",
    "--ds-action-dock-safe-area-top",
    "--ds-action-dock-shadow-bottom",
    "--ds-action-dock-shadow-top",
    "--ds-action-dock-sticky-z-index",
    "--ds-action-dock-z-index",
  ],
  derive: () => deriveActionDockChannels(),
};

export function deriveActionDockChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  // Chrome sheet: a translucent ground over the page plus the tokenized
  // backdrop blur the reduced-effects intensity collapses.
  vars["--ds-action-dock-bg"] =
    "color-mix(in srgb, var(--ds-color-bg-primary) 90%, transparent)";
  vars["--ds-action-dock-backdrop-filter"] = "blur(var(--ds-glass-blur, 8px))";
  // Separation: a structural hairline plus the content-facing inset highlight.
  // Shadow and background both collapse under forced colors; the hairline does
  // not, which is why it carries the separation and not the elevation.
  vars["--ds-action-dock-edge-color"] = "var(--ds-color-border-primary, transparent)";
  vars["--ds-action-dock-edge-highlight"] =
    "color-mix(in srgb, var(--ds-color-bg-elevated) 72%, transparent)";
  // Depth is PLACEMENT-AWARE: the downward navbar shadow is invisible beneath
  // a bottom bar, so a bottom dock casts upward instead.
  vars["--ds-action-dock-shadow-bottom"] =
    "0 -2px 4px color-mix(in srgb, var(--ds-color-shadow) 30%, transparent), 0 -12px 28px -12px color-mix(in srgb, var(--ds-color-shadow) 60%, transparent)";
  vars["--ds-action-dock-shadow-top"] = "var(--ds-shadow-navbar)";
  // Geometry rides the density-scaled spacing rungs, so the dock breathes per
  // tenant density posture with no dock-owned density math.
  vars["--ds-action-dock-padding-inline"] = "var(--ds-spacing-4, 1rem)";
  vars["--ds-action-dock-padding-block"] = "var(--ds-spacing-3, 0.75rem)";
  vars["--ds-action-dock-gap"] = "var(--ds-spacing-3, 0.75rem)";
  // The physical insets the reservation hooks compose with.
  vars["--ds-action-dock-safe-area-top"] =
    "var(--ds-safe-area-top, env(safe-area-inset-top, 0px))";
  vars["--ds-action-dock-safe-area-bottom"] =
    "var(--ds-safe-area-bottom, env(safe-area-inset-bottom, 0px))";
  // Stacking: a fixed dock sits in the fixed band, a sticky one in the sticky
  // band. Two channels because the two modes are two bands, not one.
  vars["--ds-action-dock-z-index"] = "var(--ds-z-index-fixed, 1200)";
  vars["--ds-action-dock-sticky-z-index"] = "var(--ds-z-index-sticky, 1100)";
  return vars;
}
