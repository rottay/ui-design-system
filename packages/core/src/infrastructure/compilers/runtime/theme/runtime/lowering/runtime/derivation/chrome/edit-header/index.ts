/**
 * @fileoverview The `edit-header` channels the Modern skin read with no producer:
 * the hero row's gap, the glass opt-in and the two title sizes.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/edit-header
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * Each value is the fallback the skin already resolved to, so producing the name
 * changes nothing that renders and everything about whether a tenant can reach it.
 *
 * `--ds-edit-header-title-font-size-compact` is NEW as a name and not as a value:
 * the compact rung read `var(--ds-type-section-title-font-size, …)` raw while the
 * twin `form-header` read it through a family channel, so the two families stepped
 * together in pixels and not in what a tenant could name. The status tone and the
 * back chip's focus ring are the header contract's, produced by
 * `derivation/chrome/header`.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own edit-header chrome outranks every relation stated here. */
export const editHeaderChromeDeriver: FamilyDeriver = {
  family: "edit-header",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "typography.scale",
    "spacing.rhythm",
    "density",
  ],
  produces: [
    "--ds-edit-header-context-card-filter",
    "--ds-edit-header-hero-row-gap",
    "--ds-edit-header-title-font-size",
    "--ds-edit-header-title-font-size-compact",
  ],
  derive: () => deriveEditHeaderChannels(),
};

export function deriveEditHeaderChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* The hero row's gap was a `gap={20}` prop on the Flex: a visual value in the TSX,
     and the one measurement in this family the rhythm plane never reached. Same 20px
     at rest, on the plane every other gutter here already rides. */
  vars["--ds-edit-header-hero-row-gap"] =
    "calc(20px * var(--ds-rhythm-effective-scale, 1))";

  /* Glass is opt-in: the retired default-ON `blur(8px)` was not the sanctioned
     glass contract. */
  vars["--ds-edit-header-context-card-filter"] = "none";

  vars["--ds-edit-header-title-font-size"] =
    "var(--ds-type-page-title-font-size, var(--ds-font-size-2xl))";
  vars["--ds-edit-header-title-font-size-compact"] =
    "var(--ds-type-section-title-font-size, var(--ds-font-size-xl))";

  return vars;
}
