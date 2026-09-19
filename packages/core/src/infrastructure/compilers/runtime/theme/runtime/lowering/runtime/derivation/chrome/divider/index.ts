/**
 * @fileoverview The divider family: the hairline, the inset rungs it keeps
 * around itself, and the overline label on the typographic label role.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/divider
 * @category Compilers
 * @package @rottay/design-system
 */

import { safeInkOnGround } from "@/foundation/kernel/color/oklch/ink";
import { WCAG_AA_NORMAL_TEXT_RATIO } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import type {
  FamilyDeriver,
  LoweringContext,
} from "../../../../foundation/contract";

/**
 * The quiet the DS states for an overline label, and the ink it resolves to
 * when nobody authors `chrome.layout.dividerTextColor`.
 *
 * It is the `:root` default of `--ds-divider-text-color`, restated here because
 * a compiled block has to CHECK it against its own ground and a CSS literal
 * cannot be checked. The sheet keeps the declaration for everything this door
 * does not compile (the frozen engines read it directly); this owner decides
 * what a compiled tenant gets.
 */
const OVERLINE_QUIET_INK = "#737373";

/** A vertical's own layout chrome outranks every relation stated here. */
export const dividerChromeDeriver: FamilyDeriver = {
  family: "divider",
  rank: "derived",
  consumes: [
    "palette.*",
    "chrome.layout.dividerTextColor",
    "typography.roles",
    "typography.roleWeights",
    "spacing.rhythm",
    "density",
    "motion.*",
  ],
  produces: [
    "--ds-divider-content-gap",
    "--ds-divider-edge-basis",
    "--ds-divider-edge-segment",
    "--ds-divider-gap",
    "--ds-divider-inset",
    "--ds-divider-inset-lg",
    "--ds-divider-inset-md",
    "--ds-divider-inset-none",
    "--ds-divider-inset-sm",
    "--ds-divider-inset-xl",
    "--ds-divider-inset-xs",
    "--ds-divider-label-case",
    "--ds-divider-label-font-size",
    "--ds-divider-label-font-weight",
    "--ds-divider-label-ink",
    "--ds-divider-label-leading",
    "--ds-divider-label-line-height",
    "--ds-divider-label-max-width",
    "--ds-divider-label-measure",
    "--ds-divider-label-size",
    "--ds-divider-label-track",
    "--ds-divider-label-tracking",
    "--ds-divider-label-transform",
    "--ds-divider-label-weight",
    "--ds-divider-line",
    "--ds-divider-min-segment",
    "--ds-divider-motion-duration",
    "--ds-divider-motion-easing",
    "--ds-divider-segment-min",
    "--ds-divider-transition-duration",
    "--ds-divider-transition-timing",
    "--ds-divider-vertical-min",
  ],
  derive: (context) => deriveDividerChannels(context),
};

/**
 * `--ds-divider-line` carries its resting value here and the caller's own
 * thickness/variant/colour inline: those three props are free-form, so the
 * resolved shorthand cannot be enumerated into a closed `data-*` domain.
 *
 * The overline label reads the `label` typographic role rather than a raw size
 * step, so `typography.scale` and `typography.role-weights` reach it.
 *
 * NOT produced here: `--ds-divider-{color,text-color,thickness-*}`, which
 * `chrome.layout` authors. They are the inputs of the derived channels below,
 * never their output.
 *
 * The remaining authorable channels (`--ds-divider-{content-gap,edge-segment,
 * min-segment,label-font-size,label-font-weight,label-line-height,
 * label-max-width,label-tracking,label-transform,motion-duration,
 * motion-easing}`) rest here at the exact fallback each skin chain names: the
 * gap on the rhythm-scaled spacing ramp, the label metrics on the label
 * typographic role, the motion links on the dial-scaled motion channels; the
 * segment bases, the label measure and transform literals have no decision
 * behind them (nobody tuned geometry or casing that was never asked for). An
 * authored `chrome.layout` statement outranks the rest -- `chrome` sits one
 * rank above this family -- so the rest is what the chain resolved to when
 * nobody authored the channel, never a second opinion about it.
 */
