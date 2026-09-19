/**
 * @fileoverview The space family: the inline rhythm rungs and the motion of the
 * row that carries them.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/space
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own layout chrome outranks every relation stated here. */
export const spaceChromeDeriver: FamilyDeriver = {
  family: "space",
  rank: "derived",
  consumes: ["spacing.rhythm", "density", "motion.*"],
  produces: [
    "--ds-space-gap",
    "--ds-space-gap-lg",
    "--ds-space-gap-md",
    "--ds-space-gap-sm",
    "--ds-space-motion-duration",
    "--ds-space-motion-easing",
    "--ds-space-transition-duration",
    "--ds-space-transition-timing",
  ],
  derive: () => deriveSpaceChannels(),
};

/**
 * Each rung keeps the `--ds-space-{small,middle,large}-size` compat alias as its
 * authored input and falls back to the spacing ramp. The alias is a fixed rem
 * that does not track the density profile, so the density factor is applied here
 * where the ramp would already have carried it; rhythm then sizes the room once,
 * exactly as Stack states it.
 *
 * NOT produced here: the three size aliases, which the space token sheet
 * declares.
 *
 * The authorable motion channels (`--ds-space-{motion-duration,motion-easing}`)
 * rest here at the exact fallback the skin chain names: the dial-scaled motion
 * channels. An authored `chrome.layout` statement outranks the rest --
 * `chrome` sits one rank above this family -- so the rest is what the chain
 * resolved to when nobody authored the channel, never a second opinion about
 * it.
 */
export function deriveSpaceChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-space-motion-duration"] = "var(--ds-motion-feedback)";
  vars["--ds-space-motion-easing"] = "var(--ds-motion-ease-out)";
  const rung = (alias: string, ramp: string) =>
    `calc(var(${alias}, var(${ramp})) * var(--ds-density-effective-scale) * var(--ds-rhythm-effective-scale, 1))`;
  vars["--ds-space-gap-sm"] = rung("--ds-space-small-size", "--ds-spacing-2");
  vars["--ds-space-gap-md"] = rung("--ds-space-middle-size", "--ds-spacing-4");
  vars["--ds-space-gap-lg"] = rung("--ds-space-large-size", "--ds-spacing-6");
  vars["--ds-space-gap"] = "var(--ds-space-gap-sm)";
  vars["--ds-space-transition-duration"] =
    "var(--ds-space-motion-duration, var(--ds-motion-feedback))";
  vars["--ds-space-transition-timing"] =
    "var(--ds-space-motion-easing, var(--ds-motion-ease-out))";
  return vars;
}
