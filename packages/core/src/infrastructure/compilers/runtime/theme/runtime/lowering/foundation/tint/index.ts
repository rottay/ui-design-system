/**
 * @fileoverview Tint step, ramp and scale channel writers.
 *
 * @module Compilers/Theme/Lowering/Foundation/tint
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";

/** The five closed tint steps of the one-blue scale (design-language §2.5). */
const TINT_STEPS = [4, 8, 12, 16, 24] as const;

function tintStep(colorVar: string, step: (typeof TINT_STEPS)[number]): string {
  return `color-mix(in oklab, var(${colorVar}) ${step}%, var(--ds-color-bg-primary))`;
}

/**
 * One role's five-step ramp. The scale prefix arrives as a literal at every
 * call site and each step is spelled in its own key, so the emitted names are
 * enumerable from source: ownership derivations read this file, and a family
 * assembled behind an interpolated variable is invisible to them — a channel
 * the compiler writes at :root would then be classified as an unowned read.
 */
function setTintRampVariables(
  vars: Record<string, string>,
  scale: string,
  colorVar: string
): void {
  vars[`${scale}-4`] = tintStep(colorVar, 4);
  vars[`${scale}-8`] = tintStep(colorVar, 8);
  vars[`${scale}-12`] = tintStep(colorVar, 12);
  vars[`${scale}-16`] = tintStep(colorVar, 16);
  vars[`${scale}-24`] = tintStep(colorVar, 24);
}

/**
 * Emit the closed tint scale --ds-tint-{4,8,12,16,24} per palette role.
 *
 * Each step is `color-mix(in oklab, <role> N%, var(--ds-color-bg-primary))`, so a
 * single role color (mixed over the page background) generates every interaction
 * tint instead of hand-picked rgba() values. This is what lets a vertical drop a
 * foreign second blue and re-derive hover/active/selected/focus states from its
 * primary alone (one-blue law). The primary role is emitted UNSUFFIXED (the
 * canonical interaction scale — hover=tint-4, active/selected=tint-8, selected
 * row=tint-12, focus ring=tint-24); each status tone (success/warning/error/info)
 * carries a role suffix so a tinted pill reads bg = tint-8 of the tone and
 * border = tint-24 of the tone. A role is skipped when its palette color is
 * absent, so themes that omit a tone simply omit that tone's tints.
 *
 * OKLAB, NOT SRGB, because a perceptually-even space keeps the steps evenly
 * spaced in perceived lightness; an sRGB mix compresses and expands unevenly
 * depending on hue, measured here at a 1.0% spread in the per-1% lightness gap
 * across the scale versus 0.0% for Oklab.
 *
 * OKLAB, NOT OKLCH, and the two are NOT interchangeable even though they are the
 * same space. The evenness above is a property of L, which both forms carry
 * identically -- the ramp's L values are byte-identical under either. They differ
 * only in the chroma plane: the polar form interpolates hue as an ANGLE, so a
 * ground with any chroma at all drags the role across the wheel in proportion to
 * how much of the mix the ground occupies -- and at these steps the ground is
 * 76-96% of it. A near-neutral page background is enough: at C=0.0059 an OKLCH
 * mix turned a warm role cold, and at C=0.0013 it rendered a blue primary as a
 * green-grey. The rectangular form interpolates a and b, which lands the mix
 * along the role's own direction and keeps the hue.
 *
 * This is invisible on a pure-white or pure-black ground. There the hue is
 * POWERLESS (CSS Color 4 §12.2: a hue with zero chroma is replaced by the other
 * color's during interpolation), so OKLCH carries the role's own hue forward and
 * the two forms agree exactly. A scale validated only against a neutral ground,
 * or only on a role that happens to share the ground's hue, will therefore show
 * no difference at all -- which is why this needs saying rather than rediscovering.
 */
export function setTintScaleVariables(
  vars: Record<string, string>,
  bt: BrandTheme
): void {
  const palette = bt.palette;
  if (!palette) return;

  if (palette.primaryColor)
    setTintRampVariables(vars, "--ds-tint", "--ds-color-primary");
  if (palette.successColor)
    setTintRampVariables(vars, "--ds-tint-success", "--ds-color-success");
  if (palette.warningColor)
    setTintRampVariables(vars, "--ds-tint-warning", "--ds-color-warning");
  if (palette.errorColor)
    setTintRampVariables(vars, "--ds-tint-error", "--ds-color-error");
  if (palette.infoColor)
    setTintRampVariables(vars, "--ds-tint-info", "--ds-color-info");
}
