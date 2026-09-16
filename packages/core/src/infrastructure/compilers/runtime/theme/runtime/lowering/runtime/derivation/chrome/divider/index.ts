/**
 * @fileoverview The divider family: the hairline, the inset rungs it keeps
 * around itself, and the overline label on the typographic label role.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/divider
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own layout chrome outranks every relation stated here. */
export const dividerChromeDeriver: FamilyDeriver = {
  family: "divider",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "typography.roleWeights",
    "spacing.rhythm",
    "density",
    "motion.*",
  ],
  produces: [
    "--ds-divider-edge-basis",
    "--ds-divider-gap",
    "--ds-divider-inset",
    "--ds-divider-inset-lg",
    "--ds-divider-inset-md",
    "--ds-divider-inset-none",
    "--ds-divider-inset-sm",
    "--ds-divider-inset-xl",
    "--ds-divider-inset-xs",
    "--ds-divider-label-case",
    "--ds-divider-label-ink",
    "--ds-divider-label-leading",
    "--ds-divider-label-measure",
    "--ds-divider-label-size",
    "--ds-divider-label-track",
    "--ds-divider-label-weight",
    "--ds-divider-line",
    "--ds-divider-segment-min",
    "--ds-divider-transition-duration",
    "--ds-divider-transition-timing",
    "--ds-divider-vertical-min",
  ],
  derive: () => deriveDividerChannels(),
};

/**
 * `--ds-divider-line` carries its resting value here and the caller's own
 * thickness/variant/colour inline: those three props are free-form, so the
 * resolved shorthand cannot be enumerated into a closed `data-*` domain.
 *
 * The overline label reads the `label` typographic role rather than a raw size
 * step, so `typography.scale` and `typography.role-weights` reach it.
 *
 * NOT produced here: `--ds-divider-{color,text-color,thickness-*,content-gap,
 * edge-segment,min-segment,label-*,motion-*}`, which `chrome.layout` authors.
 * They are the inputs of the derived channels below, never their output.
 */
export function deriveDividerChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  const inset = (rung: string) =>
    `calc(var(${rung}) * var(--ds-rhythm-effective-scale, 1))`;

  vars["--ds-divider-line"] =
    "var(--ds-divider-thickness-thin, 1px) solid var(--ds-divider-color, var(--ds-color-border-subtle))";
  vars["--ds-divider-vertical-min"] = "1em";
  vars["--ds-divider-edge-basis"] = "var(--ds-divider-edge-segment, 5%)";
  vars["--ds-divider-segment-min"] = "var(--ds-divider-min-segment, 5%)";
  vars["--ds-divider-gap"] =
    "var(--ds-divider-content-gap, calc(var(--ds-spacing-4) * var(--ds-rhythm-effective-scale, 1)))";

  vars["--ds-divider-inset-none"] = "0";
  vars["--ds-divider-inset-xs"] = inset("--ds-spacing-1");
  vars["--ds-divider-inset-sm"] = inset("--ds-spacing-2");
  vars["--ds-divider-inset-md"] = inset("--ds-spacing-4");
  vars["--ds-divider-inset-lg"] = inset("--ds-spacing-6");
  vars["--ds-divider-inset-xl"] = inset("--ds-spacing-8");
  vars["--ds-divider-inset"] = "var(--ds-divider-inset-md)";

  vars["--ds-divider-label-ink"] =
    "var(--ds-divider-text-color, var(--ds-color-text-secondary))";
  vars["--ds-divider-label-size"] =
    "var(--ds-divider-label-font-size, var(--ds-type-label-font-size))";
  vars["--ds-divider-label-weight"] =
    "var(--ds-divider-label-font-weight, var(--ds-type-label-font-weight))";
  vars["--ds-divider-label-leading"] =
    "var(--ds-divider-label-line-height, var(--ds-type-label-line-height))";
  vars["--ds-divider-label-track"] =
    "var(--ds-divider-label-tracking, var(--ds-type-label-letter-spacing))";
  vars["--ds-divider-label-case"] = "var(--ds-divider-label-transform, uppercase)";
  vars["--ds-divider-label-measure"] = "var(--ds-divider-label-max-width, 100%)";

  vars["--ds-divider-transition-duration"] =
    "var(--ds-divider-motion-duration, var(--ds-motion-feedback))";
  vars["--ds-divider-transition-timing"] =
    "var(--ds-divider-motion-easing, var(--ds-motion-ease-out))";
  return vars;
}
