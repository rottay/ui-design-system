/**
 * @fileoverview The `collection-header` channels: the hero card's ground, frame,
 * sheen and radius, the overline/chip/keycap material rungs, the title measure,
 * the drained root/identity/subtitle/rail geometry and the dotted-title stroke.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/collection-header
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * Ten of these names were read by the Modern skin with no producer at all
 * (`-bg`, `-border`, `-radius`, `-shadow`, `-shadow-hover`, `-sheen-duration`,
 * `-sheen-opacity`, `-actions-backdrop`, `-display-color`, `-display-shade`):
 * a `var(--ds-x, LITERAL)` whose name nobody writes is a channel that looks
 * customizable and is not.
 *
 * Twenty-two more were FAMILY-PRIVATE (`--_ds-collection-header-*`): a leading
 * underscore puts a channel outside every producer census and outside the
 * tenant's reach at the same time. They are renamed into the family namespace
 * at the exact values the skin resolved them to.
 *
 * The rest are the drain of the component's inline paint: the root's posture
 * padding (default / editorial-compact / embedded / minimal), the identity
 * grid gap, the subtitle type ladder (size, leading, tracking, case, opacity,
 * measure — keyed on the stamped treatment/posture attributes in the skin),
 * the quick-actions cluster gaps, the rail's trailing rhythm and the dotted
 * title's `-webkit-text-stroke` rungs. Each is stated here at exactly the
 * fallback the skin reads it with, so registering this deriver moves no pixel
 * and no causality probe goes stale.
 *
 * NOT here, and deliberate: `--ds-collection-header-action-floor` (the
 * coarse-pointer quick-action height) is runtime-computed per instance and
 * retired with the inline paint — the composed Button raises its own floor to
 * the touch target under `(hover: none), (pointer: coarse)` in its own skin.
 * The `--ds-kbd-*` set is the kbd family's vocabulary (routed, not invented
 * here) and `--ds-page-header-*` is the shared page-header group recipe the
 * type profile drives.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own collection-header chrome outranks every relation stated here. */
export const collectionHeaderChromeDeriver: FamilyDeriver = {
  family: "collection-header",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "typography.scale",
    "spacing.rhythm",
    "shape.*",
    "surfaces.elevation-posture",
    "motion.*",
    "expressive.*",
  ],
  produces: [
    "--ds-collection-header-accent",
    "--ds-collection-header-action-icon-gap",
    "--ds-collection-header-actions-backdrop",
    "--ds-collection-header-bg",
    "--ds-collection-header-border",
    "--ds-collection-header-chip-block-size",
    "--ds-collection-header-chip-family",
    "--ds-collection-header-chip-inline-padding",
    "--ds-collection-header-chip-radius",
    "--ds-collection-header-chip-size",
    "--ds-collection-header-chip-tracking",
    "--ds-collection-header-chip-weight",
    "--ds-collection-header-display-color",
    "--ds-collection-header-display-shade",
    "--ds-collection-header-dotted-stroke",
    "--ds-collection-header-dotted-stroke-compact",
    "--ds-collection-header-dotted-stroke-editorial",
    "--ds-collection-header-identity-gap",
    "--ds-collection-header-inline-meta-gap",
    "--ds-collection-header-keycap-block-size",
    "--ds-collection-header-keycap-depth-width",
    "--ds-collection-header-keycap-family",
    "--ds-collection-header-keycap-frame",
    "--ds-collection-header-keycap-inline-padding",
    "--ds-collection-header-keycap-ink",
    "--ds-collection-header-keycap-radius",
    "--ds-collection-header-keycap-size",
    "--ds-collection-header-keycap-surface",
    "--ds-collection-header-keycap-weight",
    "--ds-collection-header-overline-case",
    "--ds-collection-header-overline-family",
    "--ds-collection-header-overline-size",
    "--ds-collection-header-overline-tracking",
    "--ds-collection-header-overline-weight",
    "--ds-collection-header-padding-block-end",
    "--ds-collection-header-padding-block-start",
    "--ds-collection-header-padding-compact-block-end",
    "--ds-collection-header-padding-compact-block-start",
    "--ds-collection-header-padding-compact-inline",
    "--ds-collection-header-padding-embedded-block-end",
    "--ds-collection-header-padding-embedded-editorial-block-end",
    "--ds-collection-header-padding-inline",
    "--ds-collection-header-padding-minimal",
    "--ds-collection-header-padding-minimal-embedded-block",
    "--ds-collection-header-padding-minimal-embedded-inline",
    "--ds-collection-header-quick-actions-above-gap",
    "--ds-collection-header-quick-actions-above-gap-editorial",
    "--ds-collection-header-quick-actions-gap",
    "--ds-collection-header-quick-actions-gap-editorial",
    "--ds-collection-header-quick-actions-padding",
    "--ds-collection-header-radius",
    "--ds-collection-header-rail-grid-gap",
    "--ds-collection-header-rail-trailing-gap",
    "--ds-collection-header-rail-trailing-row-gap",
    "--ds-collection-header-shadow",
    "--ds-collection-header-shadow-hover",
    "--ds-collection-header-sheen-duration",
    "--ds-collection-header-sheen-opacity",
    "--ds-collection-header-subtitle-line-height",
    "--ds-collection-header-subtitle-line-height-caption",
    "--ds-collection-header-subtitle-measure-editorial",
    "--ds-collection-header-subtitle-opacity-editorial",
    "--ds-collection-header-subtitle-opacity-treated",
    "--ds-collection-header-subtitle-size",
    "--ds-collection-header-subtitle-size-caption",
    "--ds-collection-header-subtitle-tracking-caption",
    "--ds-collection-header-subtitle-tracking-code",
    "--ds-collection-header-subtitle-tracking-compact-technical",
    "--ds-collection-header-subtitle-tracking-dotted",
    "--ds-collection-header-subtitle-tracking-technical",
    "--ds-collection-header-subtitle-family-code",
    "--ds-collection-header-subtitle-family-technical",
    "--ds-collection-header-subtitle-row-gap",
    "--ds-collection-header-subtitle-row-gap-editorial",
    "--ds-collection-header-subtitle-row-gap-treated",
    "--ds-collection-header-subtitle-row-inline-gap",
    "--ds-collection-header-subtitle-row-inline-gap-editorial",
    "--ds-collection-header-subtitle-row-measure",
    "--ds-collection-header-subtitle-row-measure-editorial",
    "--ds-collection-header-subtitle-row-rule-gap",
    "--ds-collection-header-title-measure",
    "--ds-collection-header-title-measure-editorial",
  ],
  derive: () => deriveCollectionHeaderChannels(),
};

