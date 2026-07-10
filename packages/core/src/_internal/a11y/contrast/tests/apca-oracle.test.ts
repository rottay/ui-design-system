/**
 * Validates the hand-rolled `apcaContrast` (WO-TOK-02) against the real
 * `apca-w3` reference implementation as a test-only oracle.
 *
 * `apca-w3` is a repo-root dev dependency used by
 * `scripts/engine-token-audit.mjs` (a build-time script, not part of the
 * published package). `_internal/a11y/contrast/index.ts` ships inside
 * `@rottay/design-system`, so it hand-implements the APCA 0.1.9 formula
 * instead of depending on `apca-w3` at runtime (WO-TOK-02 fence: no new
 * color-math runtime dependency). This test is the correctness proof for
 * that hand-rolled implementation: importing `apca-w3` here is safe because
 * test files never ship in `dist/`, so this import never reaches a consumer.
 */
import { describe, expect, it } from 'vitest';
// @ts-expect-error apca-w3 ships no type declarations; test-only oracle import.
import { calcAPCA } from 'apca-w3';

import { apcaContrast } from '../index';

const PAIRS: ReadonlyArray<[string, string]> = [
  ['#000000', '#FFFFFF'],
  ['#FFFFFF', '#000000'],
  ['#162A43', '#FFFFFF'], // bithire body text on white
  ['#FFFFFF', '#3A6FB0'], // bithire button text on primary
  ['#ECECEC', '#0C0C0E'], // rottay body text on canvas
  ['#0C0C0E', '#FFFFFF'], // rottay primary-foreground on white
  ['#6B6B72', '#0C0C0E'], // rottay muted text on canvas (expected low contrast)
  ['#A0A0A5', '#0C0C0E'], // rottay secondary text on canvas
  ['#3A6FB0', '#F8FBFF'], // bithire primary as UI element on its ground
  ['#D6A04E', '#FFFFFF'], // a mid-contrast warning tone
  ['#EF4444', '#0C0C0E'], // saturated error on dark ground
  ['#CCCCCC', '#FFFFFF'], // deliberately near-invisible (low contrast) pair
];

describe('apcaContrast matches the apca-w3 reference implementation', () => {
  it.each(PAIRS)('Lc(%s on %s) is within 0.5 of apca-w3', (text, bg) => {
    const reference = calcAPCA(text, bg) as number;
    const mine = apcaContrast(text, bg);
    expect(Math.abs(mine - reference)).toBeLessThan(0.5);
  });

  it('agrees with apca-w3 on which pairs pass the body-text bronze threshold (|Lc| >= 60)', () => {
    for (const [text, bg] of PAIRS) {
      const reference = Math.abs(calcAPCA(text, bg) as number) >= 60;
      const mine = Math.abs(apcaContrast(text, bg)) >= 60;
      expect(mine, `${text} on ${bg}`).toBe(reference);
    }
  });
});
