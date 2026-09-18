/**
 * @fileoverview The `workbench-header` channels the Modern skin read with no
 * producer: the preset room tiers (padding, section/item/action gaps), the
 * card ground, the identity tile's size and the action rail's glass opt-in.
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
    "--ds-workbench-header-action-gap",
    "--ds-workbench-header-actions-backdrop",
    "--ds-workbench-header-bg",
    "--ds-workbench-header-icon-size",
    "--ds-workbench-header-item-gap",
    "--ds-workbench-header-padding",
    "--ds-workbench-header-section-gap",
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

  /* Room channels are PRESET tiers: each produced value is verbatim the fallback
     the skin states at its read sites, so the rhythm axis still mounts once at
     the root declaration and producing the name cannot move a pixel. The gap
     channels state the same words the cockpit-header deriver states them, for
     the same reason the ground does. */
  vars["--ds-workbench-header-padding"] =
    "calc(clamp(var(--ds-spacing-4, 16px), 2vw, var(--ds-spacing-6, 24px)) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-workbench-header-section-gap"] =
    "calc(var(--ds-spacing-4, 16px) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-workbench-header-item-gap"] =
    "var(--ds-workspace-card-gap, calc(var(--ds-spacing-3, 12px) * var(--ds-rhythm-effective-scale, 1)))";
  vars["--ds-workbench-header-action-gap"] =
    "calc(var(--ds-spacing-2, 8px) * var(--ds-rhythm-effective-scale, 1))";

  /* The identity tile is the 40px spacing step; the literal tail is the resting
     value the skin already resolved to. */
  vars["--ds-workbench-header-icon-size"] = "var(--ds-spacing-10, 40px)";

  /* Glass is opt-in: a default-ON backdrop blur taxes every scroll frame. */
  vars["--ds-workbench-header-actions-backdrop"] = "none";

  return vars;
}
