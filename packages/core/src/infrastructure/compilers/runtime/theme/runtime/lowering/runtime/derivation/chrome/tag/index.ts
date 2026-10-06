/**
 * @fileoverview The tag family: its tone fills on the palette's seeds mixed
 * toward the deep neutral, its inks on the inverse text role, the outlined inks
 * on the tone itself, the chip corners on the radius scale, the pill corners on
 * the full radius, the padding steps on the spacing ramp, the touch targets on
 * the foundation minimum, and the focus rings on the foundation ring.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/tag
 * @category Compilers
 * @package @rottay/design-system
 */

import { contrastRatio } from "@/foundation/kernel/color/contrast";
import {
  isHexColor,
  mixColor,
  normalizeHexColor,
} from "@/infrastructure/compilers/kernel/foundation/css/color-math";
import {
  WCAG_AA_NORMAL_TEXT_RATIO,
  measureReadableInk,
} from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import type {
  AssembledChannels,
  FamilyDeriver,
  LoweringContext,
} from "../../../../foundation/contract";
import { textGrounds } from "../../../../foundation/palette";

/** A vertical's own tag chrome outranks every relation stated here. */
export const tagChromeDeriver: FamilyDeriver = {
  family: "tag",
  rank: "derived",
  scopes: ["density"],
  consumes: [
    "palette.*",
    "surfaces.radiusScale",
    "surfaces.focusStyle",
    "surfaces.borderStyle",
    "states.press",
    "typography.roles",
    "typography.roleWeights",
    "density",
  ],
  produces: [
    "--ds-tag-primary-solid-bg",
    "--ds-tag-secondary-solid-bg",
    "--ds-tag-success-solid-bg",
    "--ds-tag-warning-solid-bg",
    "--ds-tag-error-solid-bg",
    "--ds-tag-secondary-ink",
    "--ds-tag-success-ink",
    "--ds-tag-warning-ink",
    "--ds-tag-error-ink",
    "--ds-tag-outlined-ink",
    "--ds-tag-primary-outlined-ink",
    "--ds-tag-secondary-outlined-ink",
    "--ds-tag-success-outlined-ink",
    "--ds-tag-warning-outlined-ink",
    "--ds-tag-error-outlined-ink",
    "--ds-tag-border",
    "--ds-tag-focus-ring",
    "--ds-tag-close-focus-ring",
    "--ds-tag-close-radius",
    "--ds-tag-close-size",
    "--ds-tag-close-touch-size",
    "--ds-tag-touch-target",
    "--ds-tag-icon-radius",
    "--ds-tag-icon-size",
    "--ds-tag-compact-font-weight",
    "--ds-tag-xs-padding-inline",
    "--ds-tag-sm-padding-inline",
    "--ds-tag-md-padding-inline",
    "--ds-tag-lg-padding-inline",
    "--ds-tag-xl-padding-inline",
    "--ds-tag-max-inline-size",
    "--ds-tag-press-transform",
    "--ds-tag-shadow",
    "--ds-tag-border-width",
    "--ds-tag-radius-sm",
    "--ds-tag-radius-md",
    "--ds-tag-radius-lg",
  ],
  derive: (context, below) => ({
    ...deriveTagChannels(),
    "--ds-tag-primary-outlined-ink": deriveOutlinedPrimaryInk(context, below),
  }),
};

const OUTLINED_PRIMARY_INK_CHAIN = "var(--ds-color-primary)";
/** The recommended pricing plan's resting tint (modern/skin/pricing-table), which carries an outlined primary badge. */
const PRIMARY_HIGHLIGHT_WASH = 0.1;
const INK_STEPS = 20;

/** The primary stays the ink where it clears AA on every ground it is painted on (canvas, raised
 *  ground, the primary wash over it); otherwise it steps toward the readable ink until it does. */
export function deriveOutlinedPrimaryInk(context: LoweringContext, below: AssembledChannels): string {
  const primary = below["--ds-color-primary"];
  const grounds = textGrounds(context.theme.palette, context.mode);
  if (!primary || !isHexColor(primary) || grounds.length === 0 || !grounds.every((g) => isHexColor(g))) {
    return OUTLINED_PRIMARY_INK_CHAIN;
  }
  const ink = normalizeHexColor(primary);
  const surfaces = grounds.map((g) => normalizeHexColor(g));
  surfaces.push(mixColor(surfaces[surfaces.length - 1], ink, PRIMARY_HIGHLIGHT_WASH));
  const clears = (candidate: string) =>
    surfaces.every((surface) => contrastRatio(candidate, surface) >= WCAG_AA_NORMAL_TEXT_RATIO);
  if (clears(ink)) return OUTLINED_PRIMARY_INK_CHAIN;

  const readable = measureReadableInk(surfaces[0]);
  if (readable.status !== "measured") return OUTLINED_PRIMARY_INK_CHAIN;
  for (let step = 1; step < INK_STEPS; step += 1) {
    const candidate = mixColor(ink, readable.ink, step / INK_STEPS);
    if (clears(candidate)) return candidate;
  }
  return readable.ink;
}

