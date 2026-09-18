/**
 * @fileoverview The `form-header` channels the Modern skin read with no producer:
 * the root's page gutter, the top-bar and hero paddings, the context gap, the
 * compact hero rung, the hero row's gap, the glass opt-in and the two title sizes.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/form-header
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * Each value is the fallback the skin already resolved to, so producing the name
 * changes nothing that renders and everything about whether a tenant can reach it:
 * a `var(--ds-x, LITERAL)` whose name nobody writes is a channel that looks
 * customizable and is not.
 *
 * The tone and the back chip's focus ring are NOT here — they are the header
 * contract's, produced once by `derivation/chrome/header`.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own form-header chrome outranks every relation stated here. */
export const formHeaderChromeDeriver: FamilyDeriver = {
  family: "form-header",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "typography.scale",
    "spacing.rhythm",
    "density",
  ],
  produces: [
    "--ds-form-header-context-backdrop",
    "--ds-form-header-context-gap",
    "--ds-form-header-hero-padding",
    "--ds-form-header-hero-padding-compact",
    "--ds-form-header-hero-row-gap",
    "--ds-form-header-root-margin",
    "--ds-form-header-title-font-size",
    "--ds-form-header-title-font-size-compact",
    "--ds-form-header-top-bar-padding-block",
    "--ds-form-header-top-bar-padding-inline",
  ],
  derive: () => deriveFormHeaderChannels(),
};

export function deriveFormHeaderChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* The root's page gutter rests at the spacing step of the same value. */
  vars["--ds-form-header-root-margin"] = "var(--ds-spacing-6, 24px)";

  /* The preset-tier paddings and the context gap: the same rhythm plane the root
     declares them on, so a read whose channel is never stated still rests at the
     tier the root would have set. */
  vars["--ds-form-header-top-bar-padding-block"] =
    "calc(var(--ds-spacing-3, 12px) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-form-header-top-bar-padding-inline"] =
    "calc(var(--ds-spacing-6, 24px) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-form-header-hero-padding"] =
    "calc(var(--ds-spacing-7, 28px) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-form-header-context-gap"] =
    "calc(var(--ds-spacing-6, 24px) * var(--ds-rhythm-effective-scale, 1))";

  vars["--ds-form-header-hero-padding-compact"] =
    "calc(var(--ds-spacing-5, 20px) * var(--ds-rhythm-effective-scale, 1))";
  /* The hero row's gap was a `gap={20}` prop on the Flex: a visual value in the TSX,
     and the one measurement in this family the rhythm plane never reached. Same 20px
     at rest, on the plane every other gutter here already rides. */
  vars["--ds-form-header-hero-row-gap"] =
    "calc(20px * var(--ds-rhythm-effective-scale, 1))";

  /* Glass is opt-in: a default-ON backdrop blur taxed every scroll frame. */
  vars["--ds-form-header-context-backdrop"] = "none";

  vars["--ds-form-header-title-font-size"] =
    "var(--ds-type-page-title-font-size, var(--ds-font-size-2xl))";
  vars["--ds-form-header-title-font-size-compact"] =
    "var(--ds-type-section-title-font-size, var(--ds-font-size-xl))";

  return vars;
}
