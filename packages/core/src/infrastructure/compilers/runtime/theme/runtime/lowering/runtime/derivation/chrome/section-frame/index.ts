/**
 * @fileoverview The `section-frame` channels: the framing rule, the mono label rung
 * and the two inks the numbered section paints.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/section-frame
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * This family read every one of its channels through a producer already -- it is the
 * cleanest family of the WO-FAM-10 cut -- so nothing here repairs an unproduced name.
 * What it repairs is reach: the frame's rhythm, its rule and its label rung were
 * stated as literals and shared roots directly in the skin, which means a tenant
 * could move `--ds-spacing-10` for the whole product or nothing at all. Naming them
 * gives the section its own dial over the same resting value.
 *
 * `--_ds-section-frame-label-tracking` was the one private name here. A leading
 * underscore puts a channel outside every producer census and outside the tenant's
 * reach at the same time; it is the family's own tracking, so it is in the family's
 * own namespace now.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own section-frame chrome outranks every relation stated here. */
export const sectionFrameChromeDeriver: FamilyDeriver = {
  family: "section-frame",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "typography.scale",
    "spacing.rhythm",
    "density",
  ],
  produces: [
    "--ds-section-frame-label-column-gap",
    "--ds-section-frame-label-font-size",
    "--ds-section-frame-label-font-weight",
    "--ds-section-frame-label-margin-block-end",
    "--ds-section-frame-label-measure",
    "--ds-section-frame-label-row-gap",
    "--ds-section-frame-label-tracking",
    "--ds-section-frame-meta-ink",
    "--ds-section-frame-ordinal-ink",
    "--ds-section-frame-padding-block",
    "--ds-section-frame-rule-color",
    "--ds-section-frame-rule-width",
  ],
  derive: () => deriveSectionFrameChannels(),
};

export function deriveSectionFrameChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  vars["--ds-section-frame-padding-block"] = "var(--ds-spacing-10, 2.5rem)";
  vars["--ds-section-frame-rule-width"] = "1px";
  vars["--ds-section-frame-rule-color"] = "var(--ds-color-hairline)";

  vars["--ds-section-frame-label-column-gap"] = "var(--ds-spacing-3, 0.75rem)";
  vars["--ds-section-frame-label-row-gap"] = "var(--ds-spacing-1, 0.25rem)";
  vars["--ds-section-frame-label-margin-block-end"] = "var(--ds-spacing-6, 1.5rem)";
  vars["--ds-section-frame-label-measure"] = "var(--ds-type-paragraph-measure, 68ch)";
  vars["--ds-section-frame-label-font-size"] = "var(--ds-font-size-xs, 0.75rem)";
  vars["--ds-section-frame-label-font-weight"] = "var(--ds-font-weight-medium, 500)";
  vars["--ds-section-frame-label-tracking"] = "0.12em";

  /* Both inks are mixed from the MODE'S OWN ink toward the MODE'S OWN canvas, so each
     quiets by the same proportion in light and in dark instead of landing on a fixed
     step only one canvas can carry. What they replace was measured failing by axe in
     the family's own four scopes: `--ds-color-mono-500` is
     `color-mix(in lab, #000000 50%, #ffffff)` in EVERY mode -- one mid grey for both
     canvases -- and read 4.18 on rottay dark, 4.32 on bithire dark and 4.29 on evnto
     light against the 4.5 AA floor; `--ds-color-text-secondary`, which the skin's own
     comment used to call the safe route, resolves #A0A0A5 on a white ground and read
     2.60 there and 2.49 on evnto's. After this change axe reports no serious finding
     in any of the four. */
  vars["--ds-section-frame-ordinal-ink"] =
    "color-mix(in oklab, var(--ds-color-text-primary) 66%, var(--ds-color-bg-primary))";
  vars["--ds-section-frame-meta-ink"] =
    "color-mix(in oklab, var(--ds-color-text-primary) 78%, var(--ds-color-bg-primary))";

  return vars;
}