export function deriveDividerChannels(
  context?: Pick<LoweringContext, "theme" | "surface">
): Record<string, string> {
  const vars: Record<string, string> = {};
  const inset = (rung: string) =>
    `calc(var(${rung}) * var(--ds-rhythm-effective-scale, 1))`;

  vars["--ds-divider-content-gap"] =
    "calc(var(--ds-spacing-4) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-divider-edge-segment"] = "5%";
  vars["--ds-divider-min-segment"] = "5%";
  vars["--ds-divider-label-font-size"] = "var(--ds-type-label-font-size)";
  vars["--ds-divider-label-font-weight"] = "var(--ds-type-label-font-weight)";
  vars["--ds-divider-label-line-height"] = "var(--ds-type-label-line-height)";
  vars["--ds-divider-label-max-width"] = "100%";
  vars["--ds-divider-label-tracking"] = "var(--ds-type-label-letter-spacing)";
  vars["--ds-divider-label-transform"] = "uppercase";
  vars["--ds-divider-motion-duration"] = "var(--ds-motion-feedback)";
  vars["--ds-divider-motion-easing"] = "var(--ds-motion-ease-out)";
  vars["--ds-divider-line"] =
    "var(--ds-divider-thickness-thin, 1px) solid var(--ds-divider-color, var(--ds-color-border-subtle))";
  vars["--ds-divider-vertical-min"] = "1em";
  vars["--ds-divider-edge-basis"] = "var(--ds-divider-edge-segment, 5%)";
  vars["--ds-divider-segment-min"] = "var(--ds-divider-min-segment, 5%)";
  vars["--ds-divider-gap"] =
    "var(--ds-divider-content-gap, calc(var(--ds-spacing-4) * var(--ds-rhythm-effective-scale, 1)))";

  vars["--ds-divider-inset-none"] = "var(--ds-spacing-0, 0)";
  vars["--ds-divider-inset-xs"] = inset("--ds-spacing-1");
  vars["--ds-divider-inset-sm"] = inset("--ds-spacing-2");
  vars["--ds-divider-inset-md"] = inset("--ds-spacing-4");
  vars["--ds-divider-inset-lg"] = inset("--ds-spacing-6");
  vars["--ds-divider-inset-xl"] = inset("--ds-spacing-8");
  vars["--ds-divider-inset"] = "var(--ds-divider-inset-md)";

  vars["--ds-divider-label-ink"] = overlineInk(context);
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

/**
 * The overline ink: what the vertical authored, else the quiet this ground can
 * actually carry.
 *
 * The chain used to read `var(--ds-divider-text-color, var(--ds-color-text-secondary))`,
 * and the fallback never fired: the DS's OWN sheet declares
 * `--ds-divider-text-color: #737373` in a mode-less `:root`, so an authorable
 * channel arrived permanently "authored" with one value for every canvas. It
 * measured 4.74:1 on white and 3.95:1 on rottay's dark ground -- the same
 * declaration, legible in one mode and not the other. No first-party vertical
 * authors this field; the mode-less default was deciding it for all of them.
 *
 * So an AUTHORED value still wins whole -- a vertical's own layout chrome
 * outranks every relation this family states, and a tenant that picks its
 * overline ink gets exactly the colour it picked -- and the unauthored case is
 * derived against the canvas instead of inheriting a literal that cannot see
 * it. Falling through to `--ds-color-text-secondary` was not the answer either:
 * that channel reads #A0A0A5 in a light block, which clears no text floor at
 * all.
 */
function overlineInk(
  context?: Pick<LoweringContext, "theme" | "surface">
): string {
  const authored = context?.theme.chrome?.layout?.dividerTextColor;
  if (authored) return "var(--ds-divider-text-color)";
  // MEASURABLE OR DEFERRED. Only a theme that STATES its canvas can have an ink
  // checked against it; the foundation's default ground is what a compiled
  // block falls back to and WRITES, not what an unstated theme paints -- the
  // neutral foundation's own dark scope renders #0b1220, not #0A0A0A. So a
  // theme with no ground of its own keeps the chain and the sheet's two scopes
  // answer for it, which is where an unseeded theme is reachable at all.
  const ground = context?.theme.palette?.backgroundColor;
  if (!ground) return "var(--ds-divider-text-color, var(--ds-color-text-secondary))";
  return safeInkOnGround(OVERLINE_QUIET_INK, ground, WCAG_AA_NORMAL_TEXT_RATIO);
}
