/**
 * @fileoverview The neutral axis: the neutral ramp a theme states and the two
 * monochrome anchors, both leaning to the temperature the tenant decided.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/palette/neutral-temperature
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { hexToOklch, oklchToHex } from "@/foundation/kernel/color/oklch";
import { isHexColor } from "@/infrastructure/compilers/kernel/foundation/css/color-math";

/**
 * `neutral` is achromatic and therefore the identity: the authored ramp
 * verbatim and the two literals the monochrome ramp used to hand-carry.
 */
const TEMPERATURES = {
  cool: { hue: 250, chroma: 0.012 },
  neutral: undefined,
  warm: { hue: 70, chroma: 0.012 },
} as const;

type TemperatureName = keyof typeof TEMPERATURES;
type Lean = { readonly hue: number; readonly chroma: number };

/** The two ends of the monochrome axis at rest: pure ink, pure paper. */
const ACHROMATIC_INK = "#000000";
const ACHROMATIC_PAPER = "#ffffff";

// At L 0 and L 1 every chroma gamut-maps back to black and white, so a tinted
// anchor has to sit just inside the extremes to carry its hue at all.
const TINTED_INK_LIGHTNESS = 0.08;
const TINTED_PAPER_LIGHTNESS = 0.985;

function resolveLean(bt: BrandTheme): Lean | undefined {
  const authored = bt.palette?.neutralTemperature;
  return authored !== undefined && authored in TEMPERATURES
    ? TEMPERATURES[authored as TemperatureName]
    : undefined;
}

/**
 * Re-hue one step, holding its lightness exactly: a warm 500 and a cool 500
 * are the same step of the same ladder.
 */
function lean(step: string, to: Lean): string {
  if (!isHexColor(step)) return step;
  const { l } = hexToOklch(step);
  return oklchToHex({ l, c: to.chroma, h: to.hue });
}

/**
 * The neutral ramp and the two monochrome anchors, in one producer.
 *
 * `neutral` is the one palette role with no seed, so what a tenant decides
 * about it is a TEMPERATURE. `foundation/monochrome` mixes all eleven of its
 * steps between the two anchors stated here.
 */
export function deriveNeutralAxis(bt: BrandTheme): Record<string, string> {
  const palette = bt.palette;
  if (!palette) return {};
  const to = resolveLean(bt);
  const vars: Record<string, string> = {};

  // Written as explicit per-step assignments, not a loop over `RAMP_STEPS`:
  // the producer census reads these names out of the source text, so an
  // interpolated key leaves the whole ramp without a declared producer.
  const authored = palette.ramps?.neutral;
  if (authored) {
    const step = (value: string | undefined) =>
      value === undefined ? undefined : to ? lean(value, to) : value;
    const s50 = step(authored[50]);
    if (s50) vars["--ds-color-neutral-50"] = s50;
    const s100 = step(authored[100]);
    if (s100) vars["--ds-color-neutral-100"] = s100;
    const s200 = step(authored[200]);
    if (s200) vars["--ds-color-neutral-200"] = s200;
    const s300 = step(authored[300]);
    if (s300) vars["--ds-color-neutral-300"] = s300;
    const s400 = step(authored[400]);
    if (s400) vars["--ds-color-neutral-400"] = s400;
    const s500 = step(authored[500]);
    if (s500) vars["--ds-color-neutral-500"] = s500;
    const s600 = step(authored[600]);
    if (s600) vars["--ds-color-neutral-600"] = s600;
    const s700 = step(authored[700]);
    if (s700) vars["--ds-color-neutral-700"] = s700;
    const s800 = step(authored[800]);
    if (s800) vars["--ds-color-neutral-800"] = s800;
    const s900 = step(authored[900]);
    if (s900) vars["--ds-color-neutral-900"] = s900;
  }

  vars["--ds-color-neutral-ink"] = to
    ? oklchToHex({ l: TINTED_INK_LIGHTNESS, c: to.chroma, h: to.hue })
    : ACHROMATIC_INK;
  vars["--ds-color-neutral-paper"] = to
    ? oklchToHex({ l: TINTED_PAPER_LIGHTNESS, c: to.chroma, h: to.hue })
    : ACHROMATIC_PAPER;
  return vars;
}
