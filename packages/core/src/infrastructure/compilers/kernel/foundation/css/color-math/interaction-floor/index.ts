/**
 * @fileoverview The single derivation for the four primary-seeded floors.
 *
 * `--ds-color-primary-foreground`, `--ds-color-border-focus`,
 * `--ds-color-link` and `--ds-color-link-hover` are channels a theme MAY
 * author and never MUST. Both ingress paths — the static arm and the DB
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
 * the other three keep their derived value. Derivation never outranks an
 * author, and an author of one channel never suppresses the floor of another.
 *
 * MEASURABLE OR DEFERRED. A seed that is a legal CSS color but not a hex
 * literal (`var(--brand)`, `oklch(...)`) has no value here, so:
 *   - the two PASS-THROUGH channels still emit — they restate the seed and
 *     need no color math at all;
 *   - the two DERIVED channels are omitted. An ink or a hover shade computed
 *     from an unresolvable seed would be a claim about a pairing that was
 *     never measured, and the cascade's own default is the honest answer.
 */

import { isValidCssColor } from '..';
import { HOVER_LIGHTNESS_STEP, shadeSeed } from '../palette-derivations';
import { measureReadableInk, type ReadableInkMeasurement } from '../readable-ink';

/** The four channels this floor can reach, in their canonical names. */
export const INTERACTION_FLOOR_CHANNELS = {
  primaryForeground: '--ds-color-primary-foreground',
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
   * omits the foreground and hover channels rather than guessing them.
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
 * All four channels read the primary alone. None of them has an accent-keyed
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
): InteractionFloor {
  if (!effectivePrimary || !isValidCssColor(effectivePrimary)) {
    return { variables: {}, ink: undefined };
  }

  // Pass-through: these two restate the seed verbatim, so they hold for a
  // `var()` seed exactly as they hold for a hex one.
  const variables: Record<string, string> = {
    [INTERACTION_FLOOR_CHANNELS.borderFocus]: effectivePrimary,
    [INTERACTION_FLOOR_CHANNELS.link]: effectivePrimary,
  };

  const ink = measureReadableInk(effectivePrimary);
  if (ink.status === 'measured') {
    if (ink.meetsAA) {
      variables[INTERACTION_FLOOR_CHANNELS.primaryForeground] = ink.ink;
    }
    variables[INTERACTION_FLOOR_CHANNELS.linkHover] = shadeSeed(
      effectivePrimary,
      HOVER_LIGHTNESS_STEP,
    );
  }

  return { variables, ink };
}
