/**
 * @fileoverview The status-tint floor: the well, the separator and the two
 * washes each status tone implies.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/palette/tints
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandPalette } from "@/foundation/contracts/composition/tenants/themes";

/** The two mix strengths `palette.contrast-posture` states for this block. */
export interface TintStrengths {
  /** Percent of the tone that survives in its own separator. */
  readonly separatorMix: number;
  /** Percent of the tone that survives in its quietest wash. */
  readonly washMix: number;
}

/**
 * The floor for the status-tint family: `--ds-color-{tone}-bg`,
 * `--ds-color-{tone}-border` and `--ds-color-alpha-{tone}-{10,20}`, per tone.
 *
 * Each formula names the tone's OWN channel rather than resolving it, so the
 * floor never needs the seed's literal value -- only its presence in the
 * block being compiled. That is what lets one function serve the base block
 * and every mode overlay alike: the family re-enters per block with that
 * block's own merged palette, so a dark overlay derives against its own dark
 * seed rather than inheriting light's.
 *
 * ANCHOR IS THE SEED, NOT THE `-500` STEP. `color-mix(in srgb,
 * var(--ds-color-{tone}) N%, transparent)` reads the channel the theme itself
 * sets (`--ds-color-{tone}` = `palette.{tone}Color`, stated by the semantic
 * owner beside this one), never a ramp step. The `-500` step is residue of a
 * documented APCA re-level (`default.css`) and no longer coincides with the
 * channel in three of four tones -- anchoring there would paint a brown border
 * under an amber well in bithire's warning tone.
 *
 * `--ds-color-alpha-info-20` is never emitted: it is a RETIRED channel
 * (`governance/tokens/decisions/writers/unused/system/index.json`,
 * `"decision": "RETIRE_PROPOSED", "executed": true`), and reviving it from this
 * floor would resurrect a name the programme already closed.
 *
 * GUARDED PER TONE, per the ramp-anchor law: a tone whose block carries no
 * seed emits nothing for it. Without this guard the floor would fire off a
 * mode overlay that authors an unrelated ramp blind to mode (e.g. evnto's dark
 * `ramps.success` copying light's 50..800 verbatim) and PROPAGATE that defect
 * instead of curing it.
 *
 * The guard does NOT exclude Evnto's dark overlay merely because the overlay
 * never declares `successColor`. `applyModeOverlay` MERGES the palette, so a
 * dark block's palette always carries the base seed even when the overlay
 * itself is silent -- the floor DOES fire in dark, at the same seed, and emits
 * the identical string it emits in light. What actually excludes the four
 * `-bg` rows from dark's DELTA is downstream: `compileModeBlocks` only keeps a
 * key whose value differs from the base block's, and dark's derived string is
 * byte-identical to light's, so the row is deduplicated, not suppressed at the
 * source.
 *
 * Merged BEFORE the authored extended palette: derivation is the floor, an
 * authored `successBgColor`/`alphaSuccess10`/etc. is the ceiling, per channel.
 * `palette.contrast-posture` moves the two mix strengths together, so a tenant
 * that asks for a harder read gets a harder separator and a harder wash
 * without re-picking either.
 */
export function derivePaletteTints(
  palette: BrandPalette,
  strengths: TintStrengths
): Record<string, string> {
  const vars: Record<string, string> = {};
  const separator = (tone: string) =>
    `color-mix(in srgb, var(--ds-color-${tone}) ${strengths.separatorMix}%, transparent)`;
  const wash = (tone: string) =>
    `color-mix(in srgb, var(--ds-color-${tone}) ${strengths.washMix}%, transparent)`;
  // Written as explicit per-tone assignments, not a loop over the role table:
  // the producer census reads these names out of the source text, and an
  // interpolated key both hides the fifteen it does emit and invents the
  // retired `--ds-color-alpha-info-20` it deliberately does not.
  if (palette.successColor) {
    vars["--ds-color-success-bg"] = "var(--ds-color-success-50)";
    vars["--ds-color-success-border"] = separator("success");
    vars["--ds-color-alpha-success-10"] = wash("success");
    vars["--ds-color-alpha-success-20"] = separator("success");
  }
  if (palette.warningColor) {
    vars["--ds-color-warning-bg"] = "var(--ds-color-warning-50)";
    vars["--ds-color-warning-border"] = separator("warning");
    vars["--ds-color-alpha-warning-10"] = wash("warning");
    vars["--ds-color-alpha-warning-20"] = separator("warning");
  }
  if (palette.errorColor) {
    vars["--ds-color-error-bg"] = "var(--ds-color-error-50)";
    vars["--ds-color-error-border"] = separator("error");
    vars["--ds-color-alpha-error-10"] = wash("error");
    vars["--ds-color-alpha-error-20"] = separator("error");
  }
  if (palette.infoColor) {
    vars["--ds-color-info-bg"] = "var(--ds-color-info-50)";
    vars["--ds-color-info-border"] = separator("info");
    vars["--ds-color-alpha-info-10"] = wash("info");
  }
  return vars;
}
