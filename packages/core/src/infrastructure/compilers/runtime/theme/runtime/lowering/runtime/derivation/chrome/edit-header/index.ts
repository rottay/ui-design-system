/**
 * @fileoverview The `edit-header` channels the Modern skin read with no producer:
 * the top-bar and hero paddings, the context gap, the badge glyph size, the
 * status-pill tone aliases, the hero row's gap, the glass opt-in and the two
 * title sizes.
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
 * together in pixels and not in what a tenant could name. The status-pill tone
 * aliases chain to the header contract's `--ds-header-tone-*` channels, produced
 * by `derivation/chrome/header`; the back chip's focus ring is likewise the
 * contract's.
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
    "--ds-edit-header-context-gap",
    "--ds-edit-header-hero-padding",
    "--ds-edit-header-hero-row-gap",
    "--ds-edit-header-icon-badge-glyph-size",
    "--ds-edit-header-status-tone-bd",
    "--ds-edit-header-status-tone-bg",
    "--ds-edit-header-status-tone-fg",
    "--ds-edit-header-title-font-size",
    "--ds-edit-header-title-font-size-compact",
    "--ds-edit-header-top-bar-padding-block",
    "--ds-edit-header-top-bar-padding-inline",
  ],
  derive: () => deriveEditHeaderChannels(),
};

export function deriveEditHeaderChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* The preset-tier paddings and the context gap: the same rhythm plane the root
     declares them on, so a read whose channel is never stated still rests at the
     tier the root would have set. */
  vars["--ds-edit-header-top-bar-padding-block"] =
    "calc(var(--ds-spacing-3, 12px) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-edit-header-top-bar-padding-inline"] =
    "calc(var(--ds-spacing-6, 24px) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-edit-header-hero-padding"] =
    "calc(var(--ds-spacing-7, 28px) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-edit-header-context-gap"] =
    "calc(var(--ds-spacing-6, 24px) * var(--ds-rhythm-effective-scale, 1))";

  /* The badge glyph reads the governed icon size rung whose produced value equals
     the drained 24px. */
  vars["--ds-edit-header-icon-badge-glyph-size"] = "var(--ds-icon-lg-size, 24px)";

  /* The status-pill tone aliases: `secondary` is the resting tone the part
     declares, so the alias chains to the contract's secondary channels. */
  vars["--ds-edit-header-status-tone-bg"] =
    "var(--ds-header-tone-secondary-bg, color-mix(in srgb, var(--ds-color-bg-secondary) 92%, transparent))";
  vars["--ds-edit-header-status-tone-bd"] =
    "var(--ds-header-tone-secondary-bd, var(--ds-color-border-secondary))";
  vars["--ds-edit-header-status-tone-fg"] =
    "var(--ds-header-tone-secondary-fg, var(--ds-color-text-secondary))";

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
