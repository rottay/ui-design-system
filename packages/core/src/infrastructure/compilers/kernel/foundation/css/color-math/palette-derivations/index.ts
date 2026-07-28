/**
 * @fileoverview Semantic defaults derived from a tenant's palette seeds.
 *
 * A white-label customer owns its palette and very little else, so the
 * channels the UI actually paints with have to be reachable FROM that palette.
 * Before this module a changed `primaryColor` moved the primary ramp and
 * essentially nothing else: buttons, focus rings, links, cards and inputs
 * carried values that only a hand-authored `chrome` block could reach, which
 * made a tenant look customizable while it was not.
 *
 * Everything emitted here is a DEFAULT. Both compile paths merge the result
 * BEFORE their authored layers — palette literals first, then chrome — so a
 * theme that states a channel by hand still wins and the shipped verticals
 * keep their exact pixels. The derivation only fills what nobody authored.
 *
 * This is the single derivation authority for the static BrandTheme compiler
 * (`runtime/brand-theme`) and the DB Appearance compiler (`runtime/appearance`)
 * so the two cannot drift in vocabulary or in math. Callers resolve their own
 * contract shape (and, on the DB path, their own light/dark halves) down to
 * the flat seed set below; the derivation itself is pure and mode-blind.
 */

import { hexToOklch, oklchToHex } from "@/foundation/kernel/color/oklch";

import {
  clampValue,
  isDarkSurface,
  isHexColor,
  isValidCssColor,
  mixColor,
  normalizeHexColor,
} from "..";

/**
 * The resolved palette seeds a derivation reads. Every field is one already-
 * resolved color for ONE rendering surface: the caller has picked the light or
 * dark half before calling, because the derivation direction depends on the
 * ground and a `light-dark()` pair cannot be measured.
 */
export interface PaletteDerivationSeeds {
  /** The brand seed every interactive affordance is keyed to. */
  primary?: string;
  /** The page ground this surface renders on. */
  background?: string;
}

/**
 * How far a state shade steps away from its seed in OKLCH lightness.
 *
 * Measured against what the three shipped verticals author by hand, which is
 * the only evidence available for what "a hover shade" means in this system:
 * bithire steps its #3A6FB0 primary to #2C5587 (ΔL ≈ 0.06) and evnto steps its
 * near-black #171717 to #262626 (ΔL ≈ 0.05).
 */
const HOVER_LIGHTNESS_STEP = 0.06;

/**
 * Lightness above which a seed is stepped DARKER for its hover state.
 *
 * The direction is a property of the seed, not of the ground: a near-black
 * primary has no darker hover available and must brighten (evnto authors
 * #171717 → #262626 on a WHITE ground), while a white primary must darken
 * (rottay authors #FFFFFF → #E0E0E0 on a BLACK ground). Keying the direction
 * to the ground would invert both.
 */
const SHADE_DIRECTION_LIGHTNESS = 0.5;

/**
 * Step a seed away from its own lightness extreme.
 *
 * Returns the seed unchanged for any value hex math cannot read (a `var()`
 * chain, a `light-dark()` pair, a named color), because a wrong shade is worse
 * than no shade: the channel then simply carries the seed and the authored
 * layer or the DS default still decides the state.
 */
function shadeSeed(seedHex: string, step: number): string {
  if (!isHexColor(seedHex)) return seedHex;
  const seed = hexToOklch(normalizeHexColor(seedHex));
  const direction = seed.l > SHADE_DIRECTION_LIGHTNESS ? -1 : 1;
  return oklchToHex({
    ...seed,
    l: clampValue(seed.l + direction * step, 0, 1),
  });
}

/** A translucent wash of a seed, usable over any ground. */
function wash(seed: string, percent: number): string {
  return `color-mix(in srgb, ${seed} ${percent}%, transparent)`;
}

/**
 * Canonical channels a derived default points AT rather than copies.
 *
 * Where a derivation's value simply IS a seed, it is emitted as a `var()`
 * chain over that seed's own channel instead of the resolved literal. Two
 * reasons, both load-bearing:
 *
 * 1. The string is then identical in every mode, so `compileModeBlocks` —
 *    which keeps only channels whose value actually moves — emits it once in
 *    the base block and it re-resolves against each mode's own seed. A literal
 *    would be duplicated into the dark block at a HIGHER selector specificity
 *    than an un-moded artifact extension, silently outranking authorship the
 *    tenant already owns.
 * 2. A tenant that later overrides only the seed still moves everything keyed
 *    to it, without the compiler having to re-emit the dependents.
 */
const PRIMARY = "var(--ds-color-primary)";
const FOCUS = "var(--ds-color-border-focus, var(--ds-color-primary))";