export function deriveTagChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // A tone chip carries its seed mixed toward the deep neutral, so its ink
  // clears the contrast floor at every seed a tenant can author.
  vars["--ds-tag-primary-solid-bg"] = "var(--ds-color-primary)";
  vars["--ds-tag-secondary-solid-bg"] =
    "color-mix(in srgb, var(--ds-color-secondary) 82%, var(--ds-color-neutral-900) 18%)";
  vars["--ds-tag-success-solid-bg"] =
    "color-mix(in srgb, var(--ds-color-success) 62%, var(--ds-color-neutral-900) 38%)";
  vars["--ds-tag-warning-solid-bg"] =
    "color-mix(in srgb, var(--ds-color-warning) 55%, var(--ds-color-neutral-900) 45%)";
  vars["--ds-tag-error-solid-bg"] =
    "color-mix(in srgb, var(--ds-color-error) 78%, var(--ds-color-neutral-900) 22%)";

  vars["--ds-tag-secondary-ink"] = "var(--ds-color-white)";
  vars["--ds-tag-success-ink"] = "var(--ds-color-white)";
  vars["--ds-tag-warning-ink"] = "var(--ds-color-white)";
  vars["--ds-tag-error-ink"] = "var(--ds-color-white)";

  // An outlined chip wears the tone itself as ink, over the page ground.
  vars["--ds-tag-outlined-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-tag-primary-outlined-ink"] = "var(--ds-color-primary)";
  vars["--ds-tag-secondary-outlined-ink"] = "var(--ds-color-secondary)";
  vars["--ds-tag-success-outlined-ink"] =
    "color-mix(in srgb, var(--ds-color-success) 60%, var(--ds-color-neutral-900) 40%)";
  vars["--ds-tag-warning-outlined-ink"] =
    "color-mix(in srgb, var(--ds-color-warning) 55%, var(--ds-color-neutral-900) 45%)";
  vars["--ds-tag-error-outlined-ink"] =
    "color-mix(in srgb, var(--ds-color-error) 78%, var(--ds-color-neutral-900) 22%)";

  vars["--ds-tag-border"] = "color-mix(in srgb, currentColor 16%, transparent)";
  vars["--ds-tag-focus-ring"] =
    "var(--ds-focus-ring, 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 22%, transparent))";
  // The close button's ring reads the tenant's focus decision, like the shell's
  // own ring above it; the literal stays as the fallback for a page with no
  // `--ds-focus-ring` on the root.
  vars["--ds-tag-close-focus-ring"] =
    "var(--ds-focus-ring, 0 0 0 2px color-mix(in srgb, currentColor 26%, transparent))";

  vars["--ds-tag-close-radius"] = "var(--ds-radius-full)";
  vars["--ds-tag-icon-radius"] = "var(--ds-radius-full)";
  vars["--ds-tag-close-size"] = "var(--ds-spacing-4)";
  vars["--ds-tag-icon-size"] = "1em";
  vars["--ds-tag-close-touch-size"] = "var(--ds-touch-target-min)";
  vars["--ds-tag-touch-target"] = "var(--ds-touch-target-min)";

  vars["--ds-tag-compact-font-weight"] = "var(--ds-font-weight-semibold)";

  // The inline padding walks the spacing ramp, which already carries density.
  vars["--ds-tag-xs-padding-inline"] = "calc(var(--ds-spacing-2) * 0.75)";
  vars["--ds-tag-sm-padding-inline"] = "var(--ds-spacing-2)";
  vars["--ds-tag-md-padding-inline"] = "calc(var(--ds-spacing-2) * 1.25)";
  vars["--ds-tag-lg-padding-inline"] = "var(--ds-spacing-3)";
  vars["--ds-tag-xl-padding-inline"] = "var(--ds-spacing-4)";

  vars["--ds-tag-max-inline-size"] = "calc(var(--ds-spacing-4) * 16)";
  vars["--ds-tag-press-transform"] = "translateY(0) scale(var(--ds-state-press-scale))";
  vars["--ds-tag-shadow"] = "0 2px 7px color-mix(in srgb, currentColor 8%, transparent)";

  // The chip keyline reads the hairline role its skin fallback already names;
  // hairline rests at the component default's 1px in every vertical.
  vars["--ds-tag-border-width"] = "var(--ds-edge-hairline-width)";

  // The chip corners are the base rungs times the tenant's radius scale; the
  // pill corner rides the full radius and never scales.
  vars["--ds-tag-radius-sm"] = "calc(0.125rem * var(--ds-radius-scale, 1))";
  vars["--ds-tag-radius-md"] = "calc(0.25rem * var(--ds-radius-scale, 1))";
  vars["--ds-tag-radius-lg"] = "calc(0.5rem * var(--ds-radius-scale, 1))";

  return vars;
}
