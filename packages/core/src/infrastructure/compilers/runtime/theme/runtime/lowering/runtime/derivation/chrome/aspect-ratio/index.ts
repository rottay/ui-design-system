/**
 * @fileoverview The aspect-ratio family: the media frame's reserved geometry,
 * its crop policy, and its finish on the layout chrome a tenant authors.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/aspect-ratio
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own layout chrome outranks every relation stated here. */
export const aspectRatioChromeDeriver: FamilyDeriver = {
  family: "aspect-ratio",
  rank: "derived",
  consumes: ["motion.*"],
  produces: [
    "--ds-aspect-ratio-background",
    "--ds-aspect-ratio-border",
    "--ds-aspect-ratio-clip",
    "--ds-aspect-ratio-corner",
    "--ds-aspect-ratio-depth",
    "--ds-aspect-ratio-frame",
    "--ds-aspect-ratio-instance-max-width",
    "--ds-aspect-ratio-instance-ratio",
    "--ds-aspect-ratio-motion-duration",
    "--ds-aspect-ratio-motion-easing",
    "--ds-aspect-ratio-object-fit",
    "--ds-aspect-ratio-object-position",
    "--ds-aspect-ratio-overflow",
    "--ds-aspect-ratio-radius",
    "--ds-aspect-ratio-shadow",
    "--ds-aspect-ratio-surface",
    "--ds-aspect-ratio-transition-duration",
    "--ds-aspect-ratio-transition-timing",
  ],
  derive: () => deriveAspectRatioChannels(),
};

/**
 * The reserved box is a RESIZE, so its duration reads the calm step already
 * multiplied by the tenant motion dial.
 *
 * The two instance channels carry their resting value here and the caller's
 * geometry inline, so a frame with no caller ratio still resolves from the
 * cascade instead of from a literal in the skin.
 *
 * The authorable finish and motion channels (`--ds-aspect-ratio-{background,
 * border,radius,shadow,overflow,motion-duration,motion-easing}`) rest here at
 * the exact fallback each skin chain names: the finish links at the no-chrome
 * literal (no decision governs a finish nobody authored), the motion links on
 * the dial-scaled motion channels. An authored `chrome.layout` statement
 * outranks the rest -- `chrome` sits one rank above this family -- so the
 * rest is what the chain resolved to when nobody authored the channel, never
 * a second opinion about it.
 */
export function deriveAspectRatioChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-aspect-ratio-background"] = "transparent";
  vars["--ds-aspect-ratio-border"] = "0 solid transparent";
  vars["--ds-aspect-ratio-radius"] = "0";
  vars["--ds-aspect-ratio-shadow"] = "none";
  vars["--ds-aspect-ratio-overflow"] = "hidden";
  vars["--ds-aspect-ratio-motion-duration"] = "var(--ds-motion-resize)";
  vars["--ds-aspect-ratio-motion-easing"] = "var(--ds-motion-ease-out)";
  vars["--ds-aspect-ratio-instance-ratio"] = "16 / 9";
  vars["--ds-aspect-ratio-instance-max-width"] = "none";
  vars["--ds-aspect-ratio-surface"] = "var(--ds-aspect-ratio-background, transparent)";
  vars["--ds-aspect-ratio-frame"] = "var(--ds-aspect-ratio-border, 0 solid transparent)";
  vars["--ds-aspect-ratio-corner"] = "var(--ds-aspect-ratio-radius, 0)";
  vars["--ds-aspect-ratio-depth"] = "var(--ds-aspect-ratio-shadow, none)";
  vars["--ds-aspect-ratio-clip"] = "var(--ds-aspect-ratio-overflow, hidden)";
  vars["--ds-aspect-ratio-object-fit"] = "cover";
  vars["--ds-aspect-ratio-object-position"] = "center";
  vars["--ds-aspect-ratio-transition-duration"] =
    "var(--ds-aspect-ratio-motion-duration, var(--ds-motion-resize))";
  vars["--ds-aspect-ratio-transition-timing"] =
    "var(--ds-aspect-ratio-motion-easing, var(--ds-motion-ease-out))";
  return vars;
}