/**
 * The ground ladder a page canvas implies.
 *
 * Mirrors the grammar the first-party artifacts already author by hand: on a
 * dark canvas every step is a small white lift (the default dark theme's own
 * #0C0C0E → #0F0F12/#141417/#18181C distances); on a light canvas sunken
 * regions darken while raised surfaces go to near-white, which is the static
 * artifacts' pure-white card grammar.
 */
export interface GroundLadder {
  secondary: string;
  tertiary: string;
  elevated: string;
  input: string;
}

export function deriveGroundLadder(background: string): GroundLadder {
  return isDarkSurface(background)
    ? {
        secondary: mixColor(background, "#ffffff", 0.01),
        tertiary: mixColor(background, "#ffffff", 0.03),
        elevated: mixColor(background, "#ffffff", 0.05),
        input: mixColor(background, "#ffffff", 0.01),
      }
    : {
        secondary: mixColor(background, "#000000", 0.025),
        tertiary: mixColor(background, "#000000", 0.05),
        elevated: mixColor(background, "#ffffff", 0.6),
        input: mixColor(background, "#ffffff", 0.75),
      };
}

/**
 * Semantic channels derived from the PRIMARY seed: button primary chrome and
 * the focused-control treatment, both keyed to the one seed a tenant reliably
 * sets. `--ds-color-text-on-primary` is not among them — the Appearance
 * compiler derives that ink with WCAG math the axe gates grade against, and a
 * second author for the same channel is what `assertSingleLightEmitter` exists
 * to reject.
 */
function derivePrimarySemantics(
  seeds: PaletteDerivationSeeds
): Record<string, string> {
  const primary = seeds.primary;
  if (!primary || !isValidCssColor(primary)) return {};

  return {
    // Button primary chrome — the control that IS the brand color. The two
    // state shades are real math on the seed, so they resolve per mode.
    "--ds-button-primary-bg": PRIMARY,
    "--ds-button-primary-bg-hover": shadeSeed(primary, HOVER_LIGHTNESS_STEP),
    "--ds-button-primary-border": PRIMARY,
    "--ds-button-primary-color": "var(--ds-color-text-on-primary)",

    // Focus, on the control side only. `--ds-color-border-focus` itself is
    // NOT claimed here: the legacy-branding emitter in
    // `runtime/tenant-css/visual-config` already derives it from the same
    // primary seed, and `assertSingleLightEmitter` rejects a channel with two
    // authors rather than let a merge hide which one won. These two read
    // THROUGH that channel, so the focused control still tracks the seed
    // wherever the other emitter runs, and falls back to the primary where it
    // does not. `--ds-color-link` is withheld for exactly the same reason.
    "--ds-input-border-focus": FOCUS,
    "--ds-input-shadow-focus": `0 0 0 3px ${wash(FOCUS, 20)}`,
  };
}

/**
 * Grounds derived from the BACKGROUND seed: the surfaces cards, inputs and
 * table rows are painted on.
 */
function deriveGroundSemantics(
  seeds: PaletteDerivationSeeds
): Record<string, string> {
  const background = seeds.background;
  if (!background || !isHexColor(background)) return {};

  const ladder = deriveGroundLadder(normalizeHexColor(background));

  return {
    // The recessed control ground. The rest of the ladder —
    // `--ds-color-bg-secondary`, `-tertiary`, `-elevated` — is deliberately
    // NOT emitted here: all three first-party extensions declare those by hand
    // with values that differ from any mechanical derivation, so emitting them
    // would put a compiled channel under an extension that outranks it. That
    // is exactly what EXTENSION-CANNOT-BEAT-TENANT forbids, and its pinned
    // inventory is decrease-only, so buying the reach with twelve new pins
    // would reintroduce the same defect one tier down. The DB path, which has
    // no extension, still emits the full ladder from `deriveGroundLadder`.
    "--ds-color-bg-input": ladder.input,

    // The bounded surfaces, so a tenant that retunes one ground moves every
    // surface standing on it. Aliases rather than copies, which also means
    // they resolve correctly on the static path even though the ladder
    // channels they point at are authored a tier down there.
    "--ds-card-bg": "var(--ds-color-bg-elevated)",
    "--ds-input-bg": "var(--ds-color-bg-input)",
    "--ds-table-header-bg": "var(--ds-color-bg-secondary)",
  };
}

/**
 * Every semantic default a palette implies, for one rendering surface.
 *
 * The caller merges this UNDER its authored layers. Nothing here is emitted
 * for a seed the palette does not declare, so an absent seed never claims a
 * channel against a lower-precedence writer.
 */
export function derivePaletteSemantics(
  seeds: PaletteDerivationSeeds
): Record<string, string> {
  return {
    ...derivePrimarySemantics(seeds),
    ...deriveGroundSemantics(seeds),
  };
}
