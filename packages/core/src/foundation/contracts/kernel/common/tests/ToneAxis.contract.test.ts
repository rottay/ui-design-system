/**
 * Tone-axis contract test (design 2.8, TAX-SIZE-TONE) -- proves the "single
 * authority" law rather than asserting it in a doc comment: every tone-
 * bearing primitive's `TONE_TO_*` bridge constant must resolve THROUGH the
 * kernel {@link TONE_TO_VARIANT} map, not through an independently
 * hand-rolled copy that could silently drift from it.
 *
 * Two resolution shapes are both legal and both asserted here:
 * - Direct identity: Badge/Tag/Avatar/Callout/Alert's internal color-token
 *   vocabulary is a strict subset of `TONE_TO_VARIANT`'s spelling, so their
 *   bridge constants are literally `= TONE_TO_VARIANT` (same object
 *   reference) -- proven with `toBe`, which also means each of these
 *   bindings still carries the full six-key runtime object even where its
 *   static type narrows the key set (e.g. `TagTone` excludes `'info'`); that
 *   is an intentional consequence of the non-literal-source assignment
 *   documented on each contract file, not a leak.
 * - Documented divergence: Progress's unthemed key is spelled `'normal'`,
 *   not `'default'`, so it cannot derive from the shared object -- its
 *   bridge is asserted key-by-key against `TONE_TO_VARIANT` to prove the
 *   divergence is confined to exactly the `neutral` key and nothing else.
 *
 * A future tone-bearing primitive that hand-rolls a parallel `neutral:
 * 'default', ...` map instead of importing `TONE_TO_VARIANT` (or importing
 * it and re-typing this test to cover the new export) would not be caught
 * by this file automatically -- unlike the size axis, tone has no
 * TS-program census (the vocabulary is one fixed six-member union, not an
 * open string space), so the enumeration below is the census.
 */
import { describe, expect, it } from 'vitest';

import type { Tone } from '..';
import { TONE_TO_VARIANT } from '..';
import { TONE_TO_BADGE_VARIANT } from '@/ui/primitives/display/Badge/contracts';
import { TONE_TO_TAG_VARIANT } from '@/ui/primitives/display/Tag/contracts';
import { TONE_TO_AVATAR_VARIANT } from '@/ui/primitives/display/Avatar/contracts';
import { TONE_TO_CALLOUT_VARIANT } from '@/ui/primitives/display/Callout/contracts';
import { TONE_TO_ALERT_TYPE } from '@/ui/primitives/feedback/Alert/contracts';
import { TONE_TO_PROGRESS_STATUS } from '@/ui/primitives/feedback/Progress/contracts';

const ALL_TONES: readonly Tone[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];

const DIRECT_IDENTITY_BRIDGES = [
  ['Badge', TONE_TO_BADGE_VARIANT],
  ['Tag', TONE_TO_TAG_VARIANT],
  ['Avatar', TONE_TO_AVATAR_VARIANT],
  ['Callout', TONE_TO_CALLOUT_VARIANT],
  ['Alert', TONE_TO_ALERT_TYPE],
] as const;

describe('Tone axis contract: TONE_TO_VARIANT is the single resolution authority', () => {
  it('defines every Tone member exactly once, with the documented internal spelling', () => {
    expect(Object.keys(TONE_TO_VARIANT).sort()).toEqual([...ALL_TONES].sort());
    expect(TONE_TO_VARIANT.neutral).toBe('default');
    expect(TONE_TO_VARIANT.primary).toBe('primary');
    expect(TONE_TO_VARIANT.success).toBe('success');
    expect(TONE_TO_VARIANT.warning).toBe('warning');
    expect(TONE_TO_VARIANT.danger).toBe('error');
    expect(TONE_TO_VARIANT.info).toBe('info');
  });

  it.each(DIRECT_IDENTITY_BRIDGES)(
    '%s: its TONE_TO_* bridge is the exact TONE_TO_VARIANT object (no parallel authority)',
    (_component, bridge) => {
      expect(bridge).toBe(TONE_TO_VARIANT);
    },
  );

  it('Progress: TONE_TO_PROGRESS_STATUS resolves through TONE_TO_VARIANT with exactly one documented divergence (neutral -> "normal", not "default")', () => {
    expect(TONE_TO_PROGRESS_STATUS.success).toBe(TONE_TO_VARIANT.success);
    expect(TONE_TO_PROGRESS_STATUS.danger).toBe(TONE_TO_VARIANT.danger);
    expect(TONE_TO_PROGRESS_STATUS.neutral).toBe('normal');
    expect(TONE_TO_PROGRESS_STATUS.neutral).not.toBe(TONE_TO_VARIANT.neutral);
    // Progress's vocabulary is a curated subset (no primary/warning/info color tokens) --
    // asserting the exact key set catches an accidental widening back toward full `Tone`.
    expect(Object.keys(TONE_TO_PROGRESS_STATUS).sort()).toEqual(['danger', 'neutral', 'success']);
  });

  it('every key actually present on every bridge object is a real Tone member (no invented vocabulary)', () => {
    const bridges = [
      TONE_TO_BADGE_VARIANT,
      TONE_TO_TAG_VARIANT,
      TONE_TO_AVATAR_VARIANT,
      TONE_TO_CALLOUT_VARIANT,
      TONE_TO_ALERT_TYPE,
      TONE_TO_PROGRESS_STATUS,
    ];
    for (const bridge of bridges) {
      for (const key of Object.keys(bridge)) {
        expect(ALL_TONES).toContain(key);
      }
    }
  });
});
