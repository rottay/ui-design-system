/**
 * @fileoverview The `cockpit-header` channels the Modern skin read with no
 * producer: the card ground, the identity tile's size, the sticky offset and
 * stacking rung, and the action rail's glass opt-in.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/cockpit-header
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * Each value is the fallback the skin already resolved to, so producing the name
 * changes nothing that renders and everything about whether a tenant can reach it:
 * a `var(--ds-x, LITERAL)` whose name nobody writes is a channel that looks
 * customizable and is not.
 *
 * The skeleton radius this family used to read is NOT here. Its loading state is
 * the shared `AnatomySkeleton` now, which owns its own bone geometry, so the
 * channel has no reader left to produce for.
 *
 * `--ds-cockpit-header-sticky-top` is NOT here either, and the reason is measured
 * rather than chosen: its only honest value is `env(safe-area-inset-top, 0px)`, and
 * `env` is absent from `ALLOWED_VALUE_FUNCTIONS` in the single emission door
 * (`kernel/foundation/css/value-safety`), which drops an inadmissible value in
 * silence. Producing it would have deleted the notch inset with no error anywhere.
 * The skin keeps stating the inset as its own fallback, and the channel stays an
 * unproduced read until the door admits `env` — routed, not worked around.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own cockpit-header chrome outranks every relation stated here. */
export const cockpitHeaderChromeDeriver: FamilyDeriver = {
  family: "cockpit-header",
  rank: "derived",
  consumes: [
    "palette.*",
    "surfaces.radiusScale",
    "spacing.rhythm",
    "density",
    "typography.scale",
  ],
  produces: [
    "--ds-cockpit-header-actions-backdrop",
    "--ds-cockpit-header-bg",
    "--ds-cockpit-header-icon-size",
    "--ds-cockpit-header-sticky-z",
  ],
  derive: () => deriveCockpitHeaderChannels(),
};

export function deriveCockpitHeaderChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* The ground IS the shared card-header ground, verbatim. A family-local seeded
     gradient was drafted here as the fallback and measured dead: the foundation
     ships `--ds-card-header-bg: transparent` on `:root` in every vertical, so the
     fallback never painted and the arm over-claimed palette causality the shared
     ground does not have. An authored `--ds-card-header-bg` still wins through
     the chain; the painted palette arm of this family is the identity tile. */
  vars["--ds-cockpit-header-bg"] = "var(--ds-card-header-bg)";

  vars["--ds-cockpit-header-icon-size"] = "40px";

  /* The sticky rung sits below the overlay tiers rather than competing with them. */
  vars["--ds-cockpit-header-sticky-z"] = "100";

  /* Glass is opt-in: a default-ON backdrop blur taxes every scroll frame. */
  vars["--ds-cockpit-header-actions-backdrop"] = "none";

  return vars;
}