export function deriveCollectionHeaderChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* The card's own ground, frame, sheen and radius — the ten names the skin
     already read with no producer. */
  vars["--ds-collection-header-bg"] =
    "linear-gradient(116deg, color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-surface-card)), var(--ds-surface-card) 56%, var(--ds-surface-panel))";
  vars["--ds-collection-header-border"] = "var(--ds-color-border-primary)";
  vars["--ds-collection-header-radius"] = "var(--ds-radius-xl, 16px)";
  vars["--ds-collection-header-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-collection-header-shadow-hover"] = "var(--ds-elevation-2)";
  vars["--ds-collection-header-sheen-duration"] = "17s";
  vars["--ds-collection-header-sheen-opacity"] = "0.22";
  vars["--ds-collection-header-actions-backdrop"] = "none";
  vars["--ds-collection-header-display-color"] = "var(--ds-color-primary)";
  vars["--ds-collection-header-display-shade"] = "var(--ds-color-text-primary)";
  vars["--ds-collection-header-accent"] =
    "var(--ds-collection-header-display-color, var(--ds-color-primary))";

  /* Overline voice (eyebrow + shortcuts label): the rungs the page-header
     overline channels drive, renamed out of the family-private namespace. */
  vars["--ds-collection-header-overline-family"] = "inherit";
  vars["--ds-collection-header-overline-size"] =
    "var(--ds-page-header-eyebrow-size, var(--ds-font-size-xs, 12px))";
  vars["--ds-collection-header-overline-tracking"] =
    "var(--ds-page-header-eyebrow-tracking, 0.13em)";
  vars["--ds-collection-header-overline-weight"] = "var(--ds-font-weight-bold, 700)";
  vars["--ds-collection-header-overline-case"] =
    "var(--ds-page-header-eyebrow-text-transform, uppercase)";

  /* Meta chip material: the rail's only framed object. */
  vars["--ds-collection-header-chip-block-size"] = "var(--ds-spacing-6, 24px)";
  vars["--ds-collection-header-chip-inline-padding"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-collection-header-chip-radius"] = "var(--ds-radius-full, 9999px)";
  vars["--ds-collection-header-chip-family"] = "var(--ds-type-caption-font-family, inherit)";
  vars["--ds-collection-header-chip-size"] =
    "var(--ds-type-caption-font-size, var(--ds-font-size-xs, 12px))";
  vars["--ds-collection-header-chip-weight"] = "var(--ds-font-weight-bold, 700)";
  vars["--ds-collection-header-chip-tracking"] =
    "var(--ds-type-caption-letter-spacing, 0.02em)";

  /* Key cap material on the governed `--ds-kbd-*` set: the kbd family owns
     those names, this family only relays them into its own rungs. */
  vars["--ds-collection-header-keycap-block-size"] = "var(--ds-spacing-5, 20px)";
  vars["--ds-collection-header-keycap-inline-padding"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-collection-header-keycap-radius"] = "var(--ds-kbd-radius, var(--ds-radius-sm, 4px))";
  vars["--ds-collection-header-keycap-family"] =
    "var(--ds-kbd-font-family, var(--ds-font-family-mono))";
  vars["--ds-collection-header-keycap-size"] =
    "var(--ds-type-caption-font-size, var(--ds-font-size-xs, 12px))";
  vars["--ds-collection-header-keycap-weight"] = "var(--ds-kbd-font-weight, 500)";
  vars["--ds-collection-header-keycap-frame"] = "var(--ds-kbd-frame, var(--ds-color-border))";
  vars["--ds-collection-header-keycap-surface"] =
    "var(--ds-kbd-surface, var(--ds-surface-inset, var(--ds-color-neutral-100)))";
  vars["--ds-collection-header-keycap-ink"] = "var(--ds-kbd-ink, var(--ds-color-text-muted))";
  vars["--ds-collection-header-keycap-depth-width"] = "var(--ds-kbd-depth-width, 2px)";

  /* The hero measure rides the shared page-header group recipe. */
  vars["--ds-collection-header-title-measure"] = "var(--ds-page-header-title-max-width, 35rem)";
  vars["--ds-collection-header-title-measure-editorial"] =
    "var(--ds-page-header-title-max-width, 42.5rem)";

  /* Root posture padding, drained from the component's inline `style`: the
     default rhythm, the editorial-compact rung, the embedded block-end arms
     and the minimal projection's single pad. Rhythm-bearing rungs ride the
     bounded rhythm scale (the form-header precedent): at rest the effective
     scale is 1 and the values are byte-identical to the retired paint. */
  const rhythm = (value: string) => `calc(${value} * var(--ds-rhythm-effective-scale, 1))`;
  vars["--ds-collection-header-padding-block-start"] = rhythm("var(--ds-spacing-5, 20px)");
  vars["--ds-collection-header-padding-inline"] = rhythm("var(--ds-spacing-5, 20px)");
  vars["--ds-collection-header-padding-block-end"] = rhythm("var(--ds-spacing-3, 12px)");
  vars["--ds-collection-header-padding-compact-block-start"] = rhythm("var(--ds-spacing-4, 16px)");
  vars["--ds-collection-header-padding-compact-inline"] = rhythm("var(--ds-spacing-4, 16px)");
  vars["--ds-collection-header-padding-compact-block-end"] = rhythm("var(--ds-spacing-2, 8px)");
  vars["--ds-collection-header-padding-embedded-block-end"] = rhythm("var(--ds-spacing-2, 8px)");
  vars["--ds-collection-header-padding-embedded-editorial-block-end"] =
    rhythm("var(--ds-spacing-1, 4px)");
  vars["--ds-collection-header-padding-minimal"] = rhythm("var(--ds-spacing-3, 12px)");
  vars["--ds-collection-header-padding-minimal-embedded-block"] = rhythm("var(--ds-spacing-2, 8px)");
  vars["--ds-collection-header-padding-minimal-embedded-inline"] = rhythm("var(--ds-spacing-3, 12px)");

  /* Identity column grid rhythm (compact/minimal lead with the overline). */
  vars["--ds-collection-header-identity-gap"] = rhythm("var(--ds-spacing-2, 8px)");

  /* Subtitle ladder: both variants' size/leading/tracking arms, keyed on the
     stamped treatment × posture attributes in the skin. */
  vars["--ds-collection-header-subtitle-size"] =
    "var(--ds-type-supporting-font-size, var(--ds-font-size-sm, 14px))";
  vars["--ds-collection-header-subtitle-size-caption"] =
    "var(--ds-type-caption-font-size, var(--ds-font-size-xs, 12px))";
  vars["--ds-collection-header-subtitle-line-height"] =
    "var(--ds-type-supporting-line-height, 1.5)";
  vars["--ds-collection-header-subtitle-line-height-caption"] =
    "var(--ds-type-caption-line-height, 1.35)";
  vars["--ds-collection-header-subtitle-family-technical"] =
    "var(--ds-font-family-mono, var(--ds-font-family-base))";
  vars["--ds-collection-header-subtitle-family-code"] =
    "var(--ds-type-code-font-family, var(--ds-font-family-mono, var(--ds-font-family-base)))";
  vars["--ds-collection-header-subtitle-tracking-technical"] = "0.135em";
  vars["--ds-collection-header-subtitle-tracking-dotted"] = "0.08em";
  vars["--ds-collection-header-subtitle-tracking-compact-technical"] = "0.05em";
  vars["--ds-collection-header-subtitle-tracking-code"] =
    "var(--ds-type-code-letter-spacing, 0.09em)";
  vars["--ds-collection-header-subtitle-tracking-caption"] =
    "var(--ds-type-caption-letter-spacing, 0.03em)";
  vars["--ds-collection-header-subtitle-opacity-editorial"] = "0.92";
  vars["--ds-collection-header-subtitle-opacity-treated"] = "0.88";
  vars["--ds-collection-header-subtitle-measure-editorial"] = "680px";

  /* Subtitle row rhythm: the rule's pad and the measure, the treated gap. */
  vars["--ds-collection-header-subtitle-row-gap"] = rhythm("var(--ds-spacing-3, 12px)");
  vars["--ds-collection-header-subtitle-row-gap-treated"] = rhythm("var(--ds-spacing-2, 8px)");
  vars["--ds-collection-header-subtitle-row-gap-editorial"] = rhythm("var(--ds-spacing-2, 8px)");
  vars["--ds-collection-header-subtitle-row-rule-gap"] = rhythm("var(--ds-spacing-3, 12px)");
  vars["--ds-collection-header-subtitle-row-inline-gap"] = "10px";
  vars["--ds-collection-header-subtitle-row-inline-gap-editorial"] = "12px";
  vars["--ds-collection-header-subtitle-row-measure"] = "620px";
  vars["--ds-collection-header-subtitle-row-measure-editorial"] = "760px";

  /* Quick-actions cluster: its inner gap (editorial tightens it), its padding
     and the rhythm above it when the overline row leads. */
  vars["--ds-collection-header-quick-actions-gap"] = rhythm("var(--ds-spacing-2, 8px)");
  vars["--ds-collection-header-quick-actions-gap-editorial"] = "6px";
  vars["--ds-collection-header-quick-actions-padding"] = rhythm("var(--ds-spacing-1, 4px)");
  vars["--ds-collection-header-quick-actions-above-gap"] = rhythm("var(--ds-spacing-3, 12px)");
  vars["--ds-collection-header-quick-actions-above-gap-editorial"] = rhythm("var(--ds-spacing-2, 8px)");

  /* Rail rhythm: the trailing block under the cluster, the chips-only rail's
     grid gap, the icon/inline-meta gutters. */
  vars["--ds-collection-header-rail-trailing-gap"] = rhythm("var(--ds-spacing-3, 12px)");
  vars["--ds-collection-header-rail-trailing-row-gap"] = rhythm("var(--ds-spacing-1, 4px)");
  vars["--ds-collection-header-rail-grid-gap"] = rhythm("var(--ds-spacing-2, 8px)");
  vars["--ds-collection-header-action-icon-gap"] = rhythm("var(--ds-spacing-1, 4px)");
  vars["--ds-collection-header-inline-meta-gap"] = rhythm("var(--ds-spacing-2, 8px)");

  /* The dotted title's glyph-clip stroke rungs (compact/editorial/default),
     mixed from the family's display ink toward transparency. */
  vars["--ds-collection-header-dotted-stroke"] =
    "1px color-mix(in srgb, var(--ds-collection-header-display-color, var(--ds-color-primary)) 28%, transparent)";
  vars["--ds-collection-header-dotted-stroke-compact"] =
    "0.24px color-mix(in srgb, var(--ds-collection-header-display-color, var(--ds-color-primary)) 20%, transparent)";
  vars["--ds-collection-header-dotted-stroke-editorial"] =
    "0.32px color-mix(in srgb, var(--ds-collection-header-display-color, var(--ds-color-primary)) 24%, transparent)";

  return vars;
}
