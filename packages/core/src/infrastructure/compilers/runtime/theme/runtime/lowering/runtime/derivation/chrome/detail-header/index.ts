/**
 * @fileoverview The `detail-header` channels: the hero's display type rungs, the
 * identity frame's geometry, the back chip's chrome and the tab strip's lane.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/detail-header
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * Thirty-one of the seventy-nine channels this family's skin read had no
 * producer -- the highest unproduced share of the WO-FAM-10 cut. Thirty of them
 * are the family's own `--ds-detail-header-*` dials; each one was a literal (or
 * a chain to a shared root) sitting in a `var(--ds-x, …)` fallback nobody
 * wrote, which looks customizable and is not. Each is stated here at exactly
 * the fallback the skin reads it with, so producing the name moves no pixel
 * and changes only whether a tenant can reach it.
 *
 * The title rungs state the page-title role chains (not bare literals): the
 * family's resting type defers to `--ds-type-page-title-*`, exactly as the
 * skin's post-C1 fallback chains did, so a role-less artifact renders
 * byte-identical and an authored role reaches the hero through the family
 * channel.
 *
 * The thirty-first unproduced name, `--ds-size-touch-target`, is NOT here and
 * is a measurement rather than an omission: it is the governed accessibility
 * floor (fixed 44px, no density/profile dial), owned by the token/root lane
 * and read by many families. Producing it from a family deriver would be a
 * second owner of a shared root; it stays a routed read (WO-FAM-10 census §4).
 *
 * The `--ds-detail-hero-*` and `--ds-detail-control-*` / `--ds-detail-continuous-*`
 * names are NOT here either: the detail-page chrome lane owns them and this
 * family's skin already states their defaults as authored declarations.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own detail-header chrome outranks every relation stated here. */
export const detailHeaderChromeDeriver: FamilyDeriver = {
  family: "detail-header",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "typography.scale",
    "states.*",
    "shape.*",
  ],
  produces: [
    "--ds-detail-header-avatar-initials-size",
    "--ds-detail-header-avatar-size",
    "--ds-detail-header-avatar-size-compact",
    "--ds-detail-header-back-button-padding",
    "--ds-detail-header-context-rail-margin-block-start",
    "--ds-detail-header-eyebrow-tracking",
    "--ds-detail-header-focus-ring",
    "--ds-detail-header-hero-panel-padding",
    "--ds-detail-header-hero-panel-padding-compact",
    "--ds-detail-header-metadata-card-children-margin-block-start",
    "--ds-detail-header-metadata-card-margin-block-start",
    "--ds-detail-header-metadata-card-padding-compact",
    "--ds-detail-header-metadata-chip-label-tracking",
    "--ds-detail-header-radius",
    "--ds-detail-header-root-margin-block-end",
    "--ds-detail-header-shadow",
    "--ds-detail-header-subtitle-leading",
    "--ds-detail-header-subtitle-max-inline-size",
    "--ds-detail-header-tab-active-bg",
    "--ds-detail-header-tab-count-padding",
    "--ds-detail-header-tab-focus-ring",
    "--ds-detail-header-tab-padding",
    "--ds-detail-header-title-leading",
    "--ds-detail-header-title-size",
    "--ds-detail-header-title-size-compact",
    "--ds-detail-header-title-size-editorial",
    "--ds-detail-header-title-size-technical",
    "--ds-detail-header-title-tracking",
    "--ds-detail-header-title-tracking-compact",
    "--ds-detail-header-title-weight",
  ],
  derive: () => deriveDetailHeaderChannels(),
};

export function deriveDetailHeaderChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* The identity frame. The avatar rungs are density-neutral by decision --
     a portrait that grows with the density dial stops being the identity
     block the hero grid positions against. */
  vars["--ds-detail-header-avatar-size"] = "68px";
  vars["--ds-detail-header-avatar-size-compact"] = "56px";
  vars["--ds-detail-header-avatar-initials-size"] = "24px";

  /* The hero's display type. Every rung defers to the page-title role the
     C1 wave converged on; the family channel stays first, the role second,
     the pre-C1 literal last, so an unauthored role renders byte-identical. */
  vars["--ds-detail-header-title-size"] = "var(--ds-type-page-title-font-size, 32px)";
  vars["--ds-detail-header-title-size-editorial"] =
    "calc(var(--ds-type-page-title-font-size, 32px) * 1.0625)";
  vars["--ds-detail-header-title-size-technical"] =
    "calc(var(--ds-type-page-title-font-size, 32px) * 0.9375)";
  vars["--ds-detail-header-title-size-compact"] =
    "calc(var(--ds-type-page-title-font-size, 32px) * 0.8125)";
  vars["--ds-detail-header-title-weight"] = "var(--ds-type-page-title-font-weight, 700)";
  vars["--ds-detail-header-title-leading"] = "var(--ds-type-page-title-line-height, 1.2)";
  vars["--ds-detail-header-title-tracking"] =
    "var(--ds-type-page-title-letter-spacing, var(--ds-typography-heading-letter-spacing, -0.04em))";
  vars["--ds-detail-header-title-tracking-compact"] =
    "var(--ds-type-page-title-letter-spacing, -0.025em)";

  /* The hero copy around the title. */
  vars["--ds-detail-header-eyebrow-tracking"] = "0.14em";
  vars["--ds-detail-header-subtitle-leading"] = "1.65";
  vars["--ds-detail-header-subtitle-max-inline-size"] = "68ch";
  vars["--ds-detail-header-context-rail-margin-block-start"] = "2px";

  /* The frame itself: the single dominant card, its gutter and its ground.
     The shadow states the tenant identity chrome chain verbatim, so a
     `--ds-detail-hero-shadow` still wins through the family channel. */
  vars["--ds-detail-header-radius"] = "var(--ds-radius-xl, 22px)";
  vars["--ds-detail-header-root-margin-block-end"] = "24px";
  vars["--ds-detail-header-hero-panel-padding"] = "var(--ds-spacing-6, 24px)";
  vars["--ds-detail-header-hero-panel-padding-compact"] = "20px";
  vars["--ds-detail-header-shadow"] =
    "var(--ds-detail-hero-shadow, inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 82%, transparent), var(--ds-elevation-1))";

  /* The metadata lane. */
  vars["--ds-detail-header-metadata-card-margin-block-start"] = "24px";
  vars["--ds-detail-header-metadata-card-children-margin-block-start"] = "18px";
  vars["--ds-detail-header-metadata-card-padding-compact"] = "14px";
  vars["--ds-detail-header-metadata-chip-label-tracking"] = "0.12em";

  /* The back chip: padding, and the keyboard ring shared with the tab. */
  vars["--ds-detail-header-back-button-padding"] = "7px 12px";
  vars["--ds-detail-header-focus-ring"] =
    "var(--ds-focus-ring, 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 24%, transparent))";

  /* The tab strip: a rail, not a folder -- the selection is the rail's paint,
     the active wash stays a tenant opt-in over a transparent ground. */
  vars["--ds-detail-header-tab-padding"] = "10px 12px 12px";
  vars["--ds-detail-header-tab-active-bg"] = "transparent";
  vars["--ds-detail-header-tab-count-padding"] = "2px 6px";
  vars["--ds-detail-header-tab-focus-ring"] =
    "var(--ds-focus-ring, 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 24%, transparent))";

  return vars;
}
