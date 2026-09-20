/**
 * @fileoverview The scope-switcher family: the namespace this cut created, at
 * the values its skin was already painting from root tokens.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/scope-switcher
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/**
 * A vertical's own scope-switcher chrome outranks every relation stated here.
 *
 * WHY THIS NAMESPACE DID NOT EXIST. The family's twelve reads were all ROOT
 * tokens — `--ds-color-*`, `--ds-spacing-*`, `--ds-surface-card`. Nothing was
 * unproduced, which is why the read-without-producer counter reported zero and
 * reported it falsely: there was no `--ds-scope-switcher-*` name for a decision
 * to reach, so the only way to move this strip was to move every other family
 * reading the same roots. The channels below are that namespace, each published
 * at the exact value the skin was already resolving to, so creating them repaints
 * nothing and makes the strip individually addressable for the first time.
 *
 * WHAT STAYS ON THE COMPOSED PRIMITIVE, deliberately. The option chrome, the
 * active fill, the track frame and the control material are `segmented`'s
 * (COMPOSITION LAW S22). This family owns the section band, the scroll region
 * and the count badge — and nothing here may grow an elevation channel: the
 * strip is flat by ruling, and a wrapper shadow would double the frame the
 * composition gave away.
 */
export const scopeSwitcherChromeDeriver: FamilyDeriver = {
  family: "scope-switcher",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "typography.numeric",
    "density",
    "spacing.rhythm",
    "surfaces.radiusScale",
    "motion.*",
  ],
  produces: [
    "--ds-scope-switcher-background",
    "--ds-scope-switcher-border",
    "--ds-scope-switcher-count-bg",
    "--ds-scope-switcher-count-bg-active",
    "--ds-scope-switcher-count-block-size",
    "--ds-scope-switcher-count-color",
    "--ds-scope-switcher-count-color-active",
    "--ds-scope-switcher-count-font-size",
    "--ds-scope-switcher-count-font-weight",
    "--ds-scope-switcher-count-gap",
    "--ds-scope-switcher-count-padding-inline",
    "--ds-scope-switcher-count-radius",
    "--ds-scope-switcher-motion-duration",
    "--ds-scope-switcher-padding-block",
    "--ds-scope-switcher-padding-inline",
  ],
  derive: () => deriveScopeSwitcherChannels(),
};

export function deriveScopeSwitcherChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  // The section band: a card ground settled a few percent toward the page and
  // a hairline a shade softer than the subtle border. The inline variant paints
  // neither, which is why both are one channel rather than a variant matrix.
  vars["--ds-scope-switcher-background"] =
    "linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 95%, var(--ds-color-bg-primary) 5%), color-mix(in srgb, var(--ds-surface-card) 92%, var(--ds-color-bg-primary) 8%))";
  vars["--ds-scope-switcher-border"] =
    "1px solid color-mix(in srgb, var(--ds-color-border-subtle) 88%, transparent)";
  // The strip's own breathing room rides the density-scaled spacing rungs; the
  // scroll padding reads the same channel so a keyboard-focused option can
  // never sit closer to the scrollport edge than the strip's own inset.
  vars["--ds-scope-switcher-padding-block"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-scope-switcher-padding-inline"] = "var(--ds-spacing-4, 16px)";
  // The count badge: a mini-pill that reads through NUMBER plus tint, never
  // tint alone, so the active scope survives a forced-colors ground.
  vars["--ds-scope-switcher-count-block-size"] = "18px";
  vars["--ds-scope-switcher-count-padding-inline"] = "6px";
  vars["--ds-scope-switcher-count-gap"] = "var(--ds-spacing-1, 4px)";
  vars["--ds-scope-switcher-count-radius"] = "var(--ds-radius-full)";
  vars["--ds-scope-switcher-count-bg"] =
    "color-mix(in srgb, var(--ds-color-bg-primary) 60%, transparent)";
  vars["--ds-scope-switcher-count-color"] = "var(--ds-color-text-muted)";
  vars["--ds-scope-switcher-count-bg-active"] =
    "color-mix(in srgb, var(--ds-color-primary) 18%, transparent)";
  vars["--ds-scope-switcher-count-color-active"] = "var(--ds-color-primary)";
  vars["--ds-scope-switcher-count-font-size"] =
    "var(--ds-font-size-2xs, var(--ds-font-size-xs))";
  vars["--ds-scope-switcher-count-font-weight"] = "var(--ds-font-weight-bold)";
  // The active tint cross-fades rather than snapping when the scope changes.
  vars["--ds-scope-switcher-motion-duration"] = "var(--ds-motion-feedback)";
  return vars;
}
