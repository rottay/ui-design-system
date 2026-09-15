/**
 * @fileoverview Readable-ink derivation shared by both compile paths.
 *
 * One algorithm decides which canonical ink is legible over a seed, so the
 * static FlatTheme compiler and the DB Appearance compiler cannot drift in
 * contrast math. Each path keeps exactly one emitter per channel: sharing
 * this function is sharing math, never adding a second author.
 *
 * Two measurements, because two floors grade these channels. The status-tone
 * inks are chosen by the WCAG ratio: the axe gates grade those pairs with WCAG,
 * so the derivation must optimize the same metric — on light teals APCA favors
 * white where WCAG measures ~2.5:1. The on-primary ink is chosen by APCA, the
 * floor its own governed pairing is graded against. Neither is a fallback for
 * the other; each names the metric that decides its channel.
 */

import { apcaContrast } from '@/foundation/kernel/accessibility/branding-contrast';
import { contrastRatio } from '@/foundation/kernel/color/contrast';

import { isHexColor, normalizeHexColor } from '..';

/** The two canonical inks the derivation chooses between. */
export const READABLE_INK_LIGHT = '#ffffff';
export const READABLE_INK_DARK = '#171717';

/** The WCAG 2.x AA ratio for normal-size text. */
export const WCAG_AA_NORMAL_TEXT_RATIO = 4.5;

/**
 * The pair an ink is chosen from, and the ratio it must clear to claim a
 * channel. `palette.contrast-posture` states one of these; every caller that
 * does not state one gets the canonical pair, so the algorithm stays single
 * while the posture stays a parameter rather than a second derivation.
 */
export interface ReadableInkPair {
  readonly light: string;
  readonly dark: string;
  readonly minimumRatio: number;
}

export const CANONICAL_READABLE_INK: ReadableInkPair = Object.freeze({
  light: READABLE_INK_LIGHT,
  dark: READABLE_INK_DARK,
  minimumRatio: WCAG_AA_NORMAL_TEXT_RATIO,
});

/**
 * The outcome of choosing an ink for a seed.
 *
 * `unmeasurable` is a first-class result, not an error path with a default.
 * A seed that is a legal CSS color but not a hex literal — `var(--x)`,
 * `oklch(...)`, `currentColor` — has no value at compile time, so no ink can
 * be shown to contrast with it. Returning white there would be inventing a
 * pairing and then claiming it was checked; every consumer must instead
 * DEFER the channel and let the cascade's own default stand.
 */
export type ReadableInkMeasurement =
  | {
      status: 'measured';
      /** The canonical ink with the higher measured ratio over the seed. */
      ink: string;
      /** That ink's WCAG contrast ratio over the seed. */
      contrast: number;
      /** Whether `contrast` clears the pair's own `minimumRatio`. */
      meetsFloor: boolean;
    }
  | { status: 'unmeasurable'; reason: 'non-hex-seed' };

/**
 * Measure both canonical inks over a seed and report the better one.
 *
 * WCAG, not NTSC. The retired heuristic compared an NTSC luma sum against a
 * 186 threshold, which is not the metric anything grades: amber (`#F59E0B`)
 * sums to ~167, so the heuristic answered white — 1.9:1, less than half of
 * AA — while the dark ink measures ~10.4:1 on the same seed. A luma threshold
 * cannot be wrong about a ratio it never computes, which is why the ratio is
 * now the thing computed.
 */
export function measureReadableInk(
  seed: string,
  pair: ReadableInkPair = CANONICAL_READABLE_INK,
): ReadableInkMeasurement {
  if (!isHexColor(seed)) return { status: 'unmeasurable', reason: 'non-hex-seed' };

  const normalized = normalizeHexColor(seed);
  const overLight = contrastRatio(pair.light, normalized);
  const overDark = contrastRatio(pair.dark, normalized);
  const preferLight = overLight >= overDark;

  const contrast = preferLight ? overLight : overDark;
  return {
    status: 'measured',
    ink: preferLight ? pair.light : pair.dark,
    contrast,
    meetsFloor: contrast >= pair.minimumRatio,
  };
}

/**
 * The canonical ink an APCA-GATED pair takes over a seed.
 *
 * The sibling of {@link measureReadableInk}, and deliberately a second
 * function rather than a flag on the first: they optimize DIFFERENT metrics
 * because different metrics grade their channels. A channel the axe gates read
 * is chosen by the WCAG ratio; `--ds-color-text-on-primary` is graded by the
 * governed APCA floor in `TEXT_CONTRAST_PAIRINGS`, so it is chosen by |Lc|.
 *
 * The two genuinely disagree on a mid-tone seed, and the disagreement is not
 * marginal. On `#1e84e6` the WCAG ratio prefers the dark ink (4.69:1 against
 * 3.82:1) while APCA measures that same dark pair at Lc 35.4 and the light one
 * at Lc 70.6 -- one side of the governed floor of 60 each. Choosing by the
 * metric that does NOT gate a channel is how a derivation ships a pair its own
 * admission then refuses.
 *
 * `undefined` for a seed with no compile-time colour, exactly as the WCAG
 * measurement reports `unmeasurable`: no ink can be shown to contrast with a
 * value that has none.
 */
export function apcaReadableInk(
  seed: string,
  pair: ReadableInkPair = CANONICAL_READABLE_INK,
): string | undefined {
  if (!isHexColor(seed)) return undefined;
  const normalized = normalizeHexColor(seed);
  const overLight = Math.abs(apcaContrast(pair.light, normalized));
  const overDark = Math.abs(apcaContrast(pair.dark, normalized));
  return overLight >= overDark ? pair.light : pair.dark;
}

/** Raised when an ink is asked for over a seed that carries no measurable color. */
export class UnmeasurableInkError extends Error {
  constructor(seed: string) {
    super(
      `Cannot derive a readable ink over "${seed}": the seed is not a hex literal, ` +
        `so no contrast ratio exists at compile time. Measure with measureReadableInk() ` +
        `and defer the channel when the result is unmeasurable.`,
    );
    this.name = 'UnmeasurableInkError';
  }
}

/**
 * The readable ink over a hex seed.
 *
 * Throws rather than defaulting for a non-hex seed: a caller that cannot
 * handle the deferral must not receive a fabricated one. Callers that CAN
 * defer use {@link measureReadableInk} and skip the channel.
 */
export function deriveReadableInk(
  seedHex: string,
  pair: ReadableInkPair = CANONICAL_READABLE_INK,
): string {
  const measurement = measureReadableInk(seedHex, pair);
  if (measurement.status === 'unmeasurable') throw new UnmeasurableInkError(seedHex);
  return measurement.ink;
}

/**
 * The status tones that carry an `--ds-color-on-<tone>` ink channel.
 *
 * `primary` is deliberately absent: its ink is the long-standing
 * `--ds-color-text-on-primary`, authored by a theme over the APCA-chosen floor
 * {@link apcaReadableInk} derives; `--ds-color-on-primary` exists only as a
 * root alias of it.
 */
export const ON_TONE_ROLES = ['success', 'warning', 'error', 'info'] as const;

export type OnToneRole = (typeof ON_TONE_ROLES)[number];

/** Channel name for a tone's readable-ink emission. */
export function onToneChannel(role: OnToneRole): string {
  return `--ds-color-on-${role}`;
}
