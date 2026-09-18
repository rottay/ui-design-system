/**
 * @fileoverview The `workbench-header` channels the Modern skin read with no
 * producer: the card ground, the identity tile's size and the action rail's
 * glass opt-in.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/workbench-header
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * Each value is the fallback the skin already resolved to, so producing the name
 * changes nothing that renders and everything about whether a tenant can reach it.
 *
 * The card ground and the tile size are stated in the same words the
 * `cockpit-header` deriver states them: the two shell headers are the same
 * surface, and the duplication is real. It is NOT collapsed here — a shared
 * `shell-header` namespace would be a contract with two consumers, and this cut
 * owns neither header's peers. The duplication is reported rather than hidden.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own workbench-header chrome outranks every relation stated here. */
export const workbenchHeaderChromeDeriver: FamilyDeriver = {
  family: "workbench-header",
  rank: "derived",
  consumes: [
    "palette.*",
    "surfaces.radiusScale",
    "spacing.rhythm",
    "density",
    "typography.scale",
  ],
  produces: [
    "--ds-workbench-header-actions-backdrop",
    "--ds-workbench-header-bg",
    "--ds-workbench-header-icon-size",
  ],
  derive: () => deriveWorkbenchHeaderChannels(),
};

export function deriveWorkbenchHeaderChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* The ground IS the shared card-header ground, verbatim — the same disposition
     the cockpit-header deriver states, for the same measured reason: the
     foundation ships `--ds-card-header-bg: transparent` on `:root` in every
     vertical, so a seeded family gradient as the fallback was dead code that
     over-claimed palette causality. Painted palette causality for this family
     is the identity tile's ink. */
  vars["--ds-workbench-header-bg"] = "var(--ds-card-header-bg)";

  vars["--ds-workbench-header-icon-size"] = "40px";

  /* Glass is opt-in: a default-ON backdrop blur taxes every scroll frame. */
  vars["--ds-workbench-header-actions-backdrop"] = "none";

  return vars;
}
