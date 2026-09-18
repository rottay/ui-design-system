/**
 * @fileoverview The single derivation for the primary-seeded floors.
 *
 * `--ds-color-primary-foreground`, `--ds-color-text-on-primary`,
 * `--ds-color-border-focus`, `--ds-color-link` and `--ds-color-link-hover`
 * are channels a theme MAY author and never MUST. Both ingress paths — the static arm and the DB
 * `compileTenantThemeConfig`, which now share one `compileTheme` — need the same
 * unauthored floor, and each used to carry its own copy: the static path
 * exported one it deliberately did not wire in, and the retired runtime
 * generator derived all four from an NTSC luma threshold. Two copies of one
 * formula is two answers to "what does this seed imply", and they had already
 * diverged on the ink.
 *
 * There is now one function, and it lives below the compilers that call it.
 *
 * FLOOR, NOT CEILING. The result is merged BEFORE the authored palette layer,
 * so an authored value for any single channel overwrites just that channel and
 * the others keep their derived value. Derivation never outranks an author,
 * and an author of one channel never suppresses the floor of another.
 *
 * MEASURABLE OR DEFERRED. A seed that is a legal CSS color but not a hex
 * literal (`var(--brand)`, `oklch(...)`) has no value here, so:
 *   - the two PASS-THROUGH channels still emit — they restate the seed and
 *     need no color math at all;
 *   - the three DERIVED channels are omitted. An ink or a hover shade computed
 *     from an unresolvable seed would be a claim about a pairing that was
 *     never measured, and the cascade's own default is the honest answer.
 *
 * THE TWO LINK INKS FOLLOW THE GROUND. `--ds-color-link` and
 * `--ds-color-link-hover` are the only channels here that paint the seed AS
 * TEXT, on the canvas this block compiles for, and they used to restate the
 * seed verbatim in every mode. A seed is a BRAND statement, not a contrast one
 * -- rottay's near-black seed painted a 1.04:1 link on its own dark canvas, and
 * bithire's blue measured 3.56:1 there -- so each is now checked against that
 * ground and moved along lightness only when it fails, exactly as
 * `safeFocusRingColor` does for the ring. A seed that already reads resolves to
 * itself, so every light-surface block is byte-unchanged. `--ds-color-border-focus`
 * keeps the pass-through: it is a border, graded by the non-text floor the
 * ramps family already checks for `--ds-focus-ring-color`.
 *
 * A RAISED FLOOR NEVER LOWERS CONTRAST. `palette.contrast-posture` may raise
 * `pair.minimumRatio` above AA, and withholding the foreground on a seed that
 * misses the raised ratio hands the channel to a cascade fallback nobody
 * measured — on bithire's dark primary that fallback reads 3.82:1 where the
 * withheld ink reads 4.69:1, so asking for MORE contrast produced less. The
 * floor therefore withholds only when the best ink in the posture's own pair
 * misses the canonical AA baseline too; a posture that asks for more can
 * raise the emitted ink, never withdraw one the identity posture would emit.
 */

import { safeInkOnGround } from '@/foundation/kernel/color/oklch/ink';

import { isValidCssColor } from '..';
import { HOVER_LIGHTNESS_STEP, shadeSeed } from '../palette-derivations';
import {
  CANONICAL_READABLE_INK,
  WCAG_AA_NORMAL_TEXT_RATIO,
  apcaReadableInk,
  measureReadableInk,
  type ReadableInkMeasurement,
  type ReadableInkPair,
} from '../readable-ink';

/** The five channels this floor can reach, in their canonical names. */
export const INTERACTION_FLOOR_CHANNELS = {
  primaryForeground: '--ds-color-primary-foreground',
  onPrimary: '--ds-color-text-on-primary',
  borderFocus: '--ds-color-border-focus',
  link: '--ds-color-link',
  linkHover: '--ds-color-link-hover',
} as const;

