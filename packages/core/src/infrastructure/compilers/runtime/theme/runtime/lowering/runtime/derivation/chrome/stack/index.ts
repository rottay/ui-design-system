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
    "--ds-stack-divider-gutter",
    "--ds-stack-divider-ink",
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
 * NOT produced here: `--ds-stack-divider-{size,color,opacity,inset}`, which
 * `chrome.layout` authors. They are the inputs of the derived channels below,
 * never their output.
 */
export function deriveStackChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  const rung = (step: string) =>
    `calc(var(--ds-spacing-${step}) * var(--ds-rhythm-effective-scale, 1))`;

  vars["--ds-stack-gap-none"] = "0";
  vars["--ds-stack-gap-xs"] = rung("1");
  vars["--ds-stack-gap-sm"] = rung("2");
  vars["--ds-stack-gap-md"] = rung("4");
  vars["--ds-stack-gap-lg"] = rung("6");
  vars["--ds-stack-gap-xl"] = rung("8");
  vars["--ds-stack-gap-2xl"] = rung("10");
  vars["--ds-stack-gap-3xl"] = rung("12");
  vars["--ds-stack-gap-4xl"] = rung("16");
  vars["--ds-stack-gap"] = "0px";

  vars["--ds-stack-divider-thickness"] = "var(--ds-stack-divider-size, 1px)";
  vars["--ds-stack-divider-ink"] =
    "var(--ds-stack-divider-color, var(--ds-color-border-subtle))";
  vars["--ds-stack-divider-veil"] = "var(--ds-stack-divider-opacity, 0.72)";
  vars["--ds-stack-divider-gutter"] = "var(--ds-stack-divider-inset, 0px)";
  vars["--ds-stack-reflow-transition"] = "var(--ds-transition-rearrange)";
  return vars;
}
