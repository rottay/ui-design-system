/**
 * @fileoverview Extended palette, alias and seed-RGB channel writers plus their floors.
 *
 * @module Compilers/Theme/Lowering/Foundation/palette
 * @category Compilers
 * @package @rottay/design-system
 */

import type {
  BrandPalette,
  BrandPaletteAliases,
} from "@/foundation/contracts/composition/tenants/themes";
import { deriveInteractionFloor } from "@/infrastructure/compilers/kernel/foundation/css/color-math/interaction-floor";
import { ON_TONE_ROLES } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";

/**
 * The palette channels beyond the seeds: the second and third steps of every
 * semantic family a product actually paints with.
 *
 * These are DS-owned channels with real consumers (`--ds-color-bg-elevated`
 * alone is read in ~295 places). Before they were contract fields the only way
 * for a vertical to set them was a hand-written root block in its artifact
 * extension, which is how a static vertical ended up with a second theme
 * author. One field reaches exactly one channel, so a value that ships today
 * moves into the contract without changing.
 *
 * Spelled as a static `field -> --ds-*` record so the channel-parity graph can
 * read every edge from source. Encoded as tuples or computed keys these 31
 * emissions are invisible to it and each one reappears as a phantom
 * declared-but-unemitted finding.
 */
const EXTENDED_PALETTE_CHANNELS = {
  primaryHoverColor: "--ds-color-primary-hover",
  secondaryHoverColor: "--ds-color-secondary-hover",
  accentHoverColor: "--ds-color-accent-hover",
  onPrimaryColor: "--ds-color-text-on-primary",
  primaryForegroundColor: "--ds-color-primary-foreground",
  textTertiaryColor: "--ds-color-text-tertiary",
  borderColor: "--ds-color-border",
  borderTertiaryColor: "--ds-color-border-tertiary",
  borderSubtleColor: "--ds-color-border-subtle",
  borderFocusColor: "--ds-color-border-focus",
  backgroundSecondaryColor: "--ds-color-bg-secondary",
  backgroundTertiaryColor: "--ds-color-bg-tertiary",
  backgroundElevatedColor: "--ds-color-bg-elevated",
  backgroundSurfaceColor: "--ds-color-bg-surface",
  backgroundOverlayColor: "--ds-color-bg-overlay",
  successBgColor: "--ds-color-success-bg",
  successBorderColor: "--ds-color-success-border",
  warningBgColor: "--ds-color-warning-bg",
  warningBorderColor: "--ds-color-warning-border",
  errorBgColor: "--ds-color-error-bg",
  errorBorderColor: "--ds-color-error-border",
  infoBgColor: "--ds-color-info-bg",
  infoBorderColor: "--ds-color-info-border",
  infoInkColor: "--ds-color-info-ink",
  linkColor: "--ds-color-link",
  linkHoverColor: "--ds-color-link-hover",
  linkVisitedColor: "--ds-color-link-visited",
  interactiveBorderColor: "--ds-color-interactive-border",
  interactiveBgHoverColor: "--ds-color-interactive-bg-hover",
  interactiveBgActiveColor: "--ds-color-interactive-bg-active",
  interactiveBgMutedColor: "--ds-color-interactive-bg-muted",
  alphaBlack50: "--ds-color-alpha-black-50",
  alphaBlack100: "--ds-color-alpha-black-100",
  alphaWhite50: "--ds-color-alpha-white-50",
  alphaPrimary10: "--ds-color-alpha-primary-10",
  alphaPrimary20: "--ds-color-alpha-primary-20",
  alphaSecondary10: "--ds-color-alpha-secondary-10",
  alphaSecondary20: "--ds-color-alpha-secondary-20",
  alphaSuccess10: "--ds-color-alpha-success-10",
  alphaSuccess20: "--ds-color-alpha-success-20",
  alphaWarning10: "--ds-color-alpha-warning-10",
  alphaWarning20: "--ds-color-alpha-warning-20",
  alphaError10: "--ds-color-alpha-error-10",
  alphaError20: "--ds-color-alpha-error-20",
  alphaInfo10: "--ds-color-alpha-info-10",
  bgHoverColor: "--ds-color-bg-hover",
  bgInfoColor: "--ds-color-bg-info",
  bgSubtleColor: "--ds-color-bg-subtle",
  neutralZeroColor: "--ds-color-neutral-0",
  primarySubtleColor: "--ds-color-primary-subtle",
  shadowColor: "--ds-color-shadow",
  surfaceColor: "--ds-color-surface",
  surfaceMutedColor: "--ds-color-surface-muted",
  surfaceSecondaryColor: "--ds-color-surface-secondary",
  textColor: "--ds-color-text",
  textInverseColor: "--ds-color-text-inverse",
} as const satisfies Readonly<Partial<Record<keyof BrandPalette, string>>>;