/** What the floor decided, and why, for one effective primary seed. */
export interface InteractionFloor {
  /** Channels to merge under the authored palette layer. */
  variables: Record<string, string>;
  /**
   * The ink measurement for this seed.
   *
   * `undefined` when there was no seed at all. `unmeasurable` when the seed
   * carries no compile-time color — in which case `variables` deliberately
   * omits the two foreground inks and the hover shade rather than guessing.
   */
  ink: ReadableInkMeasurement | undefined;
}

/**
 * Derive the unauthored floor for one effective primary seed.
 *
 * `effectivePrimary` is the primary the SURFACE actually renders, resolved by
 * the caller. Both callers resolve it the same way they resolve the seed for
 * `derivePaletteSemantics`, so the button/focus defaults and this floor can
 * never disagree about which primary a surface has.
 *
 * `ground` is the canvas the theme STATES, passed by the caller that holds it.
 * Omitted, or not a hex literal, the two link inks keep the verbatim
 * pass-through: a theme that states no canvas paints the sheet's, so an ink
 * moved against a guessed one would be a claim rather than a check, and the
 * sheet's own two scopes are the answer for it.
 *
 * Every channel reads the primary alone. None of them has an accent-keyed
 * precedent anywhere in this codebase, and the retired runtime derivation this
 * replaces read the primary alone too.
 *
 * `--ds-color-link-hover` reuses `shadeSeed` — the same OKLCH state-shade
 * helper `derivePrimarySemantics` already uses for
 * `--ds-button-primary-bg-hover` — rather than introducing a second lightness
 * formula for the same visual idea.
 */
export function deriveInteractionFloor(
  effectivePrimary: string | undefined,
  pair?: ReadableInkPair,
  ground?: string,
): InteractionFloor {
  if (!effectivePrimary || !isValidCssColor(effectivePrimary)) {
    return { variables: {}, ink: undefined };
  }

  // The AA TEXT floor, not `pair.minimumRatio`: the pair's ratio grades an ink
  // painted ON a tone, and reading it here would let `palette.contrast-posture`
  // repaint a link that already clears the text floor on its own canvas.
  // Extending the posture to the link ink is a catalog decision, not this one.
  const readableOn = (ink: string): string =>
    ground === undefined ? ink : safeInkOnGround(ink, ground, WCAG_AA_NORMAL_TEXT_RATIO);

  // The focus border restates the seed verbatim, so it holds for a `var()` seed
  // exactly as it holds for a hex one; the link ink is the seed this ground can
  // carry as text.
  const variables: Record<string, string> = {
    [INTERACTION_FLOOR_CHANNELS.borderFocus]: effectivePrimary,
    [INTERACTION_FLOOR_CHANNELS.link]: readableOn(effectivePrimary),
  };

  const ink = measureReadableInk(effectivePrimary, pair);
  if (ink.status === 'measured') {
    if (ink.meetsFloor || ink.contrast >= CANONICAL_READABLE_INK.minimumRatio) {
      variables[INTERACTION_FLOOR_CHANNELS.primaryForeground] = ink.ink;
    }
    // The ink painted ON the primary. Chosen by APCA, not by the WCAG ratio
    // above, because the governed floor that grades THIS pair is APCA -- see
    // `apcaReadableInk`. Emitted whenever it can be measured and never
    // withheld: its cascade fallback is not a neutral default but the ink some
    // OTHER primary was tuned for, so withholding it can only ship a worse
    // pair than the better of the two candidates.
    const onPrimary = apcaReadableInk(effectivePrimary, pair);
    if (onPrimary) variables[INTERACTION_FLOOR_CHANNELS.onPrimary] = onPrimary;
    variables[INTERACTION_FLOOR_CHANNELS.linkHover] = readableOn(
      shadeSeed(effectivePrimary, HOVER_LIGHTNESS_STEP),
    );
  }

  return { variables, ink };
}
