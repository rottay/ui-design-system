/**
 * @fileoverview The `surface-chrome` family: the section card's header height,
 * its identity tile size, its overline tracking and the tab label's gap.
 *
 * @remarks
 * Every produced value is the single chained fallback its skin reads it with,
 * so producing the name changes WHO can reach the value, not what it rests at.
 *
 * The family id is `surface-chrome` and the namespace is `--ds-section-card-*`.
 * That is not drift: `--ds-section-card-` is the GENERATED manifest prefix of
 * the governed section-card recipe (`recipes/manifest`), which is public API,
 * and the class root the component emits comes from the same recipe. Renaming
 * either would be a breaking change to a published contract, so the family-cut
 * roster carries a `skins` pin instead and the spelling stays.
 *
 * `--ds-workspace-card-icon-bg` / `-border` / `-color` are NOT produced here.
 * They are the shared workspace-card tenant group — `cockpit-header`,
 * `workbench-header` and `page-shell` read the same three names with the same
 * fallbacks for the same identity tile — so a tenant that states one expects
 * every tile to follow. They belong to that owner and are routed.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/surface-chrome
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own section-card chrome outranks every relation stated here. */
export const surfaceChromeChromeDeriver: FamilyDeriver = {
  family: "surface-chrome",
  rank: "derived",
  consumes: ["density"],
  produces: [
    "--ds-section-card-header-min-height",
    "--ds-section-card-icon-size",
    "--ds-section-card-eyebrow-tracking",
    "--ds-section-card-tab-label-gap",
  ],
  derive: () => deriveSurfaceChromeChannels(),
};

export function deriveSurfaceChromeChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // The header keeps a minimum band so a title-only section and a section with
  // an icon, an overline and an action row read at the same rhythm.
  vars["--ds-section-card-header-min-height"] = "68px";

  // The identity tile is a control-sized square.
  vars["--ds-section-card-icon-size"] = "38px";

  // The overline is set wide enough to read as a register rather than a label.
  vars["--ds-section-card-eyebrow-tracking"] = "0.11em";

  // The tab label's badge sits one spacing rung off the label.
  vars["--ds-section-card-tab-label-gap"] = "var(--ds-spacing-2, 8px)";

  return vars;
}
