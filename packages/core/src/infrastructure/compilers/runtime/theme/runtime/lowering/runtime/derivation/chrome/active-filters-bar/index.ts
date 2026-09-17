/**
 * @fileoverview The active-filters-bar family: every channel its Modern-scope skin
 * reads under the family's own namespace, at the resting value the skin itself
 * stated, so a decision now has somewhere to move it.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/active-filters-bar
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/**
 * A vertical's own active-filters-bar chrome outranks every relation stated here.
 *
 * `palette.*`, `typography.roles`, `density` and `motion.*` are read by the
 * family's SKIN rather than by these nine channels: the seeded ink paints the
 * rail ground, its hairline and the lifecycle grammar on the chip value, the
 * role ramp sets the eyebrow and chip type steps, the density plane scales the
 * chips' hit target, and the motion dial times the entrance. Each is measured
 * in `ActiveFiltersBar.causality.integration.test.tsx`.
 *
 * The region relays the rail reads UNDER its own channels (`--ds-toolbar-*`,
 * `--ds-list-shell-section-gap`) are another family's vocabulary and are not
 * produced here; neither are the two `--ds-control-size-*` rungs the chip
 * target reads, which are a kernel scale with no owner today. Both stay
 * pinned as this cut's named residue.
 *
 * MATERIAL INVARIANT: the rail is deliberately flat, so no elevation channel
 * appears below and none may be added -- the family's tenant-reachable
 * material decisions are its ground and its rule, and nothing else.
 */
export const activeFiltersBarChromeDeriver: FamilyDeriver = {
  family: "active-filters-bar",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "density",
    "motion.*",
  ],
  produces: [
    "--ds-active-filters-bar-background",
    "--ds-active-filters-bar-border",
    "--ds-active-filters-bar-chips-basis",
    "--ds-active-filters-bar-count-block-size",
    "--ds-active-filters-bar-count-color",
    "--ds-active-filters-bar-embedded-padding-block",
    "--ds-active-filters-bar-motion-duration",
    "--ds-active-filters-bar-padding-block",
    "--ds-active-filters-bar-padding-inline",
  ],
  derive: () => deriveActiveFiltersBarChannels(),
};

export function deriveActiveFiltersBarChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  // Ground and rule follow the collection band the sibling toolbar reads, and
  // fall through to the same neutral pair when no toolbar channel is declared.
  vars["--ds-active-filters-bar-background"] =
    "var(--ds-toolbar-bg, linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 94%, var(--ds-color-bg-primary) 6%), color-mix(in srgb, var(--ds-surface-card) 90%, var(--ds-color-bg-primary) 10%)))";
  vars["--ds-active-filters-bar-border"] =
    "1px solid var(--ds-toolbar-border-bottom, color-mix(in srgb, var(--ds-color-border-subtle) 88%, transparent))";
  // The chips lane asks for its own measure before it wraps; the actions keep
  // the rail's trailing edge.
  vars["--ds-active-filters-bar-chips-basis"] = "560px";
  vars["--ds-active-filters-bar-count-block-size"] = "24px";
  vars["--ds-active-filters-bar-count-color"] = "var(--ds-color-text-muted)";
  vars["--ds-active-filters-bar-embedded-padding-block"] = "6px 10px";
  // The entrance is a REVEAL, so it reads the role the motion dial bends and
  // falls through to the cadence alias byte-identically when no dial is
  // stated: `--ds-motion-reveal` is `calc(calm * duration-scale)`, and at
  // scale 1 that is exactly the `--ds-motion-normal` the skin used to read.
  vars["--ds-active-filters-bar-motion-duration"] =
    "var(--ds-motion-reveal, var(--ds-motion-normal))";
  vars["--ds-active-filters-bar-padding-block"] = "10px 12px";
  vars["--ds-active-filters-bar-padding-inline"] = "16px";
  return vars;
}