/**
 * The unprefixed alias namespace. Same shape as the record above, keyed on
 * `BrandPalette.aliases` instead of the palette root, and exhaustive over that
 * type so a new alias leaf fails type review until it has a destination.
 */
const PALETTE_ALIAS_CHANNELS = {
  textPrimary: "--ds-text-primary",
  textSecondary: "--ds-text-secondary",
  textTertiary: "--ds-text-tertiary",
  textDisabled: "--ds-text-disabled",
  textInverse: "--ds-text-inverse",
  borderColor: "--ds-border-color",
  borderColorDefault: "--ds-border-color-default",
  borderColorMuted: "--ds-border-color-muted",
  borderColorStrong: "--ds-border-color-strong",
  borderColorHover: "--ds-border-color-hover",
  borderColorFocus: "--ds-border-color-focus",
} as const satisfies Readonly<Record<keyof BrandPaletteAliases, string>>;

/**
 * Derive `--ds-color-{primary,secondary}-rgb` from the resolved seed.
 *
 * The channel is a comma-separated sRGB triplet, which is what a `rgb(var(...)
 * / <alpha>)` reader needs and what a hex seed cannot supply directly. It is
 * DERIVED, never authored: a theme that could write the triplet by hand could
 * write one that disagrees with its own seed, which is a second color
 * authority. A non-hex seed (a `var()` forward, a color function) has no
 * verified triplet, so the channel is omitted and the reader keeps its floor.
 */
