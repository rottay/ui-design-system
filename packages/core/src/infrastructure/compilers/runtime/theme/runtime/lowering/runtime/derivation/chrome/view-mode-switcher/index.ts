/**
 * @fileoverview The `view-mode-switcher` chrome deriver — the measured empty set.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/view-mode-switcher
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * `produces` is EMPTY, and that is a measurement rather than an omission —
 * the same ruling `header-surface` already carries, reached from the opposite
 * direction. This family's skin reads ZERO `--ds-*` names of any kind, which
 * the WO-FAM-11 census called the cut's extreme case. It is not a hole: it is
 * the receipt for the S25/S617B composition. After the wrapper's second
 * recessed frame was retired, this file owns no surface at all — no border, no
 * ground, no corner, no state — so there is nothing a channel could key to,
 * and `var(--ds-x, LITERAL)` with no producer is a channel that looks
 * customizable and is not.
 *
 * Every visual channel the wrapper used to carry exists one layer down, on the
 * certified Segmented this component IS: radius, control material, elevation,
 * spacing, motion and type all reach the pixel through `--ds-segmented-*` and
 * the governed `--ds-material-control-*` role. Re-adding any of them here
 * would rebuild a lower layer and make the wrapper a second authority for a
 * decision the primitive already owns.
 *
 * What this family owns is what only it can know: how the switcher behaves as
 * one item in a workspace toolbar row — an intrinsic `inline-flex` measure and
 * a `max-inline-size: 100%` cap that hands overflow to the primitive's own
 * scroll affordance instead of pushing the row wide. That is layout, not
 * paint, and it has no value a tenant could state.
 *
 * `consumes` is still stated honestly: these are the decision keypaths the
 * composed primitive depends on, so a change to any of them reaches this
 * switcher through the primitive's channels even though this family emits
 * none of its own.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own view-mode-switcher chrome outranks every relation stated here. */
export const viewModeSwitcherChromeDeriver: FamilyDeriver = {
  family: "view-mode-switcher",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "surfaces.materials",
    "surfaces.radiusScale",
    "density",
    "motion.*",
  ],
  produces: [],
  derive: () => deriveViewModeSwitcherChannels(),
};

/**
 * The family's channels at rest: none. See the module docblock for the
 * measured reason — the family owns zero paint channels, so the honest
 * emission is the empty map, and the ranked merge treats it as a no-op.
 */
export function deriveViewModeSwitcherChannels(): Record<string, string> {
  return {};
}
