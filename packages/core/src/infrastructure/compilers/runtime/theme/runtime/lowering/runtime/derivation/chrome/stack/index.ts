/**
 * @fileoverview The stack family: the rhythm rungs it puts between children and
 * the hairline it can draw inside that room.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/stack
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own layout chrome outranks every relation stated here. */
export const stackChromeDeriver: FamilyDeriver = {
  family: "stack",
  rank: "derived",
  consumes: ["palette.*", "spacing.rhythm", "density"],
  produces: [
    "--ds-stack-divider-color",
    "--ds-stack-divider-gutter",
    "--ds-stack-divider-ink",
    "--ds-stack-divider-inset",
    "--ds-stack-divider-opacity",
    "--ds-stack-divider-size",
    "--ds-stack-divider-thickness",
    "--ds-stack-divider-veil",
    "--ds-stack-gap",
    "--ds-stack-gap-2xl",
    "--ds-stack-gap-3xl",
    "--ds-stack-gap-4xl",
    "--ds-stack-gap-lg",
    "--ds-stack-gap-md",
    "--ds-stack-gap-none",
    "--ds-stack-gap-sm",
    "--ds-stack-gap-xl",
    "--ds-stack-gap-xs",
    "--ds-stack-reflow-transition",
  ],
  derive: () => deriveStackChannels(),
};

/**
 * The rungs ride the spacing ramp, which already carries density at the token
 * layer, multiplied once by rhythm: density sizes the control, rhythm sizes the
 * room between controls. `--ds-stack-gap` is the CUSTOM rung -- a caller's
 * measurement, exact geometry, never scaled -- so it rests at zero here and the
 * engine writes it inline when a number is asked for.
 *
 * The authorable hairline channels (`--ds-stack-divider-{color,inset,opacity,
 * size}`) rest here at the exact fallback each skin chain names: the colour on
 * the border ramp, the inset on the spacing zero rung, the size on the
 * border-width ramp; only the veil's literal has no decision behind it (a hairline
 * nobody tuned is simply quiet). An authored `chrome.layout` statement
 * outranks the rest -- `chrome` sits one rank above this family -- so the rest
 * is what the chain resolved to when nobody authored the channel, never a
 * second opinion about it.
 */
export function deriveStackChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-stack-divider-color"] = "var(--ds-color-border-subtle)";
  vars["--ds-stack-divider-inset"] = "var(--ds-spacing-0, 0px)";
  vars["--ds-stack-divider-opacity"] = "0.72";
  vars["--ds-stack-divider-size"] = "var(--ds-border-width-1, 1px)";
  const rung = (step: string, rest: string) =>
    `calc(var(--ds-spacing-${step}, ${rest}) * var(--ds-rhythm-effective-scale, 1))`;

  vars["--ds-stack-gap-none"] = "var(--ds-spacing-0, 0)";
  vars["--ds-stack-gap-xs"] = rung("1", "0.25rem");
  vars["--ds-stack-gap-sm"] = rung("2", "0.5rem");
  vars["--ds-stack-gap-md"] = rung("4", "1rem");
  vars["--ds-stack-gap-lg"] = rung("6", "1.5rem");
  vars["--ds-stack-gap-xl"] = rung("8", "2rem");
  vars["--ds-stack-gap-2xl"] = rung("10", "2.5rem");
  vars["--ds-stack-gap-3xl"] = rung("12", "3rem");
  vars["--ds-stack-gap-4xl"] = rung("16", "4rem");
  vars["--ds-stack-gap"] = "var(--ds-spacing-0, 0px)";

  vars["--ds-stack-divider-thickness"] =
    "var(--ds-stack-divider-size, var(--ds-border-width-1, 1px))";
  vars["--ds-stack-divider-ink"] =
    "var(--ds-stack-divider-color, var(--ds-color-border-subtle))";
  vars["--ds-stack-divider-veil"] = "var(--ds-stack-divider-opacity, 0.72)";
  vars["--ds-stack-divider-gutter"] =
    "var(--ds-stack-divider-inset, var(--ds-spacing-0, 0px))";
  vars["--ds-stack-reflow-transition"] = "var(--ds-transition-rearrange)";
  return vars;
}