function seedRgbTriplet(seed: string | undefined): string | undefined {
  if (typeof seed !== "string") return undefined;
  const hex = seed.trim();
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  if (!match) return undefined;
  const digits = match[1];
  const full =
    digits.length === 3
      ? digits
          .split("")
          .map((d) => d + d)
          .join("")
      : digits;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function setSeedRgbVariables(
  vars: Record<string, string>,
  palette: BrandPalette
): void {
  const primary = seedRgbTriplet(palette.primaryColor);
  if (primary) vars["--ds-color-primary-rgb"] = primary;
  const secondary = seedRgbTriplet(palette.secondaryColor);
  if (secondary) vars["--ds-color-secondary-rgb"] = secondary;
}

export function setExtendedPaletteVariables(
  vars: Record<string, string>,
  palette: BrandPalette
): void {
  for (const [field, variable] of Object.entries(
    EXTENDED_PALETTE_CHANNELS
  ) as ReadonlyArray<readonly [keyof BrandPalette, string]>) {
    const value = palette[field];
    if (typeof value === "string" && value) vars[variable] = value;
  }
  const aliases = palette.aliases;
  if (aliases) {
    for (const [field, variable] of Object.entries(
      PALETTE_ALIAS_CHANNELS
    ) as ReadonlyArray<readonly [keyof BrandPaletteAliases, string]>) {
      const value = aliases[field];
      if (typeof value === "string" && value) vars[variable] = value;
    }
  }
  setSeedRgbVariables(vars, palette);
}

/**
 * The FLOOR for four `EXTENDED_PALETTE_CHANNELS` entries a theme may author
 * but never must: `--ds-color-primary-foreground`, `--ds-color-border-focus`,
 * `--ds-color-link`, `--ds-color-link-hover`.
 *
 * The math itself is `deriveInteractionFloor` in
 * `color-math/interaction-floor` -- shared verbatim with the DB
 * `compileTenantThemeConfig` path, so the two ingress paths cannot answer
 * "what does this seed imply" differently. This wrapper exists only to keep
 * the static path's own call site named after the channel group it feeds.
 *
 * Merged BEFORE `setExtendedPaletteVariables`, whose unconditional "write
 * when the string is present" then overwrites exactly the keys the theme
 * supplies -- derivation is the floor, authored is the ceiling, and it is
 * never the other way around. Precedence is per channel: authoring the link
 * color leaves the derived foreground, focus border and link hover in place.
 */
export function deriveExtendedPaletteFloor(
  effectivePrimary: string | undefined
): Record<string, string> {
  return deriveInteractionFloor(effectivePrimary).variables;
}

/**
 * The floor for the status-tint family: `--ds-color-{tone}-bg`,
 * `--ds-color-{tone}-border` and `--ds-color-alpha-{tone}-{10,20}`, per tone.
 *
 * Each formula names the tone's OWN channel rather than resolving it, so the
 * floor never needs the seed's literal value -- only its presence in the
 * block being compiled. That is what lets one function serve the base block
 * and every mode overlay alike: `brandThemeToCssVariables` re-enters per
 * block with that block's own merged palette, so a dark overlay derives
 * against its own dark seed rather than inheriting light's.
 *
 * ANCHOR IS THE SEED, NOT THE `-500` STEP. `color-mix(in srgb,
 * var(--ds-color-{tone}) N%, transparent)` reads the channel the theme
 * itself sets (`--ds-color-{tone}` = `bt.palette.{tone}Color`, set a few
 * lines above in this same function), never a ramp step. The `-500` step is
 * residue of a documented APCA re-level (`default.css`) and no longer
 * coincides with the channel in three of four tones -- anchoring there would
 * paint a brown border under an amber well in bithire's warning tone.
 *
 * `--ds-color-alpha-info-20` is never emitted: it is a RETIRED channel
 * (`governance/tokens/decisions/writers/unused/system/index.json`, `"decision": "RETIRE_PROPOSED", "executed":
 * true`), and reviving it from this floor would resurrect a name the
 * programme already closed.
 *
 * GUARDED PER TONE, per the ramp-anchor law: a tone whose block carries no
 * seed emits nothing for it. Without this guard the floor would fire off a
 * mode overlay that authors an unrelated ramp blind to mode (e.g. evnto's
 * dark `ramps.success` copying light's 50..800 verbatim) and PROPAGATE that
 * defect instead of curing it.
 *
 * The guard does NOT exclude Evnto's dark overlay merely because
 * the overlay never declaring `successColor`. `applyModeOverlay` MERGES the
 * palette (`palette: mergeModeOverlay(bt.palette, overlay.palette)`), so a
 * dark block's palette always carries the base seed even when the overlay
 * itself is silent -- the floor DOES fire in dark, at the same seed, and
 * emits the identical string it emits in light. What actually excludes the
 * four `-bg` rows from dark's DELTA is downstream: `compileModeBlocks` only
 * keeps a key whose value differs from the base block's (`if (baseVars[key]
 * !== value)`), and dark's derived string is byte-identical to light's, so
 * the row is deduplicated, not suppressed at the source. The blind-ramp
 * defect this guard exists to stop is real and unchanged by
 * this correction -- only the EXPLANATION of why dark's delta stays empty
 * was wrong.
 *
 * Merged BEFORE `setExtendedPaletteVariables`, exactly like
 * `deriveExtendedPaletteFloor` above: derivation is the floor, an authored
 * `successBgColor`/`alphaSuccess10`/etc. is the ceiling, per channel.
 */
export function deriveStatusTintFloor(
  palette: BrandPalette
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const role of ON_TONE_ROLES) {
    if (!palette[`${role}Color`]) continue;
    const channel = `--ds-color-${role}`;
    vars[`${channel}-bg`] = `var(${channel}-50)`;
    vars[`${channel}-border`] = `color-mix(in srgb, var(${channel}) 20%, transparent)`;
    vars[`--ds-color-alpha-${role}-10`] = `color-mix(in srgb, var(${channel}) 10%, transparent)`;
    if (role !== "info") {
      vars[`--ds-color-alpha-${role}-20`] = `color-mix(in srgb, var(${channel}) 20%, transparent)`;
    }
  }
  return vars;
}
