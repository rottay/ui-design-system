/**
 * @fileoverview The file-manager family: every channel its Modern skin reads under the
 * family's own namespace, at the resting value the skin itself stated, so a decision
 * now has somewhere to move it.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/file-manager
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/**
 * A vertical's own file-manager chrome outranks every relation stated here.
 *
 * `palette.*`, `typography.roles`, `surfaces.radiusScale`, `surfaces.elevation`,
 * `states.focus` and `density` are read by the family's SKIN rather than by
 * these four channels: the seeded ink paints the selected row and card, the
 * per-kind glyphs and the drop zone, the role ramp sets the list type step,
 * the radius rungs close the card surface and the grid card, the elevation
 * ramp lifts the loaded root, the focus signature rings the folder link and
 * the grid card, and the density-scaled spacing ramp sets the body rhythm.
 * Each is measured in `PatternFileManager.causality.integration.test.tsx`.
 *
 * The two `--ds-link-*` names the folder-link reset reads
 * (`--ds-link-underline-thickness`, `--ds-link-underline-offset`) are NOT
 * produced here: they are the Link vocabulary, a foreign namespace, and a
 * family deriver that wrote them would be a second owner of another family's
 * channels. They stay pinned as this cut's named residue.
 */
export const fileManagerChromeDeriver: FamilyDeriver = {
  family: "file-manager",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "surfaces.radiusScale",
    "surfaces.elevation",
    "states.focus",
    "density",
  ],
  produces: [
    "--ds-file-manager-content-min-height",
    "--ds-file-manager-link-color",
    "--ds-file-manager-link-hover-color",
    "--ds-file-manager-touch-target",
  ],
  derive: () => deriveFileManagerChannels(),
};

export function deriveFileManagerChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  // The drop zone is a target before it is a list: it keeps a minimum
  // catchment even when the folder is empty.
  vars["--ds-file-manager-content-min-height"] = "12.5rem";
  // The folder entry is the pattern's one link affordance, so it rides the
  // link ink the rest of the system uses rather than a private blue.
  vars["--ds-file-manager-link-color"] = "var(--ds-color-link, var(--ds-color-primary))";
  vars["--ds-file-manager-link-hover-color"] = "var(--ds-color-link-hover, var(--ds-color-primary-hover))";
  vars["--ds-file-manager-touch-target"] = "2.75rem";
  return vars;
}
