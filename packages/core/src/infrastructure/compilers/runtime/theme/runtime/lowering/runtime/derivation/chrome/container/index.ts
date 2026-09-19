/**
 * @fileoverview The container family: the page measure on the viewport ladder,
 * the inset on the spacing ramp, and the canvas finish on the layout chrome a
 * tenant authors. The measure rungs are the breakpoint contract itself, so the
 * container scale and the viewport scale can never drift into two ladders.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/container
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own layout chrome outranks every relation stated here. */
export const containerChromeDeriver: FamilyDeriver = {
  family: "container",
  rank: "derived",
  consumes: ["responsive.posture", "spacing.rhythm", "density", "motion.*"],
  produces: [
    "--ds-container-2xl",
    "--ds-container-background",
    "--ds-container-border",
    "--ds-container-corner",
    "--ds-container-depth",
    "--ds-container-frame",
    "--ds-container-lg",
    "--ds-container-md",
    "--ds-container-measure",
    "--ds-container-motion-duration",
    "--ds-container-motion-easing",
    "--ds-container-pad",
    "--ds-container-padding-lg",
    "--ds-container-padding-md",
    "--ds-container-padding-none",
    "--ds-container-padding-sm",
    "--ds-container-radius",
    "--ds-container-shadow",
    "--ds-container-sm",
    "--ds-container-surface",
    "--ds-container-transition-duration",
    "--ds-container-transition-timing",
    "--ds-container-xl",
  ],
  derive: () => deriveContainerChannels(),
};

/**
 * The measure ladder reads `--ds-breakpoint-*` rather than restating 640/768/
 * 1024/1280/1536: the container measure IS the viewport step it frames, and a
 * second copy of the ladder is how the two drift.
 *
 * The canvas transition is a RESIZE: `--ds-motion-resize` is the calm duration
 * already multiplied by the tenant motion dial, so a container answers the dial
 * that `--ds-motion-normal` (an unscaled alias) silently ignored.
 *
 * The inset rungs ride the spacing ramp (already density-scaled at the token
 * layer) multiplied once by the rhythm scale: density sizes the control, rhythm
 * sizes the room the page frame leaves around it.
 *
 * The authorable canvas and motion channels (`--ds-container-{background,
 * border,radius,shadow,motion-duration,motion-easing}`) rest here at the exact
 * fallback each skin chain names: the canvas links at the no-chrome literal
 * (no decision governs a finish nobody authored), the motion links on the
 * dial-scaled motion channels. An authored `chrome.layout` statement
 * outranks the rest -- `chrome` sits one rank above this family -- so the
 * rest is what the chain resolved to when nobody authored the channel, never
 * a second opinion about it.
 */
export function deriveContainerChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-container-background"] = "transparent";
  vars["--ds-container-border"] = "0 solid transparent";
  vars["--ds-container-radius"] = "0";
  vars["--ds-container-shadow"] = "none";
  vars["--ds-container-motion-duration"] = "var(--ds-motion-resize)";
  vars["--ds-container-motion-easing"] = "var(--ds-motion-ease-out)";
  vars["--ds-container-sm"] = "var(--ds-breakpoint-sm)";
  vars["--ds-container-md"] = "var(--ds-breakpoint-md)";
  vars["--ds-container-lg"] = "var(--ds-breakpoint-lg)";
  vars["--ds-container-xl"] = "var(--ds-breakpoint-xl)";
  vars["--ds-container-2xl"] = "var(--ds-breakpoint-2xl)";
  vars["--ds-container-measure"] = "var(--ds-container-lg)";
  vars["--ds-container-padding-none"] = "var(--ds-spacing-0)";
  vars["--ds-container-padding-sm"] = "calc(var(--ds-spacing-2) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-container-padding-md"] = "calc(var(--ds-spacing-4) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-container-padding-lg"] = "calc(var(--ds-spacing-6) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-container-pad"] = "var(--ds-container-padding-md)";
  vars["--ds-container-surface"] = "var(--ds-container-background, transparent)";
  vars["--ds-container-frame"] = "var(--ds-container-border, 0 solid transparent)";
  vars["--ds-container-corner"] = "var(--ds-container-radius, 0)";
  vars["--ds-container-depth"] = "var(--ds-container-shadow, none)";
  vars["--ds-container-transition-duration"] =
    "var(--ds-container-motion-duration, var(--ds-motion-resize))";
  vars["--ds-container-transition-timing"] =
    "var(--ds-container-motion-easing, var(--ds-motion-ease-out))";
  return vars;
}
