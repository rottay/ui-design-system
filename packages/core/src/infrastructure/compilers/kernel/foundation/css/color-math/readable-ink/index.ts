/**
 * @fileoverview Readable-ink derivation shared by both compile paths.
 *
 * One algorithm decides which canonical ink is legible over a seed, so the
 * static BrandTheme compiler and the DB Appearance compiler cannot drift in
 * contrast math. Each PATH keeps exactly one emitter per channel (the
 * `assertSingleLightEmitter` law): sharing the function is sharing math,
 * never adding a second author.
 *
 * WCAG, not APCA: the axe gates grade these pairs with WCAG ratios, so the
 * derivation must optimize the same metric — on light teals APCA favors white
 * where WCAG measures ~2.5:1.
 */

import { contrastRatio } from '@/foundation/kernel/color/contrast';

import { normalizeHexColor } from '..';

/** The two canonical inks the derivation chooses between. */
export const READABLE_INK_LIGHT = '#ffffff';
export const READABLE_INK_DARK = '#171717';

/**
 * Best-effort readable ink on a hex seed, chosen by WCAG contrast ratio
 * between the canonical white and dark inks.
 */
export function deriveReadableInk(seedHex: string): string {
  const normalized = normalizeHexColor(seedHex);
  return contrastRatio(READABLE_INK_LIGHT, normalized) >=
    contrastRatio(READABLE_INK_DARK, normalized)
    ? READABLE_INK_LIGHT
    : READABLE_INK_DARK;
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
