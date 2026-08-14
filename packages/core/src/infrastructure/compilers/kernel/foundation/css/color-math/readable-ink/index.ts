/**
 * @fileoverview Readable-ink derivation shared by both compile paths.
 *
 * One algorithm decides which canonical ink is legible over a seed, so the
 * static BrandTheme compiler and the DB Appearance compiler cannot drift in
 * contrast math. Each path keeps exactly one emitter per channel: sharing
 * this function is sharing math, never adding a second author.
 *
 * WCAG, not APCA: the axe gates grade these pairs with WCAG ratios, so the
 * derivation must optimize the same metric — on light teals APCA favors white
 * where WCAG measures ~2.5:1.
 */

import { contrastRatio } from '@/foundation/kernel/color/contrast';

import { isHexColor, normalizeHexColor } from '..';

/** The two canonical inks the derivation chooses between. */
export const READABLE_INK_LIGHT = '#ffffff';
export const READABLE_INK_DARK = '#171717';

/** The WCAG 2.x AA ratio for normal-size text. */
export const WCAG_AA_NORMAL_TEXT_RATIO = 4.5;

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
      /** Whether `contrast` clears {@link WCAG_AA_NORMAL_TEXT_RATIO}. */
      meetsAA: boolean;
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
export function measureReadableInk(seed: string): ReadableInkMeasurement {
  if (!isHexColor(seed)) return { status: 'unmeasurable', reason: 'non-hex-seed' };

  const normalized = normalizeHexColor(seed);
  const overLight = contrastRatio(READABLE_INK_LIGHT, normalized);
  const overDark = contrastRatio(READABLE_INK_DARK, normalized);
  const preferLight = overLight >= overDark;

  const contrast = preferLight ? overLight : overDark;
  return {
    status: 'measured',
    ink: preferLight ? READABLE_INK_LIGHT : READABLE_INK_DARK,
    contrast,
    meetsAA: contrast >= WCAG_AA_NORMAL_TEXT_RATIO,
  };
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
export function deriveReadableInk(seedHex: string): string {
  const measurement = measureReadableInk(seedHex);
  if (measurement.status === 'unmeasurable') throw new UnmeasurableInkError(seedHex);
  return measurement.ink;
}

/**
 * The status tones that carry an `--ds-color-on-<tone>` ink channel.
 *
 * `primary` is deliberately absent: its ink is the long-standing
 * `--ds-color-text-on-primary`, authored on the static path and derived on
 * the DB path; `--ds-color-on-primary` exists only as a root alias of it.
 */
export const ON_TONE_ROLES = ['success', 'warning', 'error', 'info'] as const;

export type OnToneRole = (typeof ON_TONE_ROLES)[number];

/** Channel name for a tone's readable-ink emission. */
export function onToneChannel(role: OnToneRole): string {
  return `--ds-color-on-${role}`;
}
